# Use Super UI from your agent

Connect once, then ask for the interface you want to build:

> Find a restrained approval card for an AI assistant. Compare a few options and inspect the best fit for my React app.

Super UI exposes two read-only tools at `/mcp`: `search_components` and `get_component`. No account or client API key is required. Your coding agent uses its own editing tools to integrate a selected component.

## Start locally

From the repository root, with Node.js 22.12 or newer:

```sh
npm ci
npm run search:index
npm run build
npm start
```

The first index build downloads the pinned public embedding model. Keep the server running. The connection URL is:

```text
http://127.0.0.1:4174/mcp
```

Without a TypeSafe key, search uses local semantic matching. Component details do not require the embedding model or any provider key. A built app is needed for the returned preview and thumbnail links.

### Codex

```sh
codex mcp add super-ui --url http://127.0.0.1:4174/mcp
```

Or add this to your Codex MCP configuration:

```toml
[mcp_servers.super-ui]
url = "http://127.0.0.1:4174/mcp"
```

Restart or refresh your agent's MCP connections if necessary. This repository does not alter your personal agent configuration automatically.

### Other MCP clients

Choose a **Streamable HTTP** server and enter the same URL. For clients using the common `mcpServers` configuration shape:

```json
{
  "mcpServers": {
    "super-ui": {
      "url": "http://127.0.0.1:4174/mcp"
    }
  }
}
```

Exact configuration locations vary by client. The endpoint supports modern MCP and stateless 2025 Streamable HTTP clients. It does not offer the older standalone SSE transport or a ChatGPT visual widget. A remote agent cannot reach a server on your computer through its own `127.0.0.1`; use a hosted HTTPS endpoint for remote clients.

## Tool contract

### search_components

```json
{
  "query": "Let people approve an AI action",
  "filters": { "library": "beui" },
  "limit": 3
}
```

`query` is 1 to 600 characters. `limit` defaults to 5 and allows 1 to 10. Optional filters: `library`, `category`, `useCase`, `style`, `motion`, `setup`, and `savedIds`. Discover allowed values through the tool's schema. Saved IDs are an explicit input list, not access to anyone's browser bookmarks.

Results include names, descriptions, dependencies, upstream attribution and licenses, absolute preview/thumbnail/details links, and fit labels and reasons. `mode: jev` identifies model ranking; `mode: semantic` identifies semantic matching and preserves any fallback notice. Empty results are valid. No source code is loaded into the search response.

### get_component

```json
{ "id": "beui:approval-card" }
```

Returns catalog metadata, source-based assessment information, declared dependencies, integration guidance, and up to three verified source excerpts. Each source has a repository path, SHA-256 of the full vendored file, upstream reference, modification notes, and a truncation flag. Excerpts are bounded to approximately 18,000 characters in total.

This is **not a complete installable bundle**. Shared files, styles, and transitive dependencies may be absent. Follow upstream documentation, inspect required imports, preserve license notices, and verify the result in the target application. AI assessments do not establish tested accessibility, performance, or universal quality.

## Optional companion skill

The portable skill is at [`skills/super-ui/SKILL.md`](../../skills/super-ui/SKILL.md). From the repository root, copy its folder into your agent's skills directory. For a project using `.agents/skills`, for example:

```sh
mkdir -p /path/to/your-project/.agents/skills
cp -R skills/super-ui /path/to/your-project/.agents/skills/
```

The skill is optional. It explains when to search, how to compare results, and how to inspect source limitations. The MCP tools work without it. Do not overwrite an existing customized skill without inspecting it first.

## API-only access

The existing search response remains unchanged:

```sh
curl http://127.0.0.1:4174/api/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"Let people approve an AI action"}'

curl http://127.0.0.1:4174/api/components/beui%3Aapproval-card
```

`GET /api/components/:id` returns the same details as `get_component`. Use `/catalog.json` to resolve search IDs or browse by name when intelligent search is unavailable. `/llms.txt` describes the discovery surfaces.

## Hosting

There is no public deployment URL configured by this change. Run the same Node service behind an HTTPS reverse proxy and set:

```dotenv
HOST=0.0.0.0
PORT=4174
PUBLIC_URL=https://your-component-domain.example
```

Replace the example origin with your actual domain. `PUBLIC_URL` must be an HTTPS origin, without a path, query, or credentials. Preserve the public `Host` header at the proxy. Returned links use this configured origin; arbitrary forwarded headers cannot change it. Cross-origin browser calls are rejected, while native MCP clients can connect without an Origin header.

Keep `.cache/search/` on persistent storage and use one API process. Both interfaces share the same provider budget, maximum of two running searches, and 15 searches per minute per socket IP. API/MCP requests also have a 120-per-minute socket-IP limit and 16 concurrent requests, a 64 KiB body limit, and a 10-second upload deadline. MCP tool-level rate errors include `retryAfterSeconds`; HTTP rate errors include `Retry-After`. Do not retry automatically in a tight loop.

Behind a proxy, callers may share its socket-IP quota. Configure additional edge rate limiting for a public service. The application deliberately does not trust `X-Forwarded-For`; multiple replicas require shared quotas and budget accounting before use. Stateless MCP does not remove those search-service constraints.

If `TYPESAFE_API_KEY` is configured on the server, search sends the user query and bounded public source evidence to TypeSafe for ranking. The key stays on the server. The application does not log query text, but operators should review proxy logging separately. See [search privacy and budget details](../search/README.md).

## Verification

```sh
npm run check
npm run mcp:smoke
```

The automated suite uses the official MCP client over local HTTP and tests both modern and 2025 protocol flows without paid provider requests or model downloads. `mcp:smoke` uses the real local semantic model, explicitly disables paid ranking, searches for an approval interaction, retrieves the top result's source, and checks returned asset links against the built app. Build the app and prepare the index first.

Desktop-client interfaces and public hosting need their own deployment-time check. After deploying, connect to the actual HTTPS URL, search, inspect a result, and open its preview. Watch HTTP 429/503 rates and the persisted budget ledger; if normal discovery fails or the budget grows unexpectedly, remove the `/mcp` proxy route while investigating. Do not log request bodies to diagnose it.

## References

- [Official MCP HTTP server guide](https://ts.sdk.modelcontextprotocol.io/v2/serving/http.html)
- [MCP legacy client support](https://ts.sdk.modelcontextprotocol.io/v2/serving/legacy-clients.html)
