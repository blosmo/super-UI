import test from "node:test";
import assert from "node:assert/strict";
import { parseRanking } from "../server/jev-search.mjs";
import { validateRequest, createSearchServer } from "../server/index.mjs";
import { eligible, entries } from "../server/retrieval.mjs";
const response = () => ({
  model: "jev-1.13.0",
  usage: { input_tokens: 100 },
  answers: {
    functional: {
      type: "score",
      score: 1.9,
      confidence: 0.9,
      probabilities: { 0: 0, 1: 0.1, 2: 0.9 },
    },
    interaction: { type: "noul", noul: 0.95 },
    preferences: { type: "noul", noul: 0.9 },
  },
});
test("strong labels require functional evidence, confidence, interaction, and preferences", () => {
  assert.equal(parseRanking(response()).label, "Strong match");
  const uncertain = response();
  uncertain.answers.functional.confidence = 0.2;
  assert.equal(parseRanking(uncertain).label, "Possible match");
  const conflict = response();
  conflict.answers.preferences.noul = 0.1;
  assert.equal(parseRanking(conflict).label, "Possible match");
  assert.match(parseRanking(conflict).reasons.join(" "), /not supported/);
});
test("invalid model answers cannot become recommendations", () => {
  for (const mutate of [
    (r) => (r.answers.functional.score = NaN),
    (r) => (r.answers.interaction.noul = 1.1),
    (r) => (r.model = "other"),
    (r) => (r.answers.functional.probabilities[2] = 0),
  ]) {
    const r = response();
    mutate(r);
    assert.throws(() => parseRanking(r));
  }
});
test("input validation rejects hidden libraries, unknown facets, long tasks and invalid saved scopes", () => {
  assert.deepEqual(
    validateRequest({ query: "  approval  ", filters: { library: "beui" } }),
    { query: "approval", filters: { library: "beui" } },
  );
  for (const body of [
    { query: "" },
    { query: "x".repeat(601) },
    { query: "x", filters: { library: "reui" } },
    { query: "x", filters: { x: "bad" } },
    { query: "x", filters: { savedIds: ["reui:button"] } },
  ])
    assert.throws(() => validateRequest(body));
});
test("retrieval applies hard filters before ranking, including saved scope", () => {
  assert(!entries.some((e) => ["reui", "transitions"].includes(e.library)));
  const approval = entries.find((e) => e.id === "beui:approval-card");
  assert(eligible(approval, { library: "beui", savedIds: [approval.id] }));
  assert(!eligible(approval, { library: "shadcn" }));
  assert(!eligible(approval, { savedIds: [] }));
});
test("search HTTP API validates requests, forbids cross origin, handles errors, and exposes no credentials", async () => {
  const server = createSearchServer({
    search: async (query) => {
      if (query === "failure") throw Error("secret internal detail");
      return {
        mode: "jev",
        results: [
          { id: "beui:approval-card", label: "Strong match", reasons: [] },
        ],
      };
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const post = (body, headers = {}) =>
      fetch(base + "/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
    assert.equal((await fetch(base + "/api/search")).status, 405);
    assert.equal(
      (await post({ query: "test" }, { origin: "https://unrelated.example" }))
        .status,
      403,
    );
    assert.equal(
      (await post({ query: "test" }, { origin: "not-a-url" })).status,
      403,
    );
    assert.equal((await post({ query: "" })).status, 400);
    const success = await post({ query: "approval" });
    assert.equal(success.status, 200);
    assert.equal((await success.json()).results[0].id, "beui:approval-card");
    const failure = await post({ query: "failure" });
    assert.equal(failure.status, 503);
    assert(!JSON.stringify(await failure.json()).includes("secret internal"));
    assert.equal((await fetch(base + "/.env.local")).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("budget reservations are atomic under concurrent callers and settle against real usage", async () => {
  const { createBudgetLedger } = await import("../server/budget.mjs");
  const { mkdtemp, readFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const directory = await mkdtemp(tmpdir() + "/super-ui-budget-");
  try {
    const path = directory + "/budget.json";
    const budget = createBudgetLedger(path, 1, 0.00001);
    await Promise.all(
      Array.from({ length: 20 }, async () => {
        const r = await budget.reserve("test");
        await budget.settle(r, 100);
      }),
    );
    assert(
      Math.abs(JSON.parse(await readFile(path, "utf8")).reservedUSD - 0.02) <
        0.000001,
    );
    await assert.rejects(() =>
      createBudgetLedger(path, 0.02, 0.00001).reserve("no more"),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
