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

export default {
  async fetch(request, env) {
    const assets = env && env.ASSETS;
    if (assets && typeof assets.fetch === "function") {
      const response = await assets.fetch(request);
      if (response.status !== 404) return response;
      const url = new URL(request.url);
      if (!isNavigation(request) || url.pathname === SHELL) return response;
      return assets.fetch(shellRequest(url));
    }
    return new Response(NOT_FOUND, {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
