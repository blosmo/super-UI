import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  renameSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { entries, evidenceFor } from "./jev/evidence.mjs";
import {
  model,
  questions,
  assessmentVersion,
  summarizeResponse,
  validateResponse,
} from "../src/lib/component-assessment.mjs";
const { values } = parseArgs({
  options: {
    run: { type: "boolean" },
    publish: { type: "boolean" },
    pilot: { type: "boolean" },
    limit: { type: "string" },
    "max-usd": { type: "string" },
    only: { type: "string" },
  },
});
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const cacheDir = fileURLToPath(
  new URL("../research/jev-cache/", import.meta.url),
);
const pilotIds = [
  "shadcn:button",
  "shadcn:input",
  "shadcn:dialog",
  "coss:table",
  "interior:loading-button",
  "rare:folder-component",
  "opensource:coral-glow-background",
  "beautiful:thinking-state",
  "beui:approval-card",
  "fluid:tabs",
  "amicro:accordion-loader",
  "libraries:image",
];
let candidates = values.pilot
  ? pilotIds.map((id) => entries.find((e) => e.id === id)).filter(Boolean)
  : entries;
if (values.only)
  candidates = candidates.filter((e) => values.only.split(",").includes(e.id));
if (values.limit) {
  const n = Number(values.limit);
  if (!Number.isInteger(n) || n < 1) throw Error("Invalid limit");
  candidates = candidates.slice(0, n);
}
const jobs = candidates.map((entry) => ({ entry, ...evidenceFor(entry) }));
const existing = existsSync("src/data/assessments.json")
  ? read("src/data/assessments.json")
  : { entries: {} };
const currentPublished = (id, fingerprint) =>
  existing.version === assessmentVersion &&
  existing.model === model &&
  existing.entries[id]?.fingerprint === fingerprint;

const PRICE = 0.042 / 1_000_000; // Official Jev 1.13 input-token price, checked 2026-09-18.
// Conservative reservation: two tokens per serialized UTF-8 byte, including protocol overhead.
const reserveFor = (job) =>
  (Buffer.byteLength(JSON.stringify({ model, state: job.state, questions })) *
    2 +
    2048) *
  PRICE;
const pending = jobs.filter(
  (job) =>
    !existsSync(`${cacheDir}${job.fingerprint}.json`) &&
    !currentPublished(job.entry.id, job.fingerprint),
);
console.log(
  JSON.stringify({
    model,
    questionsPerComponent: Object.keys(questions).length,
    components: jobs.length,
    cached: jobs.length - pending.length,
    conservativeReservationUSD: pending.reduce((n, j) => n + reserveFor(j), 0),
    pricePerMillionInputTokensUSD: 0.042,
  }),
);
let apiKey = process.env.TYPESAFE_API_KEY;
for (const envPath of [".env.local", ".env"]) {
  if (apiKey || !existsSync(envPath)) continue;
  const match = readFileSync(envPath, "utf8").match(
    /^TYPESAFE_API_KEY\s*=\s*(.*)$/m,
  );
  apiKey = match?.[1]?.trim().replace(/^(['"])(.*)\1$/, "$2");
}
let reserved = 0,
  actual = 0,
  completed = 0,
  inputTokens = 0;
const cap = Number(values["max-usd"]);
const failures = [];
if (values.run) {
  if (!apiKey)
    throw Error(
      "Add TYPESAFE_API_KEY to .env. Never expose it through VITE_ variables.",
    );
  if (!Number.isFinite(cap) || cap <= 0)
    throw Error("--run requires an explicit positive --max-usd budget");
  mkdirSync(cacheDir, { recursive: true });
  let cursor = 0,
    stopped = false;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (!stopped && cursor < pending.length) {
        const job = pending[cursor++];
        try {
          let response;
          for (let attempt = 0; attempt < 3; attempt++) {
            const reservation = reserveFor(job);
            if (reserved + reservation > cap) {
              stopped = true;
              throw Error("Budget reservation limit reached");
            }
            reserved += reservation;
            const start = Date.now();
            const result = await fetch("https://api.typesafe.ai/v1/systemone", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ model, state: job.state, questions }),
              signal: AbortSignal.timeout(45000),
            });
            if ([429, 529].includes(result.status) && attempt < 2) {
              const retry = Number(result.headers.get("retry-after"));
              await new Promise((resolve) =>
                setTimeout(
                  resolve,
                  Math.min(
                    30000,
                    Number.isFinite(retry) && retry > 0
                      ? retry * 1000
                      : 1000 * 2 ** attempt,
                  ),
                ),
              );
              continue;
            }
            if (!result.ok) {
              if ([401, 403].includes(result.status)) stopped = true;
              throw Error(`TypeSafe HTTP ${result.status}`);
            }
            response = validateResponse(await result.json());
            actual += response.usage.input_tokens * PRICE;
            inputTokens += response.usage.input_tokens;
            if (actual > cap) stopped = true;
            const cached = {
              id: job.entry.id,
              fingerprint: job.fingerprint,
              provenance: job.provenance,
              classifiedAt: new Date().toISOString(),
              durationMs: Date.now() - start,
              response,
            };
            const path = `${cacheDir}${job.fingerprint}.json`;
            writeFileSync(
              path + ".tmp",
              JSON.stringify(cached, null, 2) + "\n",
            );
            renameSync(path + ".tmp", path);
            completed++;
            if (values.pilot || completed % 25 === 0)
              console.log(
                JSON.stringify({
                  completed,
                  id: job.entry.id,
                  inputTokens,
                  estimatedCostUSD: actual,
                }),
              );
            break;
          }
        } catch (error) {
          failures.push({
            id: job.entry.id,
            error:
              error.name === "TimeoutError"
                ? "Request timed out"
                : error.message,
          });
        }
      }
    }),
  );
}
if (values.publish) {
  const published = {
    version: assessmentVersion,
    model,
    generatedAt: new Date().toISOString(),
    entries: {},
  };
  for (const entry of entries) {
    const evidence = evidenceFor(entry),
      path = `${cacheDir}${evidence.fingerprint}.json`;
    if (!existsSync(path)) {
      if (currentPublished(entry.id, evidence.fingerprint))
        published.entries[entry.id] = existing.entries[entry.id];
      continue;
    }
    const cache = read(path);
    if (cache.id !== entry.id || cache.fingerprint !== evidence.fingerprint)
      throw Error("Cache provenance mismatch");
    published.entries[entry.id] = {
      ...summarizeResponse(cache.response),
      model: cache.response.model,
      classifiedAt: cache.classifiedAt,
      fingerprint: cache.fingerprint,
      evidence: cache.provenance,
      sourceBased: true,
    };
  }
  const path = "src/data/assessments.json";
  writeFileSync(path + ".tmp", JSON.stringify(published, null, 2) + "\n");
  renameSync(path + ".tmp", path);
  writeFileSync("public/assessments.json", JSON.stringify(published) + "\n");
  console.log(
    JSON.stringify({
      published: Object.keys(published.entries).length,
      total: entries.length,
    }),
  );
}
console.log(
  JSON.stringify({
    completed,
    inputTokens,
    estimatedCostUSD: actual,
    reservedUSD: reserved,
    failures,
  }),
);
if (failures.length) process.exitCode = 1;
