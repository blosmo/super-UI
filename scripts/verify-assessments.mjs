import { readFileSync } from "node:fs";
import { entries, evidenceFor } from "./jev/evidence.mjs";
import {
  assessmentVersion,
  model,
  traits,
  useCases,
  confidenceFloor,
} from "../src/lib/component-assessment.mjs";
const data = JSON.parse(readFileSync("src/data/assessments.json", "utf8"));
if (data.version !== assessmentVersion || data.model !== model)
  throw Error("Assessment schema/model changed. Run classification again.");
for (const [id, assessment] of Object.entries(data.entries)) {
  const entry = entries.find((e) => e.id === id);
  if (!entry)
    throw Error(`Assessment for a hidden or unknown component: ${id}`);
  if (assessment.fingerprint !== evidenceFor(entry).fingerprint)
    throw Error(
      `Stale assessment: ${id}. Reclassify after source or rubric changes.`,
    );
  if (assessment.model !== model || !assessment.sourceBased)
    throw Error(`Invalid provenance: ${id}`);
  for (const [key, value] of Object.entries(assessment.properties)) {
    if (
      !traits[key]?.options[value.value] ||
      !Number.isFinite(value.confidence) ||
      !Number.isFinite(value.confidence) ||
      value.confidence < confidenceFloor ||
      value.confidence > 1
    )
      throw Error(`Invalid property: ${id}/${key}`);
  }
  for (const [key, value] of Object.entries(assessment.fits)) {
    if (
      !useCases[key] ||
      !Number.isFinite(value.score) ||
      value.score < 0 ||
      value.score > 1 ||
      !Number.isFinite(value.confidence) ||
      value.confidence < confidenceFloor ||
      value.confidence > 1
    )
      throw Error(`Invalid fit: ${id}/${key}`);
  }
}
console.log(
  `Verified ${Object.keys(data.entries).length} current source-based Jev assessments.`,
);
