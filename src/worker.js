/**
 * Worker entry for Whop hosting.
 *
 * Whop hosting builds this project on Cloudflare Workers, so `vite build`
 * emits two environments: `dist/client` (the storefront as static assets) and
 * `dist/server` (this module, bundled to the entry `index.js`).
 *
 * The storefront is a static single-page site, so the Workers Assets layer
 * normally answers file requests before this worker is ever invoked. The worker
 * therefore stays a thin, safe fallback: when the runtime exposes the assets
 * binding it serves the single-page shell for unknown paths, and otherwise it
 * reports the miss.
 *
 * One exception is deliberate. The asset layer answers a clean route URL such
 * as /returns with the single-page shell, so the document that owns that
 * route — kept in the build at /returns/index.html, carrying its own title,
 * canonical and social card — is never reached, and every path on the site
 * shares the home's head. For a plain navigation path with no file extension
 * the worker therefore asks for the directory index first and only falls back
 * to the shell when the route has no document of its own. Nothing else moves:
 * an asset that exists is still served as-is, and an unknown path still lands
 * on the home.
 */

const SHELL = "/index.html";
const NOT_FOUND = "Not found";

function isNavigation(request) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const accept = request.headers.get("accept") || "";
  return accept === "" || accept.includes("text/html") || accept.includes("*/*");
}

function shellRequest(url) {
  return new Request(new URL(SHELL, url), { method: "GET" });
}

/* True for a path that could be a route rather than a file: no extension in
   its last segment, and not already an index document. */
function isRoutePath(pathname) {
  if (pathname === "/" || pathname.endsWith("/index.html")) return false;
  const last = pathname.split("/").pop() || "";
  return last !== "" && !/\.[a-zA-Z0-9]+$/.test(last);
}

/* The document the route owns, if the build carries one: /returns is asked for
   as /returns/index.html. */
function routeDocumentRequest(url) {
  const trimmed = url.pathname.replace(/\/+$/, "");
  if (!trimmed) return null;
  return new Request(new URL(`${trimmed}/index.html`, url), { method: "GET" });
}

export default {
  async fetch(request, env) {
    const assets = env && env.ASSETS;
    if (assets && typeof assets.fetch === "function") {
      const url = new URL(request.url);
      if (isNavigation(request) && isRoutePath(url.pathname)) {
        const document = routeDocumentRequest(url);
        if (document) {
          const owned = await assets.fetch(document);
          if (owned.status === 200) return owned;
        }
      }
      const response = await assets.fetch(request);
      if (response.status !== 404) return response;
      if (!isNavigation(request) || url.pathname === SHELL) return response;
      return assets.fetch(shellRequest(url));
    }
    return new Response(NOT_FOUND, {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
