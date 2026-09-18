import test from "node:test";
import assert from "node:assert/strict";
import {
  componentSummary,
  getComponent,
  enrichSearch,
} from "../server/component-tools.mjs";

const base = "https://super-ui.example/";

test("component summaries expose approved metadata and absolute links", () => {
  const summary = componentSummary("shadcn:button", base);
  assert.equal(summary.name, "Button");
  assert.equal(summary.libraryId, "shadcn");
  assert.equal(summary.attribution.license, "MIT");
  assert.equal(
    summary.links.preview,
    "https://super-ui.example/preview.html?id=shadcn%3Abutton",
  );
  assert.equal(
    summary.links.details,
    "https://super-ui.example/components/shadcn/button",
  );
  assert.equal(
    summary.links.thumbnail,
    "https://super-ui.example/thumbnails/shadcn--button.webp",
  );
  assert.equal(
    summary.links.license,
    "https://super-ui.example/licenses/shadcn.txt",
  );
  assert.equal(componentSummary("no:such-component", base), undefined);
  assert.equal(componentSummary("reui:button", base), undefined);
  assert.equal(
    componentSummary("../src/vendor/shadcn/ui/button", base),
    undefined,
  );
});

test("details return bounded verified provenance and honest setup limits", () => {
  const details = getComponent("shadcn:button", base);
  assert.equal(details.sourceBundleComplete, false);
  assert.equal(details.attribution.license, "MIT");
  assert(details.sources.length > 0 && details.sources.length <= 3);
  assert(
    details.sources.every((source) => /^[a-f0-9]{64}$/.test(source.sha256)),
  );
  assert(
    details.sources.every((source) =>
      source.originalUrl.startsWith("https://"),
    ),
  );
  assert(
    details.sources.some(
      (source) => source.truncated === true || source.truncated === false,
    ),
  );
  assert(
    details.setup.instructions.some((line) => line.includes("authoritative")),
  );
  assert.match(details.assessment.limitations, /AI-generated/);
  assert.throws(() => getComponent("unknown", base), {
    message: "Component not found.",
  });
});

test("search enrichment drops unknown IDs, preserves ranking explanations, and bounds output", () => {
  const enriched = enrichSearch(
    {
      mode: "jev",
      notice: "Showing semantic matches.",
      results: [
        { id: "unknown", label: "bad", reasons: ["ignore"] },
        {
          id: "shadcn:button",
          label: "Strong match",
          reasons: ["Direct fit", "Source match", "Extra"],
        },
        {
          id: "interior:loading-button",
          label: "Possible match",
          reasons: ["Loading"],
        },
      ],
    },
    base,
    1,
  );
  assert.equal(enriched.mode, "jev");
  assert.equal(enriched.notice, "Showing semantic matches.");
  assert.equal(enriched.results.length, 1);
  assert.equal(enriched.results[0].id, "shadcn:button");
  assert.deepEqual(enriched.results[0].reasons, [
    "Direct fit",
    "Source match",
    "Extra",
  ]);
  assert.equal(enriched.results[0].summary, undefined);
  assert(Object.keys(enriched.results[0]).length < 30);
});

test("source excerpts match verified files and mark real truncation", async () => {
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  for (const id of ["shadcn:button", "beui:approval-card"]) {
    const details = getComponent(id, base);
    assert(details.sources.reduce((n, s) => n + s.excerpt.length, 0) <= 18100);
    for (const source of details.sources) {
      const full = readFileSync(
        new URL("../" + source.path, import.meta.url),
        "utf8",
      );
      assert.equal(
        source.sha256,
        createHash("sha256").update(full).digest("hex"),
      );
      if (!source.truncated) assert.equal(source.excerpt, full);
      else {
        assert(source.excerpt.length < full.length);
        assert.match(source.excerpt, /excerpt omitted/);
      }
    }
  }
  assert(
    getComponent("beui:approval-card", base).sources.some((s) => s.truncated),
  );
});

test("missing or tampered evidence fails closed without revealing underlying errors", () => {
  for (const error of [
    "ENOENT /private/source-file",
    "Unverified public-source provenance: private-path",
  ]) {
    assert.throws(
      () =>
        getComponent("shadcn:button", base, {
          readEvidence: () => {
            throw Error(error);
          },
        }),
      { message: "Verified component sources are unavailable." },
    );
  }
});
