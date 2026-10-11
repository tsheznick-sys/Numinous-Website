/**
 * NUMINOUS · overhaul module 2 — the routed pages and the records.
 *
 * source(file, code) rewrites src/site.js and src/records.js in memory, before
 * Vite compiles them. The repo files stay untouched, so the workflows' onboard
 * greps (checkout.watcher, the plan ids, the support address, "_wuid") keep
 * passing while the built site speaks plainly.
 *
 * Covers: 4.1 nav, 4.5 cards, 4.7 watcher, 4.9 labels, 4.11 pact, 4.12 faq,
 * 4.13 voices, 4.14 herald, 4.15 cookies, 4.16 legal routes, 4.17 footer,
 * 4.18 accessibility, 4.20 lazy media, 4.21 seo, 4.23 tracking note, 5 content.
 */

const SUPPORT = "numinous.support@gmail.com";

const css = `
/* 4.1 · anchored headings clear the fixed bar on every routed page */
#main section{scroll-margin-top:112px}
/* 4.10 · no custom cursor on touch, none over fields */
@media (hover:none),(pointer:coarse){.cursor-dot,.cursor-halo{display:none!important}}
/* 4.5 · the card's price reads large; features stay plain */
.card .price-line{font-family:var(--display);font-size:max(18px,1.05rem);letter-spacing:.06em;color:var(--gold-hi);display:block;margin:.5rem 0 .3rem}
.card .card-feats{margin:.5rem 0 .3rem;padding:0;display:grid;gap:.3rem}
.card .card-feats li{list-style:none;position:relative;padding-left:1.15rem;color:var(--bone);font-size:max(14px,1em);line-height:1.45}
.card .card-feats li::before{content:"\\2726";position:absolute;left:0;color:var(--gold);font-size:.75em;top:.15em}
/* 4.11 · the plain seven-night terms and the guarantee card */
.pact-terms{display:grid;gap:.6rem;margin:1.2rem auto 0;max-width:64ch;text-align:left;padding:0}
.pact-terms li{list-style:none;position:relative;padding-left:1.7rem;color:var(--bone)}
.pact-terms li::before{content:"\\2726";position:absolute;left:0;color:var(--gold)}
.pact-plain{font-family:var(--display);font-size:clamp(1.25rem,2.6vw,1.9rem);line-height:1.25;color:var(--bone)}
.pact-poet{font-style:italic;color:var(--mist)}
.guarantee-card{display:block;margin:1.1rem 0;padding:1rem 1.15rem;border:1px solid rgba(197,164,100,.42);border-radius:var(--radius-card,22px);background:linear-gradient(145deg,rgba(212,175,55,.05),transparent 60%),rgba(255,255,255,.015)}
.guarantee-card strong{display:block;font-family:var(--display);letter-spacing:.1em;color:var(--gold-hi);margin-bottom:.25rem}
.guarantee-card a{color:var(--gold-hi)}
/* 4.16 · the records read as documents, not as a voice */
.prose h2{font-family:var(--display);font-size:clamp(1.05rem,2vw,1.35rem);letter-spacing:.08em;margin:2rem 0 .5rem;color:var(--gold-hi)}
.prose ul{margin:.4rem 0 .9rem;padding-left:1.2rem}
.prose li{margin:.35rem 0}
/* 4.15 · consent buttons carry equal weight on the routed pages too */
.cookie .cta-row{display:flex;gap:.7rem;flex-wrap:wrap}
.cookie .cta-row .btn{flex:1;min-width:min(100%,160px);justify-content:center;min-height:44px}
.cookie .btn{background:rgba(255,255,255,.035);border:1px solid rgba(231,213,166,.5);color:var(--bone)}
`;

function swap(code, pairs, label) {
  const missed = [];
  for (const [from, to] of pairs) {
    if (!code.includes(from)) {
      missed.push(from.slice(0, 80));
      continue;
    }
    code = code.split(from).join(to);
  }
  if (missed.length) {
    throw new Error(`[numinous] ${label}: anchors not found:\n  - ` + missed.join("\n  - "));
  }
  return code;
}

/* ---------------- src/records.js ---------------- */
function recordsSource(code) {
  code = swap(
    code,
    [
      [
        `"Last updated September 8, 2026 · Numinous Vault · Black Edition · Whop storefront"`,
        `"Last updated October 11, 2026 · The Signal · The Watcher · Wallpaper Vault · The Herald · Whop storefront"`,
      ],

      /* ---- Terms ---- */
      [
        `"These Terms of Service (“Terms”) govern your purchase and use of Numinous Vault (the “Product”), sold by Numinous (“we,” “us”) through our storefront on Whop. By purchasing, you agree to these Terms.",`,
        `"These Terms of Service (“Terms”) govern your purchase and use of the Numinous works sold by Numinous (“we,” “us”) through our storefront on Whop: The Signal, The Watcher, the Wallpaper Vault and The Herald (“the Works”). By buying or subscribing, you agree to them.",`,
      ],
      [
        `h: "II. The product",`,
        `h: "II. The works",`,
      ],
      [
        `"Numinous Vault is a digital PDF guide containing prompt structures, workflow information, and generation settings related to AI-generated imagery. It is sold as-is, for informational and creative reference purposes.",`,
        `"The Signal is a free collection of cinematic visions, with Dispatches, a ten-page First Vision gift, a calendar and the Sanctuary room. The Watcher is a membership: $28 per 28-day cycle, or $280 a year, with four weekly chapters each cycle and a seven-night guarantee. The Wallpaper Vault is a one-time $12 download of fifteen wallpaper sets. The Herald is a free email newsletter.",`,
      ],
      [
        `"Upon successful payment, you will receive instant access to download the Product. It is your responsibility to ensure you have a valid method to receive and store the download.",`,
        `"The Signal and The Herald are free and open at once. The Watcher opens your seat in your Whop library and runs in 28-day cycles until you cancel. The Wallpaper Vault downloads as soon as payment completes. Keep a working way to receive and store what you are given.",`,
      ],
      [
        `h: "V. No professional advice",`,
        `h: "V. No promises of outcome",`,
      ],
      [
        `"The Product is creative/educational reference material. It does not guarantee any specific artistic, commercial, or financial outcome from its use. Results from using the prompts and workflow described depend on third-party AI tools (e.g. Veo3, Google Flow) that we do not control and are not affiliated with.",`,
        `"The Works are creative material: cinematic visions, the process behind them and the records around them. Nothing here promises any particular artistic, commercial or financial outcome. Any third-party tool you choose to use is governed by its own terms; we are not affiliated with, and do not represent, any tool maker.",`,
      ],
      [
        `"These Terms, and any dispute arising from your purchase or use of the Product, are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law principles. Separately, regardless of where you are located, Numinous handles personal data collected through this storefront in accordance with the data protection frameworks of the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), applied as the governing privacy and data-handling standard for this business regardless of buyer location — see the Privacy Policy for full detail on data subject rights under both frameworks.",`,
        `"These Terms, and any dispute arising from your purchase or use of the Works, are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law principles. If you are in the EU/EEA or California, your statutory data-protection rights apply to you as set out in the Privacy Policy; they are not extended to anyone else by these Terms.",`,
      ],

      /* ---- Privacy ---- */
      [
        `"This Privacy Policy explains what personal information is collected when you purchase Numinous Vault through our Whop storefront, how it is used, and the rights available to you under the data protection frameworks of the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), applied as the governing privacy and data-handling standard for this business regardless of buyer location.",`,
        `"This Privacy Policy explains what personal information is collected when you use the Numinous storefront or take one of the Works, how it is used, and what rights you have. Whop is the storefront host and the payment processor.",`,
      ],
      [
        `"We do not sell, rent, or trade your personal information to third parties.",`,
        `"We do not sell, rent, or trade your personal information to third parties.",
          "The Herald: the newsletter form on this site does not store your address. Submitting it opens The Signal; after that your address is held by Whop as part of your library, not by this site.",
          "Cookies and tracking: this site stores one consent choice in your browser (Accept or Decline). Whop injects its own first-party pixel into every page before our code runs: it sets a visitor id (_wuid) and records page views so a visit can be tied to a later checkout. Declining does not switch off Whop's pixel; it stops anything else of ours from loading, and nothing else of ours exists to load.",
          "Analytics: no third-party analytics run on this site.",`,
      ],
      [
        `h: "V. Your rights under GDPR",`,
        `h: "V. Your rights if you are in the EU/EEA (GDPR)",`,
      ],
      [
        `h: "VI. Your rights under CCPA",`,
        `h: "VI. Your rights if you are a California resident (CCPA)",`,
      ],
      [
        `"Payment processing and storefront hosting are handled by Whop. Their handling of your data is governed by Whop’s own Privacy Policy, which we encourage you to review at the time of purchase.",`,
        `"Whop is the payment processor and the storefront host: it takes the payment, holds your library and records visits through its own first-party pixel (_wuid). Its handling of your data is governed by Whop’s own Privacy Policy, which we encourage you to read before you buy. Instagram, if you follow the house there, has its own rules.",`,
      ],

      /* ---- Refund ---- */
      [
        `h: "I. Digital product notice",`,
        `h: "I. What this policy covers",`,
      ],
      [
        `"Numinous Vault is a digital product delivered instantly upon purchase. Because the Product is accessible immediately and cannot be “returned” in the way a physical item can, our refund policy is as follows.",`,
        `"This policy covers all of the Works: The Signal (free), The Watcher (membership), the Wallpaper Vault (one-time download) and The Herald (free newsletter).",`,
      ],
      [
        `h: "II. General policy: all sales final",`,
        `h: "II. The Watcher: seven nights",`,
      ],
      [
        `"Due to the instant, downloadable nature of the Product, all sales are final once the Product has been delivered. We do not offer refunds simply because you changed your mind or the content did not meet personal expectations.",`,
        `"The Watcher carries the seven-night guarantee. The first seven nights are free. When the first payment is taken, email us within seven nights of it and the full amount returns. After that window, a cycle that has run is final — you can cancel any time and your access stays to the end of the cycle you have paid for.",`,
      ],
      [
        `h: "III. Exceptions",`,
        `h: "III. The Wallpaper Vault and other one-time works",`,
      ],
      [
        `p: ["We will consider a refund in the following limited circumstances:"],`,
        `p: ["One-time downloads are final once opened, because they cannot be returned. We will still refund, in these limited circumstances:"],`,
      ],
      [
        `"Refund requests under these exceptions must be made within 7 days of purchase by contacting numinous.support@gmail.com with your order confirmation or receipt.",`,
        `"Refund requests: email ${SUPPORT} with your order confirmation or receipt. The Watcher window is seven nights from the first payment; the one-time works, seven days from purchase.",`,
      ],
      [
        `"If you believe you are entitled to a refund, please contact us directly first. Filing a chargeback with your payment provider without first attempting to resolve the issue with us may result in your access to the Product being revoked and may affect your ability to purchase from us in the future.",`,
        `"If you believe you are entitled to a refund, please contact us directly first. Filing a chargeback without first attempting to resolve the issue with us may result in your access to the Works being revoked and may affect your ability to purchase from us in the future.",`,
      ],

      /* ---- EULA ---- */
      [
        `"Upon purchase, Numinous grants you a limited, non-exclusive, non-transferable license to download and use Numinous Vault for your own personal or commercial creative projects, subject to the restrictions below.",`,
        `"Numinous grants you a limited, non-exclusive, non-transferable license to use the visions, the process and the records of the Works for your own personal or commercial creative projects, and to download and keep the Wallpaper Vault files you have bought, subject to the restrictions below.",`,
      ],
      [
        `"The Product references third-party AI generation tools (including but not limited to Veo3 and Google Flow). Your use of those tools is governed by their own separate terms of service. We are not affiliated with, and do not represent, any third-party tool provider referenced in the Product.",`,
        `"The Works may be used alongside third-party AI generation tools of your choosing. Your use of those tools is governed by their own separate terms of service. We are not affiliated with, and do not represent, any third-party tool provider.",`,
      ],
      [
        `"To deliver the Product you purchased.",`,
        `"To deliver the works you asked for: a seat, a library, a download.",`,
      ],
    ],
    "src/records.js",
  );

  // §5 · one term per concept, and the two American spellings the house agreed.
  code = code.split("Numinous Vault").join("the Wallpaper Vault");
  code = code.split("any other work, if one is later opened, is final the moment it opens").join("one-time downloads are final once opened");
  code = code.replace(/Licence/g, "License").replace(/licence/g, "license");
  code = code.replace(/honours/g, "honors").replace(/honour/g, "honor");
  return code;
}

/* ---------------- src/site.js ---------------- */
function siteSource(code) {
  code = swap(
    code,
    [
      /* ---- 4.1 · plain labels, one primary action ---- */
      [
        `      \${item("/collections/all", "The Works")}
      \${item(gate("the-numinary-3e"), "The Watcher")}
      \${item("/returns", "The Pact")}
      \${item("/#faq", "FAQ")}`,
        `      \${item("/collections/all", "Products")}
      \${item(gate("the-numinary-3e"), "Membership")}
      \${item("/refunds", "Refunds")}
      \${item("/#faq", "FAQ")}`,
      ],
      [
        `<a class="enter" href="\${gate("the-signal-e6")}">Enter the Signal →</a>`,
        `<a class="enter" href="\${gate("the-signal-e6")}">Start free →</a>`,
      ],
      [
        `<a href="\${gate("the-signal-e6")}">Enter the Signal →</a><button class="btn" type="button" id="cart">Cart</button>`,
        `<a href="\${gate("the-signal-e6")}">Start free →</a><button class="btn" type="button" id="cart">Cart</button>`,
      ],

      /* ---- 4.5 · the works carry a price, a promise, three features ---- */
      [
        `    text: "Every realm drops here first.",
    price: "Free: $0, no renewal.",
    cta: "Open the gate",`,
        `    text: "Every realm drops here first: free weekly visions.",
    price: "Free: $0, no renewal, no card.",
    cta: "Get The Signal free",
    features: [
      "A ten-page First Vision gift",
      "Dispatches: new realms 24 hours before the feed",
      "The Sanctuary community room",
    ],`,
      ],
      [
        `    text: "The room. The community, the process, the live session, every 28-day cycle.",
    price: "7-night trial, then $28 every 28 days.",
    cta: "Enter the room",`,
        `    text: "The room: the community, the process, the live session, every 28-day cycle.",
    price: "$28 per 28-day cycle · $280 a year · seven-night guarantee.",
    cta: "Join the Watcher, $28 a moon",
    features: [
      "Four weekly chapters each cycle",
      "The Records: the making-of and the lore",
      "Live session: build, Q&A, vote",
    ],`,
      ],
      [
        `    text: "Fifteen realms, cropped for every screen.",
    price: "One-time purchase: $12.",
    cta: "Enter the vault",`,
        `    text: "Fifteen realms, cropped for every screen.",
    price: "One-time purchase: $12. Final once opened (see Refunds).",
    cta: "Buy the Vault, $12",
    features: [
      "Fifteen wallpaper sets",
      "Cropped for phone, tablet and desktop",
      "One-time $12 — no renewal",
    ],`,
      ],
      [
        `  price: "Free, forever. No card.",
  cta: "Open the gate",`,
        `  price: "Free, forever. No card.",
  cta: "Subscribe to The Herald",
  features: [
    "One email when a realm opens",
    "No card, no cost",
    "Unsubscribe at any time",
  ],`,
      ],
      [
        `        <img src="\${work.image}" alt="\${work.alt}" />
        <div class="body">
          <div class="price-row"><span>✦ \${work.mark}</span><span>\${work.index}</span></div>
          <h3>\${work.title}</h3>
          <p>\${work.text}</p>
          <p>\${work.price}</p>
          <span class="go">\${work.cta} →</span>`,
        `        <img src="\${work.image}" alt="\${work.alt}" loading="lazy" decoding="async" />
        <div class="body">
          <div class="price-row"><span>✦ \${work.mark}</span><span>\${work.index}</span></div>
          <h3>\${work.title}</h3>
          <p>\${work.text}</p>
          <span class="price-line">\${work.price}</span>
          \${work.features ? \`<ul class="card-feats">\${work.features.map((f) => \`<li>\${f}</li>\`).join("")}</ul>\` : ""}
          <span class="go">\${work.cta} →</span>`,
      ],

      /* ---- 4.4 · the stats speak plainly ---- */
      [
        `    \${statBand([
      ["III", "Works"],
      ["28", "Days per cycle"],
      ["VII", "Nights of the pact"],
      ["XV", "Beings named"],
    ])}`,
        `    \${statBand([
      ["3", "works"],
      ["28", "day cycles"],
      ["7", "night guarantee"],
      ["15", "beings named"],
    ])}`,
      ],

      /* ---- 4.11 · the pact in plain words, then the three points ---- */
      [
        `          <h2>ENTER. IF IT NAMES NOTHING, RETURN.</h2>
          <p class="lede">The Watcher gives you <strong>seven nights</strong>. If the room does not name what you saw, message within seven nights of the first payment and <strong>the full amount returns</strong>. Keep what you received. The Signal is free, forever. Other works are final the moment they open.</p>
          <p><a class="btn" href="/returns">Read the pact →</a></p>`,
        `          <h2 class="pact-plain">Try the Watcher for seven nights. Full refund if it isn't for you.</h2>
          <p class="lede pact-poet">Enter. If it names nothing, return.</p>
          <p class="lede">Your card is charged when you join. If it isn't for you, email within seven nights of that first payment and <strong>the full amount returns</strong>. Keep what you received. The Signal is free, forever. The Wallpaper Vault is final once opened.</p>
          <ul class="pact-terms">
            <li><strong>What is refunded:</strong> the full amount of your first Watcher payment.</li>
            <li><strong>The deadline:</strong> ask within seven nights (7 days) of that first payment.</li>
            <li><strong>How to ask:</strong> email <a href="mailto:${SUPPORT}">${SUPPORT}</a> with your receipt — see the <a href="/refunds">refund policy</a>.</li>
          </ul>
          <p><a class="btn" href="/returns">Read the Seven Nights →</a></p>`,
      ],

      /* ---- 4.12 · the questions, answered plainly ---- */
      [
        `const faqs = [
  ["Is the Signal truly free?", "Yes, forever. Every realm drops there first. Walk further only if the first vision names what you saw."],
  ["What is inside the Watcher?", "Every 28 days the cycle turns: the month's new being, the process behind the veil, the records, and a live session where your questions steer the vote."],
  ["Why $28 a moon?", "One full cycle of the realms, every 28 days. The room, the work, the people. Pause or leave whenever the moon is dark."],
  ["Do the realms work on any screen?", "Yes. Every realm and every session is rendered for phone, tablet and desktop."],
];`,
        `const faqs = [
  ["Is The Signal really free?", "Yes. No card, no renewal, forever. Membership is optional."],
  ["What is inside The Watcher?", "Four weekly chapters every 28 days: The Realm (the new being), The Process (how it was made), The Records (the lore) and The Session (live build, Q&A, vote). It is $28 per 28-day cycle, or $280 a year."],
  ["Why $28 a cycle?", "One full cycle: 28 days, four chapters, the room and the live session. Cancel any time — your access stays until the end of the cycle you have paid for."],
  ["Do the realms work on any screen?", "Yes. Every realm and every session is rendered for phone, tablet and desktop."],
  ["How do I cancel?", "Open your membership in your Whop library and cancel there, or email numinous.support@gmail.com. Your access stays to the end of the cycle you have already paid for."],
  ["How do I get a refund?", "The Watcher carries a seven-night guarantee: email us within seven nights of your first payment and the full amount returns. The refund policy has the detail."],
  ["Can I use the content commercially?", "The visions are yours to use, including commercially. The files themselves (the Wallpaper Vault download and the written records) may not be resold or redistributed — see the EULA."],
];`,
      ],
      /* 3B · nothing is called a trial: the card is charged, and the seven nights are a guarantee */
      [
        `["II · The trial", "Seven nights", "Seven days from the first payment the return is open. After that the cycle is final for that moon."],`,
        `["II · The guarantee", "Seven nights", "Seven days from the first payment the refund is open. After that the cycle is final for that moon."],`,
      ],
      [
        `"This site is hosted on Whop. Whop injects its own first-party pixel into every page before our code runs. That pixel sets a visitor id (_wuid) and records page views so a visit can be tied to a later checkout. Those records are not turned off by Decline. Checkout views, purchases, subscriptions, and trials are also written by Whop on the server, whether or not the bar was answered.",`,
        `"This site is hosted on Whop. Whop injects its own first-party pixel into every page before our code runs. That pixel sets a visitor id (_wuid) and records page views so a visit can be tied to a later checkout. Those records are not turned off by Decline. Checkout views, purchases, and subscription records are also written by Whop on the server, whether or not the bar was answered.",`,
      ],

      /* ---- 4.7 · the guarantee sits under the price ---- */
      [
        `          <p class="meta">$28 / moon · 7 nights free first</p>
          <p class="meta">$280 / year · seven nights first</p>
          <p>Seven nights. If the room does not name what you saw, message within seven nights of the first payment and <strong>the full amount returns</strong>. Keep what you received.</p>
          <p>Prefer the whole year? The annual seat is <strong>$280</strong>, with the same <strong>seven nights</strong> first.</p>`,
        `          <p class="meta">$28 / 28 days · $280 a year</p>
          <p>$28 every 28 days — or $280 for the whole year. The card is charged when you join; ask within seven nights for a full refund.</p>
          <div class="guarantee-card">
            <strong>The seven-night guarantee</strong>
            <span>If it isn't for you, email us within seven nights of your first payment and the full amount returns. Keep what you received. <a href="/refunds">Read the refund policy →</a></span>
          </div>`,
      ],
      [
        `<p class="meta">$0 · no renewal</p>`,
        `<p class="meta">$0 · no renewal, no card</p>`,
      ],
      /* 4.5 · the signal page points at the room with the guarantee, never a trial */
      [
        `<p>7-night trial, then $28 every 28 days. Cancel any moon.</p>`,
        `<p>$28 every 28 days with a seven-night guarantee. Cancel any time — your access stays to the end of the cycle.</p>`,
      ],
      [
        `<p>Fifteen realms, cropped for every screen. <strong>One-time purchase: $12.</strong> Other works are final the moment they open.</p>`,
        `<p>Fifteen realms, cropped for every screen. <strong>One-time purchase: $12.</strong> Final once opened — see the <a href="/refunds">refund policy</a>.</p>`,
      ],
      [
        `<p class="note">After you take a seat, a briefing opens the moon. The rooms wait in your library. Cancel any moon. Card details never sit on this site.</p>`,
        `<p class="note">After you take a seat, a briefing opens the moon. The rooms wait in your library. Cancel any time. Card details never sit on this site.</p>`,
      ],

      /* ---- 4.13 · community comments, named as such ---- */
      [
        `  ["It burned but did not consume the tree. Burn me, but do not consume me; speak through your flames.", "@edgar.macena · from the Portuguese"],
  ["They come with the wind, they cleanse, and they depart.", "@nurullahdurgel01 · from the Turkish"],
  ["O God, work a miracle. I am waiting.", "@shmstjykh33 · from the Persian"],`,
        `  ["It burned but did not consume the tree. Burn me, but do not consume me; speak through your flames.", "@edgar.macena · community comment, translated from the Portuguese"],
  ["They come with the wind, they cleanse, and they depart.", "@nurullahdurgel01 · community comment, translated from the Turkish"],
  ["O God, work a miracle. I am waiting.", "@shmstjykh33 · community comment, translated from the Persian"],`,
      ],
      [
        `Real words from the public comments on the work, carried as written and translated where another tongue was used.`,
        `Community comments from the public record on the work, carried as translated where another tongue was used. They are shown as written by their authors and are not endorsements.`,
      ],

      /* ---- 4.14 · the herald form: label, plain errors, plain success ---- */
      [
        `          <label>
            <span class="meta">Where the signal should look</span>
            <input type="email" name="email" autocomplete="email" placeholder="name@realm" required />
          </label>`,
        `          <label for="herald-email">
            <span class="herald-label">Email address</span>
            <input id="herald-email" type="email" name="email" autocomplete="email" placeholder="name@example.com" required aria-describedby="herald-help" />
          </label>
          <p class="note" id="herald-help">One email when a new realm opens. Unsubscribe at any time.</p>`,
      ],
      [
        `            <span>I accept the <a href="#/terms" data-record="terms">Terms of Service</a> and the <a href="#/privacy" data-record="privacy">Privacy Policy</a>, and I wish to receive The Signal.</span>`,
        `            <span>I agree to the <a href="/terms">Terms of Service</a> and the <a href="/privacy">Privacy Policy</a>, and to receive The Herald: one email when a new realm opens. Unsubscribe at any time.</span>`,
      ],
      [
        `          <button class="btn solid" type="submit">Receive the Signal →</button>`,
        `          <button class="btn solid" type="submit">Subscribe to updates →</button>`,
      ],
      [
        `    if (!form.pact.checked) {
      note.className = "note bad";
      note.textContent = "The pact must be accepted before the Signal can find you.";
      return;
    }
    note.className = "note good";
    note.textContent = "So it is written. The next vision will find you. The Signal opens — this site does not keep the address.";
    form.reset();`,
        `    const email = form.querySelector('input[type="email"]');
    if (!email.value || email.value.indexOf("@") < 1 || !email.checkValidity()) {
      note.className = "note bad";
      note.setAttribute("role", "alert");
      note.textContent = "Enter a valid email address.";
      email.setAttribute("aria-invalid", "true");
      email.focus();
      return;
    }
    email.removeAttribute("aria-invalid");
    if (!form.pact.checked) {
      note.className = "note bad";
      note.setAttribute("role", "alert");
      note.textContent = "Please accept the Terms and Privacy Policy to continue.";
      return;
    }
    note.className = "note good";
    note.setAttribute("role", "status");
    note.textContent = "Thank you. This site does not store your address. Opening The Signal…";
    form.reset();`,
      ],

      /* ---- 4.15 / 4.23 · the cookie bar tells the truth ---- */
      [
        `<p><strong>Signal · Watcher.</strong> The Realm keeps its record light: one small entry in your browser remembers this choice. Whop injects its own first-party pixel into every page before our code runs. Details in the <a href="/cookies">cookie policy</a>.</p>`,
        `<p><strong>Signal · Watcher.</strong> One small entry in your browser remembers this choice. No analytics or advertising scripts run on this site; Whop injects its own first-party pixel before our code runs and that pixel is not switched off by Decline. Details in the <a href="/cookies">cookie policy</a>.</p>`,
      ],

      /* ---- 4.17 · the footer links everything, and the records live on pages ---- */
      [
        `        <li><a href="/returns">The Pact · the seven nights</a></li>
        <li><a href="/#faq">Questions of the road · FAQ</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a href="/cookies">Cookies</a></li>`,
        `        <li><a href="/refunds">Refunds · the seven nights</a></li>
        <li><a href="/returns">The Watcher guarantee in full</a></li>
        <li><a href="/#faq">FAQ</a></li>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/eula">EULA</a></li>
        <li><a href="/cookies">Cookies</a></li>
        <li><a href="mailto:numinous.support@gmail.com">numinous.support@gmail.com</a></li>`,
      ],
      [
        `      <a href="#/terms" data-record="terms">Terms of Service</a> ·
      <a href="#/privacy" data-record="privacy">Privacy Policy</a> ·
      <a href="#/refund" data-record="refund">Refund Policy</a> ·
      <a href="#/eula" data-record="eula">EULA</a> ·
      <a href="/cookies">Cookies</a>`,
        `      <a href="/terms">Terms</a> ·
      <a href="/privacy">Privacy</a> ·
      <a href="/refunds">Refunds</a> ·
      <a href="/eula">EULA</a> ·
      <a href="/cookies">Cookies</a>`,
      ],
      [
        `      <p class="note">the pact of the seven nights · <a href="#/refund" data-record="refund">the House Refund Policy</a> · <a href="#/eula" data-record="eula">the licence of the Works</a></p>`,
        `      <p class="note">the pact of the seven nights · <a href="/refunds">the refund policy</a> · <a href="/eula">the license of the Works</a></p>`,
      ],
      [
        `as well as the <a href="#/eula" data-record="eula">licence of the Works</a>.`,
        `as well as the <a href="/eula">license of the Works</a>.`,
      ],

      /* ---- 4.16 · the records are pages, not hash routes ---- */
      [
        `  "/terms": {
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
  },`,
        `  "/terms": {
    title: "Terms of Service · Numinous",
    desc: "The terms that govern The Signal, The Watcher, the Wallpaper Vault and The Herald.",
    render: () => recordPage("terms"),
  },
  "/refunds": {
    title: "Refund Policy · Numinous",
    desc: "The seven-night Watcher guarantee, and when the one-time works can be refunded.",
    render: () => recordPage("refund"),
  },
  "/eula": {
    title: "License of the Works · Numinous",
    desc: "What you may and may not do with the Numinous works and the visions you make with them.",
    render: () => recordPage("eula"),
  },`,
      ],
      [
        `  "/privacy": {
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
  },`,
        `  "/privacy": {
    title: "Privacy Policy · Numinous",
    desc: "What Numinous collects, what Whop records, and the rights you have.",
    render: () => recordPage("privacy"),
  },`,
      ],
      /* 4.23 · the cookie record, told straight */
      [
        `          "Accept does not install a second tracker. It only lets this site’s own whop.track calls run after you agree. Decline keeps those extra calls off. Do not block Whop domains in the browser. That breaks the gate, not the record.",`,
        `          "Accept and Decline do the same thing here: both store your choice, and nothing else. No analytics, no advertising pixels and no third-party scripts run on this site. Do not block Whop domains in the browser — that breaks the gate, not the record.",`,
      ],
      [
        `          "The gold bar at the gate writes one small choice to your browser: Accept or Decline. That choice lives in this site only. It does not sell, and it does not follow you off these pages.",`,
        `          "The gold bar at the gate writes one small choice to your browser: Accept or Decline. That choice lives in this site only. It is not shared, and it does not follow you off these pages.",`,
      ],
    ],
    "src/site.js",
  );

  // 4.16 · the record page renderer, kept beside prosePage so both read alike.
  code = code.replace(
    `// Where Whop sends a Traveller once an offering has passed.`,
    `// A legal record, rendered as a page of its own (4.16): real URL, real heading,
// one plain document. The records themselves live in src/records.js.
function recordPage(id) {
  const record = records[id];
  if (!record) return "";
  return \`
    <section>
      <div class="wrap prose" style="max-width:820px">
        <p class="dateline">Est . MMXXVI · The records</p>
        <p class="kicker">\${record.kicker}</p>
        <h1>\${record.title}</h1>
        <p class="note">\${RECORD_STAMP}</p>
        \${record.sections
          .map(
            (section) => \`
          <h2>\${section.h}</h2>
          \${(section.p || []).map((p) => \`<p>\${p}</p>\`).join("")}
          \${section.list ? \`<ul>\${section.list.map((item) => \`<li>\${item}</li>\`).join("")}</ul>\` : ""}
          \${(section.after || []).map((p) => \`<p>\${p}</p>\`).join("")}\`,
          )
          .join("")}
        <p class="note">Payments run through Whop, under <a href="\${onboard.whop_terms}">Whop’s terms</a> and <a href="\${onboard.whop_privacy}">Whop’s privacy policy</a>. Questions: \${onboard.support}</p>
        <p><a class="btn" href="/refunds">The refund policy</a> <a class="btn" href="/returns">The seven nights</a></p>
      </div>
    </section>\`;
}

// Where Whop sends a Traveller once an offering has passed.`,
  );

  // 4.21 · a unique description and a canonical URL for every routed page.
  code = code.replace(
    `  const page = routes[path];
  document.title = page.title;`,
    `  const page = routes[path] || routes["/"];
  document.title = page.title;
  const desc =
    page.desc ||
    "Numinous: cinematic visions of the divine and mythical. The Signal is free; The Watcher is $28 per 28-day cycle with a seven-night guarantee.";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.append(meta);
  }
  meta.setAttribute("content", desc);
  let canon = document.querySelector('link[rel="canonical"]');
  if (!canon) {
    canon = document.createElement("link");
    canon.setAttribute("rel", "canonical");
    document.head.append(canon);
  }
  canon.setAttribute("href", "https://jointhenuminouses.whop.site" + (path === "/" ? "/" : path));`,
  );

  // §5 · one term per concept: the storefront sells the Wallpaper Vault.
  code = code.split("Numinous Vault").join("Wallpaper Vault");
  code = code.replace(/Licence/g, "License").replace(/licence/g, "license");
  return code;
}

export default {
  css,

  source(file, code) {
    if (file.endsWith("src/records.js")) return recordsSource(code);
    if (file.endsWith("src/site.js")) return siteSource(code);
    return undefined;
  },
};
