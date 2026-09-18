import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const targets = {
  "interior-license":
    "https://raw.githubusercontent.com/ddoemonn/interior/main/LICENSE",
  "rare-license":
    "https://raw.githubusercontent.com/swamimalode07/rare-ui/main/LICENSE",
  "coss-license": "https://raw.githubusercontent.com/cosscom/coss/main/LICENSE",
  "shadcn-license":
    "https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md",
  "opensource-license":
    "https://raw.githubusercontent.com/bidyut10/opensourceui/main/LICENSE",
  "beui-license":
    "https://raw.githubusercontent.com/starc007/ui-components/main/LICENSE",
  "libraries-license":
    "https://raw.githubusercontent.com/Jakubantalik/Libraries.dev/main/LICENSE",
  "transitions-license":
    "https://raw.githubusercontent.com/Jakubantalik/transitions.dev/main/LICENSE",
  "rare-tree":
    "https://api.github.com/repos/swamimalode07/rare-ui/git/trees/main?recursive=1",
  "opensource-tree":
    "https://api.github.com/repos/bidyut10/opensourceui/git/trees/main?recursive=1",
  "fluid-docs": "https://www.fluidfunctionalism.com/docs",
  "reui-embed": "https://reui.io/docs/embed.md",
  "reui-license": "https://reui.io/license",
  "coss-button": "https://coss.com/ui/r/button.json",
  "beui-tilt": "https://beui.dev/r/tilt-card.json",
};
for (const [name, url] of Object.entries(targets)) {
  try {
    const s = execFileSync("curl", ["-fsSL", "--max-time", "25", url], {
      encoding: "utf8",
    });
    writeFileSync(`research/${name}.txt`, s);
    console.log(name, s.length);
  } catch {
    console.log(name, "unavailable");
  }
}
