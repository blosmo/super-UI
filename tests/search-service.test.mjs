import test from "node:test";
import assert from "node:assert/strict";
import { createAdmissionGate } from "../server/search-service.mjs";

test("admission bounds concurrent requests and release is idempotent", () => {
  const admit = createAdmissionGate({ perMinute: 120, concurrency: 16 });
  const releases = Array.from({ length: 16 }, () => admit("client"));
  assert.throws(() => admit("other-client"), { status: 429 });
  releases[0]();
  releases[0]();
  const release = admit("other-client");
  assert.throws(() => admit("third-client"), { status: 429 });
  release();
  releases.forEach((release) => release());
});

test("per-IP quotas expire without resetting other active requests", (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: 1000 });
  const admit = createAdmissionGate({ perMinute: 2, concurrency: 2 });
  admit("a")();
  const release = admit("a");
  assert.throws(() => admit("a"), { status: 429 });
  t.mock.timers.tick(60000);
  const next = admit("a");
  assert.throws(() => admit("b"), { status: 429 });
  release();
  next();
});
