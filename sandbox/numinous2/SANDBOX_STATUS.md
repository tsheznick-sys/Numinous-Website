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

## Full-length film pass — prior two-track mix (superseded)

- All four sandbox films have been re-rendered from their original local
  scene plates at the **same lengths and scene order**, with gentle motion,
  improved readable typography/contrast and a progress marker. Misleading
  pre-checkout lines such as “Checkout has finished” have been replaced with
  offer-review language; post-return films explicitly defer access to Whop.
- The selected feminine voice now narrates across every film. The ten voiced
  blocks span all four original timelines; captions reach three seconds from
  each end. This is not a claim that Whop payment or entitlement was tested.
- This pass originally used MAGNUS DEI by arcana on both briefings and
  NEVER Leave by Ambient Outpost on both return invitations. **Those
  two-track mixes and creator labels have been replaced** by the four distinct
  supplied backgrounds documented below. This paragraph is historical, not
  a description of the current preview.

## Four supplied background films — revised voiceover review mix

- The user supplied four three-minute AV files and requested their **audio
  only**, one background for each matching product film. The site retains its
  original Numinous visuals, scene timelines and film lengths. The unrelated
  input pictures were not embedded or served.
- Replaced the two shared music beds with four extracted audio beds. The
  selected feminine narration now plays at **natural speed** rather than being
  time-stretched; three overlong invitation blocks were re-recorded to fit.
  Background gain is normalized per film, ducked under the voice and gently
  EQ'd for intelligibility. Short WebVTT cues occupy the upper image instead
  of obscuring the filmed lower-third headings.
- The user affirmed public website-video permission but **creator credit text
  for the four new files is pending**. The sandbox shows a pending credit
  placeholder rather than an inaccurate old attribution. Before release,
  verify license terms and listen to all four complete films for unwanted
  speech/promotional audio and caption/audio timing. File hashes and remix
  instructions: [`audio/README.md`](audio/README.md).

## Signal narration and sandbox actions — review update

- The Signal pre-checkout video now uses ten scene-aligned narration clips,
  its original distinct supplied audio bed, and matching upper-frame captions.
  Its 2:43 Numinous picture stream is unchanged. The Watcher briefing remains
  the 2:42 reference; both return invitations remain 1:20 and 1:13.
  [`audio/README.md`](audio/README.md) records the measurements and remix path.
- Corrected the Signal `/gates/signal/enter` route, which previously redirected
  to the detail page instead of showing its pre-checkout film. Product-detail,
  homepage and legacy Signal checkout CTAs now reach the Signal review page;
  the final free Whop link is still the same supplied checkout ID.
- A sandbox-only action layer unifies primary/secondary links, plan choices,
  mobile menu, touch targets, hover, keyboard focus and reduced-motion states.
  CTA labels describe their actual destinations rather than presuming access.
  No root-storefront CSS or routing was changed. `npm run test:smoke` checks
  the pre-checkout video route, Signal scene cue starts, card destinations,
  trial terms and return states. The existing port 4173 preview serves the
  updated build without a production deployment.
- On further feedback that Signal's voice, pacing and subtitles all need work,
  six clips were re-recorded in the same selected voice for fuller but still
  scene-matched pacing. The voice was compressed for clearer phrases, the same
  supplied score was lowered/ducked further, and captions were anchored to
  detected speech/sentence pauses rather than evenly divided across each MP3.
  Short score-only gaps between scene groups remain deliberate. The current
  Signal mix measures −17.9 dB mean and −2.0 dB peak; exact listening quality
  and word-level sync cannot be validated from waveform measurements alone.
- Technical decode and signal-level checks are not a listening assessment.
  Creator/title credits and a human desktop/phone accessibility, caption and
  soundtrack review are still outstanding.

## Signal single voice and precision pass — sandbox only

- Per the user's choice, **only the Signal pre-checkout film** gets further
  cleanup: the selected feminine narration remains; the source Signal score
  is center-vocal-reduced before mixing to suppress its underlying voice. No
  new music or pictures were added. The full film remains 2:43 and the other
  three films are untouched. Center cancellation cannot guarantee removal of
  off-center or reverberant words; a complete human listening review is still
  mandatory. Remix and source limits: [`audio/README.md`](audio/README.md).
- Added `src/precision.css` after the button system. It aligns desktop
  pre-checkout offer/film pairs on a shared grid, makes the three review steps
  equal columns, centers collection and checkout headings, balances the mobile
  hero, and removes the cramped mobile header support label (support remains
  in the mobile menu). The root storefront has not been changed.
- Headless Chromium checks at 320, 390, 768 and 1280 px found no horizontal
  overflow on the home, collection and Signal/Watcher pre-checkout routes;
  the 320 px mobile menu opens. Desktop and phone screenshots were inspected
  for alignment. This does not replace real-device or human audio review.

## Firefox playback and full-route usability pass — sandbox only

- The user reported that the Signal film did not play in Firefox or the Arena
  file viewer. The site's controlled Signal player now offers a 2:43 VP9/Opus
  WebM first, with the existing H.264/AAC MP4 as a browser fallback. Direct
  open/download links and a visible failure message remain available if both
  fail. The WebM uses the final Signal narration/score and the same Numinous
  scene sequence (at 720p); it adds no new background audio. Future Signal
  remixes refresh it via `scripts/encode-signal-webm.py`.
- Locally, a browser loaded the WebM, advanced playback past 2 seconds, fell
  back to MP4 when WebM was deliberately blocked, and displayed helpful links
  when both were blocked. HTTP media range requests returned 206. This is not
  a claim that Firefox on the user's device or Arena's file viewer has been
  verified; use the surfaced port 4173 website preview and the WebM link.
- Shared UI/UX updates cover the home, Gate details, pre-checkout and return
  films. A reusable player keeps native controls, captions, codec fallback and
  direct file options consistent. The hero loop stays muted. A keyboard skip
  link targets the main content, the mobile menu marks its active Gate, and
  body copy, checkout facts, legal records, footer links and media options have
  more legible type and touch targets. Headless 320/390/768/1280 px checks on
  seven routes found no horizontal overflow. Whop destinations are unchanged.

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
5. **Music permission and media review:** obtain creator/title credit text for
   all four newly supplied audio beds and confirm public/commercial
   synchronized-video terms (the user affirmed permission, but the terms were
   not independently verified). Listen for extraneous speech and check caption
   synchronization on desktop and phone.
6. **Security/visual review:** `npm audit` on the supplied dependency lock
   reports 5 high and 2 moderate **development/build-tool** advisories
   (Tailwind v3 and transitive packages). `npm audit --omit=dev` reports 0
   runtime dependency advisories. Do not force-upgrade without visual
   regression tests.
   The supplied QA report is dated Oct 14 and describes mobile controls/media
   that were missing in the Oct 16 archives; treat it as historical, not a
   fresh sign-off. Review the live sandbox preview on desktop and phone.

No production deployment was attempted.
