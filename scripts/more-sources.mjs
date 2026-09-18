import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const targets = {
  "coss-ui-license":
    "https://raw.githubusercontent.com/cosscom/coss/main/apps/ui/LICENSE",
  "beautiful-license": "https://www.beautifului.dev/license",
  "fluid-button": "https://www.fluidfunctionalism.com/r/button.json",
  "fluid-license": "https://www.fluidfunctionalism.com/license",
  "reui-full": "https://reui.io/llms-full.txt",
  "amicro-js": "https://amicro.vercel.app/assets/index-2UuBMt1d.js",
  "interior-registry": "https://www.interior.dev/r/registry.json",
  "rare-registry": "https://www.rareui.com/r/registry.json",
  "transitions-tree":
    "https://api.github.com/repos/Jakubantalik/transitions.dev/git/trees/main?recursive=1",
};
for (const [name, url] of Object.entries(targets)) {
  try {
    const s = execFileSync("curl", ["-fsSL", "--max-time", "25", url], {
      encoding: "utf8",
      maxBuffer: 20e6,
    });
    writeFileSync(`research/${name}.txt`, s);
    console.log(name, s.length);
  } catch {
    console.log(name, "unavailable");
  }
}
