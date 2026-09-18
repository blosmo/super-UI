import test from "node:test";
import assert from "node:assert/strict";
import {
  model,
  questions,
  summarizeResponse,
  validateResponse,
  matchesAssessment,
  fitLabel,
} from "../src/lib/component-assessment.mjs";
import { searchCatalog } from "../src/lib/search.mjs";
const response = () => ({
  model,
  usage: { input_tokens: 100, output_tokens: 100 },
  answers: Object.fromEntries(
    Object.entries(questions).map(([key, q]) => {
      if (q.type === "noul") return [key, { type: "noul", noul: 0.9 }];
      if (q.type === "choice") {
        const options = Object.keys(q.criteria);
        return [
          key,
          {
            type: "choice",
            choice: options[0],
            confidence: 0.9,
            probabilities: Object.fromEntries(
              options.map((k, i) => [k, i === 0 ? 1 : 0]),
            ),
          },
        ];
      }
      return [
        key,
        {
          type: "score",
          score: 2,
          confidence: 0.9,
          probabilities: { 0: 0, 1: 0, 2: 1 },
          legend: Object.fromEntries(q.criteria.map((v, i) => [String(i), v])),
        },
      ];
    }),
  ),
});
test("Jev responses require the pinned model and every complete, valid distribution", () => {
  const valid = response();
  assert.equal(validateResponse(valid), valid);
  assert.throws(() => validateResponse({ ...valid, model: "other-model" }));
  const missing = response();
  delete missing.answers.motion;
  assert.throws(() => validateResponse(missing));
  const broken = response();
  broken.answers.purpose.probabilities.extra = 0.5;
  assert.throws(() => validateResponse(broken));
  const fabricated = response();
  fabricated.answers.fit_ai.score = 1;
  assert.throws(() => validateResponse(fabricated));
  const nonfinite = response();
  nonfinite.answers.decorative.noul = NaN;
  assert.throws(() => validateResponse(nonfinite));
});
test("uncertain traits and fit scores are withheld, not labeled negative", () => {
  const input = response();
  input.answers.motion.confidence = 0.2;
  input.answers.fit_ai.confidence = 0.3;
  const output = summarizeResponse(input);
  assert.equal(output.properties.motion, undefined);
  assert.equal(output.fits.ai, undefined);
  assert(output.uncertain.includes("motion"));
  assert(output.uncertain.includes("fit_ai"));
  assert.equal(fitLabel(output, "ai"), null);
  assert.equal(matchesAssessment(output, { motion: "still" }), false);
});
test("unknown remains unknown even when the model is confident", () => {
  const input = response();
  const answer = input.answers.style;
  answer.choice = "unknown";
  answer.probabilities = Object.fromEntries(
    Object.keys(answer.probabilities).map((k) => [k, k === "unknown" ? 1 : 0]),
  );
  assert.equal(summarizeResponse(input).properties.style, undefined);
});
test("use-case rankings combine with existing filters and never rank missing data as a match", () => {
  const entries = ["a", "b", "c"].map((id) => ({
    id,
    name: id,
    description: "",
    category: "Inputs",
    library: "demo",
    dependencies: [],
    status: "live",
  }));
  const strong = summarizeResponse(response());
  const weak = structuredClone(strong);
  weak.fits.ai.score = 0.55;
  const result = searchCatalog(entries, {
    useCase: "ai",
    sort: "fit",
    category: "Inputs",
    assessments: { a: weak, b: strong },
  });
  assert.deepEqual(
    result.map((e) => e.id),
    ["b", "a"],
  );
  assert.equal(
    searchCatalog(entries, {
      useCase: "ai",
      category: "Other",
      assessments: { a: weak, b: strong },
    }).length,
    0,
  );
  assert.equal(searchCatalog(entries, {}).length, 3);
  assert.equal(fitLabel(strong, "ai"), "Strong fit");
  assert.equal(fitLabel(weak, "ai"), "Supporting fit");
});
test("Noul uncertainty is not incorrectly treated as choice confidence", () => {
  const input = response();
  input.answers.decorative.noul = 0.5;
  const result = summarizeResponse(input);
  assert.equal(result.qualities.decorative, undefined);
  assert(result.uncertain.includes("decorative"));
});

test("public-source evidence fingerprints are stable and change with metadata", async () => {
  const { entries, evidenceFor } = await import("../scripts/jev/evidence.mjs");
  const entry = entries.find((e) => e.id === "shadcn:button");
  const original = evidenceFor(entry);
  assert.equal(original.fingerprint, evidenceFor(entry).fingerprint);
  assert.notEqual(
    original.fingerprint,
    evidenceFor({ ...entry, description: "changed description" }).fingerprint,
  );
  assert(
    original.provenance.every(
      (file) =>
        file.path.startsWith("src/vendor/") &&
        file.originalUrl.startsWith("https://"),
    ),
  );
});
