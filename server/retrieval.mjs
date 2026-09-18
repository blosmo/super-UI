import { createHash } from "node:crypto";
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  renameSync,
} from "node:fs";
import { pipeline, env } from "@huggingface/transformers";
import { entries } from "../scripts/jev/evidence.mjs";
import { traits, useCases } from "../src/lib/component-assessment.mjs";
import { matchesAssessment } from "../src/lib/component-assessment.mjs";
const assessments = JSON.parse(
  readFileSync(new URL("../src/data/assessments.json", import.meta.url)),
).entries;
export const embeddingModel = "Xenova/all-MiniLM-L6-v2";
export const embeddingRevision = "751bff37182d3f1213fa05d7196b954e230abad9";
const bundled = process.env.SEARCH_BUNDLED === "1";
const cacheDir = new URL(
  bundled ? "./search-assets/" : "../.cache/search/",
  import.meta.url,
).pathname;
if (!bundled) mkdirSync(cacheDir, { recursive: true });
env.cacheDir = cacheDir + "models";
if (bundled) {
  env.allowRemoteModels = false;
  env.useFSCache = false;
}
// Plain-language aliases for conventional UI patterns, never evidence of tested quality.
const patternDescriptions = [
  [
    /accordion|collapsible/i,
    "Expand and collapse content sections, questions and answers, or frequently asked questions.",
  ],
  [
    /breadcrumb/i,
    "Show the current page location in a hierarchy of parent pages.",
  ],
  [/combobox/i, "Search a list of choices and select an option."],
  [/skeleton/i, "Placeholder shapes while content is loading."],
  [/otp|one.time.password/i, "Enter a verification code for account sign in."],
  [/toast|sonner/i, "A brief notification about the outcome of an action."],
];
export function documentFor(entry) {
  const a = assessments[entry.id];
  const properties = Object.entries(a?.properties || {}).flatMap(([key, p]) =>
    p.value && traits[key]?.options[p.value]
      ? [traits[key].options[p.value]]
      : [],
  );
  const patterns = patternDescriptions
    .filter(([pattern]) => pattern.test(entry.name))
    .map(([, description]) => description)
    .join(" ");
  return `${entry.name}. ${entry.description} ${patterns} Category: ${entry.category}. ${properties.join(". ")}. Dependencies: ${entry.dependencies.join(", ")}.`;
}
const documents = entries.map(documentFor);
export const corpusVersion = createHash("sha256")
  .update(
    JSON.stringify({
      entries,
      assessments,
      embeddingModel,
      embeddingRevision,
      documents,
    }),
  )
  .digest("hex");
let extractorPromise, indexPromise;
async function embed(text) {
  extractorPromise ||= pipeline(
    "feature-extraction",
    bundled ? cacheDir + "model/" : embeddingModel,
    {
      revision: embeddingRevision,
      dtype: "q8",
      local_files_only: bundled,
    },
  ).catch((error) => {
    extractorPromise = null;
    throw error;
  });
  const extractor = await extractorPromise;
  return (await extractor(text, { pooling: "mean", normalize: true })).tolist();
}
export async function prepareIndex() {
  indexPromise ||= (async () => {
    const file = `${cacheDir}${corpusVersion}.json`;
    if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
    if (bundled)
      throw Error("Bundled search index is missing. Rebuild the deployment.");
    const vectors = [];
    for (let i = 0; i < documents.length; i += 16)
      vectors.push(...(await embed(documents.slice(i, i + 16))));
    writeFileSync(file + `.${process.pid}.tmp`, JSON.stringify(vectors));
    renameSync(file + `.${process.pid}.tmp`, file);
    return vectors;
  })().catch((error) => {
    indexPromise = null;
    throw error;
  });
  return indexPromise;
}
const stop = new Set(
  "a an the to for of in on with and or i we my our need want help users user component that can should it is be me let something".split(
    " ",
  ),
);
export function tokens(text) {
  return (
    text
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((t) => !stop.has(t)) || []
  );
}
const tokenDocuments = documents.map(tokens);
const df = new Map();
for (const doc of tokenDocuments)
  for (const term of new Set(doc)) df.set(term, (df.get(term) || 0) + 1);
const averageLength =
  tokenDocuments.reduce((n, d) => n + d.length, 0) / tokenDocuments.length;
export function keywordScore(query, index) {
  const terms = tokens(query),
    doc = tokenDocuments[index];
  let score = 0;
  for (const term of new Set(terms)) {
    const frequency = doc.filter((t) => t === term).length;
    const idf = Math.log(
      1 +
        (entries.length - (df.get(term) || 0) + 0.5) /
          ((df.get(term) || 0) + 0.5),
    );
    score +=
      (idf * frequency * 2.2) /
      (frequency + 1.2 * (0.25 + (0.75 * doc.length) / averageLength));
  }
  if (entries[index].name.toLowerCase() === query.toLowerCase().trim())
    score += 20;
  return score;
}
export function eligible(entry, filters = {}) {
  return (
    (!filters.savedIds || filters.savedIds.includes(entry.id)) &&
    (!filters.library || entry.library === filters.library) &&
    (!filters.category || entry.category === filters.category) &&
    matchesAssessment(assessments[entry.id], filters)
  );
}
export async function retrieve(query, filters = {}, limit = 30) {
  const vectors = await prepareIndex();
  const [vector] = await embed([query]);
  const candidates = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => eligible(entry, filters));
  const semantic = candidates
    .map((c) => ({
      ...c,
      score: vectors[c.index].reduce((s, v, i) => s + v * vector[i], 0),
    }))
    .sort((a, b) => b.score - a.score);
  const lexical = candidates
    .map((c) => ({ ...c, score: keywordScore(query, c.index) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);
  const scores = new Map();
  for (const list of [semantic, lexical])
    list
      .slice(0, 80)
      .forEach((c, i) =>
        scores.set(c.entry.id, (scores.get(c.entry.id) || 0) + 1 / (40 + i)),
      );
  return candidates
    .sort(
      (a, b) => (scores.get(b.entry.id) || 0) - (scores.get(a.entry.id) || 0),
    )
    .slice(0, limit)
    .map((c) => c.entry);
}
export { entries, assessments };
