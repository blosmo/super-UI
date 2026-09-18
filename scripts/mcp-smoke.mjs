import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { createSearchServer } from "../server/index.mjs";
import { intelligentSearch } from "../server/jev-search.mjs";

if (!existsSync(new URL("../dist/preview.html", import.meta.url)))
  throw Error("Run npm run build before the MCP smoke test.");
const server = createSearchServer({
  publicUrl: "",
  search: (query, filters) => intelligentSearch(query, filters, { key: "" }),
});
const client = new Client({ name: "super-ui-smoke", version: "1.0.0" });
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  await client.connect(
    new StreamableHTTPClientTransport(new URL(base + "/mcp")),
  );
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 2);
  const search = await client.callTool({
    name: "search_components",
    arguments: {
      query: "Let people approve an AI action",
      filters: { library: "beui" },
      limit: 3,
    },
  });
  assert(!search.isError, JSON.stringify(search));
  assert.equal(search.structuredContent.mode, "semantic");
  assert(search.structuredContent.results.length > 0);
  const selected = search.structuredContent.results[0];
  assert.equal(selected.libraryId, "beui");
  const detail = await client.callTool({
    name: "get_component",
    arguments: { id: selected.id },
  });
  assert(!detail.isError);
  assert(detail.structuredContent.sources.length > 0);
  for (const [kind, url] of Object.entries(detail.structuredContent.links)) {
    const response = await fetch(url);
    assert.equal(response.status, 200, `${kind} link is unavailable`);
    const body = await response.arrayBuffer();
    assert(body.byteLength > 0);
    if (kind === "preview")
      assert(Buffer.from(body).toString().includes('src="/assets/preview-'));
  }
  console.log(
    JSON.stringify(
      {
        tools: tools.tools.map((tool) => tool.name),
        mode: search.structuredContent.mode,
        results: search.structuredContent.results.map((entry) => entry.id),
        verifiedSources: detail.structuredContent.sources.length,
        links: "passed",
        paidRanking: false,
      },
      null,
      2,
    ),
  );
} finally {
  await client.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
