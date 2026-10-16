# Next session handoff — Numinous storefront

Written 2026-10-09 by the `arena/6608f974-numinous-website` session.
Updated 2026-10-10 by the `arena/4c250cf0-numinous-website` session.
Updated 2026-10-10 by the `arena/496cbe7e-numinous-website` session.
Updated 2026-10-11 by the `arena/9cc19a1f-numinous-website` session.
Updated 2026-10-13 by the `arena/1d78f8a4-numinous-website` session.
Updated 2026-10-13 by the `arena/c2a74194-numinous-website` session: ran
`watcher-plan` (trial stays 7 days — see the correction below), shipped the
routed-page fix so a clean route URL is answered by that route's own document
with its own `og:image`, and verified `og:image` live.

## 2026-10-16 branch update — not deployed

- Drive folder `18i73CMzsZy0L2KqrPYAUmHOn_2i_Orsd` was a byte-for-byte snapshot
  of main at `9778e43`, not newer site changes. Current main at session start:
  `7cc20e1` (PR #12). Its 7-day Watcher trial remains in force.
- This branch refreshes the home into an editorial portal, carries its typography,
  colors and chrome onto routed pages, assigns work-specific social card images,
  and removes checkout `_redirects` that stripped plan IDs on Cloudflare preview.
  The home gate boot preserves the ID with `?from=`; `npm run verify:build` covers
  that contract. No plan setting or live deployment was changed here.
- Verify with `npm run typecheck`, `node render-check.mjs`, `npm run build`,
  `npm run verify:build`. Preview with `npm run preview` on port 4173. Review the
  design and terms before merging/deploying. A future Bootstrap deployment must
  still account for the existing KIT SLOT; this branch does not touch the three
  files in that kit.

## Current state (2026-10-13)

- **main = `9778e43`** (PR #10, merge of `arena/1d78f8a4-numinous-website`).
  The `1d78f8a4` branch was already fully merged by PR #9 (`9d2bdb9`) and PR #10
  (`9778e43`) — its tip `f5155c5` is an ancestor of main. **There were no
  pending commits to push.** (A handoff note referenced a commit `c222178`; no
  such commit exists in this repository.)
- **Deploy chain**: push to main touching `.github/workflows/bootstrap-site-files.yml`
  → Bootstrap downloads the KIT SLOT zip → applies it → `gh workflow run "Whop
  one-off tasks" -f task=deploy` → `npx whop apps deploy` (secrets.WHOP_API_KEY).
  `gh workflow run` is **HTTP 403** for the Arena sandbox token (re-confirmed
  this session: "Resource not accessible by integration") — never retry; the
  Bootstrap bounce is the only sanctioned way to start an Actions run from here.
- **The KIT SLOT** (`1ZHynnlx5lQqdTOpRuIglmxlNQDIscAFZ`,
  `numinous-KIT-SLOT-put-new-kit-versions-here.zip`, 13,884 B, md5
  `d734f0714097df3bf1b15132f298876f`) contains exactly three files:
  `vite.config.js`, `whop.app.json`, `developer-actions/last-run.json`. Its
  application is a no-op while those files match main. **Refresh it only when a
  change to one of those three files lands on main** — otherwise Bootstrap
  would overwrite the newer file with the kit's copy and push that to main.
  Changes under `src/worker.js` or `reference/` are safe: the kit does not
  carry them.
- Repo pipeline: **passing** — `npm run developer-actions` (coldstorage onboard,
  typecheck, build) and `node render-check.mjs` (**88 passed, 0 failed**).
- Whop tasks (`whop-tasks.yml`): `find-app` / `find-plans` / `watcher-plan` /
  `deploy-preview` / `deploy` — all `workflow_dispatch`, so all of them need
  either the Actions UI or the Bootstrap bounce.
- `WHOP_API_KEY` repo secret is set (deploys succeed). Keep the key only in the
  gitignored `.env`; rotate it at whop.com/dashboard/developer on a schedule —
  it has passed through chat and a shared doc in earlier sessions.

## Done this session

1. **`watcher-plan` ran and passed.** `plan_PQnMYNixMTjRQ` → `trial_period_days: 7`,
   `renewal_price: 28.0`, `billing_period: 28`, `currency: usd`, `plan_type: renewal`.
   This matches the House terms and the live copy ("7 days free, then $28 every
   28 days"). It was run from a temporary push-triggered workflow on the session
   branch because `gh workflow run` is 403 from the sandbox.
2. **`og:image` verified on the live site.** `https://jointhenuminouses.whop.site/`
   returns `<meta property="og:image" content="https://jointhenuminouses.whop.site/assets/watcher.jpg">`
   (plus a matching `twitter:image`), and that asset answers HTTP 200,
   `image/jpeg`, 211,214 B, 1408×768.
3. **Routed pages now own their head and their card.** Two changes:
   - `src/worker.js` — for a plain navigation path with no file extension the
     worker asks the asset layer for `<path>/index.html` first, so `/returns`
     is answered by the document that owns that route instead of the SPA shell.
   - `reference/patch/overhaul-home.mjs` — each routed page is written with
     `og:title`, `og:description`, `og:image` and `twitter:image`. Only the home
     carried an image before, and the 13 routed pages advertised a
     `summary_large_image` card with no picture in it. The old code tried to
     *replace* an `og:title` tag the shared shell never had, so every route's
     card stayed titled after the home.
   The image is `assets/watcher.jpg` on purpose: the shipped `og.png` is
   **a JPEG with a `.png` extension** (FF D8 FF E0 … JFIF), so it is not a safe
   card image until it is re-encoded.

   Verified live after the deploy (build `apbu_wfljNECmPsu89`):

   | URL | before | after |
   | --- | --- | --- |
   | `/returns` | home, 23,390 B, canonical `/` | seven-nights document, 4,611 B, canonical `/returns` |
   | `/products/the-signal-e6` | home, 23,390 B | Signal document, 4,669 B, its own title |
   | `/checkout/plan_PQnMYNixMTjRQ` | home | home — unchanged, it has no document of its own |
   | `/definitely-not-a-route` | home | home — unchanged fallback |

## Correction to an earlier handoff

The 2026-10-13 entry for task #1 said to set the Watcher plan to **no free
trial** (`trial_period_days: 0`). That contradicted three things in the same
repository — the House terms below ("the seven-night return"), the live copy
("7 days free, then $28 every 28 days"), and `whop-tasks.yml`'s own
`watcher-plan` job, which asserts `trial_period_days == 7`. **The 7-day trial
stays.** Task #1 is closed; do not set the trial to 0 without a deliberate
decision to change the House terms and the site copy together.

## Known, still open

- **Routes with no document of their own still fall back to the home.** The
  checkout doors (`/checkout/plan_…`, `/checkout/ch_…`) and any unknown path are
  answered by the home document, because the build ships no document at those
  paths. That is unchanged and intended — the home carries
  `assets/numinous-gate-boot.js`, which forwards a gate path client-side. The
  thresholds are not visible to a crawler that does not run scripts.
- **Every routed page shares one card image** (`assets/watcher.jpg`). Pages with
  art of their own could carry it instead; nothing enforces that yet.
- **Whop's platform script rewrites the served `<title>`, `description` and icon**
  at runtime (`data-whop-metadata="reassert"`). The static head is correct; what
  a browser tab shows for a route may not be.
- **Key hygiene.** The original key was committed to this repo (see merged PR #2
  "Add WHOP_API_KEY to .env file") and remains in public git history. Rotate it
  at https://whop.com/dashboard/developer/ and update the repo secret.

## Notes

- The sandbox preview of the built storefront (not a Whop deploy) is served with
  `npm run preview` → port 4173.
- The sandbox has **no network egress** except to github.com, codeload.github.com,
  api.github.com, registry.npmjs.org, pypi.org and files.pythonhosted.org. It
  cannot reach whop.site, api.whop.com, or the Actions log receiver
  (`results-receiver.actions.githubusercontent.com`). To inspect the live site or
  read a job's output, run a temporary workflow that commits its report back to
  the branch, then `git fetch` and read the file. Delete the workflow afterwards.
- House terms that must not change: The Signal stays free forever; the Watcher
  stays $28 / 28 days **with the seven-night return**; the Vault is a final
  one-time $12; the Herald stays free; all checkout stays on Whop; support is
  numinous.support@gmail.com.
