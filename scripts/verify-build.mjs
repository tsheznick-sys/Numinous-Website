/** Static release checks for the adopted home and the routed documents. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = "dist/client";
const text = (file) => readFileSync(join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Build verification failed: ${message}`);
};
const home = text("index.html");
assert(home.includes('id="hero-title"') && home.includes("Witness the"), "editorial home is missing");
assert(home.includes('href="/checkout/ch_wYXFulML0v6LIoJ"'), "free gate must use pre-checkout");
assert(home.includes("7 days free on the monthly plan"), "monthly trial terms must remain visible");
assert(!home.includes('href="https://whop.com/checkout/'), "home must not skip pre-checkout");
for (const css of ["numinous-clean.css", "numinous-home-acts.css", "numinous-subpages.css"]) {
  assert(existsSync(join(root, "assets", css)), `${css} missing`);
}
const cards = {
  "products/the-signal-e6": "signal.jpg",
  "products/the-numinary-3e": "watcher.jpg",
  "products/wallpaper-vault": "vault.jpg",
  "products/herald-app": "numinary.jpg",
  "collections/all": "bg_hero.jpg",
};
for (const [route, image] of Object.entries(cards)) {
  const html = text(join(route, "index.html"));
  assert(html.includes(`property="og:image" content="https://jointhenuminouses.whop.site/assets/${image}"`), `${route}: incorrect card image`);
  assert(html.includes(`name="twitter:image" content="https://jointhenuminouses.whop.site/assets/${image}"`), `${route}: incorrect Twitter image`);
  assert(existsSync(join(root, "assets", image)), `${route}: image asset missing`);
  assert(html.includes(`rel="canonical" href="https://jointhenuminouses.whop.site/${route}"`), `${route}: incorrect canonical`);
}
assert(!text("_redirects").includes("/checkout/*"), "wildcard redirect loses checkout plan ID");
assert(!/^\/\S+\/ \/\S+\/index\.html 200$/m.test(text("_redirects")), "trailing slash redirect loops at the asset layer");
// The old checkout URL must survive the handoff, with any query intact.
const boot = text("assets/numinous-gate-boot.js");
const id = "plan_PQnMYNixMTjRQ";
let forwarded = "";
const location = {
  pathname: `/checkout/${id}`, search: "?quantity=1", hash: "",
  replace(to) { forwarded = to; },
};
vm.runInNewContext(boot, { window: { location } });
assert(forwarded === `/checkout/index.html?quantity=1&from=%2Fcheckout%2F${id}`, "checkout boot lost the plan ID or query");
console.log("verify-build: home, gates, route cards, and checkout fallback passed");
