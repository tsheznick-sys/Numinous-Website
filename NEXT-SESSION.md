# Next session handoff — Numinous storefront

Written 2026-10-09 by the `arena/6608f974-numinous-website` session.
Updated 2026-10-10 by the `arena/4c250cf0-numinous-website` session.
Updated 2026-10-10 by the `arena/496cbe7e-numinous-website` session: unpacked
`Numinous-website-main.zip` to the repo root (zip removed, `npm-publish`
workflow fixed to run `developer-actions` on Node 22 instead of the missing
`npm test`). Pipeline re-verified passing; preview serves on port 4173.

## Current state

- Repo pipeline (coldstorage onboard checks, typecheck, `vite build` with the Whop
  plugin, `dist/whop-build.zip` pack): **passing** via `npm run developer-actions`.
- Whop-side actions (plan edit, deploy): **unreachable from the Arena sandbox** —
  egress is restricted to github.com / npm / PyPI. They now run via **GitHub
  Actions** instead (runners have unrestricted egress):
  - `.github/workflows/developer-actions.yml` passes the `WHOP_API_KEY` secret to
    `npm run developer-actions` on every push/PR.
  - `.github/workflows/whop-tasks.yml` is a **manual** (`workflow_dispatch`)
    workflow with two tasks: `watcher-plan` (PATCH + verify) and `deploy`.
    Trigger from the Actions tab → workflow → "Run workflow".
- `WHOP_API_KEY` is in the gitignored `.env` (supplied via a shared Google Doc,
  presumed the rotated replacement for the leaked key). **One manual step
  remains:** the sandbox's `gh` token cannot write Actions secrets (HTTP 403), so
  the `WHOP_API_KEY` repo secret must be added by a human at
  Settings → Secrets and variables → Actions, value taken from `.env` — never
  paste it into chat. Until then the Whop steps log blocked/failed, but the build
  pipeline still passes.
- `whop.app.json` does not exist yet — only `whop.app.example.json` with a
  placeholder `app_xxxxxxxx` id. The real `app_*` id is required before any deploy.

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

   Actions tab → "Whop one-off tasks" → Run workflow → `deploy` (fails with a
   clear message until `whop.app.json` has the real `app_*` id; the CLI may still
   require `whop auth login`, which needs an interactive machine). Or locally:

   ```bash
   cp whop.app.example.json whop.app.json
   # edit whop.app.json: replace app_xxxxxxxx with the real app_* id for the
   # "Numinous" app whose route is jointhenuminouses
   npm ci
   whop auth login        # browser OAuth — needs an interactive machine
   whop apps deploy
   ```

   Deploy publishes the contents of the Whop build (`dist/whop-build.zip`, packed
   from `dist/client/`) to `https://jointhenuminouses.whop.site`.

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
