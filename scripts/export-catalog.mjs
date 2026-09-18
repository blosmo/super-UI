import { readFileSync, writeFileSync } from "node:fs";
const read = (name) =>
  JSON.parse(readFileSync(`src/data/${name}.json`, "utf8"));
const hidden = new Set(read("hidden-libraries"));
const live = new Set(read("live-ids"));
const assessments = read("assessments");
const entries = read("catalog")
  .filter((entry) => !hidden.has(entry.library))
  .map((e) => ({
    ...e,
    assessed: Boolean(assessments.entries[e.id]),
    status: live.has(e.id) ? "live" : e.status,
    thumbnail: `/thumbnails/${e.library}--${e.slug}.webp`,
    detailsUrl: `/components/${encodeURIComponent(e.library)}/${encodeURIComponent(e.slug)}`,
  }));
writeFileSync(
  "public/catalog.json",
  JSON.stringify(
    {
      version: 1,
      assessmentsUrl: "/assessments.json",
      checked: "2026-09-17",
      libraries: read("libraries").filter((library) => !hidden.has(library.id)),
      entries,
    },
    null,
    2,
  ),
);

writeFileSync("public/assessments.json", JSON.stringify(assessments) + "\n");
