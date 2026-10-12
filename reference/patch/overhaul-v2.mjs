/* ============================================================
   NUMINOUS · OVERHAUL V2 — one design language, every page.
   ------------------------------------------------------------
   Loaded after overhaul-home.mjs and overhaul-site.mjs (the engine
   sorts reference/patch/*.mjs by name), so it sees their output and
   has the final word. It ships three files, all new:

     · v2/site-pages.js — the shell's pages (nav, footer, the four
       gates, the works, the records, the threshold after the
       offering), rewritten in one block; spliced into src/site.js
       in place of everything from `const works = [` to `const
       routes = {`; adds the /checkout route and its page.
     · v2/house.css — the design layer, appended last on every
       document, so it wins every tie against the home theme, the
       bridge and the older polish layers.
     · this module — the orchestration above.

   How the host routes (do not re-derive): Whop serves exact file
   paths; every routed page is its own document at <route>/index.html,
   and a clean route URL is answered with the storefront home, whose
   head carries the gate boot that forwards it. `_redirects` in the
   asset dir is INERT — it is written as insurance only. The older
   checkout family (/checkout/plan_…, /checkout/ch_…) is therefore
   answered with the home too: the forward injected below, the first
   script in the home's head, hands it to /checkout/index.html with
   the original query plus ?from=<old path>. /checkout and its whole
   family render checkoutPage(), which reads the plan id, states the
   price and the seven nights where they apply, and offers the
   canonical whop.com/checkout/… button — or, for an unknown id,
   "this gate has grown old" with every open gate below.

   Also in this module: the home's hero and Watcher chapter reworked,
   the annual Watcher seat (plan_Imfk0oedwYn7v) wired to its real
   plan, the house 404 rewritten in the v2 voice, and the social card
   repointed from the 1.18 MB banner.png to /assets/watcher.jpg
   (206 KB) — the <300 KB target, with no new dependency.

   Left for a deliberate, separate action (a run only adds and
   overwrites; a deletion needs a commit of its own): delete
   reference/gate-pages.raw.html (14,944 B, referenced by nothing) and
   optionally the three reference/merged/polish*.css layers (11,032 B,
   retired by this layer, which loads after them). KEEP
   reference/merged/theme.css — it is a hard build input via
   readFileSync; deleting it fails the build until the same commit
   also edits vite.config.js.

   Nothing here invents a fact: prices, the seven nights, the support
   address and every checkout are the house's own.
   ============================================================ */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (rel) => readFileSync(join(HERE, rel), "utf8");

const CSS = read("v2/house.css");
const PAGES = read("v2/site-pages.js");

const ANNUAL_PLAN = "plan_Imfk0oedwYn7v";
const ANNUAL_ORDER = "quantity=1&items=" + ANNUAL_PLAN + ":1";
const MONTHLY_PLAN = "plan_PQnMYNixMTjRQ";
const MONTHLY_ORDER = "quantity=1&items=" + MONTHLY_PLAN + ":1";
/* host-relative on purpose: the merge rewrites this form to the canonical
   whop.com checkout as it builds, so the home keeps one source of truth. */
const MONTHLY_LINK = "/checkout/" + MONTHLY_PLAN + "?" + MONTHLY_ORDER;
const VAULT_PLAN = "plan_Aew5DdipP3fKY";
const HERALD_PLAN = "plan_hIKLCR4hGiv9B";
const SIGNAL_CHANNEL = "ch_wYXFulML0v6LIoJ";
const PLAN_IDS = [MONTHLY_PLAN, ANNUAL_PLAN, VAULT_PLAN, HERALD_PLAN, SIGNAL_CHANNEL];

/* a splice that reports itself: a miss is loud in the build log and never
   stops the build — the storefront simply keeps its previous behaviour. */
function splice(code, from, to, replacement, label) {
  const i = code.indexOf(from);
  if (i === -1) {
    console.warn("[numinous v2] anchor not found — " + label);
    return code;
  }
  const j = to ? code.indexOf(to, i + from.length) : -1;
  if (to && j === -1) {
    console.warn("[numinous v2] closing anchor not found — " + label);
    return code;
  }
  const end = to ? j : i + from.length;
  return code.slice(0, i) + replacement + code.slice(end);
}

function replaceOnce(html, from, to, label) {
  const i = html.indexOf(from);
  if (i === -1) {
    console.warn("[numinous v2] anchor not found — " + label);
    return html;
  }
  return html.slice(0, i) + to + html.slice(i + from.length);
}

/* ---------- the shell: src/site.js ---------- */

function siteSource(code) {
  /* 1 · every page of the shell is rewritten in one block, from the works list
     down to the route map: same names, same contracts, nothing left over. */
  const pages = splice(code, "const works = [", "const routes = {", PAGES + "\n", "site pages block");
  if (pages === code) return code;
  let out = pages;

  /* 2 · the threshold becomes a route of its own: a real URL, a real document,
     and a canonical address for every older checkout link. */
  const routesHead = "const routes = {\n";
  if (out.includes(routesHead) && !out.includes('"/checkout":')) {
    out = out.replace(
      routesHead,
      routesHead +
        '  "/checkout": { title: "The threshold · Numinous", desc: "You followed an older checkout link. Here is what it was for, what it costs, and the door to Whop.", render: checkoutPage },\n',
    );
  } else {
    console.warn("[numinous v2] the /checkout route could not be registered");
  }

  /* 3 · the entrance veils and the persistent action, on every shell page.
     The veil is once per session, skippable, and absent when the reader asks
     for stillness; the action never rides on the two threshold pages. */
  out += `
/* ---------- v2 · the entrance veil and the persistent action ---------- */

(function v2Runtime() {
  const still =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const here = window.location.pathname || "/";
  /* Every shell page wears the veil, the threshold included — the only page
     that never waits is the one a buyer reaches straight after paying. */
  const quiet = here.indexOf("/order-complete") === 0;
  const remembered = (key) => {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };
  const remember = (key, value) => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      /* a browser that refuses storage simply never sees the veil */
    }
  };

  if (!still && !quiet && !remembered("numinous-entered")) {
    remember("numinous-entered", "1");
    const veil = document.createElement("div");
    veil.className = "v2-veil";
    veil.setAttribute("role", "presentation");
    veil.innerHTML =
      '<div class="v2-veil-inner">' +
      '<img class="v2-veil-sigil" src="/assets/sigil.jpg" alt="">' +
      '<p class="v2-veil-word">NUMINOUS</p>' +
      '<div class="v2-veil-line" aria-hidden="true"><i></i></div>' +
      "</div>" +
      '<button class="btn v2-veil-skip" type="button">Skip intro</button>';
    document.body.append(veil);
    const leave = () => veil.setAttribute("data-state", "leaving");
    const timer = window.setTimeout(leave, 900);
    const skip = veil.querySelector(".v2-veil-skip");
    if (skip) {
      skip.addEventListener("click", () => {
        window.clearTimeout(timer);
        leave();
      });
    }
    veil.addEventListener("transitionend", () => veil.remove());
    window.setTimeout(() => veil.remove(), 3400);
  }

  if (quiet || remembered("numinous-bar-off")) return;
  const bar = document.createElement("div");
  bar.className = "v2-sticky";
  bar.setAttribute("data-show", "false");
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Start free");
  bar.innerHTML =
    "<p><b>The Signal is free, forever.</b> A new realm every week — no card, no renewal.</p>" +
    '<a class="btn solid" href="' + gate("the-signal-e6") + '">Start free →</a>' +
    '<button class="v2-sticky-x" type="button" aria-label="Dismiss this bar">✕</button>';
  document.body.append(bar);
  const paint = () => {
    const past = window.scrollY > window.innerHeight * 0.7;
    const nearFoot = window.scrollY + window.innerHeight > document.body.scrollHeight - 420;
    bar.setAttribute("data-show", past && !nearFoot ? "true" : "false");
  };
  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint);
  bar.querySelector(".v2-sticky-x").addEventListener("click", () => {
    bar.remove();
    remember("numinous-bar-off", "1");
  });
  paint();
})();
`;
  return out;
}

/* ---------- the home document ---------- */

/* The storefront home answers every path the host cannot resolve, so it is
   where an older checkout link lands. This forward hands that visitor to the
   threshold. (The path is built by concatenation on purpose: the merge rewrites
   any double-quoted house checkout path to the canonical whop.com one, and a
   literal here would be rewritten with it.) */
const HOME_FORWARD = `<script>
(function () {
  try {
    var path = location.pathname;
    if (/^\\/checkout\\/[^/]/.test(path)) {
      var to =
        "/" + "checkout" + "/index.html" + location.search +
        (location.search ? "&" : "?") + "from=" + encodeURIComponent(path);
      location.replace(to);
      return;
    }
  } catch (error) {}
  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.getElementById("v2sticky");
    if (!bar) return;
    try {
      if (sessionStorage.getItem("numinous-bar-off") === "1") {
        bar.remove();
        return;
      }
    } catch (error) {}
    var paint = function () {
      var past = scrollY > innerHeight * 0.7;
      var nearFoot = scrollY + innerHeight > document.body.scrollHeight - 420;
      bar.setAttribute("data-show", past && !nearFoot ? "true" : "false");
    };
    addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", paint);
    var close = bar.querySelector(".v2-sticky-x");
    if (close) {
      close.addEventListener("click", function () {
        bar.remove();
        try {
          sessionStorage.setItem("numinous-bar-off", "1");
        } catch (error) {}
      });
    }
    paint();
  });
})();
</script>
`;

const HOME_BAR = `<div class="v2-sticky" id="v2sticky" data-show="false" role="region" aria-label="Start free">
  <p><b>The Signal is free, forever.</b> A new realm every week — no card, no renewal.</p>
  <a class="btn solid" href="/products/the-signal-e6">Start free →</a>
  <button class="v2-sticky-x" type="button" aria-label="Dismiss this bar">✕</button>
</div>
`;

function homeSource(html) {
  let out = html;

  /* 1 · the hero: one focal point, one primary action, the price and the pact
     stated plainly beside it, and the same trust line every other page uses. */
  const hero = `<div class="hero-inner">
  <div class="hero-sigil rv"><img onerror="this.onerror=null;this.src='/assets/icon-192.png';this.style.mixBlendMode='screen';this.style.filter='none'" src="assets/logo_alpha.webp" alt="The sigil of Numinous: a winged eye within a mandala of sacred geometry" width="196" height="196" loading="eager"></div>
  <div class="hero-kicker rv d1">WITNESS&nbsp;THE&nbsp;IMPOSSIBLE</div>
  <h1 class="hero-title split" id="heroTitle">NUMINOUS</h1>
  <p class="hero-tag rv d2">Cinematic visions of the <em>divine</em> and mythical.</p>
  <p class="hero-desc">Free weekly visions — every realm posted here before the open feed.<br>A new being every week, fifteen named so far.</p>
  <p class="hero-value rv d2">Free to start, forever: no card, no renewal. The Watcher is <b>$28</b> a moon or <b>$280</b> a year, with the seven-night guarantee. The Wallpaper Vault is a one-time <b>$12</b>.</p>
  <div class="hero-cta rv d4">
    <a class="btn solid" data-hover href="/products/the-signal-e6" aria-label="Start free with The Signal">Start free: The Signal</a>
    <a class="btn btn-ghost" data-hover href="/products/the-numinary-3e" aria-label="See The Watcher membership">See the Watcher, $28 a moon</a>
  </div>
  <p class="v2-trust"><span>Free forever</span><span>Seven-night guarantee</span><span>Cancel any moon</span><span>Three works · fifteen beings</span></p>
  </div>

  `;
  out = splice(out, '<div class="hero-inner">', '<div class="hero-foot rv d4">', hero, "the hero");

  /* 1b · the two images that sit inside the markup the house writes are pinned
     to the root: the home document is also what the host answers an unknown
     path with, and a relative art path breaks everywhere but the root. */
  out = out.replaceAll('src="assets/logo_alpha.webp"', 'src="/assets/logo_alpha.webp"');
  out = out.replaceAll('src="assets/numinary.jpg"', 'src="/assets/numinary.jpg"');
  out = out.replaceAll("this.src='assets/watcher.jpg'", "this.src='/assets/watcher.jpg'");

  /* 2 · the Watcher chapter: the seat, the year beside it, and the pact — or the
     seven nights — standing with both. */
  const seatFrom = '<a class="lq-cta" data-hover data-magnet href="/checkout/' + MONTHLY_PLAN;
  const seat = `<a class="btn solid" data-hover href="${MONTHLY_LINK}">Take a seat, $28 a moon</a>
          <a class="btn" data-hover href="https://whop.com/checkout/${ANNUAL_PLAN}?${ANNUAL_ORDER}">Take the whole year, $280</a>
          <span class="num-price">$28&nbsp;/&nbsp;MOON&nbsp;·&nbsp;$280&nbsp;/&nbsp;YEAR</span>`;
  const seatTo = '<span class="num-price">';
  const i = out.indexOf(seatFrom);
  if (i !== -1) {
    const j = out.indexOf("</span>", out.indexOf(seatTo, i));
    if (j !== -1) out = out.slice(0, i) + seat + out.slice(j + "</span>".length);
    else console.warn("[numinous v2] the Watcher seat could not be replaced");
  } else {
    console.warn("[numinous v2] the Watcher seat anchor was not found");
  }

  /* 3 · the seven nights, stated where the price is. */
  out = replaceOnce(
    out,
    '<div class="cycle rv d2"><b>28</b>',
    `<p class="guarantee-card v2-guarantee" style="text-align:left"><strong>The seven-night guarantee</strong> Join The Watcher and the first seven nights are yours. If the room does not name what you saw, write within seven nights of your first payment and <a href="/refunds">the full amount returns</a>. Keep what you received.</p>
        <div class="cycle rv d2"><b>28</b>`,
    "the seven nights beside the price",
  );

  /* 4 · one language for the works: every card opens at its own gate, and the
     gate carries the price, the pact and the briefing film. */
  out = replaceOnce(
    out,
    'href="/checkout/' + VAULT_PLAN + '?quantity=1&amp;items=' + VAULT_PLAN + ':1"',
    'href="/products/wallpaper-vault"',
    "the Vault card opens at its gate",
  );

  /* 5 · an unknown path is answered with the home: the house's own 404 speaks
     in the same voice as every other page, and it knows the threshold route. */
  const known = out.match(/var known=(\[[^\]]*\]);/);
  if (known) {
    let list = [];
    try {
      list = JSON.parse(known[1]);
    } catch (error) {
      console.warn("[numinous v2] the known-path list could not be read");
    }
    if (!list.includes("/checkout")) list.push("/checkout");
    out = out.replace(known[0], "var known=" + JSON.stringify(list) + ";");
  } else {
    console.warn("[numinous v2] the known-path list was not found");
  }
  out = replaceOnce(
    out,
    `    box.setAttribute("style","max-width:720px;margin:14vh auto;padding:0 1.4rem;text-align:center");
    box.innerHTML='<p style="letter-spacing:.3em;color:#c5a464;font-size:13px">EST . MMXXVI</p>'
      +'<h1 style="font-family:Cinzel,Georgia,serif;color:#f2efe8">This gate does not open.</h1>'
      +'<p style="color:#c9c3b6">That address is not one of the house pages. Nothing was lost.</p>'
      +'<p style="margin-top:1.4rem"><a class="btn btn-gold" href="/">Return to Numinous</a> '
      +'<a class="btn btn-ghost" href="/collections/all">The Works</a></p>';`,
    `    box.className="v2-404";
    box.innerHTML='<span class="v2-num">✦</span>'
      +'<p class="kicker">EST . MMXXVI &middot; THE HOUSE</p>'
      +'<h1>This gate does not open.</h1>'
      +'<p class="lede">That address is not one of the house pages. Nothing was lost, and nothing was taken \\u2014 The Signal is free, forever, and the works are one step away.</p>'
      +'<p class="v2-404-cta"><a class="btn solid" href="/products/the-signal-e6">Start free: The Signal</a> '
      +'<a class="btn" href="/collections/all">The Works</a> '
      +'<a class="btn" href="/">Return to Numinous</a></p>';`,
    "the 404 block",
  );

  /* 5b · the social card: the 1.18 MB banner is over the house's own weight
     target, so both og:image and twitter:image point at the Watcher art
     (206 KB) instead. No dimension tags are declared, so nothing else needs to
     agree with the swap. */
  const BANNER = "https://jointhenuminouses.whop.site/banner.png";
  if (out.includes(BANNER)) {
    out = out.replaceAll(BANNER, "https://jointhenuminouses.whop.site/assets/watcher.jpg");
  } else {
    console.warn("[numinous v2] the social card anchor was not found");
  }

  /* 6 · the forward for older checkout links, the persistent action, and the
     small machine that shows it. */
  out = replaceOnce(out, "<head>", "<head>\n" + HOME_FORWARD, "the home head");
  out = replaceOnce(out, "</body>", HOME_BAR + "</body>", "the home foot");

  return out;
}

/* ---------- the emitted files ---------- */

function emit(clientDir) {
  /* The older checkout links: every plan and channel the house has ever put in
     the world points at the threshold document. This file is insurance only —
     the host answers those paths with the home, whose forward does the work —
     but a host that does honour it must land in the same place. */
  const redirects = join(clientDir, "_redirects");
  if (existsSync(redirects)) {
    let rules = readFileSync(redirects, "utf8");
    if (!rules.includes("/checkout/" + MONTHLY_PLAN)) {
      const lines = [
        "",
        "# v2 · the older house checkout links → the threshold page (insurance)",
        "# The host answers unresolvable paths with the storefront home, which",
        "# forwards this family itself; these rules cover a host that reads this.",
      ];
      for (const id of PLAN_IDS) {
        lines.push("/checkout/" + id + " /checkout/index.html 200");
        lines.push("/checkout/" + id + "/ /checkout/index.html 200");
      }
      lines.push("/checkout/* /checkout/index.html 200");
      writeFileSync(redirects, rules.replace(/\s*$/, "\n") + lines.join("\n") + "\n");
      console.log(
        "[numinous v2] _redirects: " + PLAN_IDS.length + " checkout paths (and a catch-all) point at the threshold",
      );
    }
  } else {
    console.warn("[numinous v2] no _redirects file to extend");
  }

  const doc = join(clientDir, "checkout", "index.html");
  if (existsSync(doc)) {
    let html = readFileSync(doc, "utf8");
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, "<title>The threshold · Numinous</title>")
      .replace(
        /<meta\s+[^>]*name="description"[^>]*>/,
        '<meta name="description" content="You followed an older checkout link. Here is what it was for, what it costs, and the door to the checkout on Whop.">',
      );
    writeFileSync(doc, html);
    console.log("[numinous v2] the threshold document is titled");
  } else {
    console.warn("[numinous v2] the /checkout document was not built");
  }
}

export default {
  routes: ["checkout"],
  css: CSS,
  source(file, code) {
    if (file.endsWith("src/site.js")) return siteSource(code);
    return undefined;
  },
  home(html) {
    return homeSource(html);
  },
  emit,
};
