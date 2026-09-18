import { serverEnv } from "./env.mjs";
import { createServer } from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { intelligentSearch } from "./jev-search.mjs";
import {
  createSearchService,
  createAdmissionGate,
  ServiceError,
} from "./search-service.mjs";
import { handleMcp } from "./mcp.mjs";
import { getComponent } from "./component-tools.mjs";
export { validateRequest } from "./search-service.mjs";

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
function configuredOrigin(value) {
  if (!value) return undefined;
  const url = new URL(value);
  if (
    (url.protocol !== "https:" &&
      !(url.protocol === "http:" && localHosts.has(url.hostname))) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw Error(
      "PUBLIC_URL must be an HTTPS origin (or HTTP localhost), without a path or credentials.",
    );
  return url.origin;
}

function requestOrigin(req, publicOrigin) {
  const host = req.headers.host;
  if (!host || /[\s/@?#\\]/.test(host))
    throw new ServiceError(403, "Invalid host.");
  const local = new URL(`http://${host}`);
  if (
    local.host !== host ||
    (!localHosts.has(local.hostname) &&
      host !== (publicOrigin && new URL(publicOrigin).host))
  )
    throw new ServiceError(
      403,
      "Unrecognized host. Configure PUBLIC_URL for hosted access.",
    );
  const origin =
    publicOrigin && host === new URL(publicOrigin).host
      ? publicOrigin
      : local.origin;
  if (req.headers.origin && req.headers.origin !== origin)
    throw new ServiceError(403, "Cross-origin requests are unavailable.");
  return publicOrigin || origin;
}

// Read before admitting search work, and release stalled uploads without retaining buffers.
function readJson(req, timeoutMs) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    const finish = (error, value) => {
      clearTimeout(timer);
      req.off("data", data);
      req.off("end", end);
      req.off("aborted", aborted);
      req.off("error", aborted);
      if (error) {
        req.resume();
        reject(error);
      } else resolve(value);
    };
    const data = (chunk) => {
      bytes += chunk.length;
      if (bytes > 65536)
        return finish(new ServiceError(413, "Request too large."));
      chunks.push(chunk);
    };
    const end = () => {
      try {
        finish(null, JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        finish(new ServiceError(400, "Invalid JSON request."));
      }
    };
    const aborted = () => finish(new ServiceError(400, "Request interrupted."));
    const timer = setTimeout(
      () => finish(new ServiceError(408, "Request body timed out.")),
      timeoutMs,
    );
    req
      .on("data", data)
      .once("end", end)
      .once("aborted", aborted)
      .once("error", aborted);
  });
}

export function createSearchServer({
  search = intelligentSearch,
  staticDir = resolve("dist"),
  publicUrl = serverEnv("PUBLIC_URL"),
  bodyTimeoutMs = 10000,
  getDetails = getComponent,
} = {}) {
  const publicOrigin = configuredOrigin(publicUrl);
  const runSearch = createSearchService(search);
  const admit = createAdmissionGate({ perMinute: 120, concurrency: 16 });
  return createServer(async (req, res) => {
    const json = (status, body) => {
      if (res.destroyed || res.headersSent) return;
      if (status === 429) res.setHeader("Retry-After", "30");
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(JSON.stringify(body));
    };
    let url;
    try {
      url = new URL(req.url, "http://localhost");
    } catch {
      return json(400, { error: "Invalid URL." });
    }
    const isMcp = url.pathname === "/mcp";
    const isSearch = url.pathname === "/api/search";
    const isComponent = url.pathname.startsWith("/api/components/");
    if (isMcp || isSearch || isComponent) {
      let release;
      try {
        const baseUrl = requestOrigin(req, publicOrigin);
        if (req.method !== (isComponent ? "GET" : "POST")) {
          res.setHeader("Allow", isComponent ? "GET" : "POST");
          return json(405, { error: "Method not allowed." });
        }
        release = admit(req.socket.remoteAddress);
        if (isComponent) {
          let id;
          try {
            id = decodeURIComponent(
              url.pathname.slice("/api/components/".length),
            );
          } catch {
            return json(400, { error: "Invalid component ID." });
          }
          try {
            return json(200, getDetails(id, baseUrl));
          } catch (error) {
            return json(error.message === "Component not found." ? 404 : 503, {
              error:
                "Component details unavailable. Use an approved catalog ID.",
            });
          }
        }
        if (
          !/^application\/json(?:\s*;|$)/i.test(
            req.headers["content-type"] || "",
          )
        )
          return json(415, { error: "Use application/json." });
        const body = await readJson(req, bodyTimeoutMs);
        if (isMcp) {
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("X-Content-Type-Options", "nosniff");
          return await handleMcp(req, res, {
            body,
            baseUrl,
            getDetails,
            search: (input) => runSearch(input, req.socket.remoteAddress),
          });
        }
        return json(200, await runSearch(body, req.socket.remoteAddress));
      } catch (error) {
        const status = error instanceof ServiceError ? error.status : 500;
        return json(status, {
          error:
            error instanceof ServiceError
              ? error.message
              : "Request unavailable.",
        });
      } finally {
        release?.();
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
