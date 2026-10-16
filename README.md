# Numinous

Storefront for [jointhenuminouses.whop.site](https://jointhenuminouses.whop.site), the House of Numinous on Whop.

The live site is the source of truth for copy, prices, and gates. This repository is the onboarded copy an agent can build and check. Payments stay on Whop. This site does not collect card details.

## Gates

| Work | Price | Where it opens |
| --- | --- | --- |
| The Signal | Free, forever | [checkout](https://whop.com/checkout/ch_wYXFulML0v6LIoJ/) |
| The Watcher | $28 / 28 days, seven-night return | [plan_PQnMYNixMTjRQ](https://jointhenuminouses.whop.site/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ:1) |
| Wallpaper Vault | $12, final when opened | [plan_Aew5DdipP3fKY](https://jointhenuminouses.whop.site/checkout/plan_Aew5DdipP3fKY?quantity=1&items=plan_Aew5DdipP3fKY:1) |
| Herald app | Free | [plan_hIKLCR4hGiv9B](https://jointhenuminouses.whop.site/checkout/plan_hIKLCR4hGiv9B?quantity=1&items=plan_hIKLCR4hGiv9B:1) |

## Developer actions

```bash
npm install
npm run developer-actions   # coldstorage onboard checks, typecheck, Whop pack
npm run dev                 # local site
```

`npm run developer-actions` is what the agent runs. It:

1. Applies the cold-storage onboard checks in `coldstorage/onboard.json` — the live storefront must still honour the House terms and Whop’s payment terms.
2. Typechecks the site modules.
3. Builds with the Whop Vite plugin and packs `dist/whop-build.zip`.
4. If `WHOP_API_KEY` is set, or `whop auth login` has already succeeded, lists Economic Intelligence for `thenuminouses` and executes a ready recommendation whose title is the coldstorage onboard.

The sandbox cannot finish Whop’s browser login. Put the Account API key in `.env` as `WHOP_API_KEY=` (that file is gitignored). The developer-action script loads it. Do not commit the key or paste it into chat.

## Asking for changes

Changes have to stay inside both sets of terms.

- House terms: Signal stays free. Watcher stays $28 every 28 days with the seven-night return. Other works are final when they open. Seats are not resold. Support is numinous.support@gmail.com. The September 8, 2026 Vault records stay available.
- Whop terms: checkout, refunds, and the first-party pixel stay on Whop. Do not add a card form. Do not store the Herald email on this site. [Whop terms](https://whop.com/tos/) · [Whop privacy](https://whop.com/privacy/).

To link this directory to the hosted app once you are signed in:

```bash
cp whop.app.example.json whop.app.json
# put the real app_ id in whop.app.json, then
whop apps dev
whop apps deploy
```

## Design and release checks

The home is authored in `reference/patch/clean/home.html`; its core styles are in
`reference/patch/clean/public/assets/numinous-clean.css`, with home-only styles
in `reference/patch/v2/home-acts.css`. Routed pages use that same core sheet
plus `reference/patch/v2/subpages.css`. The build adopts the home into
`dist/client/index.html` and creates a separate document for each route. Do not
edit `dist/` directly. Product social cards are selected by route in
`reference/patch/overhaul-home.mjs`. Checkout paths keep their original plan ID
through the home boot, then reach the pre-checkout threshold; the `_redirects`
file must not map `/checkout/<id>` to `/checkout/index.html` because that strips
the ID in the Cloudflare asset layer.

After a change, run:

```sh
npm run typecheck && node render-check.mjs && npm run build && npm run verify:build
```

`npm run preview` exposes the built site on port 4173. The preview is not a Whop deployment and does not alter live plans.

## Numinous 2.0 sandbox candidate (not deployed)

The two source/compiled archives supplied on 2026-10-16 are staged as the
**editable** standalone site in [`sandbox/numinous2/`](sandbox/numinous2/).
That folder has its own lockfile and scripts; it is deliberately separate from
the root Whop/Cloudflare Worker deployment. The root `npm run build` and
`npm run deploy` still target the incumbent storefront, not this candidate.

```sh
cd sandbox/numinous2
npm ci
npm run test:smoke
npm run preview -- --port 4173 --strictPort
```

Read [`SANDBOX_STATUS.md`](sandbox/numinous2/SANDBOX_STATUS.md) before proposing
a launch. The current port 4173 preview can run either build; check its process
label to see which is showing. **Do not deploy the candidate from the root.**
