import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
const manifest = existsSync("src/data/imports.json")
  ? JSON.parse(readFileSync("src/data/imports.json", "utf8"))
  : [];
function get(url) {
  return execFileSync("curl", ["-fsSL", "--max-time", "25", url], {
    encoding: "utf8",
    maxBuffer: 20e6,
  });
}
function save(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}
function registry(lib, name, url) {
  try {
    const data = JSON.parse(get(url));
    for (const f of data.files) {
      if (!f.content) continue;
      let path = f.target || f.path;
      path = path
        .replace(/^@/, "")
        .replace(/^\//, "")
        .replace(/^registry\/default\//, "");
      if (lib === "interior") path = "components/" + name + ".tsx";
      let content = f.content
        .replaceAll("@/registry/default/", `@/vendor/${lib}/`)
        .replaceAll("@/", `@/vendor/${lib}/`);
      content = content.replaceAll(
        `@/vendor/${lib}/vendor/${lib}/`,
        `@/vendor/${lib}/`,
      );
      save(`src/vendor/${lib}/${path}`, content);
      manifest.push({
        library: lib,
        name,
        url,
        file: `src/vendor/${lib}/${path}`,
        sha256: createHash("sha256").update(f.content).digest("hex"),
        modifications: "Import aliases only",
        dependencies: data.dependencies || [],
      });
    }
    console.log(lib, name);
  } catch (e) {
    console.log("FAILED", lib, name, e.message.slice(0, 80));
  }
}
for (const n of [
  "copy-button",
  "loading-button",
  "like-burst",
  "press-depth",
  "segmented-control",
  "typing-indicator",
  "progress-bar",
  "icon-morph",
  "floating-label",
  "skeleton-swap",
  "accordion",
  "tabs",
  "show-more",
  "blur-up-image",
  "value-flash",
  "text-reveal",
  "logo-marquee",
  "new-items-pill",
])
  registry("interior", n, `https://www.interior.dev/r/${n}.json`);
for (const n of [
  "folder-component",
  "bounce-sidebar",
  "hook-sidebar",
  "animated-counter",
  "notification-bell",
  "emoji-reaction",
  "delete-button",
])
  registry("rare", n, `https://www.rareui.com/r/${n}.json`);
for (const n of ["tilt-card", "switch", "button", "tabs", "marquee"])
  registry("beui", n, `https://beui.dev/r/${n}.json`);
for (const n of ["button", "badge", "switch", "slider", "tabs", "accordion"])
  registry("shadcn", n, `https://ui.shadcn.com/r/styles/new-york/${n}.json`);
for (const n of ["coral-glow-background", "aurora-background"]) {
  try {
    const url = `https://raw.githubusercontent.com/bidyut10/opensourceui/main/components/background-gradient/${n}.tsx`;
    const s = get(url);
    save(`src/vendor/opensource/${n}.tsx`, s);
    manifest.push({
      library: "opensource",
      name: n,
      url,
      file: `src/vendor/opensource/${n}.tsx`,
      sha256: createHash("sha256").update(s).digest("hex"),
      modifications: "None",
      dependencies: ["clsx", "tailwind-merge"],
    });
  } catch {}
}
for (const [n, url] of Object.entries({
  "amicro-license":
    "https://raw.githubusercontent.com/Subhan-code/Amicro--Micro-transitions-/main/LICENSE",
  "amicro-tree":
    "https://api.github.com/repos/Subhan-code/Amicro--Micro-transitions-/git/trees/main?recursive=1",
  "coss-tree":
    "https://api.github.com/repos/cosscom/coss/git/trees/main?recursive=1",
  "transitions-data":
    "https://raw.githubusercontent.com/Jakubantalik/transitions.dev/main/scripts/transitions-data.json",
})) {
  try {
    save(`research/${n}.txt`, get(url));
  } catch {}
}
save(
  "src/data/imports.json",
  JSON.stringify(
    [...new Map(manifest.map((f) => [f.file, f])).values()],
    null,
    2,
  ),
);
