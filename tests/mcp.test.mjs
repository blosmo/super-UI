import test from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { createSearchServer } from "../server/index.mjs";

const match = {
  mode: "semantic",
  notice: "Showing semantic matches.",
  results: [
    { id: "beui:approval-card", label: "Related component", reasons: [] },
  ],
};
function rawRequest(url, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = request(url, { method, headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () =>
        resolve({
          status: res.statusCode,
          json: async () => JSON.parse(Buffer.concat(chunks).toString()),
        }),
      );
    });
    req.on("error", reject);
    req.end(body);
  });
}
async function fixture(t, options = {}) {
  const server = createSearchServer({
    search: async () => match,
    publicUrl: "",
    ...options,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    server,
    base,
    post: (path, body, headers = {}) =>
      fetch(base + path, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
      }),
  };
}
async function clientFor(t, base, modern = false) {
  const client = new Client(
    { name: "super-ui-test", version: "1.0.0" },
    modern ? { versionNegotiation: { mode: "auto" } } : {},
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL(base + "/mcp")),
  );
  t.after(() => client.close());
  return client;
}
const call = (client, name, args) => client.callTool({ name, arguments: args });

for (const modern of [false, true]) {
  test(`official MCP client discovers and calls tools (${modern ? "modern" : "2025 legacy"})`, async (t) => {
    let received;
    const { base } = await fixture(t, {
      search: async (query, filters) => {
        received = { query, filters };
        return match;
      },
    });
    const client = await clientFor(t, base, modern);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((tool) => tool.name).sort(), [
      "get_component",
      "search_components",
    ]);
    assert(tools.every((tool) => tool.annotations.readOnlyHint));
    const search = await call(client, "search_components", {
      query: "  approve an AI action  ",
      filters: { library: "beui" },
      limit: 1,
    });
    assert(!search.isError);
    assert.deepEqual(received, {
      query: "approve an AI action",
      filters: { library: "beui" },
    });
    const data = search.structuredContent;
    assert.equal(data.mode, "semantic");
    assert.equal(data.notice, match.notice);
    assert.equal(data.results[0].attribution.license, "MIT");
    const detail = await call(client, "get_component", {
      id: data.results[0].id,
    });
    assert(!detail.isError);
    assert.equal(detail.structuredContent.sourceBundleComplete, false);
    assert(
      detail.structuredContent.sources[0].originalUrl.startsWith("https://"),
    );
    assert.equal(
      detail.structuredContent.links.preview,
      `${base}/preview.html?id=beui%3Aapproval-card`,
    );
    const httpDetail = await fetch(
      base + "/api/components/beui%3Aapproval-card",
    ).then((r) => r.json());
    assert.deepEqual(httpDetail, detail.structuredContent);
  });
}

test("invalid tools, arguments, hidden IDs, and search failures stay bounded and sanitized", async (t) => {
  let searches = 0;
  const { base } = await fixture(t, {
    search: async () => {
      searches++;
      throw Error("PRIVATE_PROVIDER_TOKEN");
    },
  });
  const client = await clientFor(t, base);
  for (const args of [
    { query: "" },
    { query: "x".repeat(601) },
    { query: "x", limit: 11 },
    { query: "x", filters: { library: "reui" } },
    { query: "x", filters: { invented: "x" } },
  ]) {
    const invalid = await call(client, "search_components", args);
    assert(invalid.isError);
  }
  assert.equal(searches, 0);
  for (const id of [
    "reui:button",
    "transitions:button",
    "../../.env.local",
    "unknown",
  ]) {
    const invalid = await call(client, "get_component", { id });
    assert(invalid.isError);
    assert.match(invalid.content[0].text, /Component not found/);
    assert.equal(
      (await fetch(base + "/api/components/" + encodeURIComponent(id))).status,
      404,
    );
  }
  const failed = await call(client, "search_components", { query: "failure" });
  assert(failed.isError);
  assert(!JSON.stringify(failed).includes("PRIVATE_PROVIDER_TOKEN"));
  await assert.rejects(call(client, "not_a_tool", {}));
});

test("HTTP and separate MCP clients share search quotas", async (t) => {
  const { base, post } = await fixture(t);
  const first = await clientFor(t, base);
  const second = await clientFor(t, base);
  for (let i = 0; i < 15; i++) {
    if (i % 2)
      assert.equal(
        (await post("/api/search", { query: "approval" })).status,
        200,
      );
    else
      assert(
        !(await call(first, "search_components", { query: "approval" }))
          .isError,
      );
  }
  const busy = await call(second, "search_components", { query: "approval" });
  assert(busy.isError);
  assert.equal(busy.structuredContent.retryAfterSeconds, 30);
  const busyHttp = await post("/api/search", { query: "approval" });
  assert.equal(busyHttp.status, 429);
  assert.equal(busyHttp.headers.get("retry-after"), "30");
  assert(
    !(await call(second, "get_component", { id: "beui:approval-card" }))
      .isError,
  );
});

test("shared concurrent search slots release after failure", async (t) => {
  const pending = [];
  const { base, post } = await fixture(t, {
    search: () =>
      new Promise((resolve, reject) => pending.push({ resolve, reject })),
  });
  const client = await clientFor(t, base);
  const first = post("/api/search", { query: "one" });
  const second = call(client, "search_components", { query: "two" });
  while (pending.length < 2)
    await new Promise((resolve) => setImmediate(resolve));
  assert.equal((await post("/api/search", { query: "three" })).status, 429);
  pending[0].reject(Error("internal"));
  pending[1].resolve(match);
  await Promise.all([first, second]);
  const next = post("/api/search", { query: "next" });
  while (pending.length < 3)
    await new Promise((resolve) => setImmediate(resolve));
  pending[2].resolve(match);
  assert.equal((await next).status, 200);
});

test("HTTP boundary rejects untrusted hosts/origins, oversized bodies, and malformed JSON", async (t) => {
  const { base, post } = await fixture(t);
  const body = { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} };
  for (const headers of [
    { host: "attacker.example" },
    { origin: "null" },
    { origin: "https://127.0.0.1" },
    { origin: "http://127.0.0.1:1" },
    { origin: "not a URL" },
  ])
    assert.equal(
      (
        await rawRequest(base + "/mcp", {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: JSON.stringify(body),
        })
      ).status,
      403,
    );
  assert.equal((await post("/mcp", { query: "x".repeat(66000) })).status, 413);
  assert.equal(
    (
      await fetch(base + "/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      })
    ).status,
    400,
  );
  assert.equal(
    (await post("/mcp", body, { "content-type": "text/plain" })).status,
    415,
  );
  assert.equal((await fetch(base + "/mcp")).status, 405);
  const malformed = await post(
    "/mcp",
    { something: "invalid" },
    { accept: "application/json, text/event-stream" },
  );
  assert(malformed.status >= 400);
  assert.equal((await post("/api/search", { query: "approval" })).status, 200);
});

test("configured public origin produces absolute links without trusting forwarded headers", async (t) => {
  const { base, post } = await fixture(t, {
    publicUrl: "https://components.example",
  });
  const response = await rawRequest(base + "/api/components/shadcn%3Abutton", {
    headers: {
      host: "components.example",
      origin: "https://components.example",
      "x-forwarded-host": "attacker.example",
    },
  });
  assert.equal(response.status, 200);
  assert.equal(
    (await response.json()).links.details,
    "https://components.example/components/shadcn/button",
  );
  assert.equal(
    (
      await rawRequest(base + "/mcp", {
        method: "POST",
        headers: {
          host: "components.example",
          origin: "http://components.example",
          "content-type": "application/json",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  for (const publicUrl of [
    "http://public.example",
    "https://user:pass@example.com",
    "https://example.com/path",
    "https://example.com?x=1",
  ])
    assert.throws(() => createSearchServer({ publicUrl }));
});

test("explicit deployment aliases accept only their own HTTPS browser origin", async (t) => {
  const { base } = await fixture(t, {
    publicUrl: "https://components.example",
    allowedOrigins: ["https://deployment.example"],
  });
  const get = (origin) =>
    rawRequest(base + "/api/components/shadcn%3Abutton", {
      headers: { host: "deployment.example", origin },
    });
  const response = await get("https://deployment.example");
  assert.equal(response.status, 200);
  assert.equal(
    (await response.json()).links.details,
    "https://components.example/components/shadcn/button",
  );
  assert.equal((await get("https://attacker.example")).status, 403);
  assert.equal((await get("http://deployment.example")).status, 403);
});

test("stalled and aborted uploads do not consume search slots", async (t) => {
  const { server, base, post } = await fixture(t, { bodyTimeoutMs: 40 });
  const stalled = new Promise((resolve, reject) => {
    const req = request(
      base + "/mcp",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "100",
        },
      },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode));
      },
    );
    req.on("error", reject);
    req.write("{");
  });
  assert.equal(await stalled, 408);
  for (let i = 0; i < 16; i++) {
    const received = new Promise((resolve) => server.once("request", resolve));
    const req = request(base + "/api/search", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "100" },
    });
    req.on("error", () => {});
    req.write("{");
    const incoming = await received;
    const aborted = new Promise((resolve) => incoming.once("aborted", resolve));
    req.destroy();
    await aborted;
  }
  assert.equal((await post("/api/search", { query: "approval" })).status, 200);
});

test("source verification failures expose no excerpts or private errors through either interface", async (t) => {
  const { getComponent } = await import("../server/component-tools.mjs");
  const { base } = await fixture(t, {
    getDetails: (id, origin) =>
      getComponent(id, origin, {
        readEvidence: () => {
          throw Error("PRIVATE_SOURCE_PATH");
        },
      }),
  });
  const client = await clientFor(t, base);
  const result = await call(client, "get_component", { id: "shadcn:button" });
  assert(result.isError);
  assert(!JSON.stringify(result).includes("PRIVATE_SOURCE_PATH"));
  assert(!result.structuredContent.sources);
  const response = await fetch(base + "/api/components/shadcn%3Abutton");
  assert.equal(response.status, 503);
  assert(
    !JSON.stringify(await response.json()).includes("PRIVATE_SOURCE_PATH"),
  );
});

test("disconnecting an active MCP search holds its slot until settled and then releases it", async (t) => {
  const pending = [];
  const { server, base, post } = await fixture(t, {
    search: () => new Promise((resolve) => pending.push(resolve)),
  });
  let socket;
  server.on("request", (req) => {
    if (req.headers["x-test-disconnect"]) socket = req.socket;
  });
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "search_components", arguments: { query: "approval" } },
  });
  const req = request(base + "/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "x-test-disconnect": "yes",
    },
  });
  req.on("error", () => {});
  req.end(body);
  while (pending.length < 1)
    await new Promise((resolve) => setImmediate(resolve));
  const closed = new Promise((resolve) => socket.once("close", resolve));
  req.destroy();
  await closed;
  const activeHttp = post("/api/search", { query: "second" });
  while (pending.length < 2)
    await new Promise((resolve) => setImmediate(resolve));
  assert.equal((await post("/api/search", { query: "third" })).status, 429);
  pending[0](match);
  pending[1](match);
  await activeHttp;
  const client = await clientFor(t, base);
  const next = call(client, "search_components", { query: "next" });
  while (pending.length < 3)
    await new Promise((resolve) => setImmediate(resolve));
  pending[2](match);
  assert(!(await next).isError);
});

test("pre-parsed Vercel JSON bodies work and retain payload limits", async (t) => {
  const { createServer } = await import("node:http");
  const app = createSearchServer({ search: async () => match, publicUrl: "" });
  const handle = app.listeners("request")[0];
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    req.body = raw ? JSON.parse(raw) : undefined;
    await handle(req, res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const client = await clientFor(t, base);
  assert.equal((await client.listTools()).tools.length, 2);
  assert(
    !(await call(client, "search_components", { query: "approval" })).isError,
  );
  const large = await fetch(base + "/api/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "x", padding: " ".repeat(66000) }),
  });
  assert.equal(large.status, 413);
});
