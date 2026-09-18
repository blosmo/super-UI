// Explicit class extraction keeps vendored previews reproducible even when
// Tailwind's native directory scanner cannot traverse the host workspace.
import { Scanner } from "@tailwindcss/oxide";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const files = readdirSync("src", { recursive: true }).filter((p) =>
  /\.(tsx|ts)$/.test(p),
);
const scanner = new Scanner({ sources: [] });
const candidates = scanner
  .scanFiles(
    files.map((p) => ({
      content: readFileSync("src/" + p, "utf8"),
      extension: "tsx",
    })),
  )
  .filter((c) => !/[{}]/.test(c));
writeFileSync(
  "src/preview-classes.css",
  `/* Generated from component source. Run npm run styles after adding previews. */\n@source inline(${JSON.stringify(candidates.join(" "))});\n`,
);
console.log(`Extracted ${candidates.length} preview style candidates.`);
