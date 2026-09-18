import postcss from "postcss";
import { readFileSync, writeFileSync } from "node:fs";
const root = postcss.parse(readFileSync("research/beautiful-css.txt", "utf8"));
const rules = [];
root.walkRules((rule) => {
  if (rule.selector === ":root" || rule.selector === ".dark") {
    const vars = rule.nodes.filter(
      (n) =>
        n.type === "decl" &&
        n.prop.startsWith("--") &&
        !n.prop.startsWith("--tw"),
    );
    if (vars.length)
      rules.push(
        `${rule.selector === ":root" ? ".beautiful-demo" : ".dark .beautiful-demo"}{${vars.map((n) => n.toString()).join(";")}}`,
      );
  }
});
root.walkAtRules("keyframes", (r) => {
  if (["pixel-on", "shimmer-text", "fade-up"].includes(r.params))
    rules.push(r.toString());
});
writeFileSync(
  "src/beautiful-styles.css",
  "/* Original Beautiful UI theme tokens and keyframes. MIT, Shane Levine. */\n" +
    rules.join("\n"),
);
