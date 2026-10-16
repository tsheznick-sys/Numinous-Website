# Numinous 2.0

This repository builds the Numinous storefront for `jointhenuminouses.whop.site`. The approved, editable React/Vite experience is in [`sandbox/numinous2/`](sandbox/numinous2/); the repository-root Vite configuration is its **Whop/Cloudflare deployment adapter**. Root builds no longer publish the previous static storefront in `reference/`.

## Build and check

```sh
npm ci
npm run build
npm run verify:build
# Optional: separate preview of the Whop/Cloudflare production package on port 4174
npm run preview
```

The root build typechecks the React app, bundles the Cloudflare worker and the Vite client, copies the sandbox's films/fonts/art directly into `dist/client`, generates route-specific social/canonical metadata documents, and packs `dist/whop-build.zip`. It does **not** copy media into a second committed directory. The build verifier checks that the archive contains all films, the compatible Signal WebM, metadata pages and the expected Whop handoffs. `dist/` is ignored; never edit it as source.

For the sandbox-only preview and its more extensive route/media smoke tests:

```sh
cd sandbox/numinous2
npm ci
npm run test:smoke
npm run preview -- --port 4173 --strictPort
```

Port 4173 remains the sandbox candidate; port 4174 previews the packaged root build. The root `index.html` hydrates the same React app from `sandbox/numinous2/src/`. The root `wrangler.jsonc` preserves clean URLs and SPA fallback, so `/checkout/<old-plan-id>` reaches the client with the plan ID intact instead of going straight to Whop or silently becoming the wrong gate.

## Customer journey

- Four home/collection cards link to their **gate detail** pages.
- Each detail page leads to a product-specific pre-checkout review. Whop owns checkout, receipts and actual entitlement; a browser-return query string is never proof of payment or access.
- Signal is free. The monthly Watcher has seven days free, then $28 every 28 days; the $280 annual option is separate. The seven-night return window follows the first Watcher payment. Prices and final terms must be checked on Whop.
- Four narrated films retain the original scene order and 2:43 / 2:42 / 1:20 / 1:13 runtimes. The autoplay hero is muted; user-controlled films have sound. Signal also has a VP9/Opus WebM playback alternative and direct format links.
- Existing `/products/*`, `/collections/all`, `/checkout/<plan-id>`, `/welcome`, and `/order-complete` links route into the current Gates experience. The live entry routes are `/gates/:gate` and `/gates/:gate/enter`.

Details of soundtrack provenance, editable media scripts, return links and outstanding human review are in [`sandbox/numinous2/audio/README.md`](sandbox/numinous2/audio/README.md), [`SANDBOX_STATUS.md`](sandbox/numinous2/SANDBOX_STATUS.md) and [`POST_CHECKOUT_CONFIRMATION_LINKS.md`](sandbox/numinous2/POST_CHECKOUT_CONFIRMATION_LINKS.md). **Creator/title credit text for the four supplied audio backgrounds is still missing**; the pages say the credit is pending rather than inventing an attribution. The user authorized website-video use; final attribution should be supplied and reviewed.

## Whop release

`whop.app.json` targets the Whop website app for route `jointhenuminouses`. The [Whop one-off tasks](.github/workflows/whop-tasks.yml) workflow supports `deploy-preview` and `deploy`; both run the root build and verifier before upload, using the repository's `WHOP_API_KEY` Actions secret. **Deployed on 2026-10-16:** the [main-branch release job](https://github.com/tsheznick-sys/Numinous-Website/actions/runs/38952425872) passed, and the new homepage, Signal detail and pre-checkout, Watcher terms, four-gate collection and pending-return text were checked on the public domain. The first release attempt failed because the full Git source snapshot exceeded Whop's 50 MB limit. `scripts/stage-release.mjs` now uploads only reproducible production source and the verified archive while leaving historical reference assets in Git. The marked retry ran from `main`; other PR merges and pushes do not auto-deploy. Public media playback on every device and an actual Whop purchase/entitlement flow have not been verified. Do not use the sandbox's own `vite build` output for Whop hosting.

The old source pages under `reference/` and old `render-check.mjs` are archival, not production input. Payments stay on Whop; this website does not collect card details or store Whop credentials.
