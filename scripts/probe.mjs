import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
const origins = [
  "https://libraries.dev",
  "https://www.interior.dev",
  "https://www.rareui.com",
  "https://coss.com/ui",
  "https://ui.shadcn.com",
  "https://opensourceui.in",
  "https://www.beautifului.dev",
  "https://reui.io",
  "https://transitions.dev",
  "https://www.fluidfunctionalism.com",
  "https://beui.dev",
  "https://amicro.vercel.app",
];
await Promise.all(
  origins.map(async (base, i) => {
    for (const path of ["/llms.txt", "/registry.json", "/sitemap.xml", ""]) {
      try {
        const text = execFileSync(
          "curl",
          ["-fsSL", "--max-time", "20", base + path],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        );
        if (text) {
          await writeFile(
            `research/${i}-${path.replaceAll("/", "") || "home"}.txt`,
            text,
          );
          console.log(
            i,
            path || "home",
            200,
            text.length,
            [...text.matchAll(/https:\/\/github.com\/[^\s"<>\\)]+/g)]
              .map((m) => m[0])
              .slice(0, 3)
              .join(" "),
          );
        }
      } catch (e) {
        console.log(i, e.message);
      }
    }
  }),
);
