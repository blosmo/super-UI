import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const url = "https://www.beautifului.dev/_next/static/css/f1a0855b27dc8a58.css";
writeFileSync(
  "research/beautiful-css.txt",
  execFileSync("curl", ["-fsSL", "--max-time", "20", url], {
    encoding: "utf8",
  }),
);
