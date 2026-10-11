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
const css = `
/* 4.5 · works cards: the one-sentence promise, then three plain features */
.card-feats{margin:.55rem 0 .2rem;padding:0;display:grid;gap:.3rem}
.card-feats li{list-style:none;position:relative;padding-left:1.15rem;color:var(--bone);font-size:max(14px,1em);line-height:1.45}
.card-feats li::before{content:"\\2726";position:absolute;left:0;color:var(--gold);font-size:.75em;top:.15em}
/* 4.5 · price reads large, the annual option sits with it */
.price-line{font-family:var(--display);font-size:max(18px,1.05rem);letter-spacing:.06em;color:var(--gold-hi);display:block;margin:.35rem 0 .1rem}
/* 4.11 · the seven-night terms, in three plain points */
.pact-terms{display:grid;gap:.6rem;margin:1.2rem auto 0;max-width:64ch;text-align:left;padding:0}
.pact-terms li{list-style:none;position:relative;padding-left:1.7rem;color:var(--bone)}
.pact-terms li::before{content:"\\2726";position:absolute;left:0;color:var(--gold)}
.pact-terms a{color:var(--gold-hi)}
.pact-plain{font-family:var(--display);font-size:clamp(1.25rem,2.6vw,1.9rem);line-height:1.25;color:var(--bone)}
.pact-poet{font-style:italic;color:var(--mist)}
/* 4.7 · the guarantee card, under the price */
.guarantee-card{display:block;margin:1.1rem 0;padding:1rem 1.15rem;border:1px solid rgba(197,164,100,.42);border-radius:var(--radius-card,22px);background:linear-gradient(145deg,rgba(212,175,55,.05),transparent 60%),rgba(255,255,255,.015)}
.guarantee-card strong{display:block;font-family:var(--display);letter-spacing:.1em;color:var(--gold-hi)}
/* 4.15 · consent: Accept and Decline carry equal weight */
.cookie .cta-row{display:flex;gap:.7rem;flex-wrap:wrap}
.cookie .cta-row .btn{flex:1;min-width:min(100%,160px);justify-content:center;min-height:44px}
.cookie .btn{background:rgba(255,255,255,.035);border:1px solid rgba(231,213,166,.5);color:var(--bone)}
/* 4.14 · a real label above the field */
.herald-label{display:block;color:var(--bone);font-size:max(15px,1em);margin:.2rem 0 .45rem}
/* 4.3 · the marquee stops for a keyboard too, not only a cursor */
.marquee:focus-within .track{animation-play-state:paused}
.marquee a:focus-visible,.marquee span:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
/* 4.15 · equal-weight consent: one class, one size, one voice */
.cookiebar .row{display:flex;gap:.8rem;flex-wrap:wrap;justify-content:center}
.btn.btn-equal{display:inline-flex;align-items:center;justify-content:center;min-height:48px;min-width:9.5rem;padding:.85rem 1.4rem;background:transparent;border:1px solid var(--gold);border-radius:4px;color:var(--gold-hi);font-family:var(--display);font-size:13px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.btn.btn-equal:hover,.btn.btn-equal:focus-visible{background:var(--gold);border-color:var(--gold-hi);color:#0b0906}
/* 4.1 · mobile drawer: full screen, 48px targets, readable */
#mobile a{min-height:48px;display:flex;align-items:center;justify-content:center}
@media (max-width:768px){.hero-value{font-size:max(16px,1em)}.stat b{font-size:clamp(1.6rem,7vw,2.2rem)}}
`;

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

  css,

  home(html) {
    const pairs = [
      /* ---- 4.21 · no build notes in production HTML ---- */
      [
        `<!-- ============================================================
  WHOP-AI BUILD: the ONLY file meant to be pasted into Whop AI.
  ~140 KB = ~36K tokens (limit is 500K - fits ~13x over).
  NEVER paste publish/index.html: 1.3 MB of base64 (~330K tokens) wrecks the chat.
  ============================================================ -->

`,
        "",
      ],

      /* ---- 4.21 · one title, one description, per page ---- */
      [
        "<title>NUMINOUS · The Realms, Opened</title>",
        "<title>Numinous: Cinematic Visions of the Divine and Mythical | Free to Start</title>",
      ],
      [
        `<meta name="description" content="Cinematic visions of the divine and mythical. The Signal is $0 with no renewal. The Watcher has a 7-night trial, then $28 every 28 days. Witness the impossible.">`,
        `<meta name="description" content="Free weekly cinematic AI-art visions of mythic and divine scenes. The Signal is free forever. The Watcher is $28 per 28-day cycle or $280 a year, with a seven-night money-back guarantee. The Wallpaper Vault is a one-time $12.">`,
      ],
      [
        `<meta property="og:title" content="NUMINOUS · The Realms, Opened">`,
        `<meta property="og:title" content="Numinous: cinematic visions of the divine and mythical">`,
      ],
      [
        `<meta property="og:description" content="Cinematic visions of the divine and mythical. New realms every week.">`,
        `<meta property="og:description" content="Free weekly visions. Membership $28 per 28-day cycle, $280 a year, seven-night guarantee. Start free.">`,
      ],

      /* ---- 4.1 · one navigation, plain labels, one primary action ---- */
      [`<a href="#works" data-hover>THE WORKS</a>`, `<a href="#works" data-hover>Products</a>`],
      [`<a href="#numinary" data-hover>THE WATCHER</a>`, `<a href="#numinary" data-hover>Membership</a>`],
      [`<a href="#pact" data-hover>THE PACT</a>`, `<a href="#pact" data-hover>Refunds</a>`],
      [`<a href="#works">THE WORKS</a>`, `<a href="#works">Products</a>`],
      [`<a href="#numinary">THE WATCHER</a>`, `<a href="#numinary">Membership</a>`],
      [`<a href="#pact">THE PACT</a>`, `<a href="#pact">Refunds</a>`],
      [`>ENTER THE SIGNAL <span class="ar">→</span></a>`, `>Start free <span class="ar">→</span></a>`],

      /* ---- 4.2 · the hero says what it costs and what you get ---- */
      [
        `<p class="hero-desc">Cinematic visions of the divine and mythical.<br>New realms every week.</p>`,
        `<p class="hero-desc">Cinematic visions of the divine and mythical.<br>New realms every week.</p>
  <p class="hero-value rv d2">Free weekly AI-art visions of mythic and divine scenes. Membership adds the making-of, the lore and a live session for $28 per 28-day cycle ($280 a year).</p>`,
      ],
      [
        `<svg class="lq-star" viewBox="0 0 24 24"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z"/></svg>ENTER THE SIGNAL</span>`,
        `<svg class="lq-star" viewBox="0 0 24 24"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z"/></svg>Start free: The Signal</span>`,
      ],
      [`>BECOME A WATCHER</a>`, `>See the Watcher, $28 a moon</a>`],

      /* ---- 4.6 · the veil is skippable and never marks the page busy ---- */
      [
        `<div id="veil" aria-hidden="true">`,
        `<div id="veil" aria-label="Opening Numinous">`,
      ],
      [
        `  <div class="bar"><i id="veilBar"></i></div>
  <div class="pct" id="veilPct">I</div>
</div>`,
        `  <div class="bar" aria-hidden="true"><i id="veilBar"></i></div>
  <div class="pct" id="veilPct" aria-hidden="true">I</div>
  <button id="veilSkip" type="button" onclick="var v=document.getElementById('veil');v.classList.add('gone');document.body.style.overflow='';">Skip intro</button>
</div>`,
      ],

      /* ---- 4.4 · plain numbers, plain labels; the numerals go ---- */
      [`<div class="stat rv"><b>III</b><span>WORKS</span></div>`, `<div class="stat rv"><b>3</b><span>WORKS</span></div>`],
      [`<div class="stat rv d1"><b>28</b><span>DAYS&nbsp;PER&nbsp;CYCLE</span></div>`, `<div class="stat rv d1"><b>28</b><span>DAY&nbsp;CYCLES</span></div>`],
      [`<div class="stat rv d2"><b>VII</b><span>NIGHTS&nbsp;OF&nbsp;THE&nbsp;PACT</span></div>`, `<div class="stat rv d2"><b>7</b><span>NIGHT&nbsp;GUARANTEE</span></div>`],
      [`<div class="stat rv d3"><b>XV</b><span>BEINGS&nbsp;NAMED</span></div>`, `<div class="stat rv d3"><b>15</b><span>BEINGS&nbsp;NAMED</span></div>`],

      /* ---- 4.5 · every card: price, promise, three features, one next step ---- */
      [
        `<p>Every realm drops here first.</p>
          <span class="offer-terms">Free: $0, no renewal.</span>
          <span class="go">OPEN THE GATE <span class="ar">→</span></span>`,
        `<p>Every realm drops here first: free weekly visions.</p>
          <ul class="card-feats"><li>A ten-page First Vision gift</li><li>Dispatches: new realms 24 hours before the feed</li><li>The Sanctuary community room</li></ul>
          <span class="offer-terms">Free: $0, no renewal, no card.</span>
          <span class="go">Get The Signal free <span class="ar">→</span></span>`,
      ],
      [
        `<p>The room. The community, the process, the live session, every 28-day cycle.</p>
          <span class="offer-terms">7-night trial, then $28 every 28 days.</span>
          <span class="go">ENTER THE ROOM <span class="ar">→</span></span>`,
        `<p>The room: the community, the process, the live session, every 28-day cycle.</p>
          <ul class="card-feats"><li>Four weekly chapters each cycle</li><li>The Records: the making-of and the lore</li><li>Live session: build, Q&amp;A, vote</li></ul>
          <span class="offer-terms">$28 per 28-day cycle · $280 a year · seven-night guarantee.</span>
          <span class="go">Join the Watcher, $28 a moon <span class="ar">→</span></span>`,
      ],
      [
        `<p>Fifteen realms, cropped for every screen.</p>
          <span class="offer-terms">One-time purchase: $12.</span>
          <span class="go">ENTER THE VAULT <span class="ar">→</span></span>`,
        `<p>Fifteen realms, cropped for every screen.</p>
          <ul class="card-feats"><li>Fifteen wallpaper sets</li><li>Cropped for phone, tablet and desktop</li><li>One-time $12 — no renewal</li></ul>
          <span class="offer-terms">One-time purchase: $12. Final once opened (see Refunds in the footer).</span>
          <span class="go">Buy the Vault, $12 <span class="ar">→</span></span>`,
      ],
      [`<span class="num">II&nbsp;/&nbsp;III</span><span class="price">$28 / MOON</span>`, `<span class="num">II&nbsp;/&nbsp;III</span><span class="price">$28 / 28 DAYS · $280 / YEAR</span>`],

      /* ---- 4.21 · every fallback points at its own art ---- */
      [
        `onerror="this.onerror=null;this.src='assets/signal.jpg'" src="assets/numinary.jpg"`,
        `onerror="this.onerror=null;this.src='assets/watcher.jpg'" src="assets/numinary.jpg"`,
      ],
      [
        `<div class="art r45"><img src="https://assets-2-prod.whop.com/public/uploads/2026-09-13/e527b9ad-09ea-4631-9420-fb32350a12f1/image.png"`,
        `<div class="art r45"><img onerror="this.onerror=null;this.src='assets/vault.jpg'" src="https://assets-2-prod.whop.com/public/uploads/2026-09-13/e527b9ad-09ea-4631-9420-fb32350a12f1/image.png"`,
      ],

      /* ---- 4.11 · the pact speaks plainly first ---- */
      [
        `<h2>ENTER. IF IT NAMES NOTHING,<br><span class="g">RETURN.</span></h2>`,
        `<h2 class="pact-plain">Try the Watcher for seven nights. Full refund if it isn't for you.</h2>
      <p class="text pact-poet">Enter. If it names nothing, return.</p>`,
      ],
      [
        `<p class="text">The Watcher gives you <b>seven nights</b>. If the room does not name what you saw, message within seven nights of the first payment and <b>the full amount returns</b>. Keep what you received. The Signal is free, forever. Other works are final the moment they open.</p>`,
        `<p class="text">Your card is charged when you join. If it isn't for you, email within seven nights of that first payment and <b>the full amount returns</b>. Keep what you received. The Signal is free, forever. The Wallpaper Vault is final once opened.</p>
      <ul class="pact-terms">
        <li><b>What is refunded:</b> the full amount of your first Watcher payment.</li>
        <li><b>The deadline:</b> ask within seven nights (7 days) of that first payment.</li>
        <li><b>How to ask:</b> email <a href="mailto:${SUPPORT}">${SUPPORT}</a> with your receipt — see the <a href="/refunds">refund policy</a>.</li>
      </ul>`,
      ],

      /* ---- 4.12 · the questions travellers actually ask ---- */
      [
        `Yes, <b>forever</b>. Every realm drops there first. Walk further only if the first vision names what you saw.`,
        `Yes. No card, no renewal, forever. Every realm drops there first. Membership is optional.`,
      ],
      [
        `Every 28 days the cycle turns: <b>the month's new being</b>, the process behind the veil, the records, and a live session where your questions steer the vote.`,
        `Four weekly chapters every 28 days: <b>The Realm</b> (the new being), <b>The Process</b> (how it was made), <b>The Records</b> (the lore) and <b>The Session</b> (live build, Q&amp;A, vote). $28 per cycle, $280 a year.`,
      ],
      [
        `One full cycle of the realms, every <b>28 days</b>. The room, the work, the people. Pause or leave whenever the moon is dark.`,
        `One full cycle: <b>28 days</b>, four chapters, the room and the live session. Cancel any time — your access stays until the end of the cycle you have paid for.`,
      ],
      [
        `<div class="ans">Yes. Every realm and every session is rendered for <b>phone, tablet and desktop</b>.</div>
      </details>
    </div>`,
        `<div class="ans">Yes. Every realm and every session is rendered for <b>phone, tablet and desktop</b>.</div>
      </details>
      <details class="qa rv d1">
        <summary>HOW DO I CANCEL?<span class="pm" aria-hidden="true"></span></summary>
        <div class="ans">Open your membership in your Whop library and cancel there, or email <a href="mailto:${SUPPORT}">${SUPPORT}</a>. Your access stays to the end of the cycle you have already paid for.</div>
      </details>
      <details class="qa rv d2">
        <summary>HOW DO I GET A REFUND?<span class="pm" aria-hidden="true"></span></summary>
        <div class="ans">The Watcher carries a <b>seven-night guarantee</b>: email us within seven nights of your first payment and the full amount returns. The <a href="/refunds">refund policy</a> has the detail.</div>
      </details>
      <details class="qa rv d1">
        <summary>CAN I USE THE CONTENT COMMERCIALLY?<span class="pm" aria-hidden="true"></span></summary>
        <div class="ans">The visions are yours to use, including commercially. The files themselves (the Wallpaper Vault download and the written records) may not be resold or redistributed — see the <a href="/eula">EULA</a>.</div>
      </details>
    </div>`,
      ],

      /* ---- 4.14 · a label, working validation, plain errors ---- */
      [`<form class="herald-form" id="heraldForm" novalidate>`, `<form class="herald-form" id="heraldForm">`],
      [`<div id="heraldCaptcha" aria-hidden="true"></div>\n        `, ``],
      [
        `<input id="heraldEmail" type="email" required placeholder="Your email address" autocomplete="email" aria-label="Your email address" data-hover>`,
        `<label class="herald-label" for="heraldEmail">Email address</label>
        <input id="heraldEmail" type="email" required placeholder="name@example.com" autocomplete="email" data-hover>`,
      ],
      [`>RECEIVE THE SIGNAL <span class="ar">→</span></button>`, `>Subscribe to updates <span class="ar">→</span></button>`],
      [
        `<span>I accept the <a href="#/terms">Terms of Service</a> and the <a href="#/privacy">Privacy Policy</a>, and I wish to receive The Signal.</span>`,
        `<span>I agree to the <a href="/terms">Terms of Service</a> and the <a href="/privacy">Privacy Policy</a>, and to receive The Herald: one email when a new realm opens. Unsubscribe at any time.</span>`,
      ],
      [
        `<div class="consent-note" id="consentNote" role="alert">The pact must be accepted before the Signal can find you.</div>`,
        `<div class="consent-note" id="consentNote" role="alert">Please accept the Terms and Privacy Policy to continue.</div>`,
      ],
      [
        `<div class="herald-ok" id="heraldOk" role="status">So it is written. The next vision will find you. Confirm the address in your inbox.</div>`,
        `<div class="herald-ok" id="heraldOk" role="status">Thank you. This site does not store your address.</div>`,
      ],
      [
        `<div class="herald-note">FREE FOREVER · NO NOISE · LEAVE WITH ONE WORD</div>`,
        `<div class="herald-note">One email when a new realm opens. Unsubscribe at any time.</div>`,
      ],
      [
        `var CAPTCHA={provider:'hcaptcha',siteKey:'a0644e9c-f63e-4e2a-bbca-1e8ea40c96f2'}; /* hCaptcha public site key; the secret lives server-side (HCAPTCHA_SECRET). */`,
        `var CAPTCHA={provider:'',siteKey:''}; /* the captcha gate is off: this form stores nothing here and hands the traveller straight to The Signal. */`,
      ],

      /* ---- 4.13 · community comments, named as such ---- */
      [
        `<!-- NOTE TO THE HOUSE: the three quotes below are PLACEHOLDERS for layout only.
     Replace them with genuine member quotes before launch. Never publish
     invented reviews as if they were real. -->
`,
        "",
      ],
      [`<figcaption>@EDGAR.MACENA&nbsp;·&nbsp;FROM&nbsp;THE&nbsp;PORTUGUESE</figcaption>`, `<figcaption>@edgar.macena · community comment, translated from the Portuguese</figcaption>`],
      [`<figcaption>@NURULLAHDURGEL01&nbsp;·&nbsp;FROM&nbsp;THE&nbsp;TURKISH</figcaption>`, `<figcaption>@nurullahdurgel01 · community comment, translated from the Turkish</figcaption>`],
      [`<figcaption>@SHMSTJYKH33&nbsp;·&nbsp;FROM&nbsp;THE&nbsp;PERSIAN</figcaption>`, `<figcaption>@shmstjykh33 · community comment, translated from the Persian</figcaption>`],
      [
        `<p class="voices-note rv">Real words from the public comments on the work, carried as written and translated where another tongue was used.</p>`,
        `<p class="voices-note rv">Community comments from the public record on the work, carried as translated where another tongue was used. They are shown as written by their authors and are not endorsements.</p>`,
      ],

      /* ---- 4.17 · a footer that links everything, plainly ---- */
      [
        `          <li><a href="#faq" data-hover>Questions of the road · FAQ</a></li>
          <li><a href="#/privacy" data-hover>Privacy Policy</a></li>
          <li><a href="#/terms" data-hover>Terms of Service</a></li>`,
        `          <li><a href="#faq" data-hover>FAQ</a></li>
          <li><a href="/refunds" data-hover>Refunds · the seven nights</a></li>
          <li><a href="/terms" data-hover>Terms of Service</a></li>
          <li><a href="/privacy" data-hover>Privacy Policy</a></li>
          <li><a href="/eula" data-hover>EULA</a></li>
          <li><a href="/cookies" data-hover>Cookies</a></li>
          <li><a href="mailto:${SUPPORT}" data-hover>${SUPPORT}</a></li>`,
      ],
      [
        `<span class="legal"><a href="#/terms" data-hover>TERMS OF SERVICE</a><b>·</b><a href="#/privacy" data-hover>PRIVACY POLICY</a><b>·</b><a href="#/refund" data-hover>REFUND POLICY</a><b>·</b><a href="#/eula" data-hover>EULA</a><b>·</b><a href="#/privacy" data-hover>COOKIES</a></span>`,
        `<span class="legal"><a href="/terms" data-hover>TERMS</a><b>·</b><a href="/privacy" data-hover>PRIVACY</a><b>·</b><a href="/refunds" data-hover>REFUNDS</a><b>·</b><a href="/eula" data-hover>EULA</a><b>·</b><a href="/cookies" data-hover>COOKIES</a></span>`,
      ],

      /* ---- 4.16 · the records describe the works that exist ---- */
      [
        `LAST&nbsp;UPDATED&nbsp;SEPTEMBER&nbsp;8,&nbsp;2026&nbsp;·&nbsp;NUMINOUS&nbsp;VAULT&nbsp;·&nbsp;BLACK&nbsp;EDITION&nbsp;·&nbsp;WHOP&nbsp;STOREFRONT`,
        `LAST&nbsp;UPDATED&nbsp;OCTOBER&nbsp;11,&nbsp;2026&nbsp;·&nbsp;THE&nbsp;SIGNAL&nbsp;·&nbsp;THE&nbsp;WATCHER&nbsp;·&nbsp;WALLPAPER&nbsp;VAULT&nbsp;·&nbsp;THE&nbsp;HERALD`,
      ],
      [
        `These Terms of Service (“Terms”) govern your purchase and use of Numinous Vault (the “Product”), sold by Numinous (“we,” “us”) through our storefront on Whop. By purchasing, you agree to these Terms.`,
        `These Terms of Service (“Terms”) govern your purchase and use of the Numinous works sold by Numinous (“we,” “us”) through our storefront on Whop: The Signal, The Watcher, the Wallpaper Vault and The Herald (“the Works”). By buying or subscribing, you agree to them.`,
      ],
      [
        `Numinous Vault is a digital PDF guide containing prompt structures, workflow information, and generation settings related to AI-generated imagery. It is sold as-is, for informational and creative reference purposes.`,
        `The Signal is a free collection of cinematic visions, with Dispatches, a ten-page First Vision gift, a calendar and the Sanctuary room. The Watcher is a membership: $28 per 28-day cycle, or $280 a year, with four weekly chapters each cycle and a seven-night guarantee. The Wallpaper Vault is a one-time $12 download of fifteen wallpaper sets. The Herald is a free email newsletter.`,
      ],
      [
        `Upon successful payment, you will receive instant access to download the Product. It is your responsibility to ensure you have a valid method to receive and store the download.`,
        `The Signal and The Herald are free and open at once. The Watcher opens your seat in your Whop library and runs in 28-day cycles until you cancel. The Wallpaper Vault downloads as soon as payment completes. Keep a working way to receive and store what you are given.`,
      ],
      [
        `The Product is creative/educational reference material. It does not guarantee any specific artistic, commercial, or financial outcome from its use. Results from using the prompts and workflow described depend on third-party AI tools (e.g. Veo3, Google Flow) that we do not control and are not affiliated with.`,
        `The Works are creative material: cinematic visions, the process behind them and the records around them. Nothing here promises any particular artistic, commercial or financial outcome. Any third-party tool you choose to use is governed by its own terms; we are not affiliated with, and do not represent, any tool maker.`,
      ],
      [
        `These Terms, and any dispute arising from your purchase or use of the Product, are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law principles. Separately, regardless of where you are located, Numinous handles personal data collected through this storefront in accordance with the data protection frameworks of the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), applied as the governing privacy and data-handling standard for this business regardless of buyer location — see the <a href="#/privacy">Privacy Policy</a> for full detail on data subject rights under both frameworks.`,
        `These Terms, and any dispute arising from your purchase or use of the Works, are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law principles. If you are in the EU/EEA or California, your statutory data-protection rights apply to you as set out in the <a href="/privacy">Privacy Policy</a>; they are not extended to anyone else by these Terms.`,
      ],
      [
        `This Privacy Policy explains what personal information is collected when you purchase Numinous Vault through our Whop storefront, how it is used, and the rights available to you under the data protection frameworks of the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), applied as the governing privacy and data-handling standard for this business regardless of buyer location.`,
        `This Privacy Policy explains what personal information is collected when you use the Numinous storefront or take one of the Works (The Signal, The Watcher, the Wallpaper Vault, The Herald), how it is used, and what rights you have. Whop is the storefront host and the payment processor.`,
      ],
      [
        `<li>We do not sell, rent, or trade your personal information to third parties</li>`,
        `<li>We do not sell, rent, or trade your personal information to third parties</li>
      <li><b>The Herald:</b> the newsletter form on this site does not store your address. Submitting it opens The Signal; after that your address is held by Whop as part of your library, not by this site</li>
      <li><b>Cookies and tracking:</b> this site stores one consent choice in your browser (Accept or Decline). Whop injects its own first-party pixel into every page before our code runs: that pixel sets a visitor id (<code>_wuid</code>) and records page views so a visit can be tied to a later checkout. Declining does not switch off Whop's pixel; it stops anything else of ours from loading, and nothing else of ours exists to load</li>
      <li><b>Analytics:</b> no third-party analytics run on this site</li>`,
      ],
      [
        `Payment processing and storefront hosting are handled by Whop. Their handling of your data is governed by Whop’s own Privacy Policy, which we encourage you to review at the time of purchase.`,
        `Whop is the payment processor and the storefront host: it takes the payment, holds your library and records visits through its own first-party pixel (<code>_wuid</code>). Its handling of your data is governed by Whop's own privacy policy, which we encourage you to read before you buy. Instagram, if you follow the house there, has its own rules.`,
      ],
      [
        `Numinous Vault is a digital product delivered instantly upon purchase. Because the Product is accessible immediately and cannot be “returned” in the way a physical item can, our refund policy is as follows.`,
        `This policy covers all of the Works: The Signal (free), The Watcher (membership), the Wallpaper Vault (one-time download) and The Herald (free newsletter).`,
      ],
      [
        `<h3><span class="n">II.</span>GENERAL POLICY: ALL SALES FINAL</h3>
    <p>Due to the instant, downloadable nature of the Product, all sales are final once the Product has been delivered. We do not offer refunds simply because you changed your mind or the content did not meet personal expectations.</p>`,
        `<h3><span class="n">II.</span>THE WATCHER: SEVEN NIGHTS</h3>
    <p>The Watcher carries the seven-night guarantee. The first seven nights are free. When the first payment is taken, email us within seven nights of it and the full amount returns. After that window, a cycle that has run is final — you can cancel any time and your access stays to the end of the cycle you have paid for.</p>`,
      ],
      [
        `<h3><span class="n">III.</span>EXCEPTIONS</h3>
    <p>We will consider a refund in the following limited circumstances:</p>`,
        `<h3><span class="n">III.</span>THE WALLPAPER VAULT AND OTHER ONE-TIME WORKS</h3>
    <p>One-time downloads are final once opened, because they cannot be returned. We will still refund, in these limited circumstances:</p>`,
      ],
      [
        `Refund requests under these exceptions must be made within 7 days of purchase by contacting numinous.support@gmail.com with your order confirmation/receipt.`,
        `Refund requests: email ${SUPPORT} with your order confirmation or receipt. The Watcher window is seven nights from the first payment; the one-time works, seven days from purchase.`,
      ],

      /* ---- 4.16 · the license names the works, not one of them ---- */
      [
        `Upon purchase, Numinous grants you a limited, non-exclusive, non-transferable license to download and use Numinous Vault for your own personal or commercial creative projects, subject to the restrictions below.`,
        `Numinous grants you a limited, non-exclusive, non-transferable license to use the visions, the process and the records of the Works for your own personal or commercial creative projects, and to download and keep the Wallpaper Vault files you have bought, subject to the restrictions below.`,
      ],
      [`including but not limited to Veo3 and Google Flow`, `including third-party AI generation tools`],
      /* the legal rewrite already drops the tooling names, so no scrub pair rides here */
      /* ---- 4.15 · Accept and Decline wear the same dress ---- */
      [
        `class="btn btn-gold" data-consent="accepted"`,
        `class="btn btn-equal" data-consent="accepted"`,
      ],
      [
        `class="btn btn-ghost" data-consent="declined"`,
        `class="btn btn-equal" data-consent="declined"`,
      ],

      /* ---- 4.1 · the drawer behaves for keyboards (script below) ---- */
      [`</footer>`, `</footer>\n\n${houseScript}`],
      /* ---- 4.21 · structured data for the brand and the works ---- */
      [`</head>`, `${jsonld}</head>`],
    ];

    const soft = [
      "including but not limited to Veo3 and Google Flow",
      "<p>Fair dealing, sealed by the seven nights — the House of Numinous.</p>",
    ];

    html = apply(html, pairs, soft);
    // §5 · one term per concept: the storefront sells the Wallpaper Vault.
    html = html.split("Numinous Vault").join("Wallpaper Vault");
    // 4.16 · no hash-route legal links remain: the records are real pages now.
    html = html
      .split('href="#/terms"').join('href="/terms"')
      .split('href="#/privacy"').join('href="/privacy"')
      .split('href="#/refund"').join('href="/refunds"')
      .split('href="#/eula"').join('href="/eula"');
    // §5 · the two words the house agreed to spell the American way.
    html = html.replace(/Licence/g, "License").replace(/licence/g, "license");
    html = html.replace(/honours/g, "honors").replace(/honour/g, "honor");
    // 4.21 · the route-map build note (matched by shape, not by position).
    html = html.replace(/<!--(?:(?!-->)[\s\S])*?Product links(?:(?!-->)[\s\S])*?-->/, "");
    return html;
  },

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
        "Every Work - Three Gates and the Vault | Numinous",
        "The complete catalogue: The Signal, The Watcher and the Wallpaper Vault, with prices and what each one opens.",
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
        html = html.replace(
          /<meta property="og:title"[^>]*>/,
          `<meta property="og:title" content="${meta[0]}">`,
        );
      }
      const og =
        `<meta property="og:url" content="${site}${path}">\n` +
        `<meta property="og:site_name" content="Numinous">\n` +
        `<meta name="twitter:card" content="summary_large_image">\n` +
        (path === "/order-complete" ? `<meta name="robots" content="noindex">\n` : "");
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

    /* 4.20 · the home ships its 195 KB of inline CSS and JS as cached files.
       Order is preserved exactly: every <style> block becomes one stylesheet
       linked where the first block stood (the cascade never reorders), and
       every inline <script> becomes its own file in its own place (execution
       order and blocking semantics are unchanged). Relative asset() URLs are
       rooted first, so art keeps resolving from /assets/. Anything that looks
       unsafe to move is left inline and reported. */
    const indexPath = join(clientDir, "index.html");
    let page = readFileSync(indexPath, "utf8");
    const before = page.length;
    let moved = 0;

    const styles = [...page.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)];
    if (styles.length && !styles.some((m) => /<\/style/i.test(m[2]) || /@import/i.test(m[2]))) {
      const combined = styles
        .map((m) => m[2].trim())
        .join("\n")
        .replace(/url\((["']?)assets\//g, "url($1/assets/");
      writeFileSync(join(clientDir, "assets", "numinous-home.css"), combined);
      const link = `<link rel="stylesheet" href="/assets/numinous-home.css">`;
      let out = "";
      let last = 0;
      styles.forEach((m, i) => {
        out += page.slice(last, m.index) + (i === 0 ? link : "");
        last = m.index + m[0].length;
      });
      page = out + page.slice(last);
      moved += styles.length;
    }

    const scripts = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(
      (m) =>
        !/\bsrc=/.test(m[1]) && !/application\/ld\+json/.test(m[1]) && !/<\/script/i.test(m[2]),
    );
    if (scripts.length) {
      scripts.forEach((m, i) => {
        const name = `numinous-home-${i + 1}.js`;
        writeFileSync(join(clientDir, "assets", name), m[2].trim());
      });
      let out = "";
      let last = 0;
      scripts.forEach((m, i) => {
        const attrs = m[1].replace(/\s+/g, " ").trim();
        out +=
          page.slice(last, m.index) +
          `<script${attrs ? " " + attrs : ""} src="/assets/numinous-home-${i + 1}.js"></script>`;
        last = m.index + m[0].length;
      });
      page = out + page.slice(last);
      moved += scripts.length;
    }

    if (moved) writeFileSync(indexPath, page);
    console.log(
      `[numinous] overhaul: home slimmed ${before} -> ${page.length} bytes ` +
        `(1 stylesheet from ${styles.length} blocks, ${scripts.length} scripts externalised)`,
    );
  },
};
