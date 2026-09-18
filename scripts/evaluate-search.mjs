import { writeFileSync } from "node:fs";
import { intelligentSearch } from "../server/jev-search.mjs";
import { entries, assessments, retrieve } from "../server/retrieval.mjs";
import { searchCatalog } from "../src/lib/search.mjs";
const fixtures = [
  [
    "Let people approve an AI action before it runs",
    ["beui:approval-card", "beui:tool-approval", "beautiful:approval-card"],
  ],
  [
    "Let users drop a file to upload",
    ["beui:file-upload", "opensource:file-upload-field-input"],
  ],
  [
    "Show how much of a task has finished",
    [
      "interior:progress-bar",
      "shadcn:progress",
      "coss:progress",
      "opensource:progress-ring",
    ],
  ],
  [
    "Navigate between pages from a dashboard sidebar",
    [
      "shadcn:sidebar",
      "coss:sidebar",
      "beui:animated-sidebar",
      "rare:bounce-sidebar",
    ],
  ],
  [
    "Find commands quickly using the keyboard",
    [
      "shadcn:command",
      "coss:command",
      "interior:command-palette",
      "beui:command-palette",
      "fluid:command-menu",
    ],
  ],
  ["Explain that a list has no items yet", ["shadcn:empty", "coss:empty"]],
  [
    "Move through pages of search results",
    ["shadcn:pagination", "coss:pagination", "interior:pagination"],
  ],
  [
    "Sort rows of customer data",
    ["shadcn:data-table", "interior:sortable-table", "beui:table"],
  ],
  [
    "Swipe through a gallery of photos",
    ["shadcn:carousel", "interior:snap-carousel", "beui:cylinder-carousel"],
  ],
  [
    "Tell users whether their password is strong enough",
    ["interior:password-strength"],
  ],
  [
    "Enter a six digit verification code",
    [
      "shadcn:input-otp",
      "coss:otp-field",
      "beui:otp-input",
      "interior:otp-input",
      "rare:otp-input",
    ],
  ],
  [
    "Choose a start date and end date for a booking",
    ["opensource:date-range-picker", "shadcn:date-picker", "coss:date-picker"],
  ],
  [
    "Expand answers to frequently asked questions",
    [
      "shadcn:accordion",
      "coss:accordion",
      "interior:accordion",
      "fluid:accordion",
    ],
  ],
  [
    "Show where a page sits in the site hierarchy",
    ["shadcn:breadcrumb", "coss:breadcrumb"],
  ],
  [
    "Briefly notify someone that their changes were saved",
    [
      "shadcn:sonner",
      "shadcn:toast",
      "coss:toast",
      "opensource:toast-notification",
      "beui:animated-toast-stack",
    ],
  ],
  [
    "Explain an icon when someone hovers over it",
    ["shadcn:tooltip", "coss:tooltip", "beui:tooltip", "fluid:tooltip"],
  ],
  [
    "Compare monthly and annual subscription prices",
    ["opensource:toggle-pricing-cards"],
  ],
  [
    "Let a shopper add a product to their basket",
    ["opensource:add-to-cart-button"],
  ],
  [
    "Turn a setting on or off",
    ["shadcn:switch", "coss:switch", "beui:switch", "fluid:switch"],
  ],
  [
    "Adjust a numeric value by dragging a handle",
    [
      "shadcn:slider",
      "coss:slider",
      "beui:range-slider",
      "fluid:slider",
      "interior:slider-detents",
    ],
  ],
  [
    "Search and select one option from a long list",
    ["shadcn:combobox", "coss:combobox", "beui:combobox", "fluid:combobox"],
  ],
  [
    "Show placeholders while content is loading",
    [
      "shadcn:skeleton",
      "coss:skeleton",
      "amicro:skeleton",
      "amicro:fluid-skeleton",
      "interior:skeleton-swap",
    ],
  ],
  [
    "Ask for confirmation before deleting something",
    ["shadcn:alert-dialog", "coss:alert-dialog"],
  ],
  [
    "Copy a value to the clipboard with feedback",
    ["interior:copy-button", "opensource:copy-button", "fluid:input-copy"],
  ],
  [
    "Fade a blurry photo into the loaded image",
    ["interior:blur-up-image", "libraries:image"],
  ],
  [
    "Display an AI response as it streams in",
    [
      "beui:streaming-response",
      "beautiful:streaming-text",
      "interior:streaming-text",
    ],
  ],
  [
    "Give feedback while an AI assistant is thinking",
    [
      "beautiful:thinking-state",
      "fluid:thinking-indicator",
      "fluid:thinking-steps",
    ],
  ],
  [
    "Show a compact calendar for choosing a day",
    ["shadcn:calendar", "coss:calendar"],
  ],
  ["Button", ["shadcn:button", "coss:button", "beui:button"]],
  [
    "Accordion",
    [
      "shadcn:accordion",
      "coss:accordion",
      "interior:accordion",
      "fluid:accordion",
    ],
  ],
];
const rows = [];
for (const [query, expected] of fixtures) {
  const baseline = searchCatalog(entries, { query, assessments })
    .slice(0, 5)
    .map((e) => e.id);
  const shortlist = await retrieve(query);
  const result = await intelligentSearch(query);
  const top = result.results.slice(0, 5).map((r) => r.id);
  const row = {
    query,
    expected,
    baseline,
    top,
    shortlistHit: shortlist.some((e) => expected.includes(e.id)),
    baselineHit: baseline.some((id) => expected.includes(id)),
    topFiveHit: top.some((id) => expected.includes(id)),
    mode: result.mode,
    durationMs: result.durationMs,
    inputTokens: result.inputTokens || 0,
    costUSD: result.estimatedCostUSD || 0,
  };
  rows.push(row);
  console.log(
    JSON.stringify({
      completed: rows.length,
      query,
      top,
      hit: row.topFiveHit,
      ms: row.durationMs,
      mode: row.mode,
    }),
  );
  writeFileSync(
    "docs/search/evaluation.json",
    JSON.stringify(
      {
        method:
          "30 hand-authored task descriptions; expected IDs are illustrative relevant options, not exhaustive ground truth. Checks whether at least one expected option appears in top five. This does not measure precision or prove best overall quality.",
        rows,
      },
      null,
      2,
    ) + "\n",
  );
}
const times = rows.map((r) => r.durationMs).sort((a, b) => a - b);
console.log(
  JSON.stringify({
    total: rows.length,
    baselineHits: rows.filter((r) => r.baselineHit).length,
    searchHits: rows.filter((r) => r.topFiveHit).length,
    shortlistHits: rows.filter((r) => r.shortlistHit).length,
    medianMs: times[15],
    p95Ms: times[28],
    costUSD: rows.reduce((s, r) => s + r.costUSD, 0),
  }),
);
