# Numinous 2.0 — sandbox review (2026-10-16)

## Source and preview

- `numinous2-rebuild.zip` supplied the editable React/Vite/TypeScript source.
  The unmodified source built to exactly the CSS/JS hashes in
  `numinous2-index-bundle.zip` (`index-BkAWubPN.css`, `index-s1iOg19l.js`).
  The compiled bundle is a reference, not the editable source.
- Two invitation films referenced by both archives were **absent** from both.
  Matching local films were restored from this repo's
  `reference/web-version/public/assets/briefing/films/`. No remote media is
  needed for the preview.
- This candidate lives in `sandbox/numinous2/` so the existing Whop-hosted
  storefront stays intact. Run `npm ci && npm run test:smoke` here, then
  `npm run preview -- --port 4173 --strictPort`. The port 4173 preview currently
  shows this candidate, **not** the root storefront.

## Repairs performed in the sandbox

- Restored the styled but missing mobile menu markup and keyboard controls
  (Escape, route change, focus loop). Replaced stale Herald footer wording with
  the candidate's Numinary Agent label.
- Kept the House's monthly Watcher terms explicit: **7 days free, then $28
  every 28 days**; the $280 annual option is separate. The seven-night
  money-back return begins at the first payment after the trial.
- Exposed the supplied Agent Key plan choices and the Watcher monthly/annual
  choices on the pre-checkout page, with Whop as the final price authority.
- The browser-return page now distinguishes completed, failed, declined,
  canceled, pending and unknown states; it never treats a query string as proof
  of purchase. Only a completed *presentation* offers a link to Whop's
  verification checkpoint. Other states do not display product access.
- Restored old `/checkout/<plan id>` links as client-side routes to the
  corresponding pre-checkout page and avoid treating unknown Gates as Signal.
- Added source-level render and media checks (`npm run test:smoke`).

## 2026-10-16 cards and video sound update

- The full surface of each of the four home and collection product cards is
  now a single, keyboard-focusable link to its product detail page. The
  pre-checkout product summary card also links back to its detail page. Cards
  are never nested links and still have a separate checkout action below.
- All four previously silent briefing/invitation MP4s now have one stereo AAC
  track: the existing local ambient bed plus the user-selected feminine,
  factual product narration. They have English WebVTT captions. Controlled
  films are audible on user-initiated playback; the looping homepage backdrop
  stays muted. Source voice clips and the repeatable mix script are in
  [`audio/`](audio/README.md) and `scripts/mix-audio.py`.
- `npm run test:smoke` checks all eight grid-card destinations, the
  pre-checkout summary card, AAC audio in every built MP4, caption files, and
  that the homepage background remains muted.

## Do not deploy yet — release gates

1. **Hosting integration:** this archive is a standalone static SPA. The root
   project deploys a Cloudflare Worker through `@whop/cli/vite`; this candidate
   is not yet wired into that build or its route-serving contract. The current
   preview's SPA fallback does not prove Whop hosting will serve deep links.
2. **Offer decision:** the archive replaces the current free Herald with the
   Numinary Agent (free entry, optional paid Keys) and lists four new Key-plan
   IDs. Confirm that product change, prices, Key quantities, eligibility and
   Whop destinations before using it on the live domain. No live plans were
   changed here. The Signal, Watcher and Vault terms were not changed.
3. **Whop return setup:** configure each actual checkout's product-specific
   return URL in Whop, validate receipts/entitlements and verified webhooks,
   and perform test purchases. Neither a browser `status` query nor this static
   site can verify payment or grant access.
4. **SEO and crawler routing:** route titles/descriptions are currently set by
   client-side React. The static HTML is a single shared document, unlike the
   root storefront's route-specific HTML/OG cards. Generate route-specific
   static documents or add an SSR/Worker adapter before launch.
5. **Security/visual review:** `npm audit` on the supplied dependency lock
   reports 5 high and 2 moderate **development/build-tool** advisories
   (Tailwind v3 and transitive packages). `npm audit --omit=dev` reports 0
   runtime dependency advisories. Do not force-upgrade without visual
   regression tests.
   The supplied QA report is dated Oct 14 and describes mobile controls/media
   that were missing in the Oct 16 archives; treat it as historical, not a
   fresh sign-off. Review the live sandbox preview on desktop and phone.

No production deployment was attempted.
