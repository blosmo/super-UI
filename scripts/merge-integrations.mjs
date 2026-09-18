import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const entries = read("src/data/catalog.json");
const ids = new Set(entries.map((e) => e.id));
const covered = new Set();
const sources = new Map(read("src/data/imports.json").map((f) => [f.file, f]));
const entrySources = {};
for (const file of readdirSync("src/data/integrations")) {
  const m = read("src/data/integrations/" + file);
  for (const id of m.covered || []) if (ids.has(id)) covered.add(id);
  Object.assign(entrySources, m.entrySources || {});
  for (const record of m.imports || []) {
    if (!existsSync(record.file)) throw Error(record.file);
    const actual = hash(record.file);
    const previous = sources.get(record.file);
    const expected = record.outputSha256 || previous?.outputSha256;
    if (expected && expected !== actual)
      throw Error(
        "Source changed without importer provenance update: " + record.file,
      );
    sources.set(record.file, { ...record, outputSha256: expected || actual });
  }
}
for (const e of entries) {
  if (covered.has(e.id)) e.status = "live";
  else if (e.library === "transitions") e.status = "restricted";
  else if (e.status !== "thumbnail") throw Error("Uncovered " + e.id);
  if (e.library === "coss") {
    entrySources[e.id] = [...sources.values()]
      .filter((f) => f.library === "coss" && f.name === `p-${e.slug}-1`)
      .map((f) => f.file);
    if (!entrySources[e.id].length)
      entrySources[e.id] = [`src/vendor/coss/ui/${e.slug}.tsx`];
  }
  if (
    e.status === "live" &&
    (!entrySources[e.id]?.length ||
      entrySources[e.id].some((f) => !existsSync(f)))
  )
    throw Error("Source association missing " + e.id);
}
const libs = read("src/data/libraries.json");
for (const l of libs) {
  if (l.id === "fluid") {
    l.license = "MIT";
    l.note = "Original components and official examples. MIT licensed.";
    if (!existsSync("public/licenses/fluid.txt"))
      throw Error("Missing Fluid Functionalism license");
  } else if (l.id === "transitions") {
    l.license = "Provider terms";
    l.note =
      "Local preview requires creator permission: the provider prohibits republication of its collection. Open the original website to try these transitions.";
  } else if (l.id === "coss") {
    l.note =
      "Original components and examples under the repository’s AGPL-3.0 terms. License and source attribution retained.";
  }
}
writeFileSync("src/data/catalog.json", JSON.stringify(entries, null, 2));
writeFileSync("src/data/libraries.json", JSON.stringify(libs, null, 2));
writeFileSync(
  "src/data/live-ids.json",
  JSON.stringify([...covered].sort(), null, 2),
);
writeFileSync(
  "src/data/imports.json",
  JSON.stringify([...sources.values()], null, 2),
);
writeFileSync(
  "src/data/preview-sources.json",
  JSON.stringify(entrySources, null, 2),
);
console.log({
  live: covered.size,
  restricted: entries.filter((e) => e.status === "restricted").length,
  thumbnail: entries.filter((e) => e.status === "thumbnail").length,
  files: sources.size,
});
