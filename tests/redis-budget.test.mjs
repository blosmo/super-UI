import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRedisBudgetLedger } from "../server/redis-budget.mjs";

const settings = {
  url: "https://redis.example",
  token: "test",
  limit: 1,
  price: 0.00001,
};
test("shared budget fails closed on missing config, invalid limits, and store failures", async () => {
  for (const override of [
    { url: undefined },
    { token: undefined },
    { limit: NaN },
    { limit: 0 },
    {
      fetcher: async () => {
        throw Error("offline");
      },
    },
    { fetcher: async () => ({ ok: false }) },
    {
      fetcher: async () => ({
        ok: true,
        json: async () => ({ error: "failure" }),
      }),
    },
    { fetcher: async () => ({ ok: true, json: async () => ({ result: [] }) }) },
  ]) {
    await assert.rejects(
      createRedisBudgetLedger({ ...settings, ...override }).reserve("test"),
    );
  }
});

test("shared budget validates usage before settlement", async () => {
  let calls = 0;
  const ledger = createRedisBudgetLedger({
    ...settings,
    fetcher: async () => {
      calls++;
    },
  });
  for (const usage of [-1, NaN, Infinity])
    await assert.rejects(ledger.settle({}, usage));
  assert.equal(calls, 0);
});

// Run against a dedicated, expiring namespace in Redis. No paid provider calls.
test(
  "independent ledgers atomically enforce one cap and settle only once",
  {
    skip: process.env.VERIFY_REDIS_BUDGET !== "1",
  },
  async () => {
    const config = {
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
      namespace: "super-ui:budget-test:" + randomUUID(),
      limit: 1,
      price: 0.00001,
    };
    const a = createRedisBudgetLedger(config);
    const b = createRedisBudgetLedger(config);
    const results = await Promise.allSettled(
      Array.from({ length: 100 }, (_, i) => (i % 2 ? a : b).reserve("test")),
    );
    const accepted = results.filter((r) => r.status === "fulfilled");
    assert.equal(accepted.length, 48);
    await Promise.all(
      Array.from({ length: 10 }, () => b.settle(accepted[0].value, 100)),
    );
    await a.reserve("test");
    await assert.rejects(b.reserve("test"));
  },
);
