# Numinous · House v2 — one design language, every page

> **RUN 9 (2026-10-12) · the style swap.** The storefront now wears the index
> bundle's own design. The sections below describe v2 as it stood before the
> swap; where they disagree with this block, this block governs.
>
> * **The home** is the bundle's document, kept at
>   `reference/patch/clean/home.html`, adopted verbatim by the build (its
>   marker is `<!-- numinous-clean-home -->`) and wearing
>   `/assets/numinous-clean.css`.
> * **Every routed page** keeps its route, its copy and its funnel, and wears
>   the same sheet plus `reference/patch/v2/subpages.css`, assembled by the
>   build into `/assets/numinous-subpages.css`.
> * **The design's own bytes.** The stylesheet rides in the kit
>   (`reference/patch/clean/public/assets/numinous-clean.css`). The art and
>   the five self-hosted fonts are too heavy for a kit that travels as text, so
>   the build reads them out of the client's own index bundle
>   (`assets/bg_hero.jpg`, `assets/logo_alpha.webp`, `assets/numinary.jpg`,
>   `fonts/*.woff2`), verifies each against pinned sizes and checksums, caches
>   them beside the clean source and stages them into `dist/client/`. The
>   bundle link lives in `vite.config.js` (`DESIGN_BUNDLE`); a local path or a
>   different URL can be passed as `NUMINOUS_DESIGN_BUNDLE` for a hand build.
>   If the bundle cannot be read, the build fails loudly — it never publishes a
>   house without its art and type.
> * **The routed shell** is written by `vite.config.js` itself (chrome, font
>   preloads, design links), so it no longer depends on the repo's
>   `index.html` — a stale shell on `main` cannot leak old chrome or the old
>   stylesheet into a gate page.
> * **Retired and deleted in the same commit as this kit:**
>   `reference/merged/theme.css`, `reference/patch/v2/house.css`, the old
>   pulled home (`reference/web-version/src/home.html`) and `src/styles.css`.
>   The build reads none of them any more: the design comes from
>   `numinous-clean.css`, and the routed pages' sheet is `v2/subpages.css`.
>   `index.html` — the Vite entry — still links `src/styles.css` until its own
>   line is refreshed, so `vite.config.js` writes an empty stand-in for that one
>   file when it is missing. Nothing in the site reads it.
> * **Also removed in the same commit:** the retired menu drawer and the cart
>   drawer wiring in `src/site.js` (the design has no cart; Whop takes the
>   offering), the old-home transforms and old stylesheet literals in the three
>   `reference/patch/*.mjs` modules, and the home-slim pass.

This folder is the whole of the v2 overhaul. It is read at build time by
`vite.config.js`'s overhaul loader (every `reference/patch/*.mjs` is loaded in
alphabetical order, so `overhaul-v2.mjs` loads **after** `overhaul-home.mjs` and
`overhaul-site.mjs` and has the last word).

## The files

| File | What it is |
|---|---|
| `../overhaul-v2.mjs` | The orchestrator. Rewrites the shell's pages and the refund record, appends the design layer, rewrites the home's copy, teaches the host's 404 the house voice, and emits the checkout insurance rules. |
| `v2/site-pages.js` | The shell's pages, rewritten in one block — spliced into `src/site.js` in place of everything from `const works = [` to `const routes = {`. Same names, same contracts. Adds the `/checkout` route and its page. |
| `v2/subpages.css` (was `v2/house.css`) | The subpage layer. Appended last on every document (routed pages and the home), so it wins every tie against the home theme, the bridge and the three older polish layers. |
| `../../vite.config.js` | The build itself. Since RUN 7 it is part of the kit: the merge guard no longer requires the home's Herald form (the fourth work card replaces it), and the Herald hand-off script rides along only while the form exists. The bootstrap workflow already `git add`s this file. |

No edit to `overhaul-home.mjs` or `overhaul-site.mjs`, no new dependency.

**Ship set: five files** — `reference/patch/overhaul-v2.mjs`,
`reference/patch/v2/house.css`, `reference/patch/v2/site-pages.js`,
`reference/patch/v2/README.md` and `vite.config.js`, carried as
`push-ready/overhaul-kit-canon.zip`. The module's header carries the essentials
in-place; this file is the long form.

## The canon copy pass (RUN 8, 2026-10-12)

One brief: the house says **four gates**, never three; the Watcher's promise is
**7 days free, then $28 every 28 days**; the cookie bar says one plain sentence;
the Herald is a **free app, its own gate**, not The Signal by another name. No
route, price, plan id, checkout target, font or piece of art changed; Codex,
Collector's, The Vault and Premium stay retired.

| Where | What changed |
|---|---|
| the shell's four gate pages | Signal: "Free forever. No card, no renewal. Every realm drops here 24 hours before the feed. Inside: Dispatches and The First Vision, a ten-page gift." · Watcher: "7 days free, then $28 every 28 days, or $280 a year." · Vault: "Fifteen wallpapers, each in phone, portrait, and desktop." / "$12 once. Final once opened." · Herald: "The next realm, delivered first." + "A free app. Not The Signal." |
| the trust chips | `v2Trust(extra, chips)` — Signal and Herald carry **Free forever · No card**; the Watcher pages keep Free to start · Seven-night guarantee · Cancel any moon. "No card needed" is gone. |
| `/collections/all` | "Four gates. Start at the free gate"; the stat band reads 4 / Gates, 28 / Day cycles, 7 / Night Watcher trial, 15 / Beings named; every card numbered I/IV to IV/IV. |
| `/order-complete` | "THE HOUSE KEEPS FOUR GATES" and the four-gate line; the Herald hold/step rows say **its own gate — never The Signal**. |
| `/refunds` | The scope sentence gains "The Signal and the Herald app have nothing to refund."; section II is the Watcher's canon: first seven nights free, the first payment returns on a write within seven nights, then the cycle is final, cancel any moon. The other sections are untouched. |
| the shell's cookie card | "This site remembers Accept or Decline in your browser. Details in the cookie policy." Nothing about pixels in the bar (the `/cookies` record keeps its own Whop-pixel prose). |
| the home (build layer only) | Works chapter: CHAPTER I · FOUR GATES, the four-gate line, stat band 4 GATES / 28 DAY CYCLES / 7 NIGHT WATCHER TRIAL / 15 BEINGS NAMED, numerals I/IV–IV/IV, the cycle line FOUR WEEKS, the pact paragraph without "Your card is charged when you join.", the hero's offer line at 7 days free then $28, the trust line "Four gates · fifteen beings", the Herald newsletter block deleted, the fourth card **HERALD APP** added, the cookie bar's words and its fixed positioning deleted, the foot naming all four gates. `reference/web-version/` is never edited: every one of these is a rewrite applied as the build runs. |
| the shell's Herald-free home | the build guard now proves `id="velaris"` **+** `class="works-grid"`, and the Herald hand-off script is only appended while `id="heraldForm"` still exists. On the home it no longer does, so the script is not written at all. |
| the works grid | THE WORKS was built for three plates. `@media (min-width: 761px)` gives `#works .works-grid` two equal columns and every card `grid-column: auto` — the four gates sit **two by two** on desktop, and below 761px the single-file column stands untouched. |

**Verification (all after the change, on the built tree).** `npm run build` →
EXIT 0, no anchor warnings, 13 routed pages, 62 files packed. A home+bundle
string audit: 30 canon strings present, 14 offenders absent (`Three works`,
`FOUR MOONS`, `by another name`, `charged when you join`, `Numinous Vault`,
`No card needed`, `id="herald"`, the fixed cookie rule, the ×4 marquee stamp…).
`node render-check.mjs` — the repo's own harness, which bundles `src/site.js`
and `src/records.js` through every module's `source()` hook and renders **20
page/parameter cases** in a DOM stub — **59/59** assertions pass. A
comment-aware cascade checker over both document types at 1440 and 390 px:
**32/32**, plus a nonsense-selector control that must stay empty, and the works
grid's four widths (1440 / 1024 / 800 / 761 → two columns; 760 / 390 → one).

**Known and deliberate.** The dead Herald handler still rides inside the
externalised `numinous-home-4.js` — it is guarded by `if (hf)` and the form no
longer exists, so it never binds; removing it would mean a further home rewrite
for no visible gain. The home's hero chip reads "Four gates · fifteen beings"
(the run's own canon table), and the threshold page still prices the Watcher as
"$28 per 28-day cycle" with the seven-night guarantee beside it — both are in
the compare-notes rather than changed under a scope decision.

## Verification recorded for this build

`npm run build` → EXIT 0, 13 routed pages, `[numinous v2]` log lines for the
insurance rules and the threshold title. A DOM-stub harness re-ran the two
`source()` hooks over `src/site.js` and rendered **25 page/parameter cases**
(every gate, every record, the threshold for each of the five plan ids, an
unknown id, and the four order-complete variants) — all correct, titles and
canonical checkout targets checked row by row. A link sweep over the shipped
tree (65 links: href/src/poster, internal routes against the 13-route list,
assets against `dist/client`) reported **0 problems**; the only external hosts
are `whop.com`, the house domain, the Whop asset host and fonts.

## The fix that followed the first run (2026-10-12)

The first run of this kit wrapped each gate page in `<section class="gate">`.
The bridge (`reference/merged/theme.css`) styles `.gate` as a two-column grid
with its own padding, and the original shell used a plain `<section>` around the
inner `<div class="wrap gate">`. Carrying `gate` on both levels made the grid
apply twice: the section put its only child into the first of two columns, and
the inner div then split that column again — so the Signal, Watcher, Herald and
Vault gates and the Works page rendered in the left quarter of the page, with
the art shrunk beside them and three quarters of the page empty.

Fix: `<section class="gate">` → `<section>` in the five pages of
`v2/site-pages.js`, restoring the geometry the shell was designed around
(`#main > section:first-child` carries the nav clearance; the inner `.wrap
gate` div carries the two columns and the padding).

The same run also stopped a second, older home from appearing at `/`. Clicking
the brand or a "Home" crumb inside a routed page used to be intercepted by the
shell's router, which rendered its own `home()` template — a page with the same
address but different copy and layout from the storefront home document. The
router now lets "/" load as a document:

    if ((url.pathname.replace(/\/$/, "") || "/") === "/") return;

## The home hero's grid (second fix, 2026-10-12)

The home hero is a **two-column grid** whose rows the polish layer assigns one
by one: kicker row 1, title row 2, tagline row 3, description row 4, buttons row
5, and the sigil in column 2 spanning rows 1–5. `homeSource()` replaces the
hero's inner markup and adds two lines the home theme never knew about — the
price (`.hero-value`) and the trust strip (`.v2-trust`) — but gave them no row
of their own. The grid's auto-placement therefore dropped both into the first
free cells *below* the buttons, in the text column: the price rendered under
the actions it was written to precede, and the strip wrapped inside a narrow
column instead of reading as a line of its own.

Fix, in `v2/house.css` (the layer that loads last, so it wins these ties):

| Element | Desktop (>760px) | Mobile (≤760px, one column) |
|---|---|---|
| `.hero-value` (the price) | column 1, row **5** | row 6 |
| `.hero-cta` (the buttons) | column 1, row **6** | row 7 |
| `.hero-sigil` (the art) | column 2, rows **1–6** | row 1 (unchanged) |
| `.v2-trust` (the strip) | columns **1–2**, row **7** | row 8 |

So the hero now reads in the order it was written — kicker · title · tagline ·
description · price · buttons · trust — with the art centred against the whole
text stack and the trust strip spanning the hero's full width (one line at
≥1024px, two below, one fact per line on a phone).

Verified with a cascade-and-grid resolver run over the built
`numinous-home.css` at 1440 / 1280 / 900 / 390 px: the price sits **above** the
buttons at every width, the strip spans both columns wherever there are two,
and no two items share a grid cell. Before the fix the same resolver placed the
price in row 6 under the row-5 buttons, in column 1 only.

## The no-overlay pass (third fix, 2026-10-12)

The brief: no overlay on type, surgical CSS, nothing about the catalog, prices,
product routes or body copy, and no change to the live URL or the offer list.

| Item | What was there | What it is now |
|---|---|---|
| the bottom action bar | markup spliced into the home (`HOME_BAR`), a bar **created by JS** on every routed page, a scroll script setting `data-show`, a CSS block, and the `numinous-bar-off` key | all five deleted. One line stays as the switch that keeps it gone: `#v2sticky, .v2-sticky { display: none !important; }` |
| the cookie notice | the home already rendered its aside in-flow (a later block overrode the fixed rule); routed pages kept the shell's card pinned bottom-left at `z-index:2300` by `theme.css` | the home keeps its in-flow aside, pinned down by the `#cookiebar` block; the shell's card is `position: static`, full width, and the runtime **moves it directly under the hero**, following the router as pages change (a guarded `MutationObserver`, so it re-places without looping) |
| `.card h3` | `letter-spacing: .16em` (theme: `.2em`), title written `WALLPAPER&nbsp;VAULT` | `.08em`, `line-height: 1.2`, `overflow-wrap: anywhere`, normal space — the title wraps instead of running past the card |
| `#herald h2` | the clip came from **`.herald-box{overflow:hidden}`** plus `#herald h2{max-width:14ch}` with `.g{display:inline-block}`: an inline-block cannot wrap, so "DELIVERED FIRST." overflowed a 14ch box and the box cut it. `overflow:visible` on the heading alone could never beat the parent's clip | `.herald-box{overflow:visible}`, the heading's cap removed, `letter-spacing:.08em`, and the gold span allowed to wrap when a phone is too narrow to hold it |
| the guarantee / price boxes | dark plate, gold `<strong>`, body text inheriting whatever sat above it | `.guarantee-card, .guarantee-card p, .guarantee-card li { color: var(--bone) }`, `strong { color: var(--gold-hi) }` |
| the marquee | the pulled home stamped its single phrase **×4** at runtime (`home.html:2315`, `mq.innerHTML` four times) | stamped **×2** — what a seamless `-50%` loop actually needs — and the design layer halves the animation duration (52s → 26s) so the drift keeps exactly the pace it had |

**One correction to the first diagnosis.** The home and the shell do **not** use
different cookie keys: `vite.config.js` already rewrites the pulled home's
`numinous-consent` to the house key (`numinous-record`) before the page ships,
and the overhaul's `home()` hook runs before that pass. A choice made on either
surface has always silenced the other. The unification was written, seen in the
built script as a duplicated key, and reverted — the requirement is met by the
build, and no code was needed for it.

**Verification.** A comment-aware, at-rule-aware cascade checker over both
document types — the home (one stylesheet) and a routed page (four, in link
order) — at 1440 and 390 px: 10 rules × 2 widths × 2 documents, **20/20**, each
one winning from the last layer (`v2/house.css`, which rides at the end of the
home's stylesheet and at the end of `numinous-polish.css` on routed pages).
Strings in the built tree: no `v2sticky`, `v2-sticky`, `data-show` or
`numinous-bar-off` anywhere but the single switch; the marquee line is ×2; the
card title carries a normal space.

## How the host actually routes (read this before touching the threshold)

- Whop serves **exact file paths**. Every routed page is its own document at
  `<route>/index.html`. A clean route URL (`/products/the-numinary-3e`) is
  answered with the storefront **home**, whose head carries
  `/assets/numinous-gate-boot.js`; that boot forwards the clean path to
  `<route>/index.html`, keeping query and hash.
- `_redirects` in the asset directory is **inert** on this host. It is written
  as insurance only — never rely on it.
- The older checkout family (`/checkout/plan_PQnMYNixMTjRQ`, `/checkout/ch_…`)
  is therefore answered with the home too. `overhaul-v2.mjs` injects a small
  forward as the **first script in the home's head**: a path under that family
  is sent to `/checkout/index.html` with the original query, plus
  `?from=<the old path>` so the page can name the link it replaced.
- `/checkout`, `/checkout/` and the whole family resolve to the **threshold
  page** (`checkoutPage()` in `v2/site-pages.js`): what is being bought, the
  price, the seven nights where they apply, and the canonical
  `https://whop.com/checkout/…` button for that plan. An id the house does not
  know shows the "this gate has grown old" page with every open gate below.
- The house's own 404 (unknown paths, served as the home) is rewritten to the
  same design language, and its known-path list now includes `/checkout`.

## What v2 changes, page by page

- **Every page** wears the veil (once per session, skippable, absent under
  `prefers-reduced-motion`), the chapter rhythm (numeral + kicker + title + gold
  rule), the plate language for cards/panels/art, 44px targets, a visible gold
  focus ring, and the house's type tokens.
- **Home**: new hero (sigil, kicker, title, tag, one-line value, one primary
  action, the trust line), the Watcher chapter now carries the seven-night
  guarantee beside the price and offers the **annual seat** (`plan_Imfk0oedwYn7v`),
  the Vault card opens at its own gate, plus a persistent action that appears
  once the hero is behind the reader.
- **Gates**: hero with price + guarantee + trust, briefing films, marquee, stat
  band, the room chapters, the pact, the FAQ band. The Watcher gate carries both
  the moon and the year.
- **`/collections/all`**: chapter rhythm, cards, marquee, stats, pact.
- **Records** (`/returns`, `/terms`, `/privacy`, `/refunds`, `/eula`, `/cookies`):
  full cinematic treatment — stamped header with numeral and gold rule, a
  drop-cap first paragraph, gold-ruled headings, the house footer band. The
  record text itself is untouched (it lives in `src/records.js`).
- **`/order-complete`**: the library moment is the page's first action (with the
  briefing film), what you hold and what to do next are chapters, the seven
  nights appear for the Watcher, support is one write-away, and the page is
  deliberately **the one page with no veil** — a buyer who has just paid should
  see their next step immediately.

## After the run — a five-minute check on the live site

1. `/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ:1` →
   the Watcher threshold (price, guarantee, "Continue on Whop").
2. `/checkout` → the threshold; `/checkout/plan_GONE` → "This gate has grown old".
3. `/products/the-numinary-3e` → both the monthly and the annual buttons.
4. Any unknown path (e.g. `/nope`) → the v2 404 block.
5. `/order-complete?plan=plan_Aew5DdipP3fKY&work=vault` → the Vault variant,
   no veil, library button first.
6. The canon, in five glances: the home's works chapter reads **CHAPTER I ·
   FOUR GATES** with four cards numbered I/IV to IV/IV (the fourth is **HERALD
   APP**, linking to its own gate); the stat band reads 4 GATES / 28 DAY CYCLES /
   7 NIGHT WATCHER TRIAL / 15 BEINGS NAMED; the cookie bar under the hero says
   "This site remembers Accept or Decline in your browser."; the Watcher's gate
   and footer say **7 days free, then $28 every 28 days**; `/refunds` opens with
   "The Signal and the Herald app have nothing to refund."

## The social card

`banner.png` is 1,179,923 B on the live site — over the house's own <300 KB
target, and re-encoding it needs a dependency outside the kit boundary. This run
points **both** `og:image` and `twitter:image` at `/assets/watcher.jpg`
(206 KB, the Watcher art) instead. The banner is then referenced by nothing;
`dist/client/banner.png` remains staged but unused. The pulled home declares no
`og:image:width` / `og:image:height`, so nothing else has to agree with the swap.

## Deleting the retired files (a click in the GitHub web UI, not a run)

A kit run only adds and overwrites files; a deletion needs a commit of its own.
The list, safest first:

| File | Bytes | Verdict |
|---|---|---|
| `reference/gate-pages.raw.html` | 14,944 | **Delete.** A trace dump from an earlier pass, referenced by nothing. |
| `reference/merged/polish.css` | 5,002 | Retired by the v2 layer (which loads after it and wins every tie). Safe to delete; confirm the look once on the live site first. |
| `reference/merged/polish-shell.css` | 2,517 | Same. |
| `reference/merged/polish-home.css` | 3,413 | Same. |
| `reference/merged/theme.css` | 20,145 | **Keep.** It is a *hard* build input (read with `readFileSync` as the bridge that maps the shell's classes onto the home's): deleting it fails the build until the same commit also edits `vite.config.js`. |

The three polish layers are optional inputs (`readIf`), so the build is
unaffected by their absence — only the rendering changes if any rule in them was
not restated in `v2/house.css`. Nothing else is required.

## Deliberately not in this run

- **Lighthouse and the 360px device pass** — no browser in the build sandbox.

## RUN 11 · the deep checkouts for Signal and the Watcher

**The two ends are no longer generic.** The pre-checkout page (the threshold)
now branches: the gates that carry a `film` get the whole funnel, the rest keep
the card. The post-checkout page now recommends in every direction.

**The films were never missing.** `main` carries the real MP4s in the exact
paths the build stages from — `signal-briefing-1440` 5,891,190 · `signal-invite-1440`
3,072,461 · `watcher-briefing-1440` 6,064,532 · `watcher-invite-1440` 2,863,991
bytes. This sandbox's checkout carries 128-byte placeholders (the repo prunes
large binaries locally), so a *local* preview shows the art where the film will
be; CI builds the real files. Nothing needs re-uploading, and the kit must
never contain `reference/web-version/public/**` — that is what keeps the real
films on main.

**Pre-checkout, per gate.**
* Signal — the invitation film over its art, the full canon: free forever, no
  card, the six chambers named (The Signal, The Realm, The Process, The Records,
  The Session, Field Journal), the ten-page First Vision, Dispatches 24 hours
  before the feed, then the bridge to the Watcher.
* Watcher — the invitation film, the trial in canon words ("7 days free, then
  $28 every 28 days"), **monthly and annual as two real buttons of equal
  weight**, the guarantee, the four weeks, the pact panel and the FAQ.
* Vault, Herald, the annual gate — unchanged card.

**Post-checkout, per gate.** `nextGates` suggests two gates per purchase, always
to the gate page and never straight at a card form: Signal → Watcher + Herald ·
Watcher → Vault + Herald (plus the quiet annual line, monthly buyers only) ·
Vault → Watcher + Signal · Herald → Signal + Watcher. The old "THE HOUSE KEEPS
FOUR GATES" block is replaced by "SUGGESTED NEXT"; the four-gate sentence lives
on as the section's sub-line.

**The Signal's routing (this run's answer).** The free gate now runs *through*
the house's own pre-checkout page: the Signal's gate-page button and all five of
the home's own Signal links point at `/checkout/ch_wYXFulML0v6LIoJ`, which the
gate boot forwards to the deep threshold — film, six chambers, no-card promise —
and only then does the page hand to Whop. The paid gates are untouched: Watcher,
the annual seat, the Vault and the Herald still go straight to Whop's checkout.
The merge guard was re-scoped to its real intent in the same edit: it now refuses
any surviving `https://…whop.site/checkout/…` link (an internal `/checkout/…`
path is the funnel working as designed, not a leak).

**The dashboard names the purchase (set on Whop, not installed by the kit).**
The return URL for each product carries the gate by name —
`https://jointhenuminouses.whop.site/order-complete?gate=signal` and
`…?gate=watcher` — and the post-checkout page already reads `?gate=` ahead of
the plan stamp and the on-the-way-out stamp, so the gate is known even if Whop
hands nothing else back. Two new `render-check` fixtures plus eight assertions
prove `?gate=` alone is enough (76 checks, 0 fail).

**The home's last two acts, worked out.** The pact was one sentence and a
link; it is now the close: the guarantee in its own words, then a panel stating
each gate's terms — The Signal free forever, The Watcher with its seven nights
and its cancel any moon, The Wallpaper Vault final once opened — then the door
to the seat, the seven nights and the refund policy, then the line that card
details never sit on this site. The questions are new: **all seven canon
answers** the gate pages carry (free Signal · what is inside The Watcher · why
$28 a moon · the seven nights · how to cancel · any screen · commercial use),
in one bezel with a gold rule between and a plus that closes into a minus. The
nav carries both: *The works · The Watcher · The questions · The pact*, on the
desktop row and in the mobile menu.

**The home's own sheet.** The home is the design's own document: it carries
`numinous-clean.css` and the motion sheet and **none** of the subpage sheet —
linking that one would re-dress 45 selectors the design already owns (the
footer, the kickers, the works grid, the cookie). So the two new acts dress in
`reference/patch/v2/home-acts.css`, staged to `/assets/numinous-home-acts.css`
and linked by `mergeHome` before the motion sheet, in the design's own language
(the gold rule, the bezel, the ink panel). `mergeHome` also refuses to publish
a home that lost its answers or its pact terms, or that opened without its own
sheet — the same style of guard as the four gates.

**One set of answers, every door.** The gates' blocks carried five of the
seven; they now carry all seven, and the free gate's front door gained a
questions band of its own (the Signal's deep threshold now closes on the
questions too, so the door the home's Signal buttons open meets the same seven
answers as the seat's). The home's first answer — *Is The Signal truly free?* —
stands open when the section arrives; the other six wait closed.

**One door for every gate.** Every button that used to hand the buyer
straight to Whop — the home's four Watcher links, two Vault links and two
Herald links, the Watcher gate page's two, the Vault's and the Herald's own,
the seven nights page's one, and the yearly upgrade on the page after
purchase — now opens the house's own pre-checkout page first
(`/checkout/ch_wYXFulML0v6LIoJ`, `/checkout/plan_PQnMYNixMTjRQ`,
`/checkout/plan_Imfk0oedwYn7v`, `/checkout/plan_Aew5DdipP3fKY`,
`/checkout/plan_hIKLCR4hGiv9B`). The home now hands nobody to Whop at all: the
pre-checkout pages' own buttons are the only whop.com links left, because that
is where Whop begins. Each is named for its gate and carries the return hint
(`redirect_url=…/order-complete?gate=…`), and the gate is stamped in the tab
from the very first click. Two guards hold the line: the home merge fails if
any direct whop.com checkout survives or a door is missing, and the house merge
fails if a page's source re-points a gate button at Whop.

**The door, one gate at a time (kept for the record).** Every button that used to hand
the buyer straight to Whop for these two gates — the home's four Watcher
links, the Watcher gate page's two, the seven nights page's one, and the
yearly upgrade on the page after purchase — now opens the house's own
pre-checkout page first (`/checkout/ch_wYXFulML0v6LIoJ`,
`/checkout/plan_PQnMYNixMTjRQ`, `/checkout/plan_Imfk0oedwYn7v`). The
pre-checkout pages' own buttons are the only whop.com links to these gates that
remain, because that is where Whop begins: each is named for its gate and
carries the return hint (`redirect_url=…/order-complete?gate=…`), and the gate
is stamped in the tab from the very first click. Two guards hold the line: the
home merge fails if a direct link to either gate survives or a door is missing,
and the house merge fails if a page's source re-points a Watcher button at
Whop. **The return, integrated on this side.** Whop hands the buyer back with
`?status=success` — or `failed` — but not always *to our page*: the dashboard
redirect may not be set yet, and a plain product link can drop the query. So
both copies of the house boot — the sync one the home carries, and the layer's
on every routed page — now read the hand-back and put the buyer on their own
page: a gate named by `?gate=`/`?work=`, a plan or ch id in the address, or a
bare success with the stamp this tab left on the way out; a failure keeps its
`?status=` so the page can offer the retry. An ordinary visit is never moved,
the threshold and the post-checkout page are never bounced, and the decision is
written to `window.__numinousReturnTo` before the browser moves — so the live
site, the checks and a debugger can all read what was decided. Fifteen checks
cover the shapes.

**What the API cannot do (checked against the SDK, not guessed).** The public
API will not set the redirect on anything that already exists: checkout
configurations are list / create / retrieve / delete with no update, and
neither `plans.update` nor `products.update` carries a redirect field (only
`products.create` does, as `redirect_purchase_url`). So the two dashboard
redirects remain a dashboard act — the site side is now the guarantee that the
buyer still lands on their own page, with the link-level `redirect_url` as the
first attempt.

**The answers move.** A ninth part in the layer, `questions()`: when a
`details` opens, the answer rises into place — opacity and transform only, never
a height the browser has to re-measure, and never anything that could hold the
summary's own tap. It serves the home's questions and the gate pages' own
`details` blocks alike. `.faq-home__list` and `.pact__terms` joined the stagger
groups, their items joined the revealed pieces, and the pact's seal now breathes
with the rest of the art.

**Two flaws found and fixed while verifying.**
* The vendored Motion bundle was built with `--format=esm`, which ends in
  `export { Un as animate, … }` — an alias to a minified local that creates no
  binding named `animate`. Every `animate`/`inView`/`scroll`/`stagger` call in
  the layer was a `ReferenceError`, swallowed by the guards: the links worked,
  the motion silently did not. The vendor is now `--format=iife` with
  `--global-name=__numinousMotionVendor` and the layer binds from that object;
  a missing engine now means a still page, never a broken one.
* Hiding a video that cannot decode also hides its `poster` attribute, leaving a
  black panel. The invitation panel now carries the art in the flow with the
  film over it (the same shape the unlock strip already used), so a missing film
  leaves the art.

**Hardening in the same pass.** Each motion subsystem and each element inside
the loops (wallpapers, films) stands alone: a browser whose scroll maths or
video calls misbehave loses that piece of weather and nothing else.

**Verification.** `render-check.mjs` 69 assertions, plus three jsdom suites run
against the built bundle and the built home — funnel 24, home 11, deep 40 — with
0 failures: the deep pages and their films, the equal-weight buttons, the canon
copy, the wiring on every checkout link, the suggestions per gate, the film
lifecycle (muted, looped, preloading only in view), the broken-film fallback,
and the reduced-motion path.

**Weights.** The assembled layer is 80,581 bytes raw · 29,420 bytes gzip (the
Motion engine inside it: 63,241 raw · 23,500 gzip). The app bundle is unchanged.


## RUN 10 · the motion layer and the wired funnel

**What this run adds.** The pre- and post-checkout pages are rebuilt in the
store's own language, and the whole site moves. Two new sources and one new
build output carry it:

| File | Bytes | What it is |
| --- | --- | --- |
| `reference/vendor/motion/motion.mjs` | 62,748 | Motion 14.1.0, pre-bundled to the four calls the layer uses (`animate`, `inView`, `scroll`, `stagger`). MIT, licence and provenance beside it. |
| `reference/patch/v2/motion-layer.js` | — | The house layer: reveals, entrance, wallpaper drift and parallax, counters, magnetic gold buttons, in-view films, and the checkout-link wiring. |
| `reference/patch/v2/motion.css` | 3,352 | The measured half — the hero's pseudo-element drift, the light that crosses a gold button, the unlock strip's frame. |

**Why motion is its own script.** The home is the bundle's own document: it
runs the design's script and never loads the app bundle, so a motion pass
inside `src/site.js` could never reach it. The engine therefore assembles
`assets/numinous-motion.js` (Motion + the layer, 78,149 B raw · 25,868 B gzip)
and `assets/numinous-motion.css` at build time, and **every** document loads
both. The app bundle calls `window.__numinousMotion?.boot(main)` after each
render, so the layer re-boots per route and always stops what came before.

**Why the motion CSS is not part of `subpages.css`.** That sheet speaks to
shells the home does not have (`.works` grid, `.steps`, `.v2-*`). The home gets
the motion rules and nothing else; the routed pages link both sheets. The
home's head was corrected in this run — `mergeHome` was being called with two
arguments, so the polish parameter was always empty and the home carried no
house sheet at all.

**The wiring, in one place.** `motion-layer.js` decorates every
`whop.com/checkout/` link it finds — on the home and on every routed page —
with the gate it belongs to and an absolute, https `redirect_url` pointing at
`/order-complete?gate=<key>`, and stamps the same key in `sessionStorage` on
click, in the capture phase, so the stamp always lands before the browser
follows the link. The threshold after the offering reads the gate back in that
order of certainty: `?gate=` → the stamp → the plan/ch id in the URL.

**The two ends.**

* `/checkout/…` (the threshold): the old "You followed an older checkout link"
  note is retired for real links — it becomes a trust line ("Taken on Whop's
  own checkout — card details never sit on this site…"). The sentence survives
  only where it belongs, on the grown-old page a dead link lands on.
* `/order-complete`: confirm → the rooms and files → the first steps → **the
  unlock strip** (the buyer's own art, their briefing film playing muted in
  view, what the gate gives them) → a quiet annual line, shown **only** to
  monthly Watcher buyers (`plan_Imfk0oedwYn7v`, `data-gate="watcher-annual"`;
  an annual buyer never sees the upsell) → the four gates → the works.
  The hero's old film figure is gone: the film lives in the strip now, once.

**Verification, run in jsdom against the built bundle and the built home:**
24 funnel checks and 11 home checks, 0 failures — threshold card and trust
line, the grown-old page, the strip and its film, the annual line present for
a monthly Watcher and absent for the annual and vault buyers, the held page,
the combined page, all 12 home checkout links decorated with the right gate and
an absolute return path, and the stamp written on click.

**Still manual, by design:** Whop's own dashboard can carry a
`redirect_url`/`redirect_purchase_url` per product. The link-level
`redirect_url` above works the moment Whop honours one; until an actual
purchase has walked through it, the stamp is what guarantees the page still
knows which gate was taken. A `$0` Signal checkout is the cheapest way to
confirm which of the two lands.

