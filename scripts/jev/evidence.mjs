import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  questions,
  model,
  assessmentVersion,
} from "../../src/lib/component-assessment.mjs";
const read = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../../src/data/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
export const hidden = new Set(read("hidden-libraries"));
export const entries = read("catalog").filter((e) => !hidden.has(e.library));
const sources = read("preview-sources"),
  imports = read("imports");
export function evidenceFor(entry) {
  const paths = [...new Set(sources[entry.id] || [])]
    .filter((path) => !path.endsWith("bento-previews.tsx"))
    .slice(0, 3);
  if (!paths.length)
    throw new Error(`No original source evidence for ${entry.id}`);
  const files = paths.map((path) => {
    if (!/^src\/vendor\//.test(path) || path.includes(".."))
      throw new Error("Invalid source path");
    const content = readFileSync(
      new URL("../../" + path, import.meta.url),
      "utf8",
    );
    const sha256 = createHash("sha256").update(content).digest("hex");
    const imported = imports.find((item) => item.file === path);
    if (
      !imported?.url?.startsWith("https://") ||
      imported.outputSha256 !== sha256
    )
      throw new Error(`Unverified public-source provenance: ${path}`);
    return { path, content, sha256, originalUrl: imported.url };
  });
  const budget = 18000,
    perFile = Math.floor(budget / files.length);
  const state = {
    component: {
      name: entry.name,
      description: entry.description,
      category: entry.category,
      sourceUrl: entry.url,
    },
    dependencies: [
      ...new Set([
        ...entry.dependencies,
        ...imports
          .filter((i) => paths.includes(i.file))
          .flatMap((i) => i.dependencies || []),
      ]),
    ],
    evidenceLimitations:
      "Source-based inference only. No screenshot, browser interaction test, performance measurement, or accessibility audit is included. Excerpts may omit behavior; do not guess what is missing.",
    sources: files.map((f) => ({
      path: f.path,
      truncated: f.content.length > perFile,
      excerpt:
        f.content.length <= perFile
          ? f.content
          : f.content.slice(0, Math.floor(perFile * 0.7)) +
            "\n/* excerpt omitted */\n" +
            f.content.slice(-Math.floor(perFile * 0.3)),
    })),
  };
  const provenance = files.map(({ path, sha256, originalUrl }) => ({
    path,
    sha256,
    originalUrl,
  }));
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        model,
        assessmentVersion,
        questions,
        entry,
        provenance,
      }),
    )
    .digest("hex");
  return { state, fingerprint, provenance };
}
