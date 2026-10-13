# Numinous — session handoff

## Status: COMPLETE — the merge is live and verified (2026-10-11 ~07:43Z)

Live site: **https://jointhenuminouses.whop.site** — build **`apbu_ewEt5fcR4bXIn`**
(deploy #19 `runs/38122148823`, auto-fired by bootstrap #8 `runs/38122131272`).

Main tip: **`df71ee8`** — "Site: checkouts-only storefront; point whop.app.json at the
website app" — `src/site.js`, +14/−1: the `/index.html` strip in `currentPath()` and the
`replaceState` canonicalization in `render()`. (Its `vite.config.js` half shipped earlier in
`373a980`.) That was the last missing piece.

### Verified live (microlink real-browser probes, all `200`, `redirects: []`)

| URL | Rendered page (title) |
| --- | --- |
| `/` | NUMINOUS · The Realms, Opened (the merged home) |
| `/products/the-signal-e6` | The Signal · Numinous |
| `/products/the-numinary-3e` | Watcher · Numinous |
| `/products/herald-app` | Herald app · Numinous |
| `/products/wallpaper-vault` | Wallpaper Vault · Numinous |
| `/collections/all` | The Works · Numinous |
| `/returns` | Seven Nights · Numinous |
| `/terms` | Terms · Numinous |
| `/privacy` | Privacy · Numinous |
| `/cookies` | Cookies · Numinous |

Films: `/assets/briefing/films/signal-briefing-1440.mp4` → `video/mp4`, 5,891,190 B and
`watcher-briefing-1440.mp4` → `video/mp4`, 6,064,532 B (both `200`, `accept-ranges: bytes`,
immutable). Wired by `briefingFilms()` on the Signal and Watcher gate pages
(`src/site.js` lines ~322 and ~370).

## How routing works on this host (do not re-derive)

- Whop serves **exact file paths only**; every other navigation falls back to the SPA
  `/index.html` (the home). `_redirects` in the asset dir is **inert** here — keep it as
  harmless insurance, never rely on it. The worker is bypassed for navigations.
- The **gate boot** (`/assets/numinous-gate-boot.js`, injected into the home's `<head>` by
  `vite.config.js` `mergeHome`) forwards a clean gate path (and its trailing-slash form) to
  `<route>/index.html`, preserving query + hash. It is a no-op on `/`, on any `*/index.html`,
  and on unknown paths.
- The routed document runs the app: `currentPath()` strips `/index.html` + trailing slashes,
  `render()` `history.replaceState`s the address bar back to the clean route (query/hash kept),
  then renders the gate's own page with the house theme.

## Remaining chores (optional — none block the site)

1. **Rotate `WHOP_API_KEY`** (it was supplied into `.env`, gitignored; rotate now that
   deploy work is done).
2. **Delete the one-time workflows** when you no longer need them:
   `.github/workflows/bootstrap-site-files.yml` and `.github/workflows/pull-web-version.yml`.
3. **Whop dashboard (optional polish):** per-product pre-checkout redirect → the work's gate
   page; post-checkout → back to the site. Not built (dashboard-side, login-walled).
4. There is **no `/welcome` page** in this design (0 references) — the ref sitemap's 7 URLs
   are all covered by the 9 routes above.

## Kit packaging rule (if ever needed again)

Always pack with **real in-zip paths** — `zip -X -q -9 kit.zip src/site.js vite.config.js`.
**Never `zip -j`**: flattening put `site.js` at the repo root and the workflow's
`git add src/site.js` committed nothing (that was bootstrap #7's silent miss).
Verify with `unzip -l` before uploading.

## Repo

Local clone: branch `arena/9cc19a1f-numinous-website` (commits `9bfccaa`, `554ea15`, this one).
`push-ready/kit-v7.zip` = the final kit (`src/site.js`, md5 `14cf92631523d1e7cf5ce92895dc8768`).
Drive kit file `15jCm4YpR2wqZUKXLoOFu6XwDWVyqvs-1` holds it (version 17).
`reference/web-version/` in this clone is a synthetic fixture (regenerate with
`node /tmp/mergecheck/fixture.mjs` if it disappears).
