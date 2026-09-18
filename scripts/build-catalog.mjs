const hidden = new Set(
  JSON.parse(readFileSync("src/data/hidden-libraries.json", "utf8")),
);
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
const read = (n) => readFileSync(`research/${n}.txt`, "utf8");
const names = [
  "Libraries.dev",
  "interior.dev",
  "Rare UI",
  "coss ui",
  "shadcn/ui",
  "Opensource UI",
  "Beautiful UI",
  "ReUI",
  "Transitions.dev",
  "Fluid Functionalism",
  "beUI",
  "Amicro",
];
const ids = [
  "libraries",
  "interior",
  "rare",
  "coss",
  "shadcn",
  "opensource",
  "beautiful",
  "reui",
  "transitions",
  "fluid",
  "beui",
  "amicro",
];
const urls = [
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
const libraries = ids.map((id, i) => ({
  id,
  name: names[i],
  url: urls[i],
  license: ["coss", "transitions", "fluid", "amicro"].includes(id)
    ? "Unverified"
    : id === "reui"
      ? "Source terms"
      : "MIT",
  note:
    id === "reui"
      ? "Attributed thumbnails. Hosted live previews require partner approval."
      : ["coss", "transitions", "fluid"].includes(id)
        ? "Redistribution terms need verification before importing code."
        : "Original source retained with attribution.",
  checked: "2026-09-17",
}));
libraries.find((l) => l.id === "coss").license = "AGPL-3.0 (repository)";
const entries = [];
const title = (s) =>
  s
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
function category(text) {
  text = text.toLowerCase();
  for (const [cat, re] of [
    ["Buttons", /button|press depth|like burst|hold to|ripple|bookmark/],
    [
      "Navigation",
      /sidebar|nav|tabs|breadcrumb|pagination|menu|segmented|accordion|collapsible|command|stepper/,
    ],
    [
      "Inputs",
      /input|floating.label|password|otp|field|select|picker|slider|switch|checkbox|radio|form|combobox|toggle|autocomplete|cascader|rating|label|filter/,
    ],
    [
      "Feedback",
      /load|progress|skeleton|toast|sonner|alert|notification|spinner|typing|status|badge|empty|pulse.dots|new.items|bouncing|bobbing|rotating|spinning|ring|bar.sweep/,
    ],
    [
      "AI & chat",
      /chat|agent|thinking|prompt|tool|streaming|composer|approval|context|insight|bubble/,
    ],
    ["Images & media", /image|photo|video|audio|carousel|gallery|avatar/],
    [
      "Text & motion",
      /text|marquee|counter|number|transition|reveal|morph|scroll|motion/,
    ],
    [
      "Backgrounds",
      /background|glow|gradient|beam|orb|shader|particle|gooey|metal/,
    ],
    ["Overlays", /dialog|modal|drawer|popover|tooltip|sheet/],
    [
      "Data display",
      /table|chart|calendar|stat|data|timeline|tree|list|grid|code.block|kbd|item/,
    ],
  ])
    if (re.test(text)) return cat;
  return "Cards & layout";
}
function add(lib, slug, name, url, description = "", deps = [], extra = {}) {
  if (entries.some((x) => x.id === `${lib}:${slug}`)) return;
  entries.push({
    id: `${lib}:${slug}`,
    slug,
    name,
    library: lib,
    url,
    description: description.replace(/\[Plain-text reference\].*/, "").trim(),
    category: category(name + " " + slug),
    dependencies: deps,
    status: "indexed",
    ...extra,
  });
}
for (const [lib, file] of [
  ["interior", "interior-registry"],
  ["rare", "rare-registry"],
]) {
  const d = JSON.parse(read(file));
  for (const x of d.items || []) {
    const md = read("2-llms.txt");
    const block =
      md.split("### ").find((t) => t.includes(`/` + x.name + "`")) || "";
    const page = block.match(/- Page: (\S+)/)?.[1];
    add(
      lib,
      x.name,
      x.title || title(x.name),
      x.docs || page || `${urls[ids.indexOf(lib)]}/components/${x.name}`,
      x.description || "",
      x.dependencies || [],
    );
  }
}
for (const [i, regex] of [
  [
    3,
    /^- \[([^\]]+)\]\((https:\/\/coss.com\/ui\/docs\/components\/[^)]+)\):?\s*(.*)$/gm,
  ],
  [
    4,
    /^- \[([^\]]+)\]\((https:\/\/ui.shadcn.com\/docs\/components\/[^)]+)\):?\s*(.*)$/gm,
  ],
  [
    10,
    /^- \[([^\]]+)\]\((https:\/\/beui.dev\/components\/[^)]+)\):?\s*(.*)$/gm,
  ],
])
  for (const m of read(`${i}-llms.txt`).matchAll(regex)) {
    const url = m[2].replace(/\.md$/, "");
    add(ids[i], url.split("/").pop(), m[1], url, m[3]);
  }
const reui = read("reui-full").split("## Free examples")[1] || "";
for (const m of reui.matchAll(
  /^- \[([^\]]+)\]\((https:\/\/reui.io\/components\/[^)]+)\)/gm,
)) {
  const slug = m[2].split("/").pop();
  add("reui", slug, m[1], m[2], "", [], {
    status: "thumbnail",
    thumbnail: `https://reui.io/thumbnails/components/${slug}-light.webp`,
  });
}
for (const m of read("5-sitemap.xml").matchAll(
  /<loc>(https:\/\/opensourceui.in\/components\/([^/<]+))<\/loc>/g,
)) {
  add("opensource", m[2], title(m[2]), m[1]);
}
for (const m of read("9-home").matchAll(/href="(\/docs\/[^"#?]+)"/g)) {
  const slug = m[1].split("/").pop();
  if (
    !["fluid-hover", "motion", "scrollbars", "sizes", "surfaces"].includes(slug)
  )
    add("fluid", slug, title(slug), urls[9] + m[1]);
}
for (const m of read("6-home").matchAll(/href="#([a-z][a-z-]+)"/g)) {
  const slug = m[1];
  add("beautiful", slug, title(slug), urls[6] + "/#" + slug);
}
for (const [slug, name] of [
  ["border-beam", "Border Beam"],
  ["orbs", "Thinking Orbs"],
  ["gooey", "Gooey"],
  ["metal", "Metal"],
  ["image", "Image"],
])
  add(
    "libraries",
    slug,
    name,
    urls[0] + "/" + slug,
    "",
    slug === "image" ? ["img-fx", "three"] : [],
  );
if (existsSync("research/transitions-data.txt")) {
  const d = JSON.parse(read("transitions-data"));
  writeFileSync(
    "research/transitions-shape.txt",
    JSON.stringify(d).slice(0, 2500),
  );
  const arr = Array.isArray(d) ? d : Object.values(d).find(Array.isArray) || [];
  for (const x of arr) {
    const slug = x.id || x.slug;
    if (slug && !x.pro)
      add(
        "transitions",
        slug,
        x.name || x.title || title(slug),
        `${urls[8]}/detail.html?t=${slug}`,
        x.description || "",
      );
  }
}
if (existsSync("research/amicro-registry.txt"))
  for (const x of JSON.parse(read("amicro-registry")).items) {
    if (x.type === "registry:ui")
      add(
        "amicro",
        x.name,
        x.title || title(x.name),
        "https://amicro.vercel.app/",
        x.description || "",
        x.dependencies || [],
        {
          sourceUrl: `https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/main/registry/ui/${x.name}.json`,
        },
      );
  }
for (const lib of libraries) {
  const path = `research/${lib.id}-license.txt`;
  if (existsSync(path) && read(`${lib.id}-license`).startsWith("MIT License")) {
    copyFileSync(path, `public/licenses/${lib.id}.txt`);
    lib.license = "MIT";
  }
}
writeFileSync(
  "src/data/libraries.json",
  JSON.stringify(
    libraries.filter((l) => !hidden.has(l.id)),
    null,
    2,
  ),
);
writeFileSync(
  "src/data/catalog.json",
  JSON.stringify(
    entries.filter((e) => !hidden.has(e.library)),
    null,
    2,
  ),
);
console.log(
  "Catalog",
  entries.length,
  Object.fromEntries(
    libraries.map((l) => [
      l.name,
      entries.filter((e) => e.library === l.id).length,
    ]),
  ),
);
