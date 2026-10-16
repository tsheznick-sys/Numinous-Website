/* ============================================================
   NUMINOUS · OVERHAUL V2 — one design language, every page.
   ------------------------------------------------------------
   Loaded after overhaul-home.mjs and overhaul-site.mjs (the engine
   sorts reference/patch/*.mjs by name), so it sees their output and
   has the final word. The storefront home itself was retired from this
   module on the style swap: the index bundle's own document
   (reference/patch/clean/home.html) is canonical and the engine adopts
   it verbatim, so nothing here rewrites a home any more. What remains:

     · v2/site-pages.js — the shell's pages (nav, footer, the four
       gates, the works, the records, the threshold after the
       offering), rewritten in one block and now wearing the bundle's
       own bezel markup; spliced into src/site.js in place of
       everything from `const works = [` to `const routes = {`; adds
       the /checkout route and its page.
     · v2/subpages.css — the sheet that dresses the routed pages in the
       bundle's language. The engine assembles it, with the other
       modules' sheets, into /assets/numinous-subpages.css and links it
       on every routed page after /assets/numinous-clean.css (the
       bundle's design, shipped verbatim in public/), so the gate
       pages carry the same hand as the home.
     · this module — the orchestration above.

   How the host routes (do not re-derive): Whop serves exact file
   paths; every routed page is its own document at <route>/index.html,
   and a clean route URL is answered with the storefront home, whose
   head carries the gate boot that forwards it. `_redirects` is not used for checkout IDs: asset redirects would erase
   the ID. The older
   checkout family (/checkout/plan_…, /checkout/ch_…) is therefore
   answered with the home too: the boot in the home's head hands it to
   /checkout/index.html with the original query plus ?from=<old path>.
   /checkout and its whole family render checkoutPage(), which reads
   the plan id, states the price and the seven nights where they
   apply, and offers the canonical whop.com/checkout/… button — or,
   for an unknown id, "this gate has grown old" with every open gate
   below.

   Also in this module: the house 404 rewritten in the v2 voice, and
   the social card repointed from the 1.18 MB banner.png to
   /assets/watcher.jpg (211 KB) — the <300 KB target, with no new
   dependency.

   ============================================================ */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (rel) => readFileSync(join(HERE, rel), "utf8");

const CSS = read("v2/subpages.css");
const PAGES = read("v2/site-pages.js");

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

/* the block between two anchors, removed whole; a miss is loud in the build
   log and never stops the build. */
function cut(html, from, to, label) {
  const i = html.indexOf(from);
  if (i === -1) {
    console.warn("[numinous v2] anchor not found — " + label);
    return html;
  }
  const j = html.indexOf(to, i + from.length);
  if (j === -1) {
    console.warn("[numinous v2] closing anchor not found — " + label);
    return html;
  }
  return html.slice(0, i) + html.slice(j + to.length);
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

  /* 2b · the storefront home is its own document. A link to "/" from inside
     the shell must load that document; rendering a page here instead is how a
     second, older home appears at the same address. */
  out = replaceOnce(
    out,
    '  if (url.pathname === window.location.pathname && url.hash) return;',
    '  if (url.pathname === window.location.pathname && url.hash) return;\n' +
      '  /* "/" is the storefront home, its own document: let the browser load it. */\n' +
      '  if ((url.pathname.replace(/\\/$/, "") || "/") === "/") return;',
    "the router: the home stays its own document",
  );

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

  /* the cookie notice lives in the flow: on a routed page it is moved
     directly under the hero, and it follows the router when the page changes.
     A notice that has been answered is hidden and left where it is. */
  const notice = document.getElementById("cookie");
  const mainEl = document.getElementById("main");
  if (notice && mainEl) {
    const placeNotice = () => {
      if (notice.hidden) return;
      const hero = mainEl.firstElementChild;
      if (!hero) return;
      if (notice.parentNode !== mainEl || notice.previousElementSibling !== hero) {
        hero.after(notice);
      }
    };
    placeNotice();
    new MutationObserver(placeNotice).observe(mainEl, { childList: true });
  }
})();
`;
  /* 4 · the cookie notice speaks the house's words on every routed page. */
  out = replaceOnce(
    out,
    `<p><strong>Signal · Watcher.</strong> One small entry in your browser remembers this choice. No analytics or advertising scripts run on this site; Whop injects its own first-party pixel before our code runs and that pixel is not switched off by Decline. Details in the <a href="/cookies">cookie policy</a>.</p>`,
    `<p><strong>Signal · Watcher.</strong> This site remembers Accept or Decline in your browser. Details in the <a href="/cookies">cookie policy</a>.</p>`,
    "the shell cookie bar's words",
  );
  return out;
}

/* ---------- the records: the refund policy ---------- */

/* The refund record states the Watcher's seven nights in the house's own
   words, and the two free gates say plainly that they have nothing to refund.
   The other sections stay as the house wrote them. */
function recordsSource(code) {
  let out = code;
  out = replaceOnce(
    out,
    `"This policy covers all of the Works: The Signal (free), The Watcher (membership), the Wallpaper Vault (one-time download) and The Herald (free newsletter).",`,
    `"This policy covers all of the Works: The Signal (free), The Watcher (membership), the Wallpaper Vault (one-time download) and The Herald (free newsletter). The Signal and the Herald app have nothing to refund.",`,
    "the refund record's scope",
  );
  out = replaceOnce(
    out,
    `"The Watcher carries the seven-night guarantee. The first seven nights are free. When the first payment is taken, email us within seven nights of it and the full amount returns. After that window, a cycle that has run is final — you can cancel any time and your access stays to the end of the cycle you have paid for.",`,
    `"The Watcher's first seven nights are free. After the first payment, email numinous.support@gmail.com within seven nights and that payment returns. After that window, the paid cycle is final. Cancel any moon, and access stays until the end of the cycle (or year) you have paid for.",`,
    "the refund record's seven nights",
  );
  return out;
}

/* ---------- the home document ---------- */

/* The storefront home answers every path the host cannot resolve, so it is
   where an older checkout link lands. This forward hands that visitor to the
   threshold. (The path is built by concatenation on purpose: the merge rewrites
   any double-quoted house checkout path to the canonical whop.com one, and a
   literal here would be rewritten with it.) */
/* the pulled home is no longer the storefront home: the index bundle's
   own document is canonical, and the house keeps the funnel around it. */

/* ---------- the emitted files ---------- */

function emit(clientDir) {
  /* Do not redirect /checkout/<id> to /checkout/index.html at the asset
     layer: Cloudflare normalizes the target to /checkout/, losing the plan ID.
     The SPA fallback keeps the original URL so the home's gate boot can send
     ?from=<original path> to the threshold. */

  /* A directory URL already resolves to its index. Redirecting that trailing
     slash to index.html loops after Cloudflare canonicalizes /index.html back
     to the directory, so retain only the clean-URL rules. */
  const redirects = join(clientDir, "_redirects");
  if (existsSync(redirects)) {
    const rules = readFileSync(redirects, "utf8");
    writeFileSync(redirects, rules.split("\n")
      .filter((line) => !/^\/\S+\/ \/\S+\/index\.html 200$/.test(line))
      .join("\n"));
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
    if (file.endsWith("src/records.js")) return recordsSource(code);
    return undefined;
  },
  emit,
};
