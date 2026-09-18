import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
for (const [name, url] of Object.entries({
  "coss-intro": "https://coss.com/ui/docs/index.md",
  "amicro-registry":
    "https://raw.githubusercontent.com/Subhan-code/Amicro--Micro-transitions-/main/registry/registry.json",
  "amicro-pulse":
    "https://raw.githubusercontent.com/Subhan-code/Amicro--Micro-transitions-/main/registry/ui/apple-pulse-dots.json",
  "transitions-readme":
    "https://raw.githubusercontent.com/Jakubantalik/transitions.dev/main/README.md",
})) {
  try {
    writeFileSync(
      `research/${name}.txt`,
      execFileSync("curl", ["-fsSL", "--max-time", "20", url], {
        encoding: "utf8",
      }),
    );
  } catch {}
}
