/* ============================================================
   NUMINOUS · HOUSE V2 — the storefront shell's pages, rewritten.
   Spliced into src/site.js by reference/patch/overhaul-v2.mjs in
   place of everything from `const works = [` up to `const routes = {`.
   Same names, same contracts (records, routes, bind() all keep working):
   one design language with the home, one primary action repeated,
   the guarantee beside every price, and every destination honest.
   ============================================================ */

const SUPPORT = onboard.support;
const SUPPORT_MAIL = `<a href="mailto:${SUPPORT}">${SUPPORT}</a>`;

/* the annual seat: a real plan, live on Whop. */
const ANNUAL_PLAN = "plan_Imfk0oedwYn7v";
const ANNUAL_CHECKOUT = `https://whop.com/checkout/${ANNUAL_PLAN}?quantity=1&items=${ANNUAL_PLAN}:1`;

/* The house's own pre-checkout pages — one door per gate. Every button that
   used to hand the buyer straight to Whop opens here first: the film, the
   rooms, the seven answers, the guarantee, the no-card promise — and only
   then Whop. A pre-checkout page's own buttons are the only whop.com links to
   a gate that remain, because that is where Whop begins. */
const PRE_CHECKOUT = {
  signal: "/checkout/ch_wYXFulML0v6LIoJ",
  watcher: "/checkout/plan_PQnMYNixMTjRQ",
  "watcher-annual": "/checkout/plan_Imfk0oedwYn7v",
  vault: "/checkout/plan_Aew5DdipP3fKY",
  herald: "/checkout/plan_hIKLCR4hGiv9B",
};

const works = [
  {
    id: "signal",
    index: "I / IV",
    mark: "Start here · free forever",
    title: "The Signal",
    text: "Free forever. No card, no renewal. Every realm drops here 24 hours before the feed. Inside: Dispatches and The First Vision, a ten-page gift.",
    price: "Free: $0. No card, no renewal, forever.",
    cta: "Get The Signal free",
    href: gate("the-signal-e6"),
    image: "/assets/signal.jpg",
    alt: "A winged eye of light emerging from storm clouds: The Signal",
  },
  {
    id: "watcher",
    index: "II / IV",
    mark: "$28 / moon",
    title: "The Watcher",
    text: "The room that runs on the moon. Each 28-day cycle has four weekly chapters: The Realm, The Process, The Records, The Session. Cancel any moon. Access stays until the current cycle (or year) ends. Wallpaper Vault is separate and not included.",
    price: "7 days free, then $28 every 28 days, or $280 a year.",
    cta: "Join the Watcher, $28 a moon",
    href: gate("the-numinary-3e"),
    image: "/assets/watcher.jpg",
    alt: "The Watcher, the room that runs on the moon",
  },
  {
    id: "vault",
    index: "III / IV",
    mark: "$12",
    title: "Wallpaper Vault",
    text: "Fifteen wallpapers, each in phone, portrait, and desktop.",
    price: "$12 once. Final once opened.",
    cta: "See the Vault, $12",
    href: gate("wallpaper-vault"),
    image: "/assets/vault.jpg",
    alt: "The Wallpaper Vault: fifteen realms framed in gold",
  },
];

const herald = {
  index: "IV / IV",
  mark: "Free",
  title: "The Herald",
  text: "The next realm, delivered first. A free app. Not The Signal.",
  price: "Free, forever. No card.",
  cta: "Open The Herald",
  href: gate("herald-app"),
  image: "/assets/sigil.jpg",
  alt: "The sigil of Numinous",
};

const faqs = [
  ["Is The Signal truly free?", "Yes — free, forever. No card, no renewal. Every realm drops in The Signal first; the membership is optional and only for those who want the making-of, the lore and the live session."],
  ["What is inside The Watcher?", "One 28-day cycle, delivered in four weekly chapters: <strong>Week I · The Realm</strong> (the month's new being), <strong>Week II · The Process</strong> (how the vision was made), <strong>Week III · The Records</strong> (the lore), <strong>Week IV · The Session</strong> (live build, Q&amp;A, the vote)."],
  ["Why $28 a moon?", "One full cycle of the realms: 28 days, four chapters, the room and the live session. Take the whole year for $280 and the seat never darkens."],
  ["What if it is not for me?", "The Watcher carries the seven-night guarantee: write within seven nights of your first payment and the full amount returns. Keep what you received. The Signal stays free either way."],
  ["How do I cancel?", "Open your membership in your Whop library and cancel there, or write to " + SUPPORT + ". Your access stays to the end of the cycle you have already paid for. Nothing is paused — you simply stop when you choose."],
  ["Do the realms work on any screen?", "Yes. Every realm and every session is rendered for phone, tablet and desktop."],
  ["Can I use the visions commercially?", "The visions are yours to use, including commercially. The files themselves — the Wallpaper Vault download and the written records — may not be resold or redistributed. The <a href=\"/eula\">license of the Works</a> has the whole of it."],
];

const voices = [
  ["It burned but did not consume the tree. Burn me, but do not consume me; speak through your flames.", "@edgar.macena · community comment, translated from the Portuguese"],
  ["They come with the wind, they cleanse, and they depart.", "@nurullahdurgel01 · community comment, translated from the Turkish"],
  ["O God, work a miracle. I am waiting.", "@shmstjykh33 · community comment, translated from the Persian"],
];

const weeks = [
  ["Week I", "The Realm", "The month’s new being: met for the first time."],
  ["Week II", "The Process", "Behind the veil: how the vision was made."],
  ["Week III", "The Records", "The lore deep-dive."],
  ["Week IV", "The Session", "Live build, your questions, the vote."],
];

const MARQUEE_LINE =
  "Witness the impossible <b>✦</b> The Signal <b>✦</b> Watcher $28 a moon <b>✦</b> " +
  "New realms every week <b>✦</b> Fifteen beings <b>✦</b> The seven-night pact <b>✦</b> ";

/* ---------- shared pieces ---------- */

function v2Trust(extra = "", chips = ["Free to start", "Seven-night guarantee", "Cancel any moon"]) {
  return `
    <p class="v2-trust">
      ${chips.map((chip) => `<span>${chip}</span>`).join("\n      ")}
      ${extra}
    </p>`;
}

function v2Guarantee({ text = "" } = {}) {
  return `
    <p class="guarantee-card">
      <strong>The seven-night guarantee</strong>
      ${text || "Join The Watcher and the first seven nights are yours. If the room does not name what you saw, write within seven nights of your first payment and the full amount returns. Keep what you received."}
      <a href="/refunds">Read the refund policy →</a>
    </p>`;
}

function v2PriceBlock({ primary, primaryHref, secondary, secondaryHref, note }) {
  return `
    <div class="v2-price">
      <p class="v2-price-line">${primary}</p>
      <div class="cta-row">
        <a class="btn solid" href="${primaryHref}">${note || "Take a seat"} →</a>
        ${secondary ? `<a class="btn" href="${secondaryHref}">${secondary}</a>` : ""}
      </div>
      ${secondary ? `<p class="v2-annual-note">The annual seat renews once a year — $280, the same seven nights, nothing else added.</p>` : ""}
    </div>`;
}

function marqueeBand() {
  return `
    <div class="marquee" aria-hidden="true">
      <div class="track">${Array.from({ length: 2 }, () => `<span>${MARQUEE_LINE}</span>`).join("")}</div>
    </div>`;
}

function statBand(stats) {
  return `
    <div class="stats">
      <div class="wrap">
        <div class="stats-grid">
          ${stats.map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join("")}
        </div>
      </div>
    </div>`;
}

function pactPanel() {
  return `
    <section class="pact" id="pact">
      <div class="wrap">
        <span class="v2-num">VII</span>
        <p class="kicker">The seven nights</p>
        <h2>Enter. If it names nothing, return.</h2>
        <p class="lede">If the room does not name what you saw, write within seven nights of that first payment and <strong>the full amount returns</strong>. Keep what you received. The Signal is free, forever; the Wallpaper Vault is final once opened.</p>
        <p>
          <a class="btn" href="/returns">Read the seven nights →</a>
          <a class="btn" href="/refunds">The refund policy</a>
        </p>
      </div>
    </section>`;
}

function workCards(list = works) {
  return list
    .map(
      (work) => `
      <a class="card" href="${work.href}">
        <span class="frame"></span>
        <div class="art"><img src="${work.image}" alt="${work.alt}" loading="lazy" decoding="async"></div>
        <div class="body">
          <div class="price-row"><span>✦ ${work.mark}</span><span>${work.index}</span></div>
          <h3>${work.title}</h3>
          <p>${work.text}</p>
          <p class="offer-terms">${work.price}</p>
          <span class="go">${work.cta} <span class="ar">→</span></span>
        </div>
      </a>`,
    )
    .join("");
}

/* The header wears the index bundle's floating bezel: the same navbar the
   home carries, so every routed page opens with the same hand on the door.
   Below 760px the bundle's own rules fold the links into the Menu. */
function nav() {
  const item = (href, label) => `<a href="${href}">${label}</a>`;
  const links = [
    ["/collections/all", "The works"],
    [gate("the-numinary-3e"), "The Watcher"],
    ["/refunds", "The pact"],
    ["/#faq", "FAQ"],
  ];
  return `
    <a class="brand" href="/" aria-label="Numinous home">
      <img class="brand-mark" src="/assets/logo_alpha.webp" alt="" />
      <span>Numinous</span>
    </a>
    <div class="nav-links">
      ${links.map(([href, label]) => item(href, label)).join("\n      ")}
    </div>
    <a class="button button--gold" href="${gate("the-signal-e6")}">Start free</a>
    <details class="nav-menu">
      <summary><span class="sr-only">Open menu</span></summary>
      <nav class="mobile-links" aria-label="Mobile navigation">
        ${links.map(([href, label]) => item(href, label)).join("\n        ")}
        <a href="${gate("the-signal-e6")}">Start free</a>
      </nav>
    </details>
  `;
}

/* The foot, in the same bezel: brand, the four gates, the records. */
function footer() {
  return `
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="/" aria-label="Numinous home"><img class="brand-mark" src="/assets/logo_alpha.webp" alt="" /><span>Numinous</span></a>
        <p>The realms, opened. Cinematic visions of the divine and mythical. New realms every week.</p>
        <p>Free to start. Seven-night guarantee on The Watcher. Cancel any moon.</p>
        <p class="foot-contact"><a href="mailto:${SUPPORT}">${SUPPORT}</a> · <a href="${onboard.instagram}">@numinous2.0</a></p>
      </div>
      <nav class="foot-nav" aria-label="The gates">
        <h2>The gates</h2>
        <ul>
          <li><a href="${gate("the-signal-e6")}">The Signal · Free</a></li>
          <li><a href="${gate("the-numinary-3e")}">The Watcher · $28 a moon</a></li>
          <li><a href="${gate("wallpaper-vault")}">Wallpaper Vault · $12</a></li>
          <li><a href="${gate("herald-app")}">Herald app · Free</a></li>
          <li><a href="/collections/all">All the works</a></li>
        </ul>
      </nav>
      <nav class="foot-nav" aria-label="The records">
        <h2>The records</h2>
        <ul>
          <li><a href="/returns">The seven nights</a></li>
          <li><a href="/refunds">Refund policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/eula">License of the Works</a></li>
          <li><a href="/cookies">Cookies</a></li>
        </ul>
      </nav>
    </div>
    <div class="footer-bottom">
      <span>© MMXXVI Numinous · All visions reserved</span>
      <span>Payments run through <a href="${onboard.whop_terms}">Whop’s terms</a> · Witness the impossible ✦ New realms every week</span>
    </div>
  `;
}

/* ---------- the shell index (fallback door for any path without its own page) ---------- */

function home() {
  return `
    <section class="v2-threshold">
      <div class="wrap">
        <span class="v2-num">✦</span>
        <p class="kicker">The realms, opened</p>
        <h1>NUMINOUS</h1>
        <p class="lede">Witness the <em>impossible</em>. Cinematic visions of the divine and mythical — free every week, and deeper when you want the making-of.</p>
        <p><a class="btn solid" href="${gate("the-signal-e6")}">Start free: The Signal →</a> <a class="btn" href="${gate("the-numinary-3e")}">See the Watcher, $28 a moon</a></p>
        ${v2Trust()}
      </div>
    </section>
    <section id="works">
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">I</span>
          <div class="eyebrow">Chapter I · Four gates</div>
          <h2 class="sec-title">THE WORKS</h2>
          <p class="sec-sub">Four gates. The Signal is free forever. The Watcher is 7 days free, then $28 every 28 days, or $280 a year. The Wallpaper Vault is $12 once. The Herald app is free.</p>
        </div>
        <div class="works">${workCards([...works, herald])}</div>
      </div>
    </section>
    ${marqueeBand()}
    ${statBand([
      ["4", "Gates"],
      ["28", "Day cycles"],
      ["7", "Night Watcher trial"],
      ["15", "Beings named"],
    ])}
    ${pactPanel()}
    <section id="faq">
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">II</span>
          <div class="eyebrow">Chapter II · Questions</div>
          <h2 class="sec-title">QUESTIONS TRAVELLERS ASK</h2>
          <p class="sec-sub">Asked at the gates. Answered plainly.</p>
        </div>
        <div class="faq">
          ${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
        </div>
      </div>
    </section>`;
}

/* ---------- the gate pages ---------- */

function briefingFilms({ poster, blurb, films }) {
  return `
    <section class="briefing">
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">✦</span>
          <div class="eyebrow">The briefing · two short films</div>
          <h2 class="sec-title">WATCH THE BRIEFING</h2>
          <p class="sec-sub">${blurb}</p>
        </div>
        <div class="films">
          ${films
            .map(
              ([src, cap]) => `
          <figure class="film">
            <video controls playsinline preload="metadata" poster="${poster}" src="${src}" title="${cap}"></video>
            <figcaption>${cap}</figcaption>
          </figure>`,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function signalPage() {
  return `
    <section>
      <div class="wrap gate">
        <div>
          <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / The Signal</p>
          <span class="v2-num">I</span>
          <p class="kicker">The first gate · free forever</p>
          <h1>Every realm drops here first</h1>
          <p class="lede">Free forever. No card, no renewal. Every realm drops here 24 hours before the feed. Inside: Dispatches and The First Vision, a ten-page gift.</p>
          <p><a class="btn solid" href="${PRE_CHECKOUT.signal}">Enter The Signal, free →</a></p>
          <p class="note">The free gate opens on the house page first — the film, what waits inside, and then the door to Whop. Nothing is asked of the card, at either step.</p>
          ${v2Trust("", ["Free forever", "No card"])}
          <p class="note">After you enter, a briefing opens the rooms. They wait in your Whop library. Card details never sit on this site; Whop processes the offering.</p>
        </div>
        <div class="num-art"><img src="/assets/signal.jpg" alt="A winged eye of light emerging from storm clouds" /></div>
      </div>
    </section>
    ${briefingFilms({
      poster: "/assets/signal.jpg",
      blurb: "The Signal opens with the film: the briefing, and the invitation. Then the rooms.",
      films: [
        ["/assets/briefing/films/signal-briefing-1440.mp4", "I · The briefing"],
        ["/assets/briefing/films/signal-invite-1440.mp4", "II · The invitation"],
      ],
    })}
    ${marqueeBand()}
    ${statBand([
      ["0", "To enter"],
      ["6", "Chambers"],
      ["10", "Page First Vision"],
      ["24h", "Before the feed"],
    ])}
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">✦</span>
          <div class="eyebrow">The gate · what waits inside</div>
          <h2 class="sec-title">SIX CHAMBERS, ONE GATE</h2>
        </div>
        <div class="steps">
          ${[
            ["I · Dispatches", "Check here first.", "New realms are posted here twenty-four hours before the open feed."],
            ["II · The First Vision", "A ten-page gift.", "It names six chambers. Read it before you walk the rooms."],
            ["III · The calendar", "The moon keeps time.", "The moon calendar, the domain polls and the founding windows are announced here first."],
            ["IV · The Sanctuary", "You are not alone.", "A shared room for every Traveller who has entered a gate."],
          ].map(([k, t, d]) => `<article class="step"><b>${k}</b><div><strong>${t}</strong><p>${d}</p></div></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="v2-band">
      <div class="v2-band-inner">
        <span class="v2-num">II</span>
        <p class="kicker">The room beside this gate</p>
        <h2>Seven nights, then the moon.</h2>
        <p>When the free gate has shown you what it shows, The Watcher opens the making-of, the lore and the live table — $28 a moon, $280 a year, with the seven-night guarantee.</p>
        ${v2Guarantee()}
        <p><a class="btn" href="${gate("the-numinary-3e")}">See The Watcher →</a></p>
      </div>
    </section>
  `;
}

function watcherPage() {
  return `
    <section>
      <div class="wrap gate">
        <div>
          <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / The Watcher</p>
          <span class="v2-num">II</span>
          <p class="kicker">The membership · a seat at the live table</p>
          <h1>The room that runs on the moon.</h1>
          <p class="lede">The room that runs on the moon. 7 days free, then $28 every 28 days, or $280 a year. Each 28-day cycle has four weekly chapters: The Realm, The Process, The Records, The Session. Cancel any moon. Access stays until the current cycle (or year) ends. Wallpaper Vault is separate and not included.</p>
          ${v2PriceBlock({
            primary: `<b>$28</b><span>per 28-day cycle</span>`,
            primaryHref: PRE_CHECKOUT.watcher,
            secondary: "Take the year · $280",
            secondaryHref: PRE_CHECKOUT["watcher-annual"],
            note: "Take a seat, $28 a moon",
          })}
          ${v2Guarantee()}
          ${v2Trust()}
          <p class="note">After you take a seat, a briefing opens the moon. The rooms wait in your Whop library. Cancel any moon; access stays to the end of the cycle you have paid for. Card details never sit on this site.</p>
        </div>
        <div class="num-art"><img src="/assets/watcher.jpg" alt="The Watcher, art of the room that runs on the moon" /></div>
      </div>
    </section>
    ${briefingFilms({
      poster: "/assets/watcher.jpg",
      blurb: "The moon opens with the film: the briefing, and the invitation to the room.",
      films: [
        ["/assets/briefing/films/watcher-briefing-1440.mp4", "I · The briefing"],
        ["/assets/briefing/films/watcher-invite-1440.mp4", "II · The invitation"],
      ],
    })}
    ${marqueeBand()}
    ${statBand([
      ["$28", "A moon"],
      ["28", "Day cycle"],
      ["4", "Weekly chapters"],
      ["7", "Night guarantee"],
    ])}
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">✦</span>
          <div class="eyebrow">The room · four chapters</div>
          <h2 class="sec-title">ONE CYCLE, FOUR WEEKS</h2>
          <p class="sec-sub">One 28-day cycle, delivered in four weekly chapters.</p>
        </div>
        <div class="weeks">
          ${weeks.map(([when, name, text]) => `<article class="week"><b>${when}</b><strong>${name}</strong><p>${text}</p></article>`).join("")}
        </div>
        <p class="v2-cta-row" style="text-align:center;margin-top:2rem"><a class="btn solid" href="${PRE_CHECKOUT.watcher}" data-gate="watcher">Take a seat · $28 a moon →</a></p>
      </div>
    </section>
    ${pactPanel()}
    <section class="v2-band">
      <div class="v2-band-inner">
        <span class="v2-num">III</span>
        <p class="kicker">Questions before the seat</p>
        <h2>Asked at this gate.</h2>
        <div class="faq" style="text-align:left">
          ${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
        </div>
        <p class="v2-cta-row" style="margin-top:2rem"><a class="btn solid" href="${PRE_CHECKOUT.watcher}" data-gate="watcher">Take a seat · $28 a moon →</a></p>
      </div>
    </section>
  `;
}

function heraldPage() {
  return `
    <section>
      <div class="wrap gate">
        <div>
          <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / The Herald</p>
          <span class="v2-num">IV</span>
          <p class="kicker">The Herald · free forever</p>
          <h1>The next realm, delivered first.</h1>
          <p class="lede">One letter when a realm opens: the vision, the process, the lore — before the gates grow crowded. A free app. Not The Signal.</p>
          <p><a class="btn solid" href="${PRE_CHECKOUT.herald}">Open The Herald, free →</a></p>
          ${v2Trust("", ["Free forever", "No card"])}
          <p class="note">Free, forever. No card. The Herald does not store your email on this site — opening the gate is the letter, and the address lives with your Whop library.</p>
        </div>
        <div class="num-art"><img src="/assets/sigil.jpg" alt="The sigil of Numinous: a winged eye within a mandala of sacred geometry" /></div>
      </div>
    </section>
    ${marqueeBand()}
    ${statBand([
      ["0", "To enter"],
      ["1", "Letter a realm"],
      ["4", "Gates open"],
      ["15", "Beings named"],
    ])}
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">✦</span>
          <div class="eyebrow">Further gates</div>
          <h2 class="sec-title">THE OTHER GATES</h2>
        </div>
        <div class="works">${workCards()}</div>
      </div>
    </section>
  `;
}

function vaultPage() {
  return `
    <section>
      <div class="wrap gate">
        <div>
          <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / Wallpaper Vault</p>
          <span class="v2-num">III</span>
          <p class="kicker">The vault · one-time $12</p>
          <h1>Fifteen realms, cropped for every screen.</h1>
          <p class="lede">Fifteen wallpapers, each in phone, portrait, and desktop. $12 once. Final once opened.</p>
          ${v2PriceBlock({
            primary: `<b>$12</b><span>one time · no renewal</span>`,
            primaryHref: PRE_CHECKOUT.vault,
            note: "Open the vault, $12",
          })}
          <p class="guarantee-card"><strong>Final once opened</strong> A download cannot be returned, so the Vault is final the moment it opens — except a corrupted file, a duplicate charge, or a listing that was materially wrong, each of which is set right: write to ${SUPPORT}. <a href="/refunds">Read the refund policy →</a></p>
          <p class="note">Card details never sit on this site. Whop processes the offering, under <a href="${onboard.whop_terms}">Whop’s terms</a> as well as the <a href="/eula">license of the Works</a>.</p>
        </div>
        <div class="num-art"><img src="/assets/vault.jpg" alt="The Wallpaper Vault: realms framed in gold" /></div>
      </div>
    </section>
    ${marqueeBand()}
    ${statBand([
      ["15", "Sets inside"],
      ["$12", "Once, final at open"],
      ["3", "Screens each"],
      ["0", "Renewals"],
    ])}
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">✦</span>
          <div class="eyebrow">Further gates</div>
          <h2 class="sec-title">THE OTHER GATES</h2>
        </div>
        <div class="works">${workCards([works[0], works[1], herald])}</div>
      </div>
    </section>
  `;
}

function collectionPage() {
  return `
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">I</span>
          <p class="dateline">Est . MMXXVI · The works</p>
          <div class="eyebrow">Chapter I · Four gates</div>
          <h2 class="sec-title">THE WORKS</h2>
          <p class="sec-sub">Four gates. Start at the free gate — walk further only if the first vision names what you saw.</p>
        </div>
        <div class="works">${workCards([...works, herald])}</div>
      </div>
    </section>
    ${statBand([
      ["4", "Gates"],
      ["28", "Day cycles"],
      ["7", "Night Watcher trial"],
      ["15", "Beings named"],
    ])}
    ${marqueeBand()}
    ${pactPanel()}
  `;
}

/* ---------- the records: prose and legal, with the house band ---------- */

function prosePage({ kicker, title, paragraphs, links = [] }) {
  return `
    <section class="v2-record">
      <header class="v2-record-head">
        <span class="v2-num">✦</span>
        <p class="kicker">${kicker}</p>
        <h1>${title}</h1>
        <p class="v2-stamp">Est . MMXXVI · The records · ${RECORD_STAMP}</p>
      </header>
      <div class="v2-record-body">
        ${paragraphs.map((p) => `<p>${p}</p>`).join("")}
        ${links.map(([href, label]) => `<p><a class="btn" href="${href}">${label}</a></p>`).join("")}
      </div>
    </section>
  `;
}

function recordPage(id) {
  const record = records[id];
  if (!record) return "";
  return `
    <section class="v2-record">
      <header class="v2-record-head">
        <span class="v2-num">✦</span>
        <p class="kicker">${record.kicker}</p>
        <h1>${record.title}</h1>
        <p class="v2-stamp">${RECORD_STAMP}</p>
      </header>
      <div class="v2-record-body">
        ${record.sections
          .map(
            (section) => `
          <h2>${section.h}</h2>
          ${(section.p || []).map((p) => `<p>${p}</p>`).join("")}
          ${section.list ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
          ${(section.after || []).map((p) => `<p>${p}</p>`).join("")}`,
          )
          .join("")}
        <p class="note">Payments run through Whop, under <a href="${onboard.whop_terms}">Whop’s terms</a> and <a href="${onboard.whop_privacy}">Whop’s privacy policy</a>. Questions: ${SUPPORT_MAIL}</p>
        <p><a class="btn" href="/refunds">The refund policy</a> <a class="btn" href="/returns">The seven nights</a></p>
      </div>
    </section>`;
}

/* ---------- the threshold: where a checkout link lands before Whop ---------- */

const thresholdGates = [
  {
    id: "plan_PQnMYNixMTjRQ",
    key: "watcher",
    title: "The Watcher",
    kicker: "The membership · 28-day cycles",
    price: "$28 per 28-day cycle",
    sub: "$280 a year · seven-night guarantee · cancel any moon",
    image: "/assets/watcher.jpg",
    alt: "The Watcher, the room that runs on the moon",
    feats: ["Four weekly chapters each cycle", "The Records: the making-of and the lore", "Live session: build, Q&A, vote"],
    url: checkout.watcher,
    guarantee: true,
    film: "/assets/briefing/films/watcher-invite-1440.mp4",
    poster: "/assets/watcher.jpg",
  },
  {
    id: ANNUAL_PLAN,
    key: "watcher-annual",
    title: "The Watcher · the year",
    kicker: "The membership · a full moon-year",
    price: "$280 a year",
    sub: "$28 a moon is the monthly seat · same seven nights",
    image: "/assets/watcher.jpg",
    alt: "The Watcher, the room that runs on the moon",
    feats: ["Twelve cycles on one seat", "Four weekly chapters each cycle", "The same seven-night guarantee"],
    url: ANNUAL_CHECKOUT,
    guarantee: true,
  },
  {
    id: "plan_Aew5DdipP3fKY",
    key: "vault",
    title: "The Wallpaper Vault",
    kicker: "One-time work",
    price: "$12 once",
    sub: "Final once opened · no renewal, no cycle",
    image: "/assets/vault.jpg",
    alt: "The Wallpaper Vault: fifteen realms framed in gold",
    feats: ["Fifteen wallpaper sets", "Cropped for phone, tablet and desktop", "Yours to keep"],
    url: checkout.vault,
    guarantee: false,
  },
  {
    id: "plan_hIKLCR4hGiv9B",
    key: "herald",
    title: "The Herald",
    kicker: "Free forever",
    price: "Free",
    sub: "No card · one letter when a realm opens",
    image: "/assets/sigil.jpg",
    alt: "The sigil of Numinous",
    feats: ["A free app. Not The Signal.", "Its own gate.", "Unsubscribe at any time."],
    url: checkout.herald,
    guarantee: false,
  },
  {
    id: "ch_wYXFulML0v6LIoJ",
    key: "signal",
    title: "The Signal",
    kicker: "The first gate · free forever",
    price: "Free",
    sub: "No card, no renewal · every realm drops here first",
    image: "/assets/signal.jpg",
    alt: "A winged eye of light emerging from storm clouds",
    feats: ["A ten-page First Vision gift", "Dispatches: new realms 24 hours before the feed", "The Sanctuary community room"],
    url: checkout.signal,
    guarantee: false,
    film: "/assets/briefing/films/signal-invite-1440.mp4",
    poster: "/assets/signal.jpg",
  },
];

/* ---------- the deep thresholds: the two gates that asked for the whole page
   Signal and the Watcher get the funnel itself on the threshold — the film
   first, what waits inside, how the cycle runs, the price in full, the
   questions asked at this gate — before the handoff to Whop. Everything else
   keeps the card. */

function inviteHero({ gateFor, primary, secondary, note }) {
  return `
    <section class="v2-threshold v2-deep">
      <div class="wrap">
        <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / The threshold</p>
        <div class="v2-invite">
          <div class="v2-invite-film">
            <img src="${gateFor.poster || gateFor.image}" alt="${gateFor.alt}" />
            <video src="${gateFor.film}" poster="${gateFor.poster || gateFor.image}" muted loop playsinline preload="metadata" title="${gateFor.title} · the invitation"></video>
            <span class="v2-invite-tag">The invitation · a short film</span>
          </div>
          <div class="v2-invite-body">
            <span class="v2-num">✦</span>
            <p class="kicker">${gateFor.kicker}</p>
            <h1>${gateFor.title}</h1>
            <p class="v2-price-line"><b>${gateFor.price}</b></p>
            <p class="v2-threshold-note">${gateFor.sub}</p>
            <ul class="card-feats">${gateFor.feats.map((f) => `<li>${f}</li>`).join("")}</ul>
            <div class="cta-row v2-equal">${primary}${secondary}</div>
            ${note || ""}
            ${gateFor.guarantee ? v2Guarantee() : ""}
            <p class="note">Taken on Whop's own checkout — card details never sit on this site, and the price is the house's price. <a href="/collections/all">All the works</a> · <a href="/refunds">The refund policy</a></p>
          </div>
        </div>
      </div>
    </section>`;
}

function deepThreshold(gateFor) {
  if (gateFor.key === "signal") {
    return (
      inviteHero({
        gateFor,
        primary: `<a class="btn solid" href="${gateFor.url}">Enter The Signal, free →</a>`,
        secondary: `<a class="btn" href="/collections/all">All the works</a>`,
        note: `<p class="v2-trial">Free, forever. No card, no renewal — every realm drops here 24 hours before the feed.</p>`,
      }) +
      marqueeBand() +
      statBand([
        ["0", "To enter"],
        ["6", "Chambers"],
        ["10", "Page First Vision"],
        ["24h", "Before the feed"],
      ]) +
      `
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">I</span>
          <div class="eyebrow">The gate · what waits inside</div>
          <h2 class="sec-title">SIX CHAMBERS, ONE GATE</h2>
          <p class="sec-sub">The Signal opens with the film, then the rooms: the chambers are named in The First Vision, a ten-page gift that comes with the gate.</p>
        </div>
        <div class="steps">
          ${[
            ["I · The Signal", "Every realm drops here first.", "Twenty-four hours before the open feed, the new realm is posted in this room."],
            ["II · The Realm", "The month’s being.", "The room where the vision itself lives, with the art in full."],
            ["III · The Process", "Behind the veil.", "How the vision was made — the tools, the passes, the refusals."],
            ["IV · The Records", "The lore.", "The writing that surrounds every being, kept with the work."],
            ["V · The Session", "The live table.", "The build, the questions, the vote — announced in the calendar."],
            ["VI · Field Journal", "The road out.", "Field notes from the practice: what the visions ask of the viewer."],
          ].map(([k, t, d]) => `<article class="step"><b>${k}</b><div><strong>${t}</strong><p>${d}</p></div></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="v2-band">
      <div class="v2-band-inner">
        <span class="v2-num">II</span>
        <p class="kicker">The room beside this gate</p>
        <h2>Seven nights, then the moon.</h2>
        <p>When the free gate has shown you what it shows, The Watcher opens the making-of, the lore and the live table — $28 a moon, $280 a year, with the seven-night guarantee.</p>
        ${v2Guarantee()}
        <p><a class="btn" href="${gate("the-numinary-3e")}">See The Watcher →</a></p>
      </div>
    </section>
    <section class="v2-band">
      <div class="v2-band-inner">
        <span class="v2-num">III</span>
        <p class="kicker">Questions before you enter</p>
        <h2>Asked at this gate.</h2>
        <div class="faq" style="text-align:left">
          ${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
        </div>
      </div>
    </section>`
    );
  }

  /* the Watcher: monthly and the year at equal weight, the trial stated in
     the house's canon words, then the cycle, the FAQ and the guarantee. */
  return (
    inviteHero({
      gateFor,
      primary: `<a class="btn solid" href="${checkout.watcher}">Take a seat · $28 a moon →</a>`,
      secondary: `<a class="btn solid" href="${ANNUAL_CHECKOUT}">Take the year · $280 →</a>`,
      note: `<p class="v2-trial">7 days free, then $28 every 28 days. Cancel any moon — access stays to the end of the cycle you have paid for.</p>`,
    }) +
    marqueeBand() +
    statBand([
      ["$28", "A moon"],
      ["28", "Day cycle"],
      ["4", "Weekly chapters"],
      ["7", "Night guarantee"],
    ]) +
    `
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">I</span>
          <div class="eyebrow">The room · four chapters</div>
          <h2 class="sec-title">ONE CYCLE, FOUR WEEKS</h2>
          <p class="sec-sub">One 28-day cycle, delivered in four weekly chapters. The year is twelve of them on one seat.</p>
        </div>
        <div class="weeks">
          ${weeks.map(([when, name, text]) => `<article class="week"><b>${when}</b><strong>${name}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    ${pactPanel()}
    <section class="v2-band">
      <div class="v2-band-inner">
        <span class="v2-num">II</span>
        <p class="kicker">Questions before the seat</p>
        <h2>Asked at this gate.</h2>
        <div class="faq" style="text-align:left">
          ${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
        </div>
      </div>
    </section>`
  );
}

function checkoutPage() {
  /* Two ways in: the clean route /checkout (a visitor who typed it, or a link
     the house rewrote), and the older family /checkout/<plan> — which the host
     answers with the storefront home, whose forward arrives here with ?from=.
     Either way the plan is read from the address, and the buyer is handed to
     the canonical Whop checkout for that work — never to a stale URL. */
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from") || "";
  /* the older family carries its plan in the path; the clean route does not. */
  const searched = from || String(window.location.pathname);
  const id = (searched.match(/checkout\/([A-Za-z0-9_]+)/) || [])[1] || "";
  const gateFor = thresholdGates.find((g) => g.id === id);
  const href = gateFor ? gateFor.url : "/collections/all";

  document.title = gateFor ? `${gateFor.title} · Numinous` : "The threshold · Numinous";

  const card = gateFor && gateFor.film
    ? deepThreshold(gateFor)
    : gateFor
    ? `
    <section class="v2-threshold">
      <div class="wrap">
        <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / The threshold</p>
        <div class="v2-threshold-card">
          <div>
            <span class="v2-num">✦</span>
            <p class="kicker">${gateFor.kicker}</p>
            <h1>${gateFor.title}</h1>
            <p class="v2-price-line"><b>${gateFor.price}</b></p>
            <p class="v2-threshold-note">${gateFor.sub}</p>
            <ul class="card-feats">${gateFor.feats.map((f) => `<li>${f}</li>`).join("")}</ul>
            <div class="cta-row">
              <a class="btn solid" href="${href}">Continue on Whop →</a>
              <a class="btn" href="/collections/all">All the works</a>
            </div>
            ${gateFor.guarantee ? v2Guarantee() : ""}
            <p class="note">Taken on Whop's own checkout — card details never sit on this site, and the price is the house's price.</p>
          </div>
          <div><img src="${gateFor.image}" alt="${gateFor.alt}" /></div>
        </div>
      </div>
    </section>`
    : `
    <section class="v2-threshold">
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">✦</span>
          <div class="eyebrow">The threshold</div>
          <h2 class="sec-title">THIS GATE HAS GROWN OLD</h2>
          <p class="sec-sub">That older link no longer names a work of the house. Nothing was lost, and nothing was taken — every gate that is open is below, and The Signal is free forever.</p>
        </div>
        ${from ? `<p class="v2-threshold-old"><strong>The old link:</strong> ${from}</p>` : ""}
        <div class="works">${workCards([...works, herald])}</div>
      </div>
    </section>`;

  return card;
}

/* ---------- the threshold after the offering: /order-complete ---------- */

const HOUSE_LIBRARY = "https://whop.com/thenuminouses/";

const completions = [
  {
    key: "signal",
    slug: "the-signal-e6",
    title: "The Signal",
    cta: "Open your library",
    library: "https://whop.com/joined/the-signal-e6",
    poster: "/assets/signal.jpg",
    film: "/assets/briefing/films/signal-briefing-1440.mp4",
    lede:
      "The Signal is free, forever — nothing was asked of the card. The rooms and the files wait in your Whop library; this page was only the threshold.",
    holds: [
      ["I · The gate", "Free, forever", "No card, no renewal. The Signal stays open."],
      ["II · The rooms", "Six chambers", "The Signal, The Realm, The Process, The Records, The Session, Field Journal."],
      ["III · The files", "Yours to keep", "The First Vision, and every realm drop that follows."],
    ],
    steps: [
      ["I", "Open your library", "The rooms and the files wait on Whop, not on this storefront. Bookmark the library link — it is your door from now on."],
      ["II", "Read The First Vision tonight", "Ten pages, six chambers. If it names what you saw, the Watcher gate is here when you are ready."],
      ["III", "Keep Dispatches close", "New realms are posted in the rooms every week, twenty-four hours before the open feed — the next one is already coming."],
      ["IV", "Write if you need a hand", `${SUPPORT} — answered by a person, not a form.`],
    ],
  },
  {
    key: "watcher",
    slug: "the-numinary-3e",
    title: "Watcher",
    cta: "Open your seat",
    library: "https://whop.com/joined/the-numinary-3e",
    poster: "/assets/watcher.jpg",
    film: "/assets/briefing/films/watcher-briefing-1440.mp4",
    lede:
      "The seat is taken; the moon has started. The rooms and the files wait in your Whop library — this page was only the threshold.",
    holds: [
      ["I · The cycle", "Every 28 days", "The Realm, The Process, The Records, The Session — a new being with each moon."],
      ["II · The guarantee", "Seven nights", "Write within seven nights of your first payment and the full amount returns. After that, the cycle you have paid for is yours to the end."],
      ["III · The files", "Inside the rooms", "The sealed editions are shown inside the rooms, never on the open feed."],
    ],
    steps: [
      ["I", "Open your seat", "Week I, The Realm, is live the moment you sit. The month's new being is already waiting. Bookmark the library link — it is your door from now on."],
      ["II", "Walk the cycle", "Four weeks: The Realm, The Process, The Records, The Session. The next realm opens with the next moon; cancel any moon and access stays to the end of the paid cycle."],
      ["III", "Meet The Numinary Agent", "When the Creator is away, The Numinary Agent is the room's first voice. It does not speak for the Creator."],
      ["IV", "Write if you need a hand", `${SUPPORT} — answered by a person, not a form.`],
    ],
  },
  {
    key: "vault",
    slug: "wallpaper-vault",
    title: "Wallpaper Vault",
    cta: "Open the vault on Whop",
    library: HOUSE_LIBRARY,
    lede:
      "The vault is open. Fifteen realms, cropped for every screen — a one-time $12 work, final the moment it opens. The files wait in your Whop library.",
    holds: [
      ["I · The realms", "Fifteen sets", "Every screen: phone, tablet, desktop."],
      ["II · The offering", "$12, once", "One-time. No renewal, no cycle, no card kept on this site."],
      ["III · The works", "Later gates", "The Signal is free forever; the Watcher room turns with the moon."],
    ],
    steps: [
      ["I", "Open your library", "The vault's files sit with everything else you have taken from the house. Bookmark the library link."],
      ["II", "Unseal them", "Each file is named for its realm. Take them to any screen."],
      ["III", "Write if you need a hand", `${SUPPORT} — answered by a person, not a form.`],
    ],
  },
  {
    key: "herald",
    slug: "herald-app",
    title: "The Herald",
    cta: "Open the Herald on Whop",
    library: HOUSE_LIBRARY,
    poster: "/assets/sigil.jpg",
    lede:
      "The Herald is free, forever. Open it and let the next realm find you; its own gate, never The Signal.",
    holds: [
      ["I · The herald", "Free, forever", "No card. The next realm is delivered first."],
      ["II · The app", "Its own gate", "A free app, delivered first — never The Signal."],
      ["III · The house", "Later gates", "The Watcher room turns with the moon; the Wallpaper Vault is a one-time $12 work."],
    ],
    steps: [
      ["I", "Open the Herald", "It waits in your Whop library with the rest of the house. Bookmark the library link."],
      ["II", "Walk to the Signal", "The first gate is free forever — and nothing else is required to stay."],
      ["III", "Write if you need a hand", `${SUPPORT} — answered by a person, not a form.`],
    ],
  },
];

/* What the house suggests next, per gate. Every direction is covered: a Signal
   buyer is shown the Watcher (and the Herald), a Watcher buyer the Vault (and
   the Herald), and so on — always to the gate page, never straight at a card
   form, and never more than two at once. */
const nextGates = {
  signal: [
    ["The Watcher", "The room that runs on the moon. 7 days free, then $28 every 28 days — cancel any moon.", gate("the-numinary-3e"), "/assets/watcher.jpg", "See The Watcher"],
    ["Herald", "The next realm, delivered first. A free app — not The Signal.", gate("herald-app"), "/assets/sigil.jpg", "See Herald"],
  ],
  watcher: [
    ["Wallpaper Vault", "Fifteen realms, cropped for phone, portrait and desktop. $12 once, yours to keep.", gate("wallpaper-vault"), "/assets/vault.jpg", "See the Vault"],
    ["Herald", "The next realm, delivered first. A free app — not The Signal.", gate("herald-app"), "/assets/sigil.jpg", "See Herald"],
  ],
  vault: [
    ["The Watcher", "The room that runs on the moon: four weekly chapters each cycle, the records, the live session.", gate("the-numinary-3e"), "/assets/watcher.jpg", "See The Watcher"],
    ["The Signal", "Free forever, no card — every realm drops there 24 hours before the feed.", gate("the-signal-e6"), "/assets/signal.jpg", "See The Signal"],
  ],
  herald: [
    ["The Signal", "Free forever, no card — every realm drops there 24 hours before the feed.", gate("the-signal-e6"), "/assets/signal.jpg", "See The Signal"],
    ["The Watcher", "The room that runs on the moon: four weekly chapters each cycle, the records, the live session.", gate("the-numinary-3e"), "/assets/watcher.jpg", "See The Watcher"],
  ],
};

function nextCards(key) {
  const list = nextGates[key] || nextGates.signal;
  return list
    .map(
      ([title, line, href, image, cta]) => `
      <article class="v2-next-card">
        <img src="${image}" alt="" loading="lazy" />
        <div>
          <h3>${title}</h3>
          <p>${line}</p>
          <a class="btn" href="${href}">${cta} →</a>
        </div>
      </article>`,
    )
    .join("");
}

function orderCompletePage() {
  const search = window.location.search.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "";
  /* Three ways the gate names itself, in order of certainty: the return path
     the checkout link carried (?gate=), the stamp the house put in this tab on
     the way out, and the plan/ch id Whop may still hand back in the URL. */
  const stamped = (window.__numinousLinks && window.__numinousLinks.gate()) || "";
  /* A bare visit names no purchase, so it claims none. It is sent to the
     Watcher's own pre-checkout page — the house door this page sits behind —
     and nothing here says the visitor is inside. A real return from Whop
     always carries a status, a gate or a plan, so it never lands here. */
  if (!window.location.search && !stamped) {
    try {
      window.location.replace(PRE_CHECKOUT.watcher);
    } catch (error) {
      /* a page that will not move still offers the way forward */
    }
    return `<section class="v2-threshold"><div class="v2-threshold-card"><p class="eyebrow">The threshold</p><h1>Take a seat first.</h1><p class="v2-threshold-note">Nothing was taken on this visit. <a href="${PRE_CHECKOUT.watcher}">Continue to The Watcher →</a></p></div></section>`;
  }
  const named = (params.get("work") || params.get("gate") || stamped || "").toLowerCase();
  const annual = named === "watcher-annual";
  const work = annual ? "watcher" : named;
  const held = ["failed", "error", "canceled", "cancelled", "declined"].includes(status.toLowerCase());
  const idOf = (url) => (String(url).match(/checkout\/([A-Za-z0-9_]+)/) || [])[1] || "";
  const taken = completions.find((c) => {
    const id = idOf(checkout[c.key]).toLowerCase();
    return work === c.key || (id && search.includes(id)) || search.includes(c.slug) || search.includes(c.key);
  });
  /* What the strip says, per gate: the same voice the gate itself uses, and
     never a claim the house cannot keep. */
  const UNLOCKED = {
    signal: "Six rooms and The First Vision wait in your Whop library. Nothing was asked of the card, and nothing renews.",
    watcher: "Week I, The Realm, is already open on your seat. The cycle turns with the moon, and the seven nights stand.",
    vault: "Fifteen realms, cropped for every screen, sit in your Whop library. The work is final once opened.",
    herald: "The Herald will find you when the next realm opens. The Signal stays free forever, and no card was asked.",
  };

  document.title = held
    ? "The gate held · Numinous"
    : taken
      ? `${taken.title} · Numinous`
      : "The gate has opened · Numinous";

  if (held) {
    const retry = taken ? checkout[taken.key] : "/collections/all";
    return `
    <section class="v2-threshold">
      <div class="wrap" style="max-width:820px">
        <span class="v2-num">✦</span>
        <p class="kicker">${taken ? taken.title : "The offering"}</p>
        <h1>The gate held.</h1>
        <p class="lede">The offering did not pass${taken ? ` for ${taken.title}` : ""}. Nothing was taken. Try the gate again, or walk back to the works — the gate will still be here.</p>
        <p>
          <a class="btn solid" href="${retry}">Try the gate again →</a>
          <a class="btn" href="/collections/all">All the works</a>
          <a class="btn" href="/">Return to Numinous</a>
        </p>
        <p class="note">Card details never sit on this site. Whop processes every offering; if a payment looks wrong, write to ${SUPPORT} and a person answers.</p>
      </div>
    </section>`;
  }

  const library = taken ? taken.library : HOUSE_LIBRARY;
  const cta = taken ? taken.cta : "Open your library";
  /* The sequence ends at the product page: the house's own page for what was
     taken. The Whop library stays one step beside it, never the first. */
  const product = taken ? `/products/${taken.slug}` : "/collections/all";
  const productCta = taken ? `Open ${taken.title}` : "See the works";
  const holds = taken
    ? `
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">I</span>
          <div class="eyebrow">What you hold</div>
          <h2 class="sec-title">YOUR ROOMS AND FILES</h2>
        </div>
        <div class="steps">
          ${taken.holds
            .map(([k, t, d]) => `<article class="step"><b>${k}</b><div><strong>${t}</strong><p>${d}</p></div></article>`)
            .join("")}
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">II</span>
          <div class="eyebrow">What happens next</div>
          <h2 class="sec-title">THE FIRST STEPS</h2>
        </div>
        <div class="steps">
          ${taken.steps
            .map(
              ([k, t, d]) =>
                `<article class="step"><b>${k}</b><div><strong>${t}</strong><p>${d}</p></div></article>`,
            )
            .join("")}
        </div>
        ${taken.key === "watcher" ? v2Guarantee({ text: "If the room does not name what you saw, write within seven nights of your first payment and the full amount returns. Keep what you received." }) : ""}
        ${
          taken
            ? `<div class="v2-unlock">
          <div class="unlock-media">
            <img src="${taken.poster}" alt="${taken.title}" loading="lazy" />
            ${
              taken.film
                ? `<video src="${taken.film}" poster="${taken.poster}" muted loop playsinline preload="metadata" title="${taken.title} · the briefing"></video>`
                : ""
            }
          </div>
          <div class="unlock-body">
            <p class="eyebrow">What you unlocked</p>
            <h2>${taken.title}</h2>
            <p>${UNLOCKED[taken.key] || "The rooms and files wait in your Whop library — this page was only the threshold."}</p>
            <p style="margin-top:1rem"><a class="btn solid" href="${product}">${productCta} →</a> <a class="btn" href="${library}" rel="noopener">${cta} →</a></p>
          </div>
        </div>`
            : ""
        }
        ${
          taken && taken.key === "watcher" && !annual
            ? `<p class="v2-annual">Prefer a year? The same seat, twelve cycles, one payment of $280 — <a href="${PRE_CHECKOUT["watcher-annual"]}" data-gate="watcher-annual">take the year →</a></p>`
            : ""
        }
        <div class="sec-head" style="margin-top:3rem">
          <span class="v2-num">III</span>
          <div class="eyebrow">The gates beside this one</div>
          <h2 class="sec-title">SUGGESTED NEXT</h2>
          <p class="sec-sub">The Signal is free forever. The Watcher is 7 days free, then $28 every 28 days. The Wallpaper Vault is $12 once. The Herald app is free. Nothing else is required to stay — everything here is a suggestion, and nothing renews on its own.</p>
        </div>
        <div class="v2-next">${nextCards(taken ? taken.key : "")}</div>
        <p style="margin-top:1.6rem"><a class="btn" href="/collections/all">See every gate →</a></p>
      </div>
    </section>`
    : `
    <section>
      <div class="wrap">
        <div class="sec-head">
          <span class="v2-num">✦</span>
          <div class="eyebrow">Every gate that is open now</div>
          <h2 class="sec-title">THE WORKS</h2>
        </div>
        <div class="works">${workCards([...works, herald])}</div>
      </div>
    </section>`;

  return `
    <section class="v2-threshold">
      <div class="wrap" style="max-width:860px">
        <span class="v2-num">✦</span>
        <p class="kicker">${taken ? taken.title : "The gate opened"}</p>
        <h1>Traveller, you are inside.</h1>
        <p class="lede">${taken ? taken.lede : "Whatever you took, the rooms and files wait in your Whop library, not on this storefront. This page was only the threshold."}</p>
        <p>
          <a class="btn solid" href="${product}">${productCta} →</a>
          <a class="btn" href="${library}" rel="noopener">${cta} →</a>
          <a class="btn" href="/">Return to Numinous</a>
        </p>
        ${v2Trust(`<a href="mailto:${SUPPORT}">Write to the house</a>`)}
      </div>
    </section>
    ${holds}`;
}
