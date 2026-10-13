# Next session handoff — Numinous storefront

Written 2026-10-09 by the `arena/6608f974-numinous-website` session.
Updated 2026-10-10 by the `arena/4c250cf0-numinous-website` session.
Updated 2026-10-10 by the `arena/496cbe7e-numinous-website` session: unpacked
`Numinous-website-main.zip` to the repo root (zip removed, `npm-publish`
workflow fixed to run `developer-actions` on Node 22 instead of the missing
`npm test`). Pipeline re-verified passing; preview serves on port 4173.
Updated 2026-10-11 by the `arena/9cc19a1f-numinous-website` session: wired the
project for Whop hosting on Cloudflare Workers — `@cloudflare/vite-plugin` +
`wrangler` added, `vite build` now emits `dist/client` (assets) and
`dist/server/index.js` (worker entry from `src/worker.js`), and `wrangler.jsonc`
names the worker `jointhenuminouses`. The `whop apps deploy` wiring check now
passes.
Updated 2026-10-13 by the `arena/1d78f8a4-numinous-website` session: **THE MERGE
SHIPPED.** PR #8 (funnel doors + offline build) merged as `f96fa6c`; the KIT
SLOT (`1ZHynnlx5lQqdTOpRuIglmxlNQDIscAFZ`) was updated to the verified no-op
ship kit (13,884 B, md5 `d734f0714097df3bf1b15132f298876f`, byte-identical to
main); this commit touches `bootstrap-site-files.yml` on main to fire Bootstrap,
which applies the kit (no-op) and dispatches `Whop one-off tasks > deploy`.

## Current state (2026-10-13)

- **main = `f96fa6c`** (PR #8): every gate enters through its pre-checkout door
  (`/checkout/<id>`), mergeHome fails the build if any `whop.com/checkout` URL
  survives in home, and the 8 pinned design files live in
  `reference/patch/clean/public/` so `vite build` works offline. Verified from a
  fresh clone: build exit 0, render-check 88/0.
- **Deploy chain**: push to main touching `.github/workflows/bootstrap-site-files.yml`
  → Bootstrap downloads the KIT SLOT zip → applies it → `gh workflow run "Whop
  one-off tasks" -f task=deploy` → `npx whop apps deploy` (secrets.WHOP_API_KEY).
  The slot now holds the no-op kit, so Bootstrap applies nothing and just chains
  the deploy. `gh workflow run` is 403 for the Arena sandbox token — never retry;
  this bounce is the sanctioned path.
- Repo pipeline: **passing** via `npm run developer-actions` (88/0). Whop tasks
  (`whop-tasks.yml`): `find-app` / `find-plans` / `watcher-plan` / `deploy-preview`
  / `deploy` — all `workflow_dispatch`.
- `WHOP_API_KEY` repo secret is set (deploys succeed). Keep the key only in the
  gitignored `.env`; **rotate it at whop.com/dashboard/developer after this
  deployment settles** (it was shared in chat by an earlier session).
- Watcher plan truth (whop-tasks.yml `watcher-plan` job asserts it): **7-day free
  trial, then $28 every 28 days** (renewal `28`, billing `28`, trial `7`,
  `plan_PQnMYNixMTjRQ`; annual `plan_Imfk0oedwYn7v`). Matches the master
  prompt's "seven nights on the house".

## Remaining tasks

The Account API calls below work from **any machine with internet access**, or —
once the `WHOP_API_KEY` secret exists — from the `whop-tasks.yml` workflow on
GitHub Actions (load the key with `set -a; . ./.env; set +a` locally).

1. **Set the Watcher plan** `plan_PQnMYNixMTjRQ` to **no free trial**, price
   **$28.00 USD**, interval **every 28 days** (per House terms it already advertises
   this — the change is to stop any trial on the plan).

   Actions tab → "Whop one-off tasks" → Run workflow → `watcher-plan`. Or locally:

   ```bash
   curl -X PATCH "https://api.whop.com/api/v5/plans/plan_PQnMYNixMTjRQ" \
     -H "Authorization: Bearer $WHOP_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"trial_period_days": 0, "renewal_price": "28.00", "billing_period": 28, "currency": "usd"}'
   ```

   Verify afterwards:

   ```bash
   curl -s "https://api.whop.com/api/v5/plans/plan_PQnMYNixMTjRQ" \
     -H "Authorization: Bearer $WHOP_API_KEY"
   ```

   (If the PATCH shape differs on your account, the same edits can be made from
   https://whop.com/dashboard/ → the Watcher product → Plans → Edit plan:
   set trial days to 0/None, renewal price $28.00, billing every 28 days.)

2. **Deploy the `jointhenuminouses` app.**

   `whop.app.json` carries the real `app_*` id (`app_vLveJBtRdgfLgz`) and the
   project is now wired for Cloudflare Workers hosting, so the CLI's wiring check
   passes. Actions tab → "Whop one-off tasks" → Run workflow → `deploy`. Or
   locally:

   ```bash
   npm ci
   whop auth login        # browser OAuth — needs an interactive machine
   whop apps deploy
   ```

   Deploy publishes the Whop build (`dist/whop-build.zip`, packed from
   `dist/client/` static assets plus the `dist/server/index.js` worker entry) to
   `https://jointhenuminouses.whop.site`.

3. **Key hygiene — done, then re-rotate after the tasks.**
   The original key was committed to this repo (in `.env`, then tracked, and in
   `.env.example`) and remains in public git history (see merged PR #2 "Add
   WHOP_API_KEY to .env file"). The 2026-10-09 session untracked `.env` and
   scrubbed `.env.example`; on 2026-10-10 the user supplied a fresh key via a
   shared Google Doc, now kept only in the gitignored `.env`. Because that key
   has also passed through the doc, rotate it once more at
   https://whop.com/dashboard/developer/ after the plan edit and deploy are done,
   and update the repo secret accordingly. Never paste it into chat.

## Notes

- The sandbox preview of the built storefront (not a Whop deploy) is served with
  `npm run preview` → port 4173.
- House terms that must not change: The Signal stays free forever; the Watcher
  stays $28 / 28 days with the seven-night return; the Vault is a final one-time
  $12; the Herald stays free; all checkout stays on Whop; support is
  numinous.support@gmail.com.
