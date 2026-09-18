import { readFileSync } from "node:fs";
import { entries, evidenceFor } from "../scripts/jev/evidence.mjs";

const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"),
  );
const libraries = read("libraries");
const assessments = read("assessments").entries;
const imports = new Map(read("imports").map((item) => [item.file, item]));
const thumbnails = new Map(
  read("thumbnail-manifest").entries.map((e) => [e.id, e]),
);
const libraryMap = new Map(libraries.map((library) => [library.id, library]));
const entryMap = new Map(entries.map((entry) => [entry.id, entry]));

const setupLimitations = [
  "Upstream documentation is authoritative for installation and usage.",
  "Declared dependencies are not a complete transitive package manifest.",
  "Adapt imports and shared CSS to the target application and verify there.",
];
const assessmentLimitations =
  "Assessment labels are AI-generated, source-based judgments, not visual, accessibility, performance, or universal quality certifications.";

function origin(baseUrl = "http://localhost:4174") {
  const value = String(baseUrl).replace(/\/+$/, "");
  return value;
}
function link(baseUrl, path) {
  return `${origin(baseUrl)}${path}`;
}
function safeSegment(value) {
  return encodeURIComponent(value);
}
function linksFor(entry, baseUrl) {
  const library = safeSegment(entry.library);
  const slug = safeSegment(entry.slug);
  const thumb = thumbnails.get(entry.id);
  return {
    preview: link(baseUrl, `/preview.html?id=${encodeURIComponent(entry.id)}`),
    details: link(baseUrl, `/components/${library}/${slug}`),
    thumbnail: link(
      baseUrl,
      `/${thumb?.file?.replace(/^public\//, "") || `thumbnails/${entry.library}--${entry.slug}.webp`}`,
    ),
    license: link(baseUrl, `/licenses/${safeSegment(entry.library)}.txt`),
  };
}

function assessmentFor(entry) {
  const assessment = assessments[entry.id];
  if (!assessment) return undefined;
  const properties = Object.fromEntries(
    Object.entries(assessment.properties || {}).map(([key, value]) => [
      key,
      { value: value.value, confidence: value.confidence },
    ]),
  );
  const useCaseScores = Object.fromEntries(
    Object.entries(assessment.fits || {}).map(([key, value]) => [
      key,
      { score: value.score, confidence: value.confidence },
    ]),
  );
  return {
    properties,
    useCases: useCaseScores,
    uncertain: assessment.uncertain || [],
    limitations: assessmentLimitations,
  };
}

export function componentSummary(id, baseUrl) {
  const entry = entryMap.get(id);
  if (!entry) return undefined;
  const library = libraryMap.get(entry.library);
  return {
    id: entry.id,
    name: entry.name,
    slug: entry.slug,
    description: entry.description,
    category: entry.category,
    library: library?.name || entry.library,
    libraryId: entry.library,
    dependencies: [...(entry.dependencies || [])],
    status: entry.status,
    sourceUrl: entry.url,
    attribution: {
      library: library?.name || entry.library,
      url: library?.url || entry.url,
      license: library?.license,
      note: library?.note,
    },
    links: linksFor(entry, baseUrl),
  };
}

export function getComponent(id, baseUrl, { readEvidence = evidenceFor } = {}) {
  const entry = entryMap.get(id);
  if (!entry) throw new Error("Component not found.");
  try {
    const summary = componentSummary(id, baseUrl);
    const evidence = readEvidence(entry);
    const sources = evidence.state.sources.map((source) => {
      const imported = imports.get(source.path);
      return {
        path: source.path,
        excerpt: source.excerpt,
        truncated: Boolean(source.truncated),
        sha256: evidence.provenance.find((item) => item.path === source.path)
          ?.sha256,
        originalUrl: imported?.url,
        modifications: imported?.modifications,
      };
    });
    return {
      ...summary,
      assessment: assessmentFor(entry),
      dependencies: evidence.state.dependencies,
      sources,
      fingerprint: evidence.fingerprint,
      sourceBundleComplete: false,
      setup: {
        instructions: setupLimitations,
        limitations:
          "This response contains approved source excerpts, not a complete installable bundle.",
      },
      evidenceLimitations: evidence.state.evidenceLimitations,
    };
  } catch {
    throw new Error("Verified component sources are unavailable.");
  }
}

export function enrichSearch(result, baseUrl, limit = 5) {
  const output = {
    mode: result?.mode || "semantic",
    results: [],
  };
  if (result?.notice) output.notice = result.notice;
  for (const item of Array.isArray(result?.results) ? result.results : []) {
    if (output.results.length >= limit) break;
    const summary = componentSummary(item?.id, baseUrl);
    if (!summary) continue;
    output.results.push({
      ...summary,
      label: typeof item.label === "string" ? item.label : "Related component",
      reasons: Array.isArray(item.reasons) ? item.reasons.slice(0, 3) : [],
    });
  }
  return output;
}
