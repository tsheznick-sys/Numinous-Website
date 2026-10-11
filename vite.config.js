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
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import { whop } from "@whop/cli/vite";

const routes = [
  "products/the-signal-e6",
  "products/the-numinary-3e",
  "products/herald-app",
  "products/wallpaper-vault",
  "collections/all",
  "returns",
  "terms",
  "privacy",
  "cookies",
];

const LIVE_HOST = "jointhenuminouses.whop.site";
const REF_HOST = "thenuminouses.whop.site";
const REF = join("reference", "web-version");
const REF_PUBLIC = join(REF, "public");
const REF_HOME = join(REF, "src", "home.html");
const THEME = join("reference", "merged", "theme.css");
const COOKIE_KEY = "numinous-record";

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
// ever trapped by a form whose server is gone.
function heraldOverride(freeCheckout) {
  const free = JSON.stringify(freeCheckout);
  return `<script>
/* house merge: the herald hands off to the canonical Signal checkout */
(function(){
"use strict";
var FREE=${free};
var GATE="/products/the-signal-e6";
document.addEventListener("submit",function(e){
  var f=e.target;
  if(!f||f.id!=="heraldForm")return;
  e.preventDefault();
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  var em=document.getElementById("heraldEmail");
  if(em&&(!em.value||em.value.indexOf("@")<1)){em.setAttribute("aria-invalid","true");em.focus();return}
  if(em)em.removeAttribute("aria-invalid");
  var terms=document.getElementById("heraldTerms");
  if(terms&&!terms.checked){
    var lb=document.querySelector("label.consent");
    if(lb){lb.classList.remove("shake");void lb.offsetWidth;lb.classList.add("shake")}
    var cn=document.getElementById("consentNote");
    if(cn)cn.style.display="block";
    terms.focus();
    return;
  }
  var cn2=document.getElementById("consentNote");
  if(cn2)cn2.style.display="none";
  var ok=document.getElementById("heraldOk");
  if(ok){
    ok.innerHTML='So it is written. The Signal is free, forever \\u2014 this site keeps no address. '
      +'<a href="'+GATE+'" style="color:var(--gold-hi);text-decoration:underline;text-underline-offset:3px">Open The Signal \\u2192</a>';
    ok.style.display="block";
  }
  window.open(FREE,"_blank","noopener");
},true);
})();
</script>`;
}

// The pulled home page, wired to the live house: canonical hosted checkouts,
// the live host everywhere, the house cookie key, no reliance on the pulled
// server routes. Refuses to emit a half-merged page.
function mergeHome(html, freeCheckout) {
  if (!html.includes('id="velaris"') || !html.includes('id="heraldForm"')) {
    throw new Error(
      "[numinous] reference/web-version/src/home.html is missing the expected house markup " +
        "(velaris canvas / herald form). Refusing to publish a half-merged home.",
    );
  }
  let out = html
    .replaceAll(`https://${LIVE_HOST}/checkout/`, "https://whop.com/checkout/")
    .replaceAll(`https://${REF_HOST}/checkout/`, "https://whop.com/checkout/")
    .replaceAll(REF_HOST, LIVE_HOST)
    .replaceAll('"/checkout/', '"https://whop.com/checkout/')
    .replaceAll("'/checkout/", "'https://whop.com/checkout/")
    .replaceAll("numinous-consent", COOKIE_KEY)
    .replace('href="#/privacy" data-hover>COOKIES', 'href="/cookies" data-hover>COOKIES')
    // The pulled footer names two gates; the house keeps four open. Add the
    // Wallpaper Vault and the Herald app so every gate is linked from the home.
    .replace(
      '          <li><a href="/products/the-numinary-3e" data-hover>The Watcher · $28 / moon</a></li>\n        </ul>',
      '          <li><a href="/products/the-numinary-3e" data-hover>The Watcher · $28 / moon</a></li>\n' +
        '          <li><a href="/products/wallpaper-vault" data-hover>Wallpaper Vault · $12</a></li>\n' +
        '          <li><a href="/products/herald-app" data-hover>Herald app · Free</a></li>\n        </ul>',
    );
  out = out.replace("</body>", `${heraldOverride(freeCheckout)}\n</body>`);
  const gateLinks = [
    "/products/the-signal-e6",
    "/products/the-numinary-3e",
    "/products/wallpaper-vault",
    "/products/herald-app",
  ].filter((href) => out.includes(`href="${href}"`));
  if (gateLinks.length < 4) {
    console.warn(`[numinous] only ${gateLinks.length}/4 gate links found in the merged home`);
  }
  if (out.includes('"/checkout/') || out.includes("'/checkout/")) {
    throw new Error(
      "[numinous] unrewritten app-domain checkout link survived the merge — refusing to publish.",
    );
  }
  if (!out.includes("https://whop.com/checkout/")) {
    throw new Error(
      "[numinous] no canonical whop.com checkout found in the merged home — refusing to publish.",
    );
  }
  return out;
}

// Everything the storefront borrows from the pulled build is staged here, after
// Vite has written dist/client and before the Whop packer zips it:
// the pulled public tree, the house theme on every routed page, and the pulled
// home page as the storefront home. Listed before whop() so it runs first.
function houseMerge() {
  return {
    name: "numinous-house-merge",
    apply: "build",
    closeBundle() {
      const root = process.cwd();
      const clientDir = join(root, "dist", "client");
      const shell = join(clientDir, "index.html");
      if (!existsSync(shell)) return;

      if (!existsSync(join(root, REF_HOME))) {
        console.warn("[numinous] reference/web-version is not present — storefront left as-is");
        return;
      }

      const onboard = JSON.parse(readFileSync(join(root, "coldstorage", "onboard.json"), "utf8"));
      const freeCheckout = (onboard.checkout?.signal || "").replace(
        "://jointhenuminouses.whop.site/checkout/",
        "://whop.com/checkout/",
      );

      // 1 · fonts, films, art, icons, sitemap, service worker
      let staged = 0;
      for (const entry of REF_ASSETS) {
        const before = existsSync(join(clientDir, entry));
        copyRef(join(root, REF_PUBLIC, entry), join(clientDir, entry));
        if (!before) staged += 1;
      }

      // 2 · the house theme, and the self-hosted type, on every routed page
      const theme = readFileSync(join(root, THEME), "utf8");
      const head = [
        '<link rel="preload" href="/fonts/Cinzel-900-latin.woff2" as="font" type="font/woff2" crossorigin>',
        '<link rel="preload" href="/fonts/CormorantGaramond-400-latin.woff2" as="font" type="font/woff2" crossorigin>',
        `<style id="numinous-house-theme">${theme}</style>`,
      ].join("\n");
      let shellHtml = readFileSync(shell, "utf8");
      shellHtml = shellHtml
        .replace(/[ \t]*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>\s*/, "")
        .replace(/[ \t]*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin \/>\s*/, "")
        .replace(/[ \t]*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"\s+rel="stylesheet"\s*\/>\s*/, "");
      shellHtml = shellHtml.replace("</head>", `${head}\n  </head>`);
      writeFileSync(shell, shellHtml);

      // 3 · the routed pages read from that shell
      for (const route of routes) {
        const dest = join(clientDir, route, "index.html");
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(shell, dest);
      }

      // 4 · the pulled home becomes the storefront home
      const merged = mergeHome(readFileSync(join(root, REF_HOME), "utf8"), freeCheckout);
      writeFileSync(shell, merged);
      console.log(
        `[numinous] house merge: ${staged} pulled paths staged, theme on ${routes.length} routed pages, ` +
          `home adopted (${merged.length} bytes, herald hands off to ${freeCheckout || "the Signal gate"})`,
      );
    },
  };
}

export default defineConfig({
  plugins: [
    // Whop hosting builds on Cloudflare Workers. Keep the Cloudflare plugin
    // first so it owns the worker ("ssr") environment before the other plugins,
    // and set the two output directories Whop hosting expects: dist/client for
    // static assets, dist/server for the worker modules (entry index.js).
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    canonicalCheckouts(),
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
});
