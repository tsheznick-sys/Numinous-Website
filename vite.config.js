import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import { pathToFileURL } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import { whop } from "@whop/cli/vite";

const routes = [
  "products/the-signal-e6",
  "products/the-numinary-3e",
  "products/herald-app",
  "products/wallpaper-vault",
  "collections/all",
  "order-complete",
  "returns",
  "terms",
  "privacy",
  "cookies",
];

const LIVE_HOST = "jointhenuminouses.whop.site";
const REF_HOST = "thenuminouses.whop.site";
const REF = join("reference", "web-version");
const REF_PUBLIC = join(REF, "public");
// The storefront home is the index bundle's own document: one static page
// carrying its own stylesheet, its own art and the house's checkouts.
// One file is retired with the style swap but is still touched once during a
// build: the repo's index.html — the Vite entry — links src/styles.css, and
// that link is refreshed in its own later commit. An empty stand-in keeps the
// build whole until then. Nothing in the site reads it, and the stand-in is
// never published.
for (const retired of ["src/styles.css"]) {
  if (!existsSync(join(process.cwd(), retired))) {
    mkdirSync(dirname(join(process.cwd(), retired)), { recursive: true });
    writeFileSync(
      join(process.cwd(), retired),
      "/* retired with the style swap - an empty stand-in for this build only */\n",
    );
    console.log(`[numinous] retired file stubbed for this build: ${retired}`);
  }
}

const HOME_SRC = join("reference", "patch", "clean", "home.html");
// The design itself, served to every page: the bundle's stylesheet, lifted
// verbatim, plus the sheet that dresses the routed pages in the same language.
const CLEAN_CSS = "/assets/numinous-clean.css";
const SUBPAGES_CSS = "/assets/numinous-subpages.css";
const SUBPAGES_SHEET = join("reference", "patch", "v2", "subpages.css");
// The design's own bytes (stylesheet, art, self-hosted type) live with the
// clean source in the reference tree, because the kit commits reference/ and
// nothing else: staging from here is what guarantees the deployed site serves
// the design at all. public/ carries matching copies for the dev server only.
const DESIGN_PUBLIC = join("reference", "patch", "clean", "public");
// What the kit itself carries, and what it reads out of the client's bundle.
const DESIGN_FILES = ["assets/numinous-clean.css"];
// The art and the self-hosted type are too heavy for a kit that has to be
// handed over as text. They come from the client's own index bundle, whose
// bytes never change: the build copies them out once, caches them beside the
// clean source (so a commit can carry them from then on) and stages them into
// the site. Sizes and checksums are pinned — a different file fails the build
// rather than dressing the house in something nobody chose.
const DESIGN_BUNDLE =
  process.env.NUMINOUS_DESIGN_BUNDLE ||
  "https://drive.usercontent.google.com/download?id=1Og6xKN_uBV8YeMZOWKRp503Pjv-MC_9S&export=download&confirm=t";
const DESIGN_FETCH = [
  ["assets/bg_hero.jpg", 212781, "5c2033af64ec5261706b40c2af8b140e"],
  ["assets/logo_alpha.webp", 38912, "845cefec93d4b1de6ff04f4d5f5f887a"],
  ["assets/numinary.jpg", 208142, "8813e23900f1a302437b234d48c030cb"],
  ["fonts/Cinzel-700-latin.woff2", 25904, "e7ed1ab78a1744183d3dde29701c5fa8"],
  ["fonts/Cinzel-900-latin.woff2", 25904, "e7ed1ab78a1744183d3dde29701c5fa8"],
  ["fonts/CormorantGaramond-400-latin.woff2", 37640, "c47ff12887a36dac62f887a6fdb51066"],
  ["fonts/CormorantGaramond-500-latin.woff2", 37640, "c47ff12887a36dac62f887a6fdb51066"],
  ["fonts/Manrope-latin.woff2", 24836, "938c6e8019b69313372c47dbb7a7c930"],
];
const MERGED_MARK = "<!-- numinous-merged-home -->";
// The consent record's single key, in the shell and on the home alike.
const COOKIE_KEY = "numinous-record";
// The home carries this marker in the bundle's own document, so the merge can
// prove it adopted the right page before anything is published.
const HOME_MARK = "<!-- numinous-clean-home -->";
// This host answers the clean route URLs with the storefront home document: it
// resolves exact file paths and falls back to /index.html, and it applies no
// html_handling redirects (a request for <route> never reaches the routed page
// kept at <route>/index.html). Two guards ride along with every build: a
// _redirects rule proxying the clean URL to the routed page, and a boot script
// carried by the home that forwards a gate path to its own page before paint.
const GATE_BOOT = "/assets/numinous-gate-boot.js";
// TASK 6 · the motion layer. The vendored Motion bundle and the house's own
// layer are concatenated into one file at build time and carried by EVERY
// document — the adopted home runs the design's own script and never loads the
// app bundle, so motion has to be its own script to reach both. A missing half
// is a warning, never a failure: a site without weather is still a site.
const MOTION_VENDOR = join("reference", "vendor", "motion", "motion.mjs");
const MOTION_LAYER = join("reference", "patch", "v2", "motion-layer.js");
const MOTION_OUT = "/assets/numinous-motion.js";
// The CSS half of the layer is its own file, not part of the house sheet: the
// home takes the motion rules and nothing else — the routed-page rules in
// subpages.css speak to shells the home does not have and must never be let
// near the design's own document.
const MOTION_CSS_SRC = join("reference", "patch", "v2", "motion.css");
const MOTION_CSS = "/assets/numinous-motion.css";
const MOTION_CSS_TAG = `<link rel="stylesheet" href="${MOTION_CSS}">`;
// The home's own sheet: the two sections the house added to the design's last
// acts. The home carries the design's sheet and the motion sheet and nothing
// else of ours, so this is where its own components dress.
const HOME_ACTS_CSS_SRC = join("reference", "patch", "v2", "home-acts.css");
const HOME_ACTS_CSS = "/assets/numinous-home-acts.css";
const MOTION_TAG = `<script type="module" src="${MOTION_OUT}"></script>`;
// The overhaul modules: every reference/patch/*.mjs present at build time is
// loaded and folded in here, so one kit can carry the engine while later kits
// carry content. A module may offer { routes, source, home, css, emit }:
//   routes  - extra routed pages (shells + _redirects + boot list)
//   source  - rewrite a module's source before Vite compiles it (site.js, records.js)
//   home    - rewrite the pulled home document before the merge invariants run
//   css     - extra rules, appended after the polish layers on every page
//   emit    - write build outputs (sitemap, robots, headers, 404) into dist/client
// A missing directory, a broken module, or a module that throws is reported and
// never stops the build; the site simply keeps the previous behaviour.
const PATCH_DIR = join("reference", "patch");
let OVERHAUL = [];

async function loadOverhaul(root) {
  const dir = join(root, PATCH_DIR);
  if (!existsSync(dir)) return [];
  const loaded = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".mjs")).sort()) {
    try {
      const mod = await import(pathToFileURL(join(dir, file)).href);
      if (mod?.default) {
        loaded.push(mod.default);
        console.log(`[numinous] overhaul module loaded: ${file}`);
      }
    } catch (error) {
      console.warn(`[numinous] overhaul module failed to load (${file}): ${error.message}`);
    }
  }
  return loaded;
}

// Rewrites a module's source at compile time, before any other transform.
function overhaulSources() {
  return {
    name: "numinous-overhaul-sources",
    enforce: "pre",
    transform(code, id) {
      if (!OVERHAUL.length) return null;
      const file = id.split("?")[0];
      let out = code;
      for (const mod of OVERHAUL) {
        if (typeof mod.source !== "function") continue;
        const next = mod.source(file, out);
        if (typeof next === "string" && next !== out) out = next;
      }
      return out === code ? null : { code: out, map: null };
    },
  };
}

// Text files carried over from the pulled build get the live host written in.
const TEXT_EXT = new Set([
  ".xml",
  ".webmanifest",
  ".txt",
  ".js",
  ".css",
  ".html",
  ".json",
  ".svg",
  ".mjs",
]);

// The pulled public tree, but only what the storefront actually asks for:
// self-hosted type, the films and their art, the icons, the sitemap, the
// service worker. The codex/collector briefing sets belong to products the
// house does not sell and are left out.
const REF_ASSETS = [
  "fonts",
  "assets/bg_hero.jpg",
  "assets/bg_collector.jpg",
  "assets/logo_alpha.webp",
  "assets/numinary.jpg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/briefing/ambient.m4a",
  "assets/briefing/films",
  "assets/briefing/shared",
  "banner.png",
  "og.png",
  "favicon.ico",
  "wordmark.svg",
  "manifest.webmanifest",
  "sitemap.xml",
  "sw.js",
  ".well-known",
];

// The onboard record still lists the older app-domain checkout form for three
// works. On the live host nothing serves /checkout/*, so that form lands on the
// storefront home instead of a checkout. Every button is pointed at the
// canonical hosted checkout on whop.com as the bundle is built.
function canonicalCheckouts() {
  const virtual = "\0canonical-onboard";
  return {
    name: "canonical-checkouts",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.endsWith("coldstorage/onboard.json")) return null;
      return virtual;
    },
    load(id) {
      if (id !== virtual) return null;
      const file = join(process.cwd(), "coldstorage", "onboard.json");
      const data = JSON.parse(readFileSync(file, "utf8"));
      for (const work of Object.keys(data.checkout || {})) {
        data.checkout[work] = data.checkout[work].replace(
          "://jointhenuminouses.whop.site/checkout/",
          "://whop.com/checkout/",
        );
      }
      return "export default " + JSON.stringify(data) + ";";
    },
  };
}

function hasTextExt(path) {
  return TEXT_EXT.has(extname(path).toLowerCase());
}

// A polish layer that has not been authored yet is simply left out: the build
// stays green and the house falls back to the theme and the bridge alone.
function readIf(path) {
  return existsSync(path) ? readFileSync(path, "utf8").trim() : "";
}

// Copy one path out of the pulled build, never over anything the storefront
// already ships itself, and never leaving the old host in a text file.
function copyRef(from, to) {
  if (!existsSync(from)) {
    console.warn(`[numinous] reference asset missing, skipped: ${from}`);
    return;
  }
  if (statSync(from).isDirectory()) {
    for (const entry of readdirSync(from)) copyRef(join(from, entry), join(to, entry));
    return;
  }
  if (existsSync(to)) return;
  mkdirSync(dirname(to), { recursive: true });
  if (hasTextExt(to)) {
    const text = readFileSync(from, "utf8").replaceAll(REF_HOST, LIVE_HOST);
    writeFileSync(to, text);
  } else {
    cpSync(from, to);
  }
}

// The herald form of the pulled build hands off to its own server route
// (/api/herald), which the static storefront does not run. This override
// keeps the same pact, the same notes and the same shake — but the handoff
// opens the canonical free Signal checkout directly, so no traveller is

// Every routed page, proxied from its clean URL to the document that holds it.
function gateRedirects() {
  const lines = [
    "# Numinous: every routed page is its own document at <route>/index.html.",
    "# The host resolves exact file paths, so both spellings of the clean URL",
    "# are proxied to the document. The home carries the boot for anything",
    "# that reaches it instead.",
  ];
  for (const route of routes) {
    lines.push(`/${route} /${route}/index.html 200`);
    lines.push(`/${route}/ /${route}/index.html 200`);
  }
  return lines.join("\n") + "\n";
}

// Handed to the home document: a visitor bound for a gate is moved to that
// gate's own page at once, before the home paints. The gate puts the clean URL
// back (see currentPath in src/site.js), so the address bar never shows /index.html.
function gateBootScript() {
  const list = routes.map((route) => `/${route}`);
  return `/* Numinous house boot. The clean route URLs are answered with the storefront
   home document, so two families are forwarded before the home paints:
     · a gate path   → its own routed document
     · an old checkout link (/checkout/plan_…, /checkout/ch_…) → the threshold
       document, which says what the link was for and opens the live gate.
   Both keep the query and the hash, and the checkout family carries the path
   it came from as ?from=, so the threshold can name the old door. */
(function () {
  var routes = ${JSON.stringify(list)};
  var path = window.location.pathname;
  if (/\\/index\\.html$/i.test(path)) return;
  if (/^\\/checkout\\/[^/]/.test(path)) {
    var to =
      "/checkout/index.html" + window.location.search +
      (window.location.search ? "&" : "?") + "from=" + encodeURIComponent(path) +
      window.location.hash;
    window.location.replace(to);
    return;
  }
  var clean = path.replace(/\\/+$/, "") || "/";
  if (routes.indexOf(clean) === -1) return;
  window.location.replace(clean + "/index.html" + window.location.search + window.location.hash);
})();
`;
}

// The motion layer, assembled: the vendored Motion bundle verbatim, then the
// house's own layer, as one module. Written beside the site's other assets, so
// every document can pull it with a plain module tag.
function emitMotionLayer(root, clientDir) {
  const vendor = join(root, MOTION_VENDOR);
  const layer = join(root, MOTION_LAYER);
  if (!existsSync(vendor) || !existsSync(layer)) {
    console.warn(
      "[numinous] motion layer not written — the vendored bundle or the layer itself is missing",
    );
    return false;
  }
  const out = join(clientDir, ...MOTION_OUT.split("/").filter(Boolean));
  mkdirSync(dirname(out), { recursive: true });
  const body = readFileSync(vendor, "utf8") + "\n" + readFileSync(layer, "utf8");
  writeFileSync(out, body);
  const actsFrom = join(root, HOME_ACTS_CSS_SRC);
  if (!existsSync(actsFrom)) {
    throw new Error(
      `[numinous] ${HOME_ACTS_CSS_SRC} is missing — the home's own acts (the pact, the questions) would open undressed.`,
    );
  }
  writeFileSync(join(clientDir, ...HOME_ACTS_CSS.split("/").filter(Boolean)), readFileSync(actsFrom, "utf8"));
  const cssFrom = join(root, MOTION_CSS_SRC);
  if (existsSync(cssFrom)) {
    const cssOut = join(clientDir, ...MOTION_CSS.split("/").filter(Boolean));
    writeFileSync(cssOut, readFileSync(cssFrom, "utf8"));
  } else {
    console.warn(`[numinous] ${MOTION_CSS_SRC} missing — the layer runs without its measured half`);
  }
  console.log(`[numinous] motion layer written (${body.length} bytes)`);
  return true;
}

// The pulled home page, wired to the live house: canonical hosted checkouts,
// the live host everywhere, the house cookie key, no reliance on the pulled
// server routes. Refuses to emit a half-merged page.

function mergeHome(html, freeCheckout, housePolish = "") {
  // The design modules no longer own the home: they rewrote the pulled
  // storefront document, and that document is retired. The bundle's home is
  // adopted as it stands, so only the funnel's own invariants are enforced.
  if (!html.includes(HOME_MARK)) {
    throw new Error(
      `[numinous] ${HOME_SRC} is not the index bundle's home document ` +
        "(missing its marker). Refusing to publish a half-merged home.",
    );
  }
  if (!html.includes('class="works"') || !html.includes("numinous-clean.css")) {
    throw new Error(
      "[numinous] the home document lost its works grid or its stylesheet. " +
        "Refusing to publish a home without the design.",
    );
  }
  let out = html
    .replaceAll(`https://${LIVE_HOST}/checkout/`, "https://whop.com/checkout/")
    .replaceAll(`https://${REF_HOST}/checkout/`, "https://whop.com/checkout/")
    .replaceAll(REF_HOST, LIVE_HOST)
    // The live host contains the reference host ("join|thenuminouses"), so the
    // pass above double-prefixes any URL that was already on the live host.
    .replaceAll(`join${LIVE_HOST}`, LIVE_HOST)
    .replaceAll('"/checkout/', '"https://whop.com/checkout/')
    .replaceAll("'/checkout/", "'https://whop.com/checkout/")
    // one consent record, one key, in the shell and on the home alike
    .replaceAll("numinous-consent", COOKIE_KEY)
    // TASK 7 · the free gate runs through the house's own pre-checkout page:
    // its film, the six chambers, the no-card promise, and only then Whop.
    // The paid gates keep going straight to Whop's checkout.
    .replaceAll(
      "https://whop.com/checkout/ch_wYXFulML0v6LIoJ/",
      "/checkout/ch_wYXFulML0v6LIoJ",
    );
  // The four gates must all be reachable from the home: this is the funnel's
  // proof, and it fails the build rather than shipping a home with a closed gate.
  const gates = ["ch_wYXFulML0v6LIoJ", "plan_PQnMYNixMTjRQ", "plan_Aew5DdipP3fKY", "plan_hIKLCR4hGiv9B"];
  const missing = gates.filter((id) => !out.includes(id));
  if (missing.length) {
    throw new Error(
      `[numinous] the home is missing gate checkouts: ${missing.join(", ")}. ` +
        "Refusing to publish a home that cannot open every gate.",
    );
  }
  // The home's last two acts are the house's own, and the funnel closes on
  // them: the questions answered in full, and the pact stated gate by gate.
  // A home that lost either is half-built, and it fails here rather than live.
  const answers = (out.match(/class="faq-home__item"/g) || []).length;
  if (answers < 6) {
    throw new Error(
      `[numinous] the home carries ${answers} of the seven questions the gate pages answer — refusing to publish.`,
    );
  }
  const terms = (out.match(/class="pact__term"/g) || []).length;
  if (!out.includes('id="pact"') || terms !== 3) {
    throw new Error(
      `[numinous] the home's pact states ${terms} of the three gates' terms — refusing to publish.`,
    );
  }
  if (!out.includes("whop.com/checkout/")) {
    throw new Error(
      "[numinous] no canonical whop.com checkout found in the merged home — refusing to publish.",
    );
  }
  // The polish rides at the very end of the document, after the home's own
  // stylesheet, so its rules win their ties on the home as on every gate page.
  const polishTag = housePolish ? `<style data-house="polish">\n${housePolish}\n</style>\n` : "";
  const tail = `${MERGED_MARK}\n${polishTag}\n`;
  out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, `${tail}</body>`) : `${out}\n${tail}`;
  // The home's head: the house sheet it never used to carry (the design's own
  // sheet is linked by the document itself; this one dresses the shells, the
  // threshold and the motion layer's CSS half), then the boot — sync, so it
  // runs before anything paints — then the weather.
  const bootTag =
    `<link rel="stylesheet" href="${HOME_ACTS_CSS}">\n` +
    `${MOTION_CSS_TAG}\n` +
    `<script src="${GATE_BOOT}"></script>\n${MOTION_TAG}`;
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `${bootTag}\n</head>`);
  } else {
    throw new Error(
      "[numinous] the home has no </head> — refusing to publish a home without the gate boot.",
    );
  }
  if (!out.includes(HOME_ACTS_CSS)) {
    throw new Error(
      "[numinous] the home's own sheet is not linked — its last two acts would open undressed.",
    );
  }
  // The guard's real intent: no link may still point at the app's own domain
  // (an internal /checkout/… path is the funnel working as designed).
  if (/https?:\/\/[^"'\s]*whop\.site\/checkout\//.test(out)) {
    throw new Error(
      "[numinous] unrewritten app-domain checkout link survived the merge — refusing to publish.",
    );
  }
  return out;
}

// Everything the storefront borrows from the pulled build is staged here, after
// Vite has written dist/client and before the Whop packer zips it:
// the pulled public tree, the house theme on every routed page, and the pulled
// home page as the storefront home. Listed before whop() so it runs first.
/* ---- the design's heavier half: read out of the client's own bundle ---- */

/* A zip reader, small and strict: central directory, stored or deflated. */
function zipEntries(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("[numinous] the design bundle is not a zip archive");
  const count = buf.readUInt16LE(eocd + 10);
  let at = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i += 1) {
    if (buf.readUInt32LE(at) !== 0x02014b50) break;
    const method = buf.readUInt16LE(at + 10);
    const size = buf.readUInt32LE(at + 20);
    const nameLen = buf.readUInt16LE(at + 28);
    const extraLen = buf.readUInt16LE(at + 30);
    const commentLen = buf.readUInt16LE(at + 32);
    const localAt = buf.readUInt32LE(at + 42);
    const name = buf.toString("utf8", at + 46, at + 46 + nameLen);
    const dataAt = localAt + 30 + buf.readUInt16LE(localAt + 26) + buf.readUInt16LE(localAt + 28);
    const raw = buf.subarray(dataAt, dataAt + size);
    entries.set(name, method === 0 ? raw : method === 8 ? inflateRawSync(raw) : null);
    at += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function designBytes(from) {
  if (/^https?:\/\//.test(from)) {
    const res = await fetch(from, { redirect: "follow" });
    if (!res.ok) {
      throw new Error(`[numinous] the design bundle answered ${res.status} — ${from}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.subarray(0, 512).toString("utf8").trimStart().startsWith("<")) {
      throw new Error(
        "[numinous] the design bundle answered with a web page, not the archive — " +
          "check that the Drive file is still shared by link",
      );
    }
    return buf;
  }
  return readFileSync(from);
}

/* Every file the design needs, from the kit or from the bundle. The heavier
   half is fetched and verified once, at the start of the build, and cached
   beside the clean source — a commit can carry it from then on, and the merge
   itself stays synchronous so it cannot be overtaken by the packer. */
async function cacheDesignFiles(root) {
  const missing = [...DESIGN_FILES, ...DESIGN_FETCH.map(([rel]) => rel)].filter((rel) => {
    const cached = join(root, DESIGN_PUBLIC, rel);
    if (!existsSync(cached)) return true;
    const pinned = DESIGN_FETCH.find(([name]) => name === rel);
    return pinned ? statSync(cached).size !== pinned[1] : false;
  });
  if (!missing.length) return 0;
  const buf = await designBytes(DESIGN_BUNDLE);
  const entries = zipEntries(buf);
  for (const rel of missing) {
    const pinned = DESIGN_FETCH.find(([name]) => name === rel) || null;
    const entry =
      entries.get(rel) ||
      [...entries.entries()].find(([name]) => name.endsWith(`/${rel}`))?.[1] ||
      null;
    if (!entry) {
      throw new Error(`[numinous] the design bundle carries no ${rel} — refusing to publish`);
    }
    if (pinned) {
      if (entry.length !== pinned[1]) {
        throw new Error(
          `[numinous] ${rel} from the bundle is ${entry.length} bytes, expected ${pinned[1]} — refusing to publish`,
        );
      }
      if (createHash("md5").update(entry).digest("hex") !== pinned[2]) {
        throw new Error(
          `[numinous] ${rel} from the bundle does not match the design — refusing to publish`,
        );
      }
    }
    const cached = join(root, DESIGN_PUBLIC, rel);
    mkdirSync(dirname(cached), { recursive: true });
    writeFileSync(cached, entry);
  }
  return missing.length;
}

/* The same list, read from the cache: what the merge stages into the site. */
function designSources(root) {
  const wanted = [...DESIGN_FILES, ...DESIGN_FETCH.map(([rel]) => rel)];
  const short = wanted.filter((rel) => !existsSync(join(root, DESIGN_PUBLIC, rel)));
  if (short.length) {
    throw new Error(
      "[numinous] the design's own files are not in the tree and could not be read from the " +
        "bundle — refusing to publish a house without its art and type:\n  - " +
        short.join("\n  - "),
    );
  }
  return wanted.map((rel) => [rel, join(root, DESIGN_PUBLIC, rel)]);
}

/* The routed pages' own document. Written here, not read from the repo's
   index.html: the kit only commits the paths the bootstrap names, so the
   shipped shell must not depend on a file the run cannot carry. Only the
   build's own hashed module tag is lifted out of the built page — everything
   else (chrome, font links, design links) is the house's, stated once. */
function themedShell(shellHtml, subpagesCss) {
  const moduleTag =
    (shellHtml.match(/<script[^>]*type="module"[^>]*><\/script>/i) || [])[0] || "";
  if (!moduleTag) {
    throw new Error(
      "[numinous] the built shell carries no module script — refusing to publish gate pages without their house script.",
    );
  }
  const head = [
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '    <meta name="description" content="Witness the impossible. Cinematic visions of the divine and mythical. New realms every week." />',
    '    <meta name="theme-color" content="#07090d" />',
    '    <meta name="color-scheme" content="dark" />',
    '    <title>NUMINOUS · The Realms, Opened</title>',
    '    <link rel="icon" href="/assets/sigil.jpg" />',
    '    <link rel="preload" href="/fonts/Cinzel-900-latin.woff2" as="font" type="font/woff2" crossorigin>',
    '    <link rel="preload" href="/fonts/CormorantGaramond-400-latin.woff2" as="font" type="font/woff2" crossorigin>',
    `    <link rel="stylesheet" href="${CLEAN_CSS}">`,
    ...(subpagesCss ? [`    <link rel="stylesheet" href="${SUBPAGES_CSS}">`] : []),
    `    ${MOTION_CSS_TAG}`,
    `    ${MOTION_TAG}`,
    "    " + moduleTag,
    // the header's scrolled state, in the shell itself: the house's own script
    // stays untouched, and the shell still wears the design's behaviour.
    "    <script>",
    "      (function () {",
    "        var head = function () { return document.querySelector('.site-header'); };",
    "        var mark = function () { var h = head(); if (h) h.classList.toggle('is-scrolled', window.scrollY > 8); };",
    "        window.addEventListener('scroll', mark, { passive: true });",
    "        mark();",
    "      }());",
    "    </script>",
  ].join("\n");
  return `<!doctype html>
<html lang="en">
  <head>
${head}
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header"><nav class="nav" id="nav" aria-label="Primary navigation"></nav></header>
    <main id="main"></main>
    <footer class="site-footer" id="foot"></footer>
    <div id="cookie" class="cookie" hidden></div>
    <dialog id="records" class="records"></dialog>
  </body>
</html>
`;
}

function houseMerge() {
  return {
    name: "numinous-house-merge",
    apply: "build",
    // The design's heavier half travels out of band: fetch and verify it
    // before the build starts, so the merge below stays synchronous and the
    // artifact is always packed from the finished house.
    async buildStart() {
      const root = process.cwd();
      if (!existsSync(join(root, HOME_SRC))) return;
      const fetched = await cacheDesignFiles(root);
      if (fetched) console.log(`[numinous] design: ${fetched} file(s) read out of the bundle`);
    },

    closeBundle() {
      const root = process.cwd();
      const clientDir = join(root, "dist", "client");
      const shell = join(clientDir, "index.html");
      if (!existsSync(shell)) return;

      if (!existsSync(join(root, HOME_SRC))) {
        console.warn(`[numinous] ${HOME_SRC} is not present — storefront left as-is`);
        return;
      }

      // 1 · fonts, films, art, icons, sitemap, service worker
      let staged = 0;
      for (const entry of REF_ASSETS) {
        const before = existsSync(join(clientDir, entry));
        copyRef(join(root, REF_PUBLIC, entry), join(clientDir, entry));
        if (!before) staged += 1;
      }

      // 1a · the design: the stylesheet the kit carries, and the art and type
      // read out of the client's own bundle (fetched and verified at the start
      // of this build, cached beside the clean source). Both are staged into
      // the site — a missing or altered file fails the build rather than
      // dressing the house in something nobody chose.
      const design = designSources(root);
      for (const [rel, from] of design) {
        const dest = join(clientDir, rel);
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(from, dest);
      }

      // 1b · one stylesheet per document. The design itself
      // (/assets/numinous-clean.css) is shipped verbatim in public/; the sheet
      // that dresses the routed pages in the same language is assembled here
      // from the design modules and served last, so its rules win their ties.
      if (!existsSync(join(root, SUBPAGES_SHEET))) {
        throw new Error(
          `[numinous] ${SUBPAGES_SHEET} is missing — the routed pages would open without their design.`,
        );
      }
      const subpagesCss = readFileSync(join(root, SUBPAGES_SHEET), "utf8");
      if (subpagesCss.length < 5000) {
        throw new Error(`[numinous] ${SUBPAGES_SHEET} looks truncated — refusing to publish it.`);
      }
      mkdirSync(join(clientDir, "assets"), { recursive: true });
      writeFileSync(join(clientDir, "assets", "numinous-subpages.css"), subpagesCss);

      // 2 · the house shell: the built shell plus the design and the
      // self-hosted type. closeBundle fires once per environment build; by a
      // later pass dist/client/index.html is already the merged home, so the
      // themed shell is also stashed beside dist/client. The routed pages are
      // ALWAYS built here — from a fresh build's shell when one is present,
      // from the stash otherwise, never from index.html — so no pass, in no
      // order, can turn a gate page into a second copy of the home.
      const stash = join(root, "dist", ".numinous-shell.html");
      const shellHtml = readFileSync(shell, "utf8");
      let shellDoc;
      if (!shellHtml.includes(MERGED_MARK)) {
        shellDoc = themedShell(shellHtml, subpagesCss);
        writeFileSync(stash, shellDoc);
      } else if (existsSync(stash)) {
        shellDoc = readFileSync(stash, "utf8");
      } else {
        console.warn(
          "[numinous] house merge: index.html is a previous merge and no shell is stashed — waiting for a fresh build",
        );
        return;
      }

      // 3 · the routed pages read from that shell. This page must stay a gate:
      // the home's own markup must never appear in it.
      if (shellDoc.includes(HOME_MARK) || !shellDoc.includes('id="main"')) {
        throw new Error(
          "[numinous] the house shell for the routed pages is not the storefront shell — refusing to publish gate pages that are copies of the home.",
        );
      }
      for (const route of routes) {
        const dest = join(clientDir, route, "index.html");
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, shellDoc);
      }

      // 4 · the index bundle's document becomes the storefront home
      const merged = mergeHome(readFileSync(join(root, HOME_SRC), "utf8"), subpagesCss);
      writeFileSync(shell, merged);

      // 5 · the clean route URLs are answered with that home (exact file paths
      // only, no html_handling redirects), so the build also carries the two
      // guards: _redirects proxies each clean URL to its routed page, and the
      // home's boot forwards a gate path to that page before the home paints.
      writeFileSync(join(clientDir, "_redirects"), gateRedirects());
      const bootFile = join(clientDir, ...GATE_BOOT.split("/").filter(Boolean));
      mkdirSync(dirname(bootFile), { recursive: true });
      writeFileSync(bootFile, gateBootScript());
      emitMotionLayer(root, clientDir);
      for (const mod of OVERHAUL) {
        if (typeof mod.emit === "function") mod.emit(clientDir, routes);
      }
      console.log(
        `[numinous] house merge: ${design.length} design files staged, ${staged} pulled paths staged, ` +
          `the design on ${routes.length} routed pages, ` +
          `subpages sheet ${subpagesCss.length} bytes, home adopted (${merged.length} bytes), ` +
          `_redirects + gate boot written`,
      );
    },
  };
}

export default defineConfig(async () => {
  OVERHAUL = await loadOverhaul(process.cwd());
  for (const mod of OVERHAUL) {
    for (const route of mod.routes || []) if (!routes.includes(route)) routes.push(route);
  }
  if (OVERHAUL.length) {
    console.log(`[numinous] overhaul: ${OVERHAUL.length} module(s) loaded, ${routes.length} routed pages`);
  }
  return {
  plugins: [
    // Whop hosting builds on Cloudflare Workers. Keep the Cloudflare plugin
    // first so it owns the worker ("ssr") environment before the other plugins,
    // and set the two output directories Whop hosting expects: dist/client for
    // static assets, dist/server for the worker modules (entry index.js).
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    canonicalCheckouts(),
    overhaulSources(),
    houseMerge(),
    whop({ disableTanstackDevtools: true }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  environments: {
    client: {
      build: {
        outDir: "dist/client",
      },
    },
    ssr: {
      build: {
        outDir: "dist/server",
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
  };
});
