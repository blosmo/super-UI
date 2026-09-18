// Vercel uses immutable assets and a shared budget, never a local disk ledger.
process.env.SEARCH_BUNDLED = "1";
const { createSearchServer } = await import("../server/index.mjs");
const { intelligentSearch, inputTokenPrice } =
  await import("../server/jev-search.mjs");
const { createRedisBudgetLedger } = await import("../server/redis-budget.mjs");
const budgetLedger = createRedisBudgetLedger({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
  limit: Number(process.env.SEARCH_DAILY_BUDGET_USD ?? "1"),
  price: inputTokenPrice,
});
const domains = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
].filter(Boolean);
const canonical =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
    : process.env.VERCEL_URL;
const server = createSearchServer({
  publicUrl: canonical ? `https://${canonical}` : "",
  allowedOrigins: domains.map((domain) => `https://${domain}`),
  search: (query, filters) =>
    intelligentSearch(query, filters, { budgetLedger }),
  // Vercel overwrites this header at its edge. Local Node hosting does not trust it.
  clientIp: (req) =>
    process.env.VERCEL === "1"
      ? String(
          req.headers["x-vercel-forwarded-for"] || req.socket.remoteAddress,
        )
      : req.socket.remoteAddress,
});
const handle = server.listeners("request")[0];

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const route = url.searchParams.get("route");
  if (route === "mcp") req.url = "/mcp";
  else if (route === "search") req.url = "/api/search";
  else if (route === "component")
    req.url =
      "/api/components/" + encodeURIComponent(url.searchParams.get("id") || "");
  else if (
    ![/^\/mcp$/, /^\/api\/search$/, /^\/api\/components\/[^/]+$/].some(
      (pattern) => pattern.test(url.pathname),
    )
  ) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not found" }));
  }
  return handle(req, res);
}
