# Numinous · House v2 — one design language, every page

This folder is the whole of the v2 overhaul. It is read at build time by
`vite.config.js`'s overhaul loader (every `reference/patch/*.mjs` is loaded in
alphabetical order, so `overhaul-v2.mjs` loads **after** `overhaul-home.mjs` and
`overhaul-site.mjs` and has the last word).

## The three files

| File | What it is |
|---|---|
| `../overhaul-v2.mjs` | The orchestrator. Rewrites the shell's pages, appends the design layer, reworks the home's hero and Watcher chapter, teaches the host's 404 the house voice, and emits the checkout insurance rules. |
| `v2/site-pages.js` | The shell's pages, rewritten in one block — spliced into `src/site.js` in place of everything from `const works = [` to `const routes = {`. Same names, same contracts. Adds the `/checkout` route and its page. |
| `v2/house.css` | The design layer. Appended last on every document (routed pages and the home), so it wins every tie against the home theme, the bridge and the three older polish layers. |

Nothing else is required: no edit to `vite.config.js`, no edit to
`overhaul-home.mjs` or `overhaul-site.mjs`, no new dependency.

**Ship set: three files.** The run's payload is exactly
`reference/patch/overhaul-v2.mjs`, `reference/patch/v2/house.css` and
`reference/patch/v2/site-pages.js` (kit `overhaul-kit-v2-house.zip`, 24,346 B,
MD5 `73f03b7822063c79659b878440b136e4`). This README stays in the repo and in
the chat: three files is the smallest kit the bootstrap handles reliably, and
the module's header carries the essentials in-place. Everything in this README
that the *operator* needs lives in that header; this file is the long form.

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
