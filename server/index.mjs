import { serverEnv } from "./env.mjs";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, createReadStream } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { intelligentSearch } from "./jev-search.mjs";
import { entries } from "./retrieval.mjs";
import { traits, useCases } from "../src/lib/component-assessment.mjs";
export function validateRequest(body) {
  if (
    !body ||
    typeof body.query !== "string" ||
    !body.query.trim() ||
    body.query.length > 600
  )
    throw Error("Describe your task in 1 to 600 characters.");
  const filters = body.filters || {};
  if (typeof filters !== "object" || Array.isArray(filters))
    throw Error("Invalid filters");
  const allowed = {
    library: new Set(entries.map((e) => e.library)),
    category: new Set(entries.map((e) => e.category)),
    useCase: new Set(Object.keys(useCases)),
    style: new Set(Object.keys(traits.style.options)),
    motion: new Set(Object.keys(traits.motion.options)),
    setup: new Set(Object.keys(traits.setup.options)),
  };
  const clean = {};
  for (const [key, value] of Object.entries(filters)) {
    if (key === "savedIds") {
      if (
        !Array.isArray(value) ||
        value.length > 685 ||
        value.some((id) => !entries.some((e) => e.id === id))
      )
        throw Error("Invalid saved components");
      clean[key] = value;
      continue;
    }
    if (
      !allowed[key] ||
      typeof value !== "string" ||
      (value && !allowed[key].has(value))
    )
      throw Error("Invalid filters");
    if (value) clean[key] = value;
  }
  return { query: body.query.trim(), filters: clean };
}
const rate = new Map();
let active = 0;
export function createSearchServer({
  search = intelligentSearch,
  staticDir = resolve("dist"),
} = {}) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const json = (status, body) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(JSON.stringify(body));
    };
    if (url.pathname === "/api/search") {
      if (req.method !== "POST")
        return json(405, { error: "Use POST /api/search." });
      if (!req.headers["content-type"]?.startsWith("application/json"))
        return json(415, { error: "Use application/json." });
      // Do not allow cross-origin browser calls to consume the shared model budget.
      try {
        if (
          req.headers.origin &&
          new URL(req.headers.origin).host !== req.headers.host
        )
          return json(403, { error: "Cross-origin search is unavailable." });
      } catch {
        return json(403, { error: "Invalid origin." });
      }
      const ip = req.socket.remoteAddress,
        now = Date.now();
      if (rate.size > 1000)
        for (const [key, value] of rate)
          if (value.until < now) rate.delete(key);
      const record = rate.get(ip);
      const bucket =
        record?.until > now ? record : { count: 0, until: now + 60000 };
      rate.set(ip, bucket);
      if (++bucket.count > 15 || active >= 2) {
        res.setHeader("Retry-After", "30");
        return json(429, {
          error: "Search is busy. Please try again shortly.",
        });
      }
      active++;
      try {
        let bytes = 0;
        const chunks = [];
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 65536) {
            json(413, { error: "Search request too large." });
            req.resume();
            return;
          }
          chunks.push(chunk);
        }
        let input;
        try {
          input = validateRequest(JSON.parse(Buffer.concat(chunks).toString()));
        } catch {
          return json(400, {
            error:
              "Use a task of 1 to 600 characters and valid catalog filters.",
          });
        }
        try {
          return json(200, await search(input.query, input.filters));
        } catch {
          return json(503, {
            error:
              "Intelligent search is unavailable. You can still search by component name.",
          });
        }
      } catch {
        if (!res.headersSent && !res.destroyed)
          return json(400, { error: "Search request interrupted." });
      } finally {
        active--;
      }
    }
    if (url.pathname.startsWith("/api/"))
      return json(404, { error: "Not found" });
    if (!["GET", "HEAD"].includes(req.method))
      return json(405, { error: "Method not allowed" });
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return json(400, { error: "Invalid path" });
    }
    let file = resolve(staticDir, "." + pathname);
    if (!file.startsWith(staticDir + sep) && file !== staticDir)
      return json(403, { error: "Invalid path" });
    if (!existsSync(file) || !statSync(file).isFile()) {
      if (extname(pathname)) return json(404, { error: "Not found" });
      file = resolve(staticDir, "index.html");
    }
    if (!existsSync(file))
      return json(503, { error: "Build the app first with npm run build." });
    const mime = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".png": "image/png",
      ".ico": "image/x-icon",
      ".jpg": "image/jpeg",
      ".txt": "text/plain",
      ".woff2": "font/woff2",
    };
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") return res.end();
    createReadStream(file).pipe(res);
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === new URL(import.meta.url).pathname
) {
  const port = Number(serverEnv("PORT", "4174"));
  const server = createSearchServer();
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  server.listen(port, serverEnv("HOST", "127.0.0.1"), () =>
    console.log(`Super UI search and app: http://127.0.0.1:${port}`),
  );
}
