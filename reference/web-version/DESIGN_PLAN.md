# DESIGN PLAN · NUMINOUS PRE-CHECKOUT EXCELLENCE PASS

Date: September 28, 2026 · Owner: design lead / FE / conversion / QA
Mandate: award-site-grade page a stranger trusts enough to pay $28 within two minutes.

## 0 · STACK DECISION (stated, per §5)

The repo prescribes TanStack Start + Vite + Cloudflare (it IS the live Whop app
thenuminouses.whop.site, deployed via `whop apps deploy`). Next.js would discard the
deployed production chain, the Whop SSR checkout redirect, and the sealed home.
Decision: follow the repo, note it, spend the effort on design instead of migration.

## 1 · PALETTE (refined, one stated deviation)

- `--void #05060a` (kept) · `--ink #0a0c14` (kept) · `--hairline rgba(212,175,55,.16)`
- `--gold #d4af37` — DEVIATION from the brief's `#d8b062`, stated reason: brand lock.
  The antique gold `#d4af37` is the sealed brand token across home, PDFs, films and
  sigil; changing it would fork the identity. `--gold-hi #f0d98c` plays the brief's
  highlight role. `--gold-deep #8a6d1f` for pressed states.
- `--bone #ece3cd` (kept; brief `#efe6d2` close enough that continuity wins)
- `--mist #a29a85` (the app's ash; contrast on void ≈ 6.1:1, passes AA)
- Gradients only where they carry light: the film veil, the dial's moonlight ring.

## 2 · TYPE ROLES

- Cinzel: display, all-caps, tracked. One size step per level, no eyebrow inflation:
  the existing eyebrow ritual (small gold letter-spaced line) is used at most twice
  per viewport and only on real chapters (THE LORE, THE CYCLE).
- Cormorant Garamond: body, 1.6 to 1.7 line-height, measure under 65ch.
- Scale: 12 / 14 / 17 / 22 / 30 / clamp(2.6rem,6vw,4rem).

## 3 · LAYOUT CONCEPT

The pre-checkout surface (product page) reads as one descending corridor:
frame of the work → price and truth → invitation film → lore → **the cycle (new)** →
questions → walk on. The sealed home keeps its own hero moment untouched.

### Mobile wireframe (390)

```
┌──────────────────────────┐
│ crumbs            [cart] │
│ ┌──────────────────────┐ │
│ │   framed art (4:5)   │ │
│ │   gold corners       │ │
│ └──────────────────────┘ │
│ CHAPTER · THE FIRST GATE │
│ THE NUMINARY             │
│ headline one line        │
│ $28.00                   │
│ $28 each moon. Cancel    │
│ any moon.                │
│ [ TAKE A SEAT → ] gold   │
│ [ hold this work ] ghost │
│ flow note (1 line)       │
│ ── invitation film ──    │
│ ── lore: chambers ──     │
│ ── THE CYCLE ──          │
│ ┌──────────────────────┐ │
│ │   ◠ dial 28 ticks    │ │
│ │      ROMAN           │ │
│ └──────────────────────┘ │
│ [I][II][III][IV] 2x2     │
│ week copy (2 lines)      │
│ ── questions ──          │
│ ── walk on ──            │
│ [sticky bar: price+CTA]  │
│ (hides near footer)      │
└──────────────────────────┘
```

### Desktop wireframe (1440)

```
┌──────────────────────────────────────────────────────┐
│ header: wordmark · anchors · [ENTER THE SIGNAL]      │
│ ────────────────────────────────────────────────     │
│ ┌────────────┐  CHAPTER · WATCHER · $28 A MOON       │
│ │  framed    │  THE NUMINARY                         │
│ │  art       │  headline                             │
│ │  (1:1)     │  $28.00  ·  $28 each moon. Cancel     │
│ │            │           any moon.                   │
│ └────────────┘  [TAKE A SEAT →]  [ghost]             │
│ ── invitation film (16:9, full measure) ──           │
│ ── lore chambers (3 col) ── | ── THE CYCLE ──        │
│   dial left (320px) · four weeks right as a          │
│   vertical tab list, one line of copy each           │
│ ── questions (details, 1 col, 65ch) ──               │
│ ── walk on (related) ──                              │
│ footer: legal · contact · © MMXXVI                   │
└──────────────────────────────────────────────────────┘
```

Alignment rules: single 12-column wrap, max 1200; art column always 5/12, details
7/12; every section separated by hairline, never by shadow; one primary gold button
per viewport, the second action is always ghost.

## 4 · THE SIGNATURE MOMENT

**The moon dial.** Twenty-eight ticks for twenty-eight nights, four weeks of seven.
On reveal the ticks draw themselves around the dark; the current week's arc lights
gold; the roman numeral sits at the center like a phase. Tapping a week rotates the
light (a quiet 400ms ease, reduced-motion: none) and swaps one line of copy through a
polite live region. It is the product's own truth made interactive: a new being every
moon, cancel any moon. Keyboard operable, `aria-pressed` on every week, arrow keys move.

The home hero (sigil ring, wordmark resolve, starfield) is already shipped and sealed;
it stays the home's moment. The dial is the product page's.

## 5 · CONVERSION LADDER ON THIS SURFACE

- One gold action per viewport. Watcher's page: TAKE A SEAT is gold, hold-this-work ghost.
- Risk reducers at the point of decision (already shipped, kept): "$28 each moon.
  Cancel any moon." / "Free, forever. No card."
- CTA taxonomy (`data-cta`): `signal`, `watcher` + `data-cta-location`:
  `hero`, `sticky`, `upsell`, `closing`. Every CTA tagged.
- UTM passthrough: any `utm_*` (and `ref`) on our URL rides along to the Whop checkout.
- The e-books rule (user order, this turn): Codex and Collector are NEVER on the open
  page. They are found inside The Numinary after joining the Signal. The public page
  only admits deeper works exist ("sealed editions"), names nothing, links nothing.

## 6 · CRITIQUE (against the brief, before build)

Generic-tell audit of my first sketch, and what changed:

1. TELL FOUND: I had planned an eyebrow above every section. CUT to chapters only
   (THE CYCLE, THE LORE keep theirs; related and FAQ lose nothing).
2. TELL FOUND: my dial tab row echoed a SaaS segmented control (grey pill). RESTYLED:
   tick-aligned roman buttons, hairline underline that slides, no pill, no shadow.
3. TELL FOUND: I numbered the lore chambers 01/02/03. The chambers use roman numerals
   as chapter marks (sealed pattern, and they are lore, not steps). The four weeks are
   the only numbered sequence and the dial carries that.
4. TELL FOUND: fade-up on every block was creeping in. The corridor uses the existing
   Reveal ritual only at chapter boundaries; the dial's draw is the single new motion.
5. RISK FOUND: sticky bar covered the FAQ near the footer (the brief's exact warning).
   FIX SCHEDULED: footer observer, bar hides when the footer enters.
6. TOKEN DEVIATION (gold) stated in §1; everything else locked.

Not built for "any dark-fantasy page" specifically because: the dial IS the billing
cycle, the four weeks are the actual product calendar, the pact language ("nights")
is law, and the scarcity of the sealed editions is structural, not decorative.

## 7 · BUDGETS (§9) AGAINST THIS REPO

- JS: the corridor ships code-split chunks; total client JS audited after build and
  reported in BUG_LOG. No new runtime library is added for the dial (pure SVG+CSS).
- A11y: focus-visible rings on every tab and CTA, 44px targets, live region polite,
  `prefers-reduced-motion` kills the draw and the rotation, real heading order.
- SEO: JSON-LD `Product` + `Offer` injected per gate (free / $28 each moon), matching
  §2 exactly; canonical/OG already shipped on the routes.
- Performance: art already explicit-sized, lazy below fold, preloaded hero (home);
  the dial adds ~2 KB gzipped and zero requests.
