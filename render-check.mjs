/* Renders every routed page the way the browser will, straight from the
   sources the build compiles.

   src/site.js and src/records.js get every reference/patch module's source()
   hook applied in load order (the same order the build uses); the transformed
   pair is bundled with the same esbuild Vite uses, then evaluated against a
   small DOM stub, one fresh document per route. The rendered markup is what
   the assertions read.

   A verification tool, not part of the build. Run it after `npm ci`:
       node render-check.mjs
   Prints one line per case, exits non-zero on any failure. */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const PATCH = "reference/patch";
const mods = [];
for (const file of readdirSync(PATCH).filter((n) => n.endsWith(".mjs")).sort()) {
  const mod = (await import(pathToFileURL(join(process.cwd(), PATCH, file)).href)).default;
  if (mod) mods.push(mod);
}

function transform(file, code) {
  let out = code;
  for (const mod of mods) {
    if (typeof mod.source !== "function") continue;
    const next = mod.source(file, out);
    if (typeof next === "string" && next !== out) out = next;
  }
  return out;
}

/* the same rewrite the build's virtual module applies to the onboard record */
const onboard = JSON.parse(readFileSync("coldstorage/onboard.json", "utf8"));
for (const work of Object.keys(onboard.checkout || {})) {
  onboard.checkout[work] = onboard.checkout[work].replace(
    "://jointhenuminouses.whop.site/checkout/",
    "://whop.com/checkout/",
  );
}

const dir = "/tmp/numinous-render/src";
mkdirSync(dir, { recursive: true });
mkdirSync("/tmp/numinous-render/coldstorage", { recursive: true });
writeFileSync(join(dir, "site.js"), transform("src/site.js", readFileSync("src/site.js", "utf8")));
writeFileSync(join(dir, "records.js"), transform("src/records.js", readFileSync("src/records.js", "utf8")));
writeFileSync("/tmp/numinous-render/coldstorage/onboard.json", JSON.stringify(onboard));

const built = esbuild.buildSync({
  entryPoints: [join(dir, "site.js")],
  bundle: true,
  format: "iife",
  write: false,
  platform: "browser",
  target: "es2020",
  logLevel: "silent",
});
const bundle = built.outputFiles[0].text;

/* ---- the smallest DOM that lets site.js boot and render ---- */
function makeDom(path, search = "") {
  const el = (tag = "div") => {
    const node = {
      tagName: tag.toUpperCase(),
      children: [],
      attrs: {},
      style: {},
      dataset: {},
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      _html: "",
      get innerHTML() { return this._html; },
      set innerHTML(v) { this._html = String(v); },
      textContent: "",
      value: "",
      setAttribute(k, v) { this.attrs[k] = String(v); },
      getAttribute(k) { return this.attrs[k] ?? null; },
      removeAttribute(k) { delete this.attrs[k]; },
      appendChild(c) { this.children.push(c); return c; },
      append(...c) { this.children.push(...c); },
      prepend() {}, after() {}, before() {}, remove() {},
      insertAdjacentHTML(_p, html) { this._html += html; },
      addEventListener() {}, removeEventListener() {},
      querySelector(s) { return this.querySelectorAll(s)[0] ?? null; },
      querySelectorAll() { return []; },
      closest() { return null; }, focus() {}, matches() { return false; },
      getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; },
    };
    return node;
  };
  const byId = {};
  for (const id of ["main", "nav", "foot", "cookie", "records", "cookiebar", "veil"])
    byId[id] = el("div");
  const store = () => {
    const d = {};
    return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; } };
  };
  const location = {
    href: `https://jointhenuminouses.whop.site${path}${search}`,
    origin: "https://jointhenuminouses.whop.site",
    protocol: "https:", host: "jointhenuminouses.whop.site",
    pathname: path, search, hash: "",
    replace() {},
  };
  const document = {
    documentElement: el("html"), body: el("body"), head: el("head"),
    title: "",
    createElement: (t) => el(t), createElementNS: (_n, t) => el(t),
    createDocumentFragment: () => el("fragment"), createTextNode: (t) => ({ textContent: t }),
    getElementById: (id) => byId[id] ?? null,
    querySelector: (s) => (s.startsWith("#") ? byId[s.slice(1)] ?? null : null),
    querySelectorAll: () => [],
    addEventListener() {}, removeEventListener() {},
    readyState: "complete", hidden: false, cookie: "",
    fonts: { ready: Promise.resolve() },
  };
  const window = {
    location, document,
    history: {
      state: null,
      pushState() {}, replaceState() {},
    },
    addEventListener() {}, removeEventListener() {}, scrollTo() {}, scroll() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    localStorage: store(), sessionStorage: store(),
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    setTimeout, clearTimeout, setInterval, clearInterval,
    innerWidth: 1440, innerHeight: 900, scrollY: 0, scrollX: 0,
    open() {}, print() {}, getComputedStyle: () => ({ getPropertyValue: () => "" }),
  };
  const sandbox = {
    window, document, location, history: window.history,
    localStorage: window.localStorage, sessionStorage: window.sessionStorage,
    matchMedia: window.matchMedia, requestAnimationFrame: window.requestAnimationFrame,
    setTimeout, clearTimeout, setInterval, clearInterval, console,
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
    IntersectionObserver: class { observe() {} disconnect() {} unobserve() {} },
    ResizeObserver: class { observe() {} disconnect() {} unobserve() {} },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    URL, URLSearchParams, Date, Math, JSON, Promise, Map, Set, Array, Object, String, Number,
    requestIdleCallback: (fn) => setTimeout(fn, 0),
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  return { byId, sandbox, window, document };
}

const cases = [
  ["/products/the-signal-e6"], ["/products/the-numinary-3e"], ["/products/wallpaper-vault"],
  ["/products/herald-app"], ["/collections/all"], ["/order-complete"], ["/returns"], ["/terms"],
  ["/privacy"], ["/cookies"], ["/eula"], ["/refunds"], ["/checkout"], ["/does-not-exist"],
  /* the older checkout links land on the threshold with the plan in the query */
  ["/checkout", "?from=/checkout/plan_PQnMYNixMTjRQ"],
  ["/checkout", "?from=/checkout/ch_wYXFulML0v6LIoJ"],
  ["/checkout", "?from=/checkout/plan_Aew5DdipP3fKY"],
  ["/checkout", "?from=/checkout/plan_GONE"],
  ["/checkout", "?from=/checkout/plan_hIKLCR4hGiv9B"],
  /* a purchase returning from Whop */
  ["/order-complete", "?plan=plan_Aew5DdipP3fKY&work=vault"],
  ["/order-complete", "?plan=plan_PQnMYNixMTjRQ&work=watcher"],
  ["/order-complete", "?status=failed"],
  // TASK 7 · the Whop dashboard redirects carry the gate by name, so the
  // dashboard setting alone can name the purchase — no plan in the URL needed.
  ["/order-complete", "?gate=signal"],
  ["/order-complete", "?gate=watcher"],
];

const rendered = {};
for (const [route, search] of cases) {
  const dom = makeDom(route, search || "");
  const context = vm.createContext(dom.sandbox);
  try {
    vm.runInContext(bundle, context, { timeout: 20000 });
  } catch (error) {
    console.log(`  [render] ${route}${search || ""}: ${String(error.message).split("\n")[0].slice(0, 120)}`);
  }
  const main = dom.byId.main;
  const body = dom.document.body;
  rendered[route + (search || "")] =
    main._html + main.children.map((c) => c._html ?? "").join("") +
    body._html + body.children.map((c) => c._html ?? "").join("") +
    (dom.byId.cookie?._html ?? "") + (dom.byId.cookiebar?._html ?? "");
}

if (process.argv.includes("--dump")) {
  const strip = (h) =>
    h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  for (const key of Object.keys(rendered)) console.log(`===== ${key}\n${strip(rendered[key]).slice(0, 1100)}\n`);
  process.exit(0);
}

/* ---- assertions ---- */
let ok = 0;
const fails = [];
const has = (route, s) => {
  if ((rendered[route] ?? "").includes(s)) ok++;
  else fails.push(`${route}: missing ${JSON.stringify(s)}`);
};
const lacks = (route, s) => {
  if (!(rendered[route] ?? "").includes(s)) ok++;
  else fails.push(`${route}: still has ${JSON.stringify(s)}`);
};

has("/products/the-signal-e6", "Free forever. No card, no renewal. Every realm drops here 24 hours before the feed.");
has("/products/the-signal-e6", "Free forever");
has("/products/the-signal-e6", "No card");
lacks("/products/the-signal-e6", "No card needed");
has("/products/the-signal-e6", "This site remembers Accept or Decline in your browser.");

has("/products/the-numinary-3e", "7 days free, then $28 every 28 days, or $280 a year.");
has("/products/the-numinary-3e", "The room that runs on the moon.");
has("/products/the-numinary-3e", "plan_Imfk0oedwYn7v");
lacks("/products/the-numinary-3e", "charged when you join");
lacks("/products/the-numinary-3e", "Your card is charged when you join.");

has("/products/wallpaper-vault", "Fifteen wallpapers, each in phone, portrait, and desktop.");
has("/products/wallpaper-vault", "$12 once. Final once opened.");
has("/products/wallpaper-vault", "listing that was materially wrong");

has("/products/herald-app", "The next realm, delivered first.");
has("/products/herald-app", "A free app. Not The Signal.");
has("/products/herald-app", "Free forever");
has("/products/herald-app", "No card");
lacks("/products/herald-app", "by another name");
lacks("/products/herald-app", "No card needed");
has("/products/wallpaper-vault", "I / IV");      // the other gates are numbered
has("/products/wallpaper-vault", "IV / IV");
has("/products/herald-app", "I / IV");           // the herald lists the other three

has("/collections/all", "Four gates. Start at the free gate");
has("/collections/all", "Fifteen wallpapers, each in phone, portrait, and desktop.");
has("/collections/all", "Night Watcher trial");
has("/collections/all", "Wallpaper Vault");
lacks("/collections/all", "Numinous Vault");
lacks("/collections/all", "Three works");
lacks("/collections/all", "I / III");

has("/order-complete?plan=plan_Aew5DdipP3fKY&work=vault", "SUGGESTED NEXT");
has("/order-complete?plan=plan_Aew5DdipP3fKY&work=vault", "The Signal is free forever. The Watcher is 7 days free, then $28 every 28 days.");
has("/order-complete?plan=plan_Aew5DdipP3fKY&work=vault", "v2-next-card");
lacks("/order-complete?plan=plan_Aew5DdipP3fKY&work=vault", "THE HOUSE KEEPS FOUR GATES");
has("/order-complete?plan=plan_Aew5DdipP3fKY&work=vault", "The Wallpaper Vault is $12 once.");
lacks("/order-complete?plan=plan_Aew5DdipP3fKY&work=vault", "THE HOUSE KEEPS THREE WORKS");
has("/order-complete?plan=plan_PQnMYNixMTjRQ&work=watcher", "seven nights");
has("/order-complete?status=failed", "The gate held.");
/* TASK 7 · ?gate= alone is enough — the dashboard redirects name the purchase */
has("/order-complete?gate=signal", "The Signal");
has("/order-complete?gate=signal", "The First Vision wait in your Whop library");
has("/order-complete?gate=signal", "v2-next-card");
/* a bare visit to the post-checkout page names no purchase: it goes behind the Watcher's door */
has("/order-complete", "Continue to The Watcher");
has("/order-complete?gate=signal", "/products/the-signal-e6");
has("/order-complete?gate=watcher", "/products/the-numinary-3e");
has("/returns", "Premium works");
has("/returns", "/checkout/plan_PQnMYNixMTjRQ");
has("/returns", "/checkout/plan_Aew5DdipP3fKY");
has("/returns", "/checkout/plan_Imfk0oedwYn7v");
lacks("/returns", "whop.com/checkout/");

lacks("/order-complete", "you are inside");
has("/checkout?from=/checkout/plan_hIKLCR4hGiv9B", "The Herald");
lacks("/order-complete?gate=signal", "The gate has opened · Numinous");
has("/order-complete?gate=watcher", "The Watcher");
has("/order-complete?gate=watcher", "Week I, The Realm, is already open on your seat");
has("/order-complete?gate=watcher", "7 days free, then $28 every 28 days");

has("/refunds", "The Signal and the Herald app have nothing to refund.");
has("/refunds", "The Watcher&rsquo;s first seven nights are free.".replace("&rsquo;", "'"));
has("/refunds", "numinous.support@gmail.com");
lacks("/refunds", "Numinous Vault");

has("/cookies", "Whop injects its own first-party pixel");
has("/checkout", "THIS GATE HAS GROWN OLD");
has("/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "The Watcher");
has("/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "7 days free, then $28 every 28 days");
has("/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "v2-invite-film");
has("/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "watcher-invite-1440.mp4");
has("/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "whop.com/checkout/plan_PQnMYNixMTjRQ");
has("/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "whop.com/checkout/plan_Imfk0oedwYn7v");
has("/checkout?from=/checkout/ch_wYXFulML0v6LIoJ", "SIX CHAMBERS, ONE GATE");
has("/checkout?from=/checkout/ch_wYXFulML0v6LIoJ", "signal-invite-1440.mp4");
has("/checkout?from=/checkout/ch_wYXFulML0v6LIoJ", "Field Journal");
has("/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "The seven-night guarantee");
has("/checkout?from=/checkout/plan_Aew5DdipP3fKY", "The Wallpaper Vault");
has("/checkout?from=/checkout/plan_Aew5DdipP3fKY", "Final once opened");
has("/checkout?from=/checkout/plan_Aew5DdipP3fKY", "Continue on Whop");
has("/checkout?from=/checkout/plan_GONE", "THIS GATE HAS GROWN OLD");
for (const key of ["/checkout?from=/checkout/plan_PQnMYNixMTjRQ", "/checkout?from=/checkout/plan_Aew5DdipP3fKY", "/checkout?from=/checkout/plan_GONE"])
  lacks(key, "https://jointhenuminouses.whop.site/checkout/");

/* the cookie notice, in-flow, on every shell page */
for (const route of ["/products/the-signal-e6", "/refunds", "/collections/all", "/checkout", "/cookies"]) {
  has(route, "This site remembers Accept or Decline in your browser.");
}
for (const route of ["/products/the-signal-e6", "/refunds", "/collections/all", "/checkout"]) {
  lacks(route, "The Realm keeps its record light");   // the bar only; /cookies keeps its record prose
}

console.log(`render-check: ${ok} passed, ${fails.length} failed`);
for (const f of fails) console.log("  FAIL " + f);
process.exit(fails.length ? 1 : 0);
