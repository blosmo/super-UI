import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const errors = [];
const blocked = /^(?:node_modules\/|dist\/|\.cache\/|research\/|\.env(?:\.|$))/;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b/,
];
const textExtensions =
  /\.(?:m?[jt]sx?|json|md|txt|ya?ml|html|css|toml|sh)$|(?:^|\/)\.env\.example$/;
for (const file of files) {
  if (blocked.test(file) && file !== ".env.example")
    errors.push(`Local/private artifact tracked: ${file}`);
  if (!existsSync(file)) {
    errors.push(`Tracked file missing: ${file}`);
    continue;
  }
  const bytes = readFileSync(file);
  if (bytes.length > 50 * 1024 * 1024)
    errors.push(`Oversize tracked file: ${file}`);
  if (textExtensions.test(file)) {
    const text = bytes.toString("utf8");
    if (secretPatterns.some((pattern) => pattern.test(text)))
      errors.push(`Possible credential in ${file}`);
    if (
      /^(?:TYPESAFE_API_KEY|VITE_TYPESAFE_API_KEY)\s*=\s*["']?[^\s"'#]+/m.test(
        text,
      )
    )
      errors.push(`Populated provider key in ${file}`);
  }
}
const read = (name) => JSON.parse(readFileSync(name, "utf8"));
const hidden = new Set(read("src/data/hidden-libraries.json"));
if (read("src/data/catalog.json").some((e) => hidden.has(e.library)))
  errors.push("Pending library found in source catalog");
if (read("src/data/libraries.json").some((e) => hidden.has(e.id)))
  errors.push("Pending library found in source library list");
for (const path of [
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  ".env.example",
  ".github/workflows/ci.yml",
])
  if (!existsSync(path)) errors.push(`Missing release document: ${path}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Release hygiene passed for ${files.length} tracked files. This heuristic scan does not replace a full secret audit.`,
  );
