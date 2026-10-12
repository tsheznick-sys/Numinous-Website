import onboard from "../coldstorage/onboard.json";
import { RECORD_STAMP, records } from "./records.js";

const { checkout } = onboard;
const COOKIE_KEY = "numinous-record";

// The pre-checkout gate pages live under one prefix: the routes map below
// and copySpaRoutes() in vite.config.js must agree on it.
const GATE = "/products";
const gate = (slug) => `${GATE}/${slug}`;

const works = [
  {
    id: "signal",
    index: "I / III",
    mark: "Start here · free forever",
    title: "The Signal",
    text: "Every realm drops here first.",
    price: "Free: $0, no renewal.",
    cta: "Open the gate",
    href: gate("the-signal-e6"),
    image: "/assets/signal.jpg",
    alt: "A winged eye of light emerging from storm clouds: The Signal",
  },
  {
    id: "watcher",
    index: "II / III",
    mark: "$28 / moon",
    title: "The Watcher",
    text: "The room. The community, the process, the live session, every 28-day cycle.",
    price: "7-night trial, then $28 every 28 days.",
    cta: "Enter the room",
    href: gate("the-numinary-3e"),
    image: "/assets/watcher.jpg",
    alt: "The Watcher, the room that runs on the moon",
  },
  {
    id: "vault",
    index: "III / III",
    mark: "$12",
    title: "Wallpaper Vault",
    text: "Fifteen realms, cropped for every screen.",
    price: "One-time purchase: $12.",
    cta: "Enter the vault",
    href: checkout.vault,
    external: true,
    image: "/assets/vault.jpg",
    alt: "The Wallpaper Vault: fifteen realms framed in gold",
  },
];

const herald = {
  index: "IV",
  mark: "Free",
  title: "Herald app",
  text: "The next realm, delivered first.",
  price: "Free, forever. No card.",
  cta: "Open the gate",
  href: gate("herald-app"),
  image: "/assets/sigil.jpg",
  alt: "The sigil of Numinous",
};

const faqs = [
  ["Is the Signal truly free?", "Yes, forever. Every realm drops there first. Walk further only if the first vision names what you saw."],
  ["What is inside the Watcher?", "Every 28 days the cycle turns: the month's new being, the process behind the veil, the records, and a live session where your questions steer the vote."],
  ["Why $28 a moon?", "One full cycle of the realms, every 28 days. The room, the work, the people. Pause or leave whenever the moon is dark."],
  ["Do the realms work on any screen?", "Yes. Every realm and every session is rendered for phone, tablet and desktop."],
];

const voices = [
  ["It burned but did not consume the tree. Burn me, but do not consume me; speak through your flames.", "@edgar.macena · from the Portuguese"],
  ["They come with the wind, they cleanse, and they depart.", "@nurullahdurgel01 · from the Turkish"],
  ["O God, work a miracle. I am waiting.", "@shmstjykh33 · from the Persian"],
];

const weeks = [
  ["Week I", "The Realm", "The month’s new being: met for the first time."],
  ["Week II", "The Process", "Behind the veil: how the vision was made."],
  ["Week III", "The Records", "The lore deep-dive."],
  ["Week IV", "The Session", "Live build, your questions, the vote."],
];

function el(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}

function nav(active) {
  const item = (href, label) =>
    `<a href="${href}" ${active === href ? 'aria-current="page"' : ""}>${label}</a>`;
  return `
    <a class="brand" href="/">
      <img src="/assets/sigil.jpg" alt="" />
      <strong>NUMINOUS</strong>
    </a>
    <nav class="links" aria-label="Primary">
      ${item("/collections/all", "The Works")}
      ${item(gate("the-numinary-3e"), "The Watcher")}
      ${item("/returns", "The Pact")}
      ${item("/#faq", "FAQ")}
    </nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile">Menu</button>
    <button class="ghost cart-btn" type="button" id="open-cart">Cart</button>
    <a class="enter" href="${gate("the-signal-e6")}">Enter the Signal →</a>
  `;
}

function footer() {
  return `
    <div>
      <h4>The realms, opened</h4>
      <p>Cinematic visions of the divine and mythical. New realms every week.</p>
      <p>Signal · Watcher</p>
    </div>
    <div>
      <h4>The gates</h4>
      <ul>
        <li><a href="${gate("the-signal-e6")}">The Signal · Free</a></li>
        <li><a href="${gate("the-numinary-3e")}">The Watcher · $28 / moon</a></li>
        <li><a href="${checkout.vault}">Wallpaper Vault · $12</a></li>
        <li><a href="${gate("herald-app")}">Herald app · Free</a></li>
      </ul>
    </div>
    <div>
      <h4>Further depths</h4>
      <ul>
        <li><a href="/returns">The Pact · the seven nights</a></li>
        <li><a href="/#faq">Questions of the road · FAQ</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a href="/cookies">Cookies</a></li>
        <li><a href="${onboard.instagram}">Instagram · @numinous2.0</a></li>
      </ul>
    </div>
    <p class="legal-row">© MMXXVI <strong>NUMINOUS</strong> · All visions reserved ·
      <a href="#/terms" data-record="terms">Terms of Service</a> ·
      <a href="#/privacy" data-record="privacy">Privacy Policy</a> ·
      <a href="#/refund" data-record="refund">Refund Policy</a> ·
      <a href="#/eula" data-record="eula">EULA</a> ·
      <a href="/cookies">Cookies</a>
      · Payments run through <a href="${onboard.whop_terms}">Whop’s terms</a>.
    </p>
  `;
}

// The home's own chrome, carried onto the routed pages: the marquee band, the
// Roman-numeral chips, the seven-night pact panel and the closing call.
const MARQUEE_LINE =
  "Witness the impossible <b>✦</b> The Signal <b>✦</b> Watcher $28 a moon <b>✦</b> " +
  "New realms every week <b>✦</b> Fifteen beings <b>✦</b> The seven-night pact <b>✦</b> ";

function marqueeBand() {
  return `
    <div class="marquee" aria-hidden="true">
      <div class="track">${Array.from({ length: 4 }, () => `<span>${MARQUEE_LINE}</span>`).join("")}</div>
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
    <section>
      <div class="wrap">
        <div class="pact">
          <p class="kicker" style="justify-content:center">The seven nights</p>
          <h2>ENTER. IF IT NAMES NOTHING, RETURN.</h2>
          <p class="lede">The Watcher gives you <strong>seven nights</strong>. If the room does not name what you saw, message within seven nights of the first payment and <strong>the full amount returns</strong>. Keep what you received. The Signal is free, forever. Other works are final the moment they open.</p>
          <p><a class="btn" href="/returns">Read the pact →</a></p>
        </div>
      </div>
    </section>`;
}

function workCards(list = works) {
  return list
    .map(
      (work) => `
      <a class="card" href="${work.href}" ${work.external ? 'rel="noopener" target="_blank"' : ""}>
        <img src="${work.image}" alt="${work.alt}" />
        <div class="body">
          <div class="price-row"><span>✦ ${work.mark}</span><span>${work.index}</span></div>
          <h3>${work.title}</h3>
          <p>${work.text}</p>
          <p>${work.price}</p>
          <span class="go">${work.cta} →</span>
        </div>
      </a>`,
    )
    .join("");
}

function home() {
  return `
    <section class="hero" id="hero">
      <div>
        <p class="eyebrow">Witness the impossible</p>
        <p class="meta">Est · MMXXVI</p>
        <img class="sigil" src="/assets/sigil.jpg" alt="The sigil of Numinous: a winged eye within a mandala of sacred geometry" />
        <p class="kicker">The realms, opened</p>
        <h1>NUMINOUS</h1>
        <p class="lede">Witness the <em>impossible</em>.<br />Cinematic visions of the divine and mythical.<br />New realms every week.</p>
        <div class="cta-row">
          <a class="btn solid" href="${gate("the-signal-e6")}">Enter the Signal</a>
          <a class="btn" href="${checkout.watcher}">Become a Watcher</a>
        </div>
      </div>
    </section>
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        ${Array.from({ length: 2 }, () => `<span>Witness the impossible ✦ The Signal ✦ Watcher $28 a moon ✦ New realms every week ✦ Fifteen beings ✦ The seven-night pact ✦</span>`).join("")}
      </div>
    </div>
    <div class="stats" aria-label="The house in numbers">
      <div class="stat"><b>III</b><span>Works</span></div>
      <div class="stat"><b>28</b><span>Days per cycle</span></div>
      <div class="stat"><b>VII</b><span>Nights of the pact</span></div>
      <div class="stat"><b>XV</b><span>Beings named</span></div>
    </div>
    <section id="works">
      <div class="wrap">
        <div class="chapter">
          <p class="kicker">Chapter I · Three works</p>
          <h2>THE WORKS</h2>
          <p>Three works: The Signal is free, Watcher is a 28-day membership, and Wallpaper Vault is a one-time $12 purchase.</p>
        </div>
        <div class="works">${workCards()}</div>
      </div>
    </section>
    <div class="creed">
      <p class="kicker">The Numinous creed</p>
      <blockquote>“Cinematic visions of the <strong>divine</strong> and <strong>mythical</strong>, rendered like relics, released like omens.”</blockquote>
    </div>
    <section id="numinary">
      <div class="wrap split">
        <div>
          <p class="kicker">Chapter II · The membership</p>
          <h2>THE WATCHER</h2>
          <p class="lede" style="margin-left:0">The room that runs on the moon. Every <strong>28 days</strong>, one full cycle of the realms: a new being, the veil lifted, the lore opened, and a seat at the live table.</p>
          <p class="meta">28 days · one cycle · four moons</p>
          <div class="weeks">
            ${weeks.map(([when, name, text]) => `<article class="week"><b>${when}</b><strong>${name}</strong><p>${text}</p></article>`).join("")}
          </div>
          <a class="btn solid" href="${checkout.watcher}">Take a seat</a>
          <span class="meta"> $28 / moon</span>
        </div>
        <figure class="frame">
          <img src="/assets/watcher.jpg" alt="The Watcher, art of the room that runs on the moon" />
          <span>Every 28 days</span>
        </figure>
      </div>
    </section>
    <section class="pact" id="pact">
      <p class="kicker">The seven nights</p>
      <h2>Enter. If it names nothing, return.</h2>
      <p class="lede">The Watcher gives you <strong>seven nights</strong>. If the room does not name what you saw, message within seven nights of the first payment and <strong>the full amount returns</strong>. Keep what you received. The Signal is free, forever. Other works are final the moment they open.</p>
      <p class="note">the pact of the seven nights · <a href="#/refund" data-record="refund">the House Refund Policy</a> · <a href="#/eula" data-record="eula">the licence of the Works</a></p>
      <p><a class="btn" href="/returns">Read the pact →</a></p>
    </section>
    <section id="faq">
      <div class="wrap">
        <div class="chapter">
          <p class="kicker">Chapter III · Questions</p>
          <h2>QUESTIONS TRAVELLERS ASK</h2>
          <p>Asked at the gates. Answered plainly.</p>
        </div>
        <div class="faq">
          ${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
        </div>
      </div>
    </section>
    <section>
      <div class="wrap herald" id="herald">
        <div>
          <p class="kicker">The Herald</p>
          <h2>The next realm, delivered first.</h2>
          <p>One letter when a realm opens: the vision, the process, the lore, before the gates grow crowded. The Signal, by another name.</p>
          <p class="note">Free forever · no noise · leave with one word. The Herald form does not store your email on this site. Submitting it opens The Signal.</p>
        </div>
        <form id="herald-form">
          <label>
            <span class="meta">Where the signal should look</span>
            <input type="email" name="email" autocomplete="email" placeholder="name@realm" required />
          </label>
          <label class="chk">
            <input type="checkbox" name="pact" required />
            <span>I accept the <a href="#/terms" data-record="terms">Terms of Service</a> and the <a href="#/privacy" data-record="privacy">Privacy Policy</a>, and I wish to receive The Signal.</span>
          </label>
          <button class="btn solid" type="submit">Receive the Signal →</button>
          <p class="note" id="herald-note" role="status"></p>
        </form>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="chapter">
          <p class="kicker">Chapter IV · Voices from the room</p>
          <h2>WHAT THE ROOM SAYS</h2>
        </div>
        <div class="voices">
          ${voices.map(([quote, who]) => `<figure class="voice"><q>${quote}</q><span>${who}</span></figure>`).join("")}
        </div>
        <p class="note" style="text-align:center;margin-top:1.4rem">Real words from the public comments on the work, carried as written and translated where another tongue was used.</p>
      </div>
    </section>
    <section class="pact">
      <p class="kicker">The Signal is open</p>
      <h2>The realms are open.</h2>
      <p class="lede">New realms every week. Start free. Walk further only if the first vision names what you saw.</p>
      <div class="cta-row">
        <a class="btn solid" href="${gate("the-signal-e6")}">Enter the Signal</a>
        <a class="btn" href="${checkout.watcher}">Become a Watcher</a>
      </div>
    </section>
  `;
}

// The briefing films from the pulled build: the film opens the gate, then the
// rooms. Files are staged from reference/web-version/public at build time.
function briefingFilms({ poster, blurb, films }) {
  return `
    <section class="briefing">
      <div class="wrap">
        <div class="chapter">
          <p class="kicker">The briefing · two short films</p>
          <h2>Watch the briefing.</h2>
          <p>${blurb}</p>
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
          <p class="dateline">Est . MMXXVI · The first gate</p>
          <p class="kicker">I / III · The first gate</p>
          <h1>Every realm drops here first</h1>
          <p class="meta">$0 · no renewal</p>
          <p>Free, forever. No card. The first vision waits in your library.</p>
          <p><a class="btn solid" href="${checkout.signal}">Enter the Signal →</a></p>
          <p class="note">After you enter, a briefing opens the rooms. They wait in your library. Card details never sit on this site. Whop processes the offering.</p>
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
    <section>
      <div class="wrap">
        <p class="kicker">The gate · how it works</p>
        <div class="steps">
          ${[
            ["The first gate", "The Signal is open.", "Free, forever. No card. This is the threshold. The rooms wait on the other side."],
            ["I · Dispatches", "Check here first.", "New realms are posted here twenty-four hours before the feed."],
            ["II · The First Vision", "A ten-page gift.", "It names six chambers. Read it before you walk the rooms."],
            ["The rooms", "Six chambers, one gate.", "The Signal, The Realm, The Process, The Records, The Session, and Field Journal."],
            ["III · The calendar", "The moon keeps time.", "The moon calendar, the domain polls, and the founding windows are announced here first."],
            ["IV · The Sanctuary", "You are not alone.", "A shared room for every Traveller who has entered a gate."],
          ].map(([k, t, d]) => `<article class="step"><b>${k}</b><div><strong>${t}</strong><p>${d}</p></div></article>`).join("")}
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="chapter"><p class="kicker">The room beside this gate</p><h2>Seven nights, then the moon.</h2><p>7-night trial, then $28 every 28 days. Cancel any moon.</p><a class="btn" href="${gate("the-numinary-3e")}">Take a seat →</a></div>
      </div>
    </section>
  `;
}

function watcherPage() {
  return `
    <section>
      <div class="wrap gate">
        <div>
          <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / Watcher</p>
          <p class="dateline">Est . MMXXVI · The gate</p>
          <p class="kicker">Chapter II · The membership</p>
          <h1>The membership that runs on the moon.</h1>
          <p class="meta">$28 / moon · 7 nights free first</p>
          <p class="meta">$280 / year · seven nights first</p>
          <p>Seven nights. If the room does not name what you saw, message within seven nights of the first payment and <strong>the full amount returns</strong>. Keep what you received.</p>
          <p>Prefer the whole year? The annual seat is <strong>$280</strong>, with the same <strong>seven nights</strong> first.</p>
          <p><a href="/returns">Read the Seven Nights policy</a></p>
          <p><a class="btn solid" href="${checkout.watcher}">Take a seat →</a></p>
          <p class="note">After you take a seat, a briefing opens the moon. The rooms wait in your library. Cancel any moon. Card details never sit on this site.</p>
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
    <section>
      <div class="wrap">
        <div class="chapter">
          <p class="kicker">The room · four chapters</p>
          <h2>ONE CYCLE, FOUR WEEKS.</h2>
          <p>One 28-day cycle, delivered in four weekly chapters.</p>
        </div>
        <div class="weeks">
          ${weeks.map(([when, name, text]) => `<article class="week"><b>${when}</b><strong>${name}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    ${pactPanel()}
  `;
}

function heraldPage() {
  return `
    <section>
      <div class="wrap gate">
        <div>
          <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / Herald app</p>
          <p class="dateline">Est . MMXXVI · The Herald</p>
          <p class="kicker">IV · The next realm, delivered first</p>
          <h1>The Herald</h1>
          <p class="meta">$0 · free forever · no card</p>
          <p>One letter when a realm opens: the vision, the process, the lore, before the gates grow crowded. <strong>The Signal, by another name.</strong></p>
          <p>Free, forever. No card. The Herald does not store your email on this site. Opening the gate is the letter.</p>
          <p><a class="btn solid" href="${checkout.herald}">Open the gate →</a></p>
        </div>
        <div class="num-art"><img src="/assets/sigil.jpg" alt="The sigil of Numinous: a winged eye within a mandala of sacred geometry" /></div>
      </div>
    </section>
    <section><div class="wrap"><div class="chapter"><p class="kicker">Further gates</p><h2>THE OTHER GATES</h2></div><div class="works">${workCards()}</div></div></section>
  `;
}

function vaultPage() {
  return `
    <section>
      <div class="wrap gate">
        <div>
          <p class="crumbs"><a href="/">Home</a> / <a href="/collections/all">The Works</a> / Wallpaper Vault</p>
          <p class="dateline">Est . MMXXVI · The vault</p>
          <p class="kicker">III / III · The vault</p>
          <h1>Wallpaper Vault</h1>
          <p class="meta">$12 · one-time</p>
          <p>Fifteen realms, cropped for every screen. <strong>One-time purchase: $12.</strong> Other works are final the moment they open.</p>
          <p><a class="btn solid" href="${checkout.vault}">Enter the vault →</a></p>
          <p class="note">Card details never sit on this site. Whop processes the offering, under <a href="${onboard.whop_terms}">Whop’s terms</a> as well as the <a href="#/eula" data-record="eula">licence of the Works</a>.</p>
        </div>
        <div class="num-art"><img src="/assets/vault.jpg" alt="The Wallpaper Vault: realms framed in gold" /></div>
      </div>
    </section>
    <section><div class="wrap"><div class="chapter"><p class="kicker">Further gates</p><h2>THE OTHER GATES</h2></div><div class="works">${workCards([works[0], works[1], herald])}</div></div></section>
  `;
}

function collectionPage() {
  return `
    <section>
      <div class="wrap">
        <div class="chapter">
          <p class="dateline">Est . MMXXVI · The works</p>
          <p class="kicker">Chapter I · Four gates</p>
          <h2>THE WORKS</h2>
          <p>Three works and a free Herald. The Signal is free, forever. Watcher is a 28-day membership. The Wallpaper Vault is a one-time $12 purchase.</p>
        </div>
        <div class="works">${workCards([...works, herald])}</div>
      </div>
    </section>
    ${statBand([
      ["III", "Works"],
      ["28", "Days per cycle"],
      ["VII", "Nights of the pact"],
      ["XV", "Beings named"],
    ])}
    ${marqueeBand()}
    ${pactPanel()}
  `;
}

function prosePage({ kicker, title, paragraphs, links = [] }) {
  return `
    <section>
      <div class="wrap prose" style="max-width:740px">
        <p class="dateline">Est . MMXXVI · The records</p>
        <p class="kicker">${kicker}</p>
        <h1>${title}</h1>
        ${paragraphs.map((p) => `<p>${p}</p>`).join("")}
        ${links.map(([href, label]) => `<p><a class="btn" href="${href}">${label}</a></p>`).join("")}
      </div>
    </section>
  `;
}

// Where Whop sends a Traveller once an offering has passed. The pulled build
// keeps this page at /order-complete; the house keeps it in the same voice.
// Whop hands back what it can (?status=, ?plan=) and anything missing is read
// as a finished checkout. The rooms and files live in the Whop library, never
// on this storefront — this page is only the threshold.
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
      ["I", "Open your library", "The rooms and the files wait on Whop, not on this storefront. This page was only the threshold."],
      ["II", "Read The First Vision tonight", "Ten pages, six chambers. If it names what you saw, the Watcher gate is here when you are ready."],
      ["III", "Keep Dispatches close", "New realms are posted in the rooms twenty-four hours before the open feed."],
      ["IV", "Write if you need a hand", "numinous.support@gmail.com — answered by a person, not a form."],
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
      ["II · The trial", "Seven nights", "Seven days from the first payment the return is open. After that the cycle is final for that moon."],
      ["III · The files", "Inside the rooms", "The sealed editions are shown inside the rooms, never on the open feed."],
    ],
    steps: [
      ["I", "Open your seat", "Week I, The Realm, is live the moment you sit. The month's new being is already waiting."],
      ["II", "Walk the cycle", "Four weeks: The Realm, The Process, The Records, The Session. Cancel any moon."],
      ["III", "Meet The Numinary Agent", "When the Creator is away, The Numinary Agent is the room's first voice. It does not speak for the Creator."],
      ["IV", "Write if you need a hand", "numinous.support@gmail.com — answered by a person, not a form."],
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
      ["I", "Open your library", "The vault's files sit with everything else you have taken from the house."],
      ["II", "Unseal them", "Each file is named for its realm. Take them to any screen."],
      ["III", "Write if you need a hand", "numinous.support@gmail.com — answered by a person, not a form."],
    ],
  },
  {
    key: "herald",
    slug: "herald-app",
    title: "The Herald",
    cta: "Open the Herald on Whop",
    library: HOUSE_LIBRARY,
    lede:
      "The Herald is free, forever. Open it and let the next realm find you; submitting the address opens The Signal, the first gate.",
    holds: [
      ["I · The herald", "Free, forever", "No card. The next realm is delivered first."],
      ["II · The Signal", "The first gate", "Every realm drops in The Signal before the open feed."],
      ["III · The house", "Later gates", "The Watcher room turns with the moon; the Wallpaper Vault is a one-time $12 work."],
    ],
    steps: [
      ["I", "Open the Herald", "It waits in your Whop library with the rest of the house."],
      ["II", "Walk to the Signal", "The first gate is free forever — and nothing else is required to stay."],
      ["III", "Write if you need a hand", "numinous.support@gmail.com — answered by a person, not a form."],
    ],
  },
];

function orderCompletePage() {
  const search = window.location.search.toLowerCase();
  const status = new URLSearchParams(window.location.search).get("status") || "";
  const held = ["failed", "error", "canceled", "cancelled", "declined"].includes(status.toLowerCase());
  const idOf = (url) => (String(url).match(/checkout\/([A-Za-z0-9_]+)/) || [])[1] || "";
  const taken = completions.find((c) => {
    const id = idOf(checkout[c.key]).toLowerCase();
    return (id && search.includes(id)) || search.includes(c.slug) || search.includes(c.key);
  });

  document.title = held
    ? "The gate held · Numinous"
    : taken
      ? `${taken.title} · Numinous`
      : "The gate has opened · Numinous";

  if (held) {
    const retry = taken ? checkout[taken.key] : "/collections/all";
    return `
    <section>
      <div class="wrap" style="max-width:780px">
        <p class="dateline">Est . MMXXVI · The threshold</p>
        <p class="kicker">${taken ? taken.title : "The offering"}</p>
        <h1>The gate held.</h1>
        <p class="lede">The offering did not pass${taken ? ` for ${taken.title}` : ""}. Nothing was taken. You may try the gate again, or walk back to the works.</p>
        <p>
          <a class="btn solid" href="${retry}">Try the gate again →</a>
          <a class="btn" href="/collections/all">The Works</a>
          <a class="btn" href="/">Return to Numinous</a>
        </p>
        <p class="note">Card details never sit on this site. Whop processes every offering; if a payment looks wrong, write to numinous.support@gmail.com and a person answers.</p>
      </div>
    </section>`;
  }

  const library = taken ? taken.library : HOUSE_LIBRARY;
  const cta = taken ? taken.cta : "Open your library";
  const holds = taken
    ? `
    <section>
      <div class="wrap">
        <div class="chapter"><p class="kicker">What you hold</p><h2>YOUR ROOMS AND FILES</h2></div>
        <div class="steps">
          ${taken.holds
            .map(([k, t, d]) => `<article class="step"><b>${k}</b><div><strong>${t}</strong><p>${d}</p></div></article>`)
            .join("")}
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="chapter"><p class="kicker">What happens next</p><h2>THE FIRST STEPS</h2></div>
        <div class="steps">
          ${taken.steps
            .map(
              ([k, t, d]) =>
                `<article class="step"><b>${k}</b><div><strong>${t}</strong><p>${d}</p></div></article>`,
            )
            .join("")}
        </div>
        <div class="chapter" style="margin-top:2.6rem">
          <p class="kicker">The gate beside this one</p>
          <h2>THE HOUSE KEEPS THREE WORKS.</h2>
          <p>The Signal is free, forever. Watcher turns every 28 days. The Wallpaper Vault is a one-time $12 work. Nothing else is required to stay.</p>
          <p><a class="btn" href="/collections/all">See the works →</a></p>
        </div>
      </div>
    </section>`
    : `
    <section>
      <div class="wrap">
        <div class="chapter"><p class="kicker">Every gate that is open now</p><h2>THE WORKS</h2></div>
        <div class="works">${workCards()}</div>
        <p class="note" style="text-align:center;margin-top:1.4rem">The Herald app is free as well: <a href="${gate("herald-app")}">open that gate</a>, and the next realm is delivered first.</p>
      </div>
    </section>`;

  return `
    <section>
      <div class="wrap" style="max-width:820px">
        <p class="dateline">Est . MMXXVI · The threshold</p>
        <p class="kicker">${taken ? taken.title : "The gate opened"}</p>
        <h1>Traveller, you are inside.</h1>
        <p class="lede">${taken ? taken.lede : "Whatever you took, the rooms and files wait in your Whop library, not on this storefront. This page was only the threshold."}</p>
        <p>
          <a class="btn solid" href="${library}" rel="noopener">${cta} →</a>
          <a class="btn" href="/">Return to Numinous</a>
        </p>
        <p class="note">Card details never sit on this site. Whop processes every offering; the house never sees a card.</p>
        ${
          taken && taken.film
            ? `<div class="films" style="margin-top:2.4rem">
          <figure class="film">
            <video controls playsinline preload="metadata" poster="${taken.poster}" src="${taken.film}" title="${taken.title} · the briefing"></video>
            <figcaption>The briefing that opens ${taken.title}</figcaption>
          </figure>
        </div>`
            : ""
        }
      </div>
    </section>
    ${holds}`;
}

const routes = {
  "/": { title: "NUMINOUS · The Realms, Opened", render: home },
  [gate("the-signal-e6")]: { title: "The Signal · Numinous", render: signalPage },
  [gate("the-numinary-3e")]: { title: "Watcher · Numinous", render: watcherPage },
  [gate("herald-app")]: { title: "Herald app · Numinous", render: heraldPage },
  [gate("wallpaper-vault")]: { title: "Wallpaper Vault · Numinous", render: vaultPage },
  "/collections/all": { title: "The Works · Numinous", render: collectionPage },
  "/order-complete": { title: "The gate has opened · Numinous", render: orderCompletePage },
  "/returns": {
    title: "Seven Nights · Numinous",
    render: () =>
      prosePage({
        kicker: "Returns",
        title: "Seven Nights",
        paragraphs: [
          "Traveller, The Watcher gives you seven nights. If the room does not name what you saw, message within seven nights of the first payment and the full amount returns. Keep what you received.",
          "The Signal is free, forever. After seven nights, Watcher payments are final for that cycle. You may cancel any moon. Access stays until the current 28-day cycle ends.",
          "Any other work, if one is later opened, is final the moment it opens.",
          `Write the house at ${onboard.support}. Refunds, when they are due, return through Whop.`,
        ],
        links: [
          ["#/refund", "The House Refund Policy"],
          [checkout.watcher, "Take a seat"],
        ],
      }),
  },
  "/terms": {
    title: "Terms · Numinous",
    render: () =>
      prosePage({
        kicker: "The pact",
        title: "Terms",
        paragraphs: [
          "Numinous has two public gates. The Signal is free, forever. The Watcher is $28 every 28 days. Files and seats arrive in your Whop library when the gate opens.",
          "The Watcher is covered by the Seven Nights. The Signal is free. Any other work, if one is later opened, is final the moment it opens.",
          "Watcher renews with the moon until you cancel. You may leave any cycle. Access stays until that moon ends.",
          "You may not resell, republish, or share a seat. The vision is licensed to you, not given away.",
          "Payments, refunds, and seats run through Whop. If a gate fails to open after a completed offering, write through the store and the record will be read.",
        ],
        links: [
          ["/returns", "Read the Seven Nights"],
          ["#/terms", "The full records"],
          [onboard.whop_terms, "Whop’s terms"],
        ],
      }),
  },
  "/privacy": {
    title: "Privacy · Numinous",
    render: () =>
      prosePage({
        kicker: "The record",
        title: "Privacy",
        paragraphs: [
          "When you enter The Signal or The Watcher, Whop collects what the payment needs: your email, the gate you entered, and the name you choose to bind, if the work asks for one. Card details never sit on this site. Whop processes the offering.",
          "The Herald form on this site does not store your email. Submitting it opens The Signal. The cookie bar writes one small choice to your browser. Whop injects its own first-party pixel into every page before our code runs.",
          "We use that record to deliver files and seats, and to answer you if you write. We do not sell it.",
          "This site is hosted on Whop. Whop's own records of visits, payments, and memberships apply in addition to these words.",
          "The watching continues on Instagram at @numinous2.0. That house has its own rules.",
        ],
        links: [
          ["#/privacy", "The full privacy record"],
          ["/cookies", "The cookie record"],
          [onboard.whop_privacy, "Whop’s privacy policy"],
        ],
      }),
  },
  "/cookies": {
    title: "Cookies · Numinous",
    render: () =>
      prosePage({
        kicker: "The record",
        title: "Cookies",
        paragraphs: [
          "The Realm keeps its record light. This page is what the banner means.",
          "The gold bar at the gate writes one small choice to your browser: Accept or Decline. That choice lives in this site only. It does not sell, and it does not follow you off these pages.",
          "This site is hosted on Whop. Whop injects its own first-party pixel into every page before our code runs. That pixel sets a visitor id (_wuid) and records page views so a visit can be tied to a later checkout. Those records are not turned off by Decline. Checkout views, purchases, subscriptions, and trials are also written by Whop on the server, whether or not the bar was answered.",
          "Accept does not install a second tracker. It only lets this site’s own whop.track calls run after you agree. Decline keeps those extra calls off. Do not block Whop domains in the browser. That breaks the gate, not the record.",
          "The Herald form does not store your email on this site. Submitting it opens The Signal. Card details never sit here. Whop processes the offering.",
        ],
        links: [["/privacy", "The privacy policy"]],
      }),
  },
};

const main = document.querySelector("#main");
const navEl = document.querySelector("#nav");
const footEl = document.querySelector("#foot");
const dialog = document.querySelector("#records");

function currentPath() {
  // A gate can arrive as its <route>/index.html document (the host answers the
  // clean route URL with the home, whose boot forwards to that document). Both
  // spellings — and a stray trailing slash — resolve to the route itself.
  const path =
    window.location.pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "") || "/";
  return routes[path] ? path : "/";
}

function render() {
  const path = currentPath();
  // Keep the address bar on the route itself, never on the document that
  // carried it: a gate delivered as its own <route>/index.html document, or
  // with a stray trailing slash, settles on its clean path — the query and any
  // record hash preserved.
  const canonical =
    window.location.pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "") || "/";
  if (canonical === path && window.location.pathname !== canonical) {
    history.replaceState(null, "", canonical + window.location.search + window.location.hash);
  }
  const page = routes[path];
  document.title = page.title;
  navEl.innerHTML = nav(path);
  footEl.innerHTML = footer();
  main.innerHTML = page.render();
  bind();
  const record = window.location.hash.replace("#/", "");
  if (records[record]) openRecord(record);
  if (window.location.hash === "#faq") document.querySelector("#faq")?.scrollIntoView();
}

function bind() {
  document.querySelector("#herald-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const note = document.querySelector("#herald-note");
    if (!form.pact.checked) {
      note.className = "note bad";
      note.textContent = "The pact must be accepted before the Signal can find you.";
      return;
    }
    note.className = "note good";
    note.textContent = "So it is written. The next vision will find you. The Signal opens — this site does not keep the address.";
    form.reset();
    window.setTimeout(() => {
      window.location.href = gate("the-signal-e6");
    }, 700);
  });
}

function openRecord(id) {
  const record = records[id];
  if (!record) return;
  dialog.innerHTML = `
    <header>
      <div>
        <p class="kicker">${record.kicker}</p>
        <h2>${record.title}</h2>
        <p class="note">${RECORD_STAMP}</p>
      </div>
      <button class="close" type="button" aria-label="Close">✕</button>
    </header>
    <div class="sheet">
      ${record.sections
        .map(
          (section) => `
          <h3>${section.h}</h3>
          ${(section.p || []).map((p) => `<p>${p}</p>`).join("")}
          ${section.list ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
          ${(section.after || []).map((p) => `<p>${p}</p>`).join("")}
        `,
        )
        .join("")}
      <p class="note">Payments are also governed by <a href="${onboard.whop_terms}">Whop’s terms</a> and <a href="${onboard.whop_privacy}">Whop’s privacy policy</a>. Questions: ${onboard.support}</p>
    </div>`;
  dialog.showModal();
  dialog.querySelector(".close").addEventListener("click", () => {
    dialog.close();
    if (window.location.hash.startsWith("#/")) history.replaceState(null, "", window.location.pathname);
  });
}

function cookieBar() {
  const host = document.querySelector("#cookie");
  if (localStorage.getItem(COOKIE_KEY)) {
    host.hidden = true;
    return;
  }
  host.hidden = false;
  host.innerHTML = `
    <p><strong>Signal · Watcher.</strong> The Realm keeps its record light: one small entry in your browser remembers this choice. Whop injects its own first-party pixel into every page before our code runs. Details in the <a href="/cookies">cookie policy</a>.</p>
    <div class="cta-row">
      <button class="btn solid" type="button" data-choice="accept">Accept</button>
      <button class="btn" type="button" data-choice="decline">Decline</button>
    </div>`;
  host.addEventListener("click", (event) => {
    const choice = event.target?.dataset?.choice;
    if (!choice) return;
    localStorage.setItem(COOKIE_KEY, choice);
    host.hidden = true;
  });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  const record = link.dataset.record;
  if (record) {
    event.preventDefault();
    history.replaceState(null, "", `${window.location.pathname}#/${record}`);
    openRecord(record);
    return;
  }
  const url = new URL(link.href, window.location.origin);
  if (url.origin !== window.location.origin) return;
  if (url.pathname === window.location.pathname && url.hash) return;
  if (!routes[url.pathname.replace(/\/$/, "") || "/"]) return;
  event.preventDefault();
  history.pushState(null, "", url.pathname + url.hash);
  render();
  window.scrollTo(0, 0);
});

window.addEventListener("popstate", render);
dialog.addEventListener("cancel", () => {
  if (window.location.hash.startsWith("#/")) history.replaceState(null, "", window.location.pathname);
});
window.addEventListener("scroll", () => {
  const head = navEl.closest(".site-header");
  if (head) head.classList.toggle("is-scrolled", window.scrollY > 8);
});

render();
cookieBar();
