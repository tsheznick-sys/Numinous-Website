/**
 * NUMINOUS · overhaul module 1 — the home document.
 *
 * Loaded by vite.config.js at build time (see PATCH_DIR). Every rewrite below is
 * an exact anchor into reference/web-version/src/home.html, applied before the
 * house merge checks its invariants, so a patch that breaks the house markup
 * still fails the build instead of publishing.
 *
 * Covers the master-prompt sections: 4.1 nav, 4.2 hero, 4.3 marquee (css),
 * 4.4 stats, 4.5 works cards, 4.6 veil, 4.8 orbit (css), 4.11 pact, 4.12 faq,
 * 4.13 voices, 4.14 herald, 4.15 cookie bar (css), 4.16 legal, 4.17 footer,
 * 4.18 accessibility, 4.19 mobile, 4.21 seo, 5 content rules.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SUPPORT = "numinous.support@gmail.com";
const ROUTES = [
  "/",
  "/collections/all",
  "/order-complete",
  "/products/the-signal-e6",
  "/products/the-numinary-3e",
  "/products/herald-app",
  "/products/wallpaper-vault",
  "/returns",
  "/refunds",
  "/terms",
  "/privacy",
  "/eula",
  "/cookies",
];

/* The overhaul's own rules. Appended after the polish layers on every page, so
   they win ties exactly where the overhaul needs them. */


function apply(html, pairs, soft) {
  const missed = [];
  for (const [from, to, mode] of pairs) {
    if (!html.includes(from)) {
      missed.push(from.slice(0, 90));
      continue;
    }
    html = html.split(from).join(to);
  }
  const hard = missed.filter((m) => !soft.some((s) => m.startsWith(s.slice(0, 90))));
  if (hard.length) {
    throw new Error("[numinous] home overhaul: anchors not found:\n  - " + hard.join("\n  - "));
  }
  if (missed.length)
    console.warn(
      `[numinous] home overhaul: ${missed.length} optional anchor(s) skipped:\n  - ` +
        missed.map((m) => m.split("\n")[0].slice(0, 80)).join("\n  - "),
    );
  return html;
}

const jsonld = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Numinous","url":"https://jointhenuminouses.whop.site/","logo":"https://jointhenuminouses.whop.site/assets/sigil.jpg","sameAs":["https://www.instagram.com/numinous2.0/"]},{"@type":"Product","name":"The Signal","description":"Free cinematic visions of the divine and mythical, with Dispatches, a ten-page First Vision gift and the Sanctuary room.","offers":{"@type":"Offer","price":"0","priceCurrency":"USD","url":"https://whop.com/checkout/ch_wYXFulML0v6LIoJ/","availability":"https://schema.org/InStock"}},{"@type":"Product","name":"The Watcher","description":"Numinous membership: four weekly chapters every 28 days - The Realm, The Process, The Records, The Session - with a seven-night money-back guarantee.","offers":[{"@type":"Offer","price":"28.00","priceCurrency":"USD","url":"https://whop.com/checkout/plan_PQnMYNixMTjRQ","availability":"https://schema.org/InStock","description":"$28 per 28-day cycle"},{"@type":"Offer","price":"280.00","priceCurrency":"USD","url":"https://whop.com/checkout/plan_PQnMYNixMTjRQ","description":"$280 per year"}]},{"@type":"Product","name":"Wallpaper Vault","description":"Fifteen Numinous realms, cropped for every screen.","offers":{"@type":"Offer","price":"12.00","priceCurrency":"USD","url":"https://whop.com/checkout/plan_Aew5DdipP3fKY","availability":"https://schema.org/InStock"}}]}</script>
`;

/* the home's own script tail: an honest 404, a drawer that obeys the keyboard,
   and a receipt the reader can always see. Inline by necessity - the home is a
   single document, and the host serves it for unknown paths (see _redirects). */
const houseScript = `<script>
/* NUMINOUS house: keyboard-honest drawer + an honest answer for unknown paths */
(function(){
  var known=${JSON.stringify(ROUTES)};
  function path(){return (location.pathname.replace(/\\/index\\.html$/i,"").replace(/\\/+$/,"")||"/")}
  var p=path();
  if(known.indexOf(p)<0){
    var box=document.createElement("div");
    box.setAttribute("style","max-width:720px;margin:14vh auto;padding:0 1.4rem;text-align:center");
    box.innerHTML='<p style="letter-spacing:.3em;color:#c5a464;font-size:13px">EST . MMXXVI</p>'
      +'<h1 style="font-family:Cinzel,Georgia,serif;color:#f2efe8">This gate does not open.</h1>'
      +'<p style="color:#c9c3b6">That address is not one of the house pages. Nothing was lost.</p>'
      +'<p style="margin-top:1.4rem"><a class="btn btn-gold" href="/">Return to Numinous</a> '
      +'<a class="btn btn-ghost" href="/collections/all">The Works</a></p>';
    var veil=document.getElementById("veil");if(veil)veil.classList.add("gone");
    document.body.innerHTML="";document.body.appendChild(box);
    document.title="Page not found · Numinous";
    return;
  }
  function burger(){return document.querySelector(".burger")}
  function drawer(){return document.getElementById("mobile")}
  function close(){
    var d=drawer();if(!d||!d.classList.contains("open"))return false;
    d.classList.remove("open");
    var b=burger();if(b){b.classList.remove("open");b.setAttribute("aria-expanded","false");b.focus()}
    return true;
  }
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){close();return}
    if(e.key!=="Tab")return;
    var d=drawer();if(!d||!d.classList.contains("open"))return;
    var f=d.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if(!f.length)return;
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  document.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest(".burger");
    if(!t)return;
    setTimeout(function(){
      var d=drawer();
      if(d&&d.classList.contains("open")){var f=d.querySelector("a[href],button");if(f)f.focus()}
    },80);
  });
})();
</script>
`;

export default {
  routes: ["refunds", "eula"],



  emit(clientDir, routes) {
    const site = "https://jointhenuminouses.whop.site";
    const paths = ["/", ...routes.map((r) => `/${r}`), "/refunds", "/eula"]
      .filter((p, i, all) => all.indexOf(p) === i)
      // 4.21 · the checkout landing page is a doorway, not a destination:
      // it is noindexed below and stays out of the sitemap.
      .filter((p) => p !== "/order-complete")
      .sort();
    const today = "2026-10-11";
    const sitemap =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      paths
        .map(
          (p) =>
            `  <url><loc>${site}${p === "/" ? "/" : p}</loc><lastmod>${today}</lastmod><changefreq>${
              p === "/" ? "weekly" : "monthly"
            }</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`,
        )
        .join("\n") +
      `\n</urlset>\n`;
    writeFileSync(join(clientDir, "sitemap.xml"), sitemap);
    writeFileSync(
      join(clientDir, "robots.txt"),
      `# Numinous - witness the impossible\nUser-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
    );
    writeFileSync(
      join(clientDir, "_headers"),
      `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: geolocation=(), camera=(), microphone=()\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://t.whop.tw https://www.google.com https://www.gstatic.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://www.gstatic.com; img-src 'self' data: https://img-v2-prod.whop.com https://assets-2-prod.whop.com; font-src 'self' data:; connect-src https://t.whop.tw https://www.google.com https://static.cloudflareinsights.com 'self'; worker-src 'self' blob:; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests\n`,
    );
    mkdirSync(join(clientDir, ".well-known"), { recursive: true });
    console.log(`[numinous] overhaul: sitemap (${paths.length} urls), robots.txt, _headers written`);

    /* 4.21 · each route owns its title, description and canonical, written
       into the static HTML a crawler reads before any script runs. The routed
       pages are shells sharing the app's base <head>, so they are rewritten
       here, by path, with one plain sentence each. */
    const META = {
      "/products/the-signal-e6": [
        "The Signal - A Free Ten-Page First Vision | Numinous",
        "The Signal is free forever: a ten-page first vision, the Dispatches, the calendar and the Sanctuary.",
      ],
      "/products/the-numinary-3e": [
        "The Watcher - Four Chapters a Moon, $28 | Numinous",
        "The Watcher arrives in four weekly chapters on a 28-day cycle, $28 a moon or $280 a year, with a seven-night guarantee.",
      ],
      "/products/wallpaper-vault": [
        "Wallpaper Vault - Fifteen Realms, One Payment | Numinous",
        "The Wallpaper Vault opens fifteen realms as high-resolution wallpapers for a single $12 payment.",
      ],
      "/products/herald-app": [
        "The Herald - Weekly Dispatches by Email | Numinous",
        "The Herald sends one dispatch a week: new realms, release notes and the occasional first look.",
      ],
      "/collections/all": [
        "The Four Gates - Explore Numinous | Numinous",
        "Explore all four gates: The Signal, The Watcher, the Wallpaper Vault and the Herald, with prices and what each one opens.",
      ],
      "/terms": ["Terms of Service | Numinous", "The terms that govern the Numinous storefront, the four works and your account."],
      "/privacy": ["Privacy Policy | Numinous", "What Numinous collects, why, and the cookies and processors involved."],
      "/eula": ["License Agreement | Numinous", "What a Numinous license lets you do with the files you buy, and what it does not."],
      "/refunds": ["Refunds and the Seven Nights | Numinous", "How the seven-night guarantee works, what is refundable and how to ask."],
      "/returns": ["The Seven Nights - How the Guarantee Works | Numinous", "The seven-night guarantee explained step by step, with the exact address to write to."],
      "/cookies": ["Cookies and Tracking | Numinous", "Every cookie this site sets, what Accept and Decline change, and what Whop sets on checkout."],
      "/order-complete": ["Order Complete | Numinous", "Your order is confirmed. Receipt and next steps."],
    };
    const routeDirs = [];
    const walk = (dir, prefix) => {
      for (const entry of readdirSync(join(clientDir, dir), { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === "assets" || entry.name === "fonts" || entry.name === ".well-known") continue;
        const path = `${prefix}/${entry.name}`;
        if (existsSync(join(clientDir, dir, entry.name, "index.html"))) routeDirs.push(path);
        if (prefix.split("/").length < 3) walk(join(dir, entry.name), path);
      }
    };
    walk(".", "");
    let retitled = 0;
    for (const path of routeDirs) {
      const meta = META[path];
      const file = join(clientDir, path, "index.html");
      let html = readFileSync(file, "utf8");
      const canonical = `<link rel="canonical" href="${site}${path}">`;
      if (html.includes(`rel="canonical"`)) continue;
      if (meta) {
        html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta[0]}</title>`);
        html = html.replace(
          /<meta\s+[^>]*name="description"[^>]*>/,
          `<meta name="description" content="${meta[1]}">`,
        );
      }
      /* Each work carries its own art into link previews. Policy pages use
         the house portal; no route borrows the Watcher card by default. */
      const cardImages = {
        "/products/the-signal-e6": "signal.jpg",
        "/products/the-numinary-3e": "watcher.jpg",
        "/products/wallpaper-vault": "vault.jpg",
        "/products/herald-app": "numinary.jpg",
        "/collections/all": "bg_hero.jpg",
      };
      const image = `${site}/assets/${cardImages[path] || "bg_hero.jpg"}`;
      const card = meta
        ? `<meta property="og:title" content="${meta[0]}">\n` +
          `<meta property="og:description" content="${meta[1]}">\n` +
          `<meta name="twitter:title" content="${meta[0]}">\n` +
          `<meta name="twitter:description" content="${meta[1]}">\n`
        : "";
      const og =
        `<meta property="og:url" content="${site}${path}">\n` +
        `<meta property="og:site_name" content="Numinous">\n` +
        `<meta property="og:type" content="website">\n` +
        card +
        `<meta property="og:image" content="${image}">\n` +
        `<meta name="twitter:card" content="summary_large_image">\n` +
        `<meta name="twitter:image" content="${image}">\n` +
        (["/order-complete", "/checkout"].includes(path) ? `<meta name="robots" content="noindex">\n` : "");
      html = html.replace(/<\/head>/, `${canonical}\n${og}</head>`);
      writeFileSync(file, html);
      retitled += 1;
    }
    console.log(`[numinous] overhaul: ${retitled} routed pages given their own title, description and canonical`);

    /* 4.20 · the named weight, measured at build time so the deploy log is
       the proof (most assets arrive from the live site during the merge). */
    const weights = [];
    for (const rel of routeDirs.concat(["."])) {
      const dir = join(clientDir, rel, "assets");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!/\.(png|jpe?g|webp|avif)$/i.test(f)) continue;
        const size = statSync(join(dir, f)).size;
        if (size > 120 * 1024) weights.push([f, size]);
      }
    }
    for (const f of ["banner.png", "og.png"]) {
      const file = join(clientDir, f);
      if (existsSync(file)) weights.push([f, statSync(file).size]);
    }
    weights.sort((a, b) => b[1] - a[1]);
    const banner = weights.find(([f]) => f === "banner.png");
    console.log(
      `[numinous] overhaul: image weights - ` +
        (banner ? `banner.png ${(banner[1] / 1024).toFixed(0)} KB ${banner[1] < 300 * 1024 ? "OK (<300 KB)" : "OVER 300 KB"}` : "banner.png missing") +
        (weights.length
          ? `; heaviest: ${weights.slice(0, 6).map(([f, n]) => `${f} ${(n / 1024).toFixed(0)}KB`).join(", ")}`
          : "; no local image assets (pulled from the live site at deploy)"),
    );

    /* The old home was a 195 KB document with its own inline styles and
       scripts, so this pass used to externalise them. The style swap retired
       that home: the storefront is the index bundle's own document, already
       slim by construction (one stylesheet link, one deferred script), and the
       merge now owns the home byte for byte. Nothing rewrites it after this. */
  },
};
