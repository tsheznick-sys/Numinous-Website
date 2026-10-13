/**
 * Local stand-in for the Whop host, so the built site can be walked by hand
 * before it is shipped. Serves dist/client with the host's own behaviour:
 *
 *   · an exact file path is served as-is
 *   · a directory path is served from its index.html
 *   · anything else falls back to the storefront home (dist/client/index.html)
 *
 * Run `npm run build` first, then `node preview-server.mjs [port]`.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "dist", "client");
const PORT = Number(process.argv[2] || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
};

function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(ROOT, clean);
  if (!candidate.startsWith(ROOT)) return join(ROOT, "index.html");
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const asDir = join(candidate, "index.html");
  if (existsSync(asDir)) return asDir;
  return join(ROOT, "index.html");
}

createServer((req, res) => {
  const file = resolve(req.url || "/");
  const body = readFileSync(file);
  res.writeHead(200, {
    "content-type": TYPES[extname(file)] || "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(body);
}).listen(PORT, "0.0.0.0", () => {
  console.log(`[preview] the house is open on http://0.0.0.0:${PORT} (serving dist/client)`);
});
