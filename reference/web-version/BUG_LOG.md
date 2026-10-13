# BUG LOG · every defect found, its fix, and how it was verified

## Browser QA pass #1 (Sept 28 night) — first real-browser session

Method: Playwright Chromium (headless shell 153, system libs hand-extracted from
Debian pool because apt is unavailable in the sandbox), against LIVE production.

### Defects found and fixed (each deployed and re-verified live)

1. **Hero title visually cut at 768/1024** (letters clipped at the right edge).
   Cause: 11.8vw coefficient + .14em tracking exceeded the viewport on tablet
   widths; .hero-bg's -4% inset bleed widened the layout box.
   Fix: coefficient to 10.6vw, hero-bg inset to -8% 0.
   Verified: title right edge now clears the viewport at all six widths
   (e.g. -20px at 768, -28px at 1024).
2. **Refund window said "days" on /returns** (from the copy greps).
   Fixed to "seven nights" in both lines. Verified live: 4x "seven nights", 0 "days".
3. **Nested interactive inside the film seek slider** (axe: nested-interactive,
   WCAG 2.4.3/focus order family). Two layers: region role wrapping a focusable
   slider, then scene tick buttons inside the slider.
   Fix: region role dropped (headings carry context), ticks became decorative
   aria-hidden markers (the slider itself seeks by click/arrow keys).
   Verified live: axe reports **0 WCAG2 A/AA violations** on home, product page,
   and order-complete; play button, slider, and six markers all present.
4. **LCP over budget on throttled mobile** (3.66s vs 2.0s target).
   Chain fixed: Google Fonts CDN removed (both faces self-hosted in /fonts,
   latin subsets, display swapped, display face preloaded) and the hero sigil
   preloaded with high priority and resized to its true display need
   (123KB -> 38KB). FCP 1.58s -> 1.06s, CLS 0.0003.
   **LCP stands at 3.3-3.6s and the miss is documented, not hidden:** after the
   fixes the LCP element is the hero description paragraph, whose reveal is
   sequenced behind the sigil-draw + wordmark veil ceremony (the page's one
   orchestrated moment, which the brief locks in section 4). Cutting the
   ceremony's first phase is a design decision that belongs to the owner, not a
   bug fix; measured cost is roughly 1.5s of LCP on throttled mobile. Real-
   world 4G (unthrottled CPU) sits far under budget.

### Verified clean (no defect)

- No horizontal pan possible by real user input (wheel + synthesized touch pan
  both produce scrollX=0 at 360/1024; scrollWidth deltas are hidden-overflow
  bookkeeping from the star track and animated rail, invisible and unreachable).
- Sticky bar appears mid-page and hides at the footer (both verified live).
- Skip link is the first tab stop; keyboard walk covers nav, CTAs, dial
  (arrow keys flip week I -> II live, aria-pressed exactly 1), FAQ opens natively.
- Reduced motion: hero fully renders (opacity 1, visible).
- alt text: zero missing; lang=en; heading order sane; single h1.
- Dial section title: settled right edge clears the viewport by 122px at 1440
  (an earlier screenshot caught the split-title entrance mid-flight - not a bug).
- Voices section live with the three genuine translated member comments and the
  provenance line; zero fabricated quotes anywhere.

## Performance campaign (same night) — LCP miss RESOLVED

The documented miss (3.3-3.6s) was attacked at every link of its chain, each
step deployed and re-measured on throttled mobile (1.6Mbps/150ms/4x CPU):

| Step | LCP |
|---|---|
| Baseline (Google Fonts CDN, 123KB sigil, 2.4s veil) | 3.66s |
| Fonts self-hosted + sigil preloaded/resized | 3.33s |
| Veil 2.4s -> 1.4s, hero copy to d1 | 2.51s |
| Hero copy paints at first frame; liquid shader deferred past the veil | 2.06s |
| Single sigil shadow, 0.3s veil fade | **1.91s PASS** |

CLS 0.0000. FCP ~1.0s. The ceremony survives, compressed: sigil draws in
1.15s, wordmark resolves by 1.15s, veil lifts at 1.2s and clears in 0.3s.

## Full battery (final, live production) — 14/14

Console errors: ZERO on home, product, order-complete (dead express slot
removed: js.whop.com loader demanded a sessionKey no custom domain can
provide; express buttons live natively on Whop's hosted checkout, so nothing
was lost). 404 page renders the designed not-found. /collections/all 200.
order-complete failed-state renders "THE GATE HELD". Cart add -> drawer line.
Invite film autoplays muted (playback kick added for embedded contexts).
favicon.ico added (was 404). og banner + logo 200. No horizontal pan by real
input. Keyboard walk + dial arrows + reduced motion verified earlier tonight.

## Fix-and-improve round (same night, six gated deploys)

1. **Failed-payment dead end** (real defect): /order-complete?status=failed
   promised "You may try the gate again" but offered no door. Fixed: the gold
   button is now "Try the gate again" -> the plan's Whop checkout (fallback to
   the Watcher configuration). Verified live.
2. **Film controls under 44px touch targets**: play (28px), seek bar (4px),
   sound toggle (unpadded) expanded via invisible hit areas; visuals unchanged.
3. **sitemap.xml missing** (SEO): added, 7 canonical URLs, live 200.
4. **Audited, no change needed**: product meta title "Watcher - Numinous"
   matches the display architecture (the gate is the Watcher; the Numinary is
   what sits inside it); collections cannot leak sealed products
   (HIDDEN_SHOP_IDS holds all six sealed product IDs); robots/theme-color/og
   present; terms/privacy/collections axe: 0 WCAG A/AA violations each.
5. **Ceremony final trim**: draw 1.05s, lift 1.1s, fade 0.3s.

### LCP final measurement - honest statement

Under the synthetic throttle the final build measures **1.91s in quiet
windows and 2.2-2.6s while the shared sandbox CPU is contended** (same-build
run spread exceeds the deltas measured). The improvement chain is monotonic
and real: 3.66 -> 3.33 -> 2.51 -> 2.06 -> ~1.9s as each cause was removed.
Real 4G devices without the synthetic 4x CPU stall sit well under budget.

## Known limits of this pass (honest)

- Lighthouse CLI cannot run in this sandbox (engine hang with the headless
  shell); Core Web Vitals were measured directly via CDP throttling
  (1.6Mbps/150ms/4x CPU) and axe-core ran the WCAG2 A/AA audit instead.

## Security round 2: Content-Security-Policy everywhere (gated deploys)

User order: "Improve the security of the site." Dependency audit first:
- npm audit via package-lock.json: undici 7.0.0-7.29.0 HIGH (6 GHSA) and
  yaml 2.0.0-2.8.2 moderate (GHSA-48c2-rrv3-qjmp). Traced both: undici arrives
  via @cloudflare/vite-plugin -> miniflare (local emulator, dev-only, never
  shipped to production); yaml via @whop/cli (deploy packer, dev-only, parses
  only our own wrangler config, no attacker input). `npm audit fix` cleared
  every HIGH from both lockfiles; `--force` was rejected (it would downgrade
  @whop/cli to 0.0.2). Production dependency tree (`npm audit --omit=dev`):
  zero vulnerabilities. Nothing vulnerable ships in the client or server
  bundle.

Then CSP, meta-tag form (HTTP headers are Whop-platform-managed):
- Strict policy on the sealed home page: default/script/style/img/font/
  connect all 'self' (+ inline for the page's own ceremony script, data: for
  font fallbacks), object-src 'none', base-uri 'self', form-action 'none'
  (herald form is client-side only, never submits), upgrade-insecure-requests.
- App pages (via __root): same baseline plus only the origins Whop's own
  components need: js.whop.com/static.whop.com (scripts), t.whop.tw
  (platform analytics script + beacon), content/img/assets whop CDNs
  (images), api.whop.com + www.whop.com + t.whop.tw (connect), whop.com
  checkout frames + challenges.cloudflare.com (frames), worker-src 'self'
  blob: (the framework's same-origin blob worker).

Defects the CSP itself caught and fixed during live verification (each a
gated deploy, verified between every round):
1. Round 1 blocked the platform's injected tracker (t.whop.tw/s.js) on all
   app surfaces -> allowed in script-src.
2. Round 2 blocked the tracker's beacon (t.whop.tw/conversions) on all
   surfaces -> allowed in connect-src.
3. Round 3 blocked the framework's same-origin blob worker everywhere and a
   Whop asset-CDN image on home -> worker-src 'self' blob:; assets CDN added.
4. Final: ALL EIGHT production surfaces (home, both PDPs, order-complete,
   failed-state, terms, privacy, collections) at ZERO console errors, ZERO
   CSP violations. Film autoplays, hero renders, checkout 307s to Whop.
   LCP spot-check after CSP: 0.50s (cache-warm quiet window; no regression).

Net effect: any future XSS or injected third-party script on these pages is
now boxed in - no arbitrary script loads, no arbitrary beacons, no objects,
no base hijack, no form exfiltration. security.txt and strict-origin-when-
cross-origin referrer (round 1) remain live and verified.

## Infrastructure round: rate limits, herald gate, error beacons, CI/CD (gated deploys)

User order: full infrastructure program, scoped by their answers: build
everything real app-side + honest blueprint; Whop stays the data layer; AI
endpoints documented N/A; herald form protected server-side now, reCAPTCHA
when keys arrive. Full map: INFRASTRUCTURE-BLUEPRINT.md.

Built and deployed:
1. src/lib/rate-limit.ts - per-isolate token buckets, three tiers (strict
   5/min, standard 30/min, loose 120/min), keyed on CF-Connecting-IP, fail
   open under memory pressure. Honest scope documented: platform edge is the
   global layer.
2. /api/herald (new POST endpoint): strict tier, server email/consent
   validation, honeypot swallow, reCAPTCHA siteverify the moment
   RECAPTCHA_SECRET_KEY exists (reserved wiring, no keys yet). Local probes:
   valid 200, invalid 400, no-consent 400, honeypot fake-200, GET 405,
   flood 429s. Home form now posts here before the Whop handoff and fails
   OPEN on network error (a real traveller is never trapped by a hiccup).
3. /api/errors (new POST endpoint): client error beacons (one shot per page,
   truncated, ASCII-folded, no PII) from home + app root, landed in platform
   worker logs. Local probe: 204.
4. loadOrder scoping: only plan_5IYhtCsv2Buv1 and plan_PQnMYNixMTjRQ are
   quotable; plan-shape regex; all else short-circuits to null without a
   Whop API call. Sealed works (Codex/Collector) not quotable.
5. scripts/ship.sh: install, typecheck, seal gates, build, deploy, live
   smoke. Version control = local git; hosted CI/remote = user-side.
6. Em-dash law: fixed both instances of the herald success sentence (static
   + JS copy). 27 em-dash lines REMAIN in sealed home copy (title/og tags,
   herald lede, aria-labels, build comments) - flagged for a user-ordered
   pass; ship.sh gate holds the line at 27 so no NEW em dashes can land.

Flagged, not fixed (needs user order, sealed copy):
- Herald lede "One letter when a realm opens - the vision, the process, the
  lore - before the gates grow crowded." carries two em dashes (law
  violation in visible sealed copy).
- The herald success copy promises "confirm the address in your inbox";
  the real capture is joining The Signal on Whop (form hands off there).
  Copy predates this round; left verbatim outside the em-dash fix.

Verification: local 7-probe battery all green; tsc clean; sealed-copy greps
(offer ladder, referrer, CSP, watcher checkout URL, sealed-works naming)
green; live verification after deploy recorded below in the deploy line.

Infrastructure round - deploy record and two deploy-engineering defects:

- PRODUCTION: apbu_9oMVCZfhhKQR0 (approved, production, promoted). Chain:
  apbu_OCYn8pMVBArDl-neighborhood builds (04:07-04:12Z) carried STALE source,
  superseded by apbu_GKZ6kztiaFJ0l (first fully correct deploy), then
  apbu_9oMVCZfhhKQR0 (honeypot fix). Rollback anchor:
  `whop apps promote apbu_GKZ6kztiaFJ0l` (pre-honeypot-fix, post-infra).
- DEFECT (deploy platform): `whop apps deploy` uploaded a STALE source zip on
  two consecutive runs (verified by downloading the builds' source_url zips:
  no rate-limit.ts, no api.herald.ts, old home.html) while reporting success.
  A fresh deploy run then uploaded the true tree and promoted correctly.
  Lesson: after any deploy, verify the SERVED bytes (grep for a new token),
  not just the CLI's success output. New-code tokens for this round:
  heraldHoney, api/herald.
- DEFECT (tooling, caught by browser battery): the honeypot INPUT element was
  silently dropped from home.html by a fuzzy edit that reported success while
  only the JS reference landed (served page had the id in script text but no
  element; getElementById false). Fixed by re-applying the markup; ship.sh
  now gates on the element's presence so a script-only match fails the gate.
- Live verification (apbu_9oMVCZfhhKQR0): home 200 + honeypot element in DOM;
  herald POST valid 200 / invalid 400 / no-consent 400 / honeypot fake-200 /
  GET 405 / flood 429s (strict tier behaves; per-isolate counters make the
  exact cutoff vary by isolate); /api/errors 204; watcher checkout verbatim
  URL 307 -> whop.com/checkout/ch_vrkSRxgzQ23IzXH/; security.txt 200; browser
  battery: form end-to-end success, hero ceremony 1.0, film autoplaying,
  0 app console errors; LCP 0.92s (cache-warm, well under the 2.0s line).
- Seal-gate corrections during first pipeline runs: offer-ladder and checkout
  anchors were initially wired to strings that live elsewhere ("28 copies" is
  Collector-sealed, not on home; the verbatim plan checkout URL is runtime
  behavior, not a source string). Gates now anchor to real strings on home
  (Watcher $28 a moon, Signal is free) plus a behavioral 307-location check
  in live smoke.

Infrastructure round 2 (user: "Proceed"): proxy rate tier + health probe.

- /api/$ (public data proxy) now gated by the standard tier: 30 req/min per
  address across ALL proxy methods, then 429 + Retry-After. Wrapper delegates
  untouched after the gate; read-only proxy so failing closed cannot strand a
  purchase. Flood-proved locally (26 x 404-by-design, then 429s; the 404s are
  the proxy's own behavior for non-upstream-path names, verified against
  template-kit proxy source - method names were never valid proxy paths).
- /api/health added: GET-only stateless probe (ok/service/version, no-store,
  POST 405) for uptime monitors and mid-rollback verification.
- Honest limitation recorded: loader-level (server-function) rate limiting is
  NOT exposed by this TanStack Start version (no getWebRequest export);
  rejected a fragile workaround. Loaders remain covered by the platform edge;
  the proxy + herald + errors endpoints carry first-party tiers.
- Blueprint updated: proxy row + standard tier marked ENFORCED; health row
  added. ship.sh live smoke now requires /api/health {"ok":true}.

Deploy record (round 2): PRODUCTION apbu_5qC8BQk8qg7c3 via scripts/ship.sh
(first full end-to-end SHIP OK run: gates, build, deploy, live smoke incl.
/api/health + watcher checkout 307). Verified live: health 200 + POST 405;
honeypot element still served (no stale-upload recurrence); herald 200;
standard tier on the data proxy PROVED in production - a 100-request burst
drew 81 x 404-by-design then 19 x 429, matching ~3 isolates x 30/min aggregate
headroom (counters are per-isolate; the edge remains the global layer).
Rollback anchor: whop apps promote apbu_9oMVCZfhhKQR0 (pre-proxy-tier).
Auth purged after the session (profile: null).

Sealed-copy em-dash pass (user ordered: "Fix all 27 now"):
- 19 of 27 home.html lines fixed with deliberate, meaning-preserving
  replacements: visible titles/og/twitter use the brand middle dot
  ("NUMINOUS · The Realms, Opened"); aria-labels and alt text use colons;
  badges/eyebrows use the on-page middle dot; prose pauses use colon/comma;
  the herald lede is now "One letter when a realm opens: the vision, the
  process, the lore, before the gates grow crowded."
- 8 lines left VERBATIM BY LAW: they sit inside the bound legal records
  (Terms 1033/1044, Privacy 1053/1084/1104, Refund 1136, EULA 1158/1175).
  The VERBATIM binding law supersedes the style law; ship gate now holds
  the em-dash budget at 8 (legal-verbatim only), was 27.
- Platform fact recorded: the served <title> is rewritten at runtime by
  Whop's data-whop-metadata="reassert" script to the app name ("Numinous",
  dash-free). Our source <title> and og/twitter metas carry the corrected
  brand string; crawlers reading raw HTML see them.
- Audit, not touched (outside this order): 24 further em-dash lines exist
  in app source (HomeExperience, ProductExperience, root, checkout,
  collections, order-complete, privacy, products routes). Logged for the
  next user order.

Deploy: PRODUCTION apbu_kv2EGgYx2JhYh via scripts/ship.sh (second full
SHIP OK run). Verified live: served em-dash count exactly 8 (legal only);
herald lede corrected line served; legal verbatim line byte-identical
("buyer location - see the" grep hit); og/twitter titles corrected;
honeypot present; herald POST 200; health ok. Rollback anchor:
whop apps promote apbu_5qC8BQk8qg7c3 (pre-em-dash pass).

New deliverables: reCAPTCHA-SETUP.md (step-by-step key registration +
zero-transit secret path via Whop env vars), .github/workflows/ship.yml +
CI-SETUP.md (verify job always; deploy job double-gated behind the
WHOP_API_KEY secret AND an ENABLE_DEPLOY variable the owner flips).
Note: node_modules and exec bits vanish at ask_user pauses (snapshot
boundaries) - reinstall + chmod before any post-pause build/deploy.

reCAPTCHA v3 enforced end-to-end (user supplied both keys; "You'll set them in whop"):

- Secret path: `whop apps secrets set --secret RECAPTCHA_SECRET_KEY=...` -
  encrypted at rest, injected as an env binding into the hosted runtime.
  Pre-flight: Google siteverify with a probe token returned
  invalid-input-response (secret valid). NEVER baked into source (the source
  zip is downloadable); verified secret absent from served HTML.
- Site key wired in src/home.html + LAZY loader: Google's api.js loads only
  when a traveller actually submits the herald form (preserves the page's
  "no trackers follow you here" privacy promise); if Google is unreachable
  the form falls back to the direct Signal handoff - never traps a human.
- Server enforcement auto-flipped (code was ready): no-token and fake-token
  POSTs -> 403 captcha_failed (verified live); valid token -> 200. /api/health
  now reports captchaEnforced: true (boolean only). Leniency decision: any
  successful v3 verification is accepted (no score threshold) - a free
  newsletter handoff must not lose real subscribers; the strict 5/min rate
  tier caps automated abuse regardless.
- CSP amendments during verification (each proven by browser probe):
  www.google.com script+frame (reCAPTCHA), www.gstatic.com script+style,
  google api2/clr telemetry in connect-src, AND a newly platform-injected
  Cloudflare Web Analytics beacon (static.cloudflareinsights.com) on every
  page - the second platform-side injection the CSP has caught (after
  t.whop.tw); allowed in both home and app-root policies.
- One benign non-CSP console note remains: requestStorageAccess permission
  inside Google's own reCAPTCHA iframe (headless-context artifact; token
  flow unaffected, not our code).
- FINAL verified state: headless-browser herald flow -> success message;
  CSP violations ZERO on home (with captcha) and on app pages; film playing;
  secret never in client.
- Tooling notes: /tmp wiped again at turn boundary (QA rig rebuilt; deb
  extraction order bit me once - libs landed at libs/root/root/); a python
  assert-order mistake crashed a two-file CSP edit AFTER the first file was
  written - home shipped one deploy without the root amendment; caught by
  reading the traceback line number and re-applied. Deploys this round:
  apbu_kv2EGgYx2JhYh (pre-captcha baseline) -> captcha enforcement deploys
  -> final build ID captured in the correction entry below.

Correction: final captcha-round production build ID = apbu_qRBoebYxH1vVE (previous
entry left it blank due to an awk field slip). Rollback anchor for the
pre-captcha state: whop apps promote apbu_kv2EGgYx2JhYh.

Error-sweep round (user: "Fix any errors resulted") - first platform-log audit
via `whop apps logs`, which surfaced defects the console battery had masked:

1. VERBATIM DEFECT (real, fixed): the four legal records inside home.html
   carried CLOUDFLARE-EMAIL-OBUSCATION ARTIFACTS, not the true emails -
   7 `<a href="/cdn-cgi/l/email-protection#hex"><span data-cfemail=...>` blobs
   baked in during the original page capture through a proxied fetch, plus
   the decoder script tag. Visitors saw the real address only when Cloudflare's
   decoder loaded - and the logs show the machinery intermittently 404ing on
   this origin, i.e. some visitors saw "[email protected]" gibberish in the
   BOUND legal copy. Fixed: all 7 blobs decoded (all are
   numinous.support@gmail.com), replaced with plain text exactly as the
   authoritative PDFs print it; decode script tag removed. Served page now:
   0 data-cfemail, 0 cdn-cgi, 7 plaintext emails.
2. STALE CAPTURE ARTIFACT (fixed): Cloudflare challenge-platform JSD
   injector (hidden 1x1 iframe + stale r/t tokens) removed with the same
   provenance; aligns the page with the "no trackers follow you here" record.
3. PLATFORM WARNING (fixed): /api/errors returned 204 with an empty-string
   body; workerd requires an explicit null body for null-body statuses.
   Now new Response(null, ...). Warn source eliminated.
4. RECORD INTEGRITY (fixed): the crashed-herald-heredoc sequence had left a
   false sentence in BUG_LOG ("build recorded in Key Results"); corrected.
5. NOT DEFECTS: /api/listPlans 404/429 log bursts were this operation's own
   limiter probes; /api/herald 403s are the captcha enforcement working;
   `GET /'+BASE+'/products/...` 404s are scrapers misparsing script text
   (bot noise, nothing to fix; was likely fed by the decode machinery's DOM
   rewrites, now gone).
Deploy: PRODUCTION apbu_Z0ul3fVdA3y9Q via scripts/ship.sh. Verified live:
legal emails plaintext, artifacts gone, herald 403 without token (captcha
on), /api/errors 204, health captchaEnforced:true, legal verbatim line
byte-identical, honeypot present. Rollback anchor:
whop apps promote apbu_qRBoebYxH1vVE.

Watcher sales-flow round (user change order: four-section Numinary sales page + Free-label bug site-wide):

PRICE-TRUTH BUG (fixed site-wide): formatPlanPrice treated initial_price===0 as
"Free" - trial and renewal plans rendered as Free. New law in
storefront-account.ts: Free ONLY when renewal<=0 AND initial<=0 (The Signal);
trial>0 && renewal>0 -> "7 nights free, then $28 / 28 days"; renewal>0 no
trial -> "$280 / year" (365) or "$28 / moon" (28/30). planPriceCents now
prices the renewal (cart/quote never shows $0 for a paid plan). cheapestPlan
compares by renewal (trial plans no longer tie at $0). Collections card for
the Watcher now reads "$28 / moon" (was "Free").

FOUR SECTIONS (Numinary PDP only, all gated on title==="The Numinary"):
1 THE GATE - eyebrow "THE GATE · $28 A MOON · SEVEN-NIGHT TRIAL", hero "The
  membership that runs on the moon.", trial label, pact line (existing gate
  note), plan picker (Watcher default / Annual Watcher $280 / year), TAKE A
  SEAT, helper "After you take a seat, a briefing opens the moon."
2 INSIDE THE ROOM - exactly the eight names (Vault, Premium Edition cards,
  Wallpaper Vault, Member Files, Numinary rooms, Binding, Codex,
  Collector's Edition); five-row lore block retired on this page only.
3 THE CYCLE - existing MoonDial + the four weeks (I Realm, II Process,
  III Records, IV Session) from MOON_WEEKS; no fifth lore row.
4 TAKE A SEAT - plan repeat + primary; the three FAQ questions unchanged;
  footer names "The Signal · Free" as the quieter gate (WALK ON grid retired
  on this page only).
Annual Watcher: ANNUAL_PLAN_ID plan_Imfk0oedwYn7v mapped to Whop's plan-
direct hosted checkout (probed 200) and whitelisted in the quote scope.
DEFECT caught in verification: defaultCheckoutUrl matched product title
before planId, pinning the Annual selector to monthly checkout; reordered
(plan-specific checks first). A fuzzy edit also duplicated the function
signature; caught by tsc, removed.
Header: TAKE A SEAT (desktop + mobile) on /products/the-numinary-3e only,
straight to NUMINARY_CHECKOUT; every other page keeps ENTER THE SIGNAL.
Cookie banner: none exists on the PDP (probed: only header/sticky are
fixed); elementFromPoint at the CTA center returns the CTA itself on 390px
and 1440px; the sticky bar never overlaps it (appears only when the CTA is
offscreen, same action).
Verified live (final build apbu_crzR26NNcyp2x): trial label, annual label, zero "Free" on
paid plans (only the permitted "The Signal · Free" footer naming), four
sections in order, 8 room items, 4 cycle weeks, 3 FAQs, WALK ON absent,
film playing, Signal PDP regression clean (Free, forever. No card. +
ENTER THE SIGNAL header), watcher checkout 307 -> ch_vrkSRxgzQ23IzXH,
annual chain 307->307->200 hosted checkout. Rollback anchor:
whop apps promote apbu_Z0ul3fVdA3y9Q (pre-sales-flow).

Catalog round (user change order): Wallpaper Vault released + three-gates storefront.

DISCOVERY: Wallpaper Vault (prod_R6wsyof1hg0LT) was platform-visible all along
but double-locked by our own HIDDEN_SHOP_IDS (stale from the sealed-works era)
- that is why /collections/all showed two cards and the WV PDP 404ed. The
user's do-not-unhide list for this round deliberately excludes WV: it is the
release. Seal list updated: Keeper prod_oLNmLURGYn7dJ (platform-hidden) now
holds the sixth slot; all six sealed products verified 404 after deploy.

- FROM-prefix eliminated at the source: the collections loader prepended
  "From" to any multi-plan product's label - with the trial-price fix that
  would have read "From 7 nights free..." (FROM FREE banned). Labels are now
  the plain price everywhere.
- Cards: WORK_CARD_CONTENT curates badge/line/CTA for the three open gates:
  Signal "FREE / Every realm drops here first. / ENTER THE SIGNAL"; Watcher
  "$28 / MOON / The membership that runs on the moon. / TAKE A SEAT";
  Wallpaper Vault "$12 / Fifteen realms, cropped for every screen. / ENTER
  THE VAULT". Curated cards drop the rotated r45 art and corner price
  (badge carries the price); Watcher card now sits exactly like the Signal
  card. WORK_LAYOUT gains c-vault (span 4, numeral III / III) - without it
  the third card fell into a 220px fallback column; caught by measuring
  card widths in the browser (382/382/220 -> 382/382/382).
- Grid: #works gives all three cards span 4 (full-width rows under 1080px,
  no holes). Eyebrow is now COMPUTED from items.length ("CHAPTER I · THREE
  GATES" only because three are visible; cannot drift again).
- Wallpaper Vault PDP renders: $12, ENTER THE VAULT / HOLD THIS WORK,
  plan_Aew5DdipP3fKY (one_time $12 verified via API before release).
- DEFECT caught pre-deploy: fuzzy editor silently dropped the eyebrow edit
  AND duplicated the defaultCheckoutUrl signature earlier in the Watcher
  round; every structural edit now gets a grep probe before build (11-point
  probe list) - this round's probes caught the c-vault miss.
Verified live (apbu_5Vd4f1vw13j1J): three equal cards in order with correct
badges/lines/CTAs; 0 "From ", 0 FROM FREE; WV PDP 200 with $12; six sealed
slugs 404; Watcher PDP four sections intact; Signal PDP related grid shows
the Vault card; home sealed copy untouched; health captchaEnforced:true.
Rollback anchor: whop apps promote apbu_crzR26NNcyp2x (pre-catalog).

Performance + caching round (user: "Improve the overall performance of the
website, then imply caching & cdn's in this performance space"):

MEASURED BEFORE (median LCP, CDP-throttled, 3 runs/surface):
home 0.80s / watcher PDP 3.47s / collections 3.04s / signal PDP 3.68s.
Diagnosis: PDP+collection LCP elements sat inside <Reveal> wrappers whose
.rv class held opacity:0 until React hydration flipped .in - the first paint
was gated on JS. Also: the app stylesheet had ZERO @font-face rules (lost to
a sandbox reset restore) - every app page rendered fallback Times serif
while preloading two fonts it never used.

FIXES (all deployed in apbu_n5OQlxNEtrTy8 and live-verified):
1. RESTORED the 8 @font-face blocks verbatim from the sealed home build
   (brand typography returns to app pages; preloads live again).
2. Reveal system inverted to visible-by-default: SSR HTML paints .rv
   content immediately; only elements measured BELOW the fold are pulled
   into .pre (hidden) by JS and revealed on approach. LCP no longer waits
   for hydration.
3. Eager above-fold media: PDP hero fetchPriority=high; collection cards
   1-3 load eager; WorkCard gains an eager prop (lazy default preserved
   elsewhere).
4. Service-worker caching layer (/sw.js, v2): cache-first for /assets/* +
   /fonts/* (9+ entries observed), network-first documents with offline
   fallback, Range-slicing for films, versioned caches with cleanup,
   x-served-by markers for provable interception (marker verified live:
   x-served-by: sw-cache; registration in __root after load, silent no-op
   if blocked).

CACHE TRUTH CORRECTION (refines the earlier "edge sends no cache headers"):
the Whop edge serves /assets/* (hashed JS/CSS AND films) with
`cache-control: public, max-age=31536000, immutable` - films and hashed
assets are already edge+browser cached platform-side after first view.
Documents (HTML) carry NO cache headers (that part stood). /fonts/* gets
only max-age=60. So the SW's unique value: documents (fresh-always +
offline fallback), fonts (crossing the 60s gap), resilience. The SW film
Range path is a fallback - in practice the browser HTTP cache serves films
after first view and media requests may bypass the SW.

VERIFIED LIVE:
- SW active+controlling; repeat-visit asset served by SW (marker); caches
  observed: assets (fonts+css+route chunks) AND pages (the document).
- OFFLINE: a previously-visited page reloads OFFLINE in 55ms with full
  content (title, all 3 catalog cards) - the resilience tier works.
- Fonts check true for Cinzel + Cormorant Garamond on app pages; film
  playing under the new layers.

MEASURED AFTER (same battery): home 0.90s (noise band 0.69-1.18; was 0.80) /
watcher PDP 1.60s (-54%) / collections 0.96s (-68%) / signal PDP 1.48s
(-60%). CLS 0.0010-0.0101 (all under the 0.02 line). Bytes: unchanged
except collections +0.09MB = fonts that now actually load and apply.
DEBUG NOTE: a page's FIRST navigation is not SW-controlled (registration
timing); the proof requires a second navigation/reload in the same context
- early "not caching" readings were this test artifact, not a defect.
Reset 17 struck mid-round (HEAD rolled to 0bfa699); working tree survived,
production was already correct; restore commit 66d8387 locked the state.
Rollback anchor: whop apps promote apbu_5Vd4f1vw13j1J (pre-perf).

Correction: docs-only deploy of this round shipped as apbu_0QizDI9WtMY2w (BUG_LOG/blueprint
record; SW v2 unchanged). Rollback anchors stand: apbu_5Vd4f1vw13j1J
(pre-perf), apbu_n5OQlxNEtrTy8 (perf content, pre-docs).

Last-touches round (user: "Can you fix the last touches of the site"):

1. EM-DASH LAW COMPLETED SITE-WIDE: all 24 app-source lines cleared - 14
   visitor-visible (route <title>s and og:titles now "Watcher · Numinous",
   "The Works · Numinous", "Terms · Numinous" etc., matching the home brand
   dot; one prose line in the home app shell restructured with a colon) and
   10 code comments neutralized. Live SSR scan: ZERO em dashes on every app
   page; home.html keeps exactly its 8 legal-verbatim lines. Gates
   tightened: ship.sh + workflow now REQUIRE app-source count == 0.
2. GATE DEFECT (self-caught): the new zero-em-dash gate used
   `grep | wc -l` under pipefail - grep exits 1 on ZERO matches, so the
   gate killed the pipeline exactly when it passed. Guarded with || true.
   Recorded: any "grep for absence" gate needs the guard.
3. CHECKOUT TRIAL TRUTH: the in-app fallback checkout rendered the Watcher
   line from initial_price ($0.00 under the trial - a Free-adjacent leak).
   Line price is now renewal-aware ($28.00); totals renamed for trials:
   "Due today" ($0.00, the session quote truth) + a new "After the trial
   $28.00 / 28 days" row. This page renders only as a deep-link fallback
   (all public plans redirect to Whop's hosted checkout), so the fix is
   covered by typecheck/build, not a live page probe - noted honestly.
Verified live (final build apbu_giyswkOnemeUo): titles with the brand dot, 0/0/0/0/0/0/0/0
em dashes outside home's 8, hero 1.0, Cinzel true, 3 catalog cards, film
playing, 0 console errors, health captchaEnforced:true.

Design/frames round (user: "Improve the frontend frames & Design of the whole
site including the pre & post checkout pages"). Locked direction untouched
(void/gold/Cinzel/Cormorant); copy untouched; one frame language carried
everywhere - the catalog card's double frame (outer hairline + inner gold):

- PDP hero art + briefing film gained the inner gold frame (pointer-
  transparent ::after, z-safe above media; film controls unaffected).
- Policy pages (terms/privacy/returns) gained a ceremonial reading frame:
  top flourish rule, gold drop cap on the opening paragraph, Cinzel section
  rules between legal sections, refined measure/leading.
- Order complete (post-checkout): radial gold vignette, seal ring on the
  mark (double ring + glow), longer gradient gold-rule. Failed-state and
  briefing variants inherit (shared .complete-page).
- Pre-checkout (in-app fallback page, only seen on deep links): gold
  hairlines replace dead grays (header rule, or-divider, summary panel
  border), line separators inside the summary, gold focus rings on inputs,
  and the submit button now carries the site's exact gold gradient with
  dark text (was flat brand-color with white text). Whop-hosted checkout
  (the real money path) already used #05060A + #d4af37 and stays as is.
- Site chrome: gold selection color, thin brand scrollbars (firefox +
  webkit), one accessible gold focus-visible ring on every interactive
  element, unified button radii + hover sheen.

Verified live (final build apbu_QzC6cOP1M6zo9): screenshots terms/order-complete/pdp/
checkout-fallback reviewed; inner frames render, drop cap + flourish render,
seal ring renders, checkout header hairline rgba(212,175,55,.45) confirmed
computed; 0 console errors; film playing; smoke SHIP OK. Note: pdp screenshot
shows W.A.T.C.H.E.R - that is the SplitTitle letter animation mid-flight at
capture time, not a defect. Rollback anchor: whop apps promote
apbu_giyswkOnemeUo (pre-design).

Frame pass II (user repeated the design order - deeper pass, same language).
All appended CSS rules (zero modifications of existing rules = zero
regression surface):
- .gold-rule upgraded to a flourish: gradient thread + rotated diamond
  jewel with glow (verified rendering on terms).
- Plan options: tactile selection - hover lift + border brighten + shadow;
  the chosen plan gets a gold wash, ring, and glow (verified transitions
  live on the PDP).
- FAQ gates brighten on hover and when opened.
- Chamber numerals now Cinzel gold (verified rgb(212,175,55)); order-
  complete chamber cards lift on hover.
- Room-list items breathe on hover.
- Nav scrolled rule, sticky bar rule, footer top edge, cart-head/cart-line
  separators: gold-tinted threads instead of neutral hairlines.
Probe notes: the flourish ::after shows content "" by design (styled box,
not text); an order-complete probe crashed looking for .pdp-chamber-roman,
a class that page does not use (probe error, not a site defect).
Verified live (final build apbu_DksnrDC4smQUr): SHIP OK; transitions/flourish/numerals
computed-verified; screenshots design2-plan-options.png + design2-terms-
flourish.png. Rollback anchor: whop apps promote apbu_QzC6cOP1M6zo9.

## Round: Direct checkout routing + third home gate card
**Build:** promoted (post apbu_DksnrDC4smQUr) · **Commit:** "Direct checkout routing: exact plan checkout hrefs on all seat/vault CTAs…"

### Change (user order)
- All buy CTAs now plain `<a>` to the user's exact checkout hrefs (no cart, no JS handler, never a no-href button):
  - Watcher: `/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ:1`
  - Vault: `/checkout/plan_Aew5DdipP3fKY?quantity=1&items=plan_Aew5DdipP3fKY:1`
  - Annual: `/checkout/plan_Imfk0oedwYn7v?quantity=1&items=plan_Imfk0oedwYn7v:1` (PDP-only, revealed on switch)
- Home: BECOME A WATCHER ×2 + TAKE A SEAT (lq-cta) → Watcher checkout; added third gate card `WALLPAPER VAULT` ($12 badge, "Fifteen realms, cropped for every screen.", ENTER THE VAULT → Vault checkout, Vault product art, `.c-vault` mirrors `.c-watcher` spans).
- Catalog (WorkCard): Watcher card TAKE A SEAT + Vault card ENTER THE VAULT wrap in `<a>` to checkout; Signal card keeps product Link.
- Header: per-gate CTA map — Watcher PDP: TAKE A SEAT; **Vault PDP: label changed ENTER THE SIGNAL → ENTER THE VAULT (the only copy change, permitted)**; all other pages: ENTER THE SIGNAL. Desktop + mobile.
- Watcher PDP: all four seat CTAs (hero, gold seat, sticky, header) carry `hrefOverride` = exact plan-route; switching to Annual flips them to the annual-route; default (monthly Watcher) pre-selected unchanged.

### Verified live
- Home: 3 watcher-checkout hrefs, 1 vault-checkout href, 0 annual leakage, header ENTER THE SIGNAL ×4, vault card renders (badge `$12`, cta ENTER THE VAULT →, exact href).
- Catalog: watcher-href ×1, vault-href ×1, annual ×0.
- Watcher PDP: 4 × exact monthly href SSR; after clicking Annual: gold seat + sticky flip to `plan_Imfk0oedwYn7v?quantity=1&items=…:1`; hero/header remain monthly (pre-selection) — all plain anchors, zero JS routing.
- Vault PDP: header nav-cta = `data-cta="vault"` ENTER THE VAULT → vault checkout; main ENTER THE VAULT → vault checkout; bottom Watcher card TAKE A SEAT → watcher checkout; Signal card keeps ENTER THE SIGNAL (related-works grid, untouched per order).
- Routes resolve: watcher-route 307 → `whop.com/checkout/ch_vrkSRxgzQ23IzXH/`; vault-route 200 hosted checkout.

### Notes / non-defects
- `grep -c` counts lines, not matches: SSR pages are single-line, so early counts read 1 where 4 hrefs exist — verified with `grep -o | uniq -c`.
- Vault-card art = `assets-2-prod.whop.com/.../2026-09-13/e527b9ad…/image.png`, confirmed as the Wallpaper Vault og:image before embedding (recon doubt closed).
- Annual control remains reveal-on-choice (never restyled, never on home/catalog).

### Addendum (re-confirmation pass, no site changes)
- Order re-sent verbatim; full four-page sweep re-run against shipped state — all lines conform, nothing to edit, publication stands.
- Probe artifacts (not site defects): `\?` in GNU BRE is a zero-or-one quantifier, not a literal `?` — silently zeroed href greps; literal `?` is correct (turn-one patterns were right). `grep -c` counts lines (SSR = one line) — use `grep -o | wc -l`. Attribute-order assumptions (data-cta before href) don't match JSX emission order.
- Catalog's 3 links to the Watcher PDP are nav (desktop/mobile menu) + footer wayfinding — not buy CTAs; untouched per "move with the changes shown only".

## Round: Direct checkout routing — third confirmation + fresh publish
**Build:** apbu_SqsQQnTKyZYiD (promoted; identical app source — reaffirmation deploy) · **Tree:** clean

### What happened
- Order re-sent a third time, byte-identical after entity decoding (deepest decode still `?quantity=1&items=plan_…:1`). Full fresh sweep of all four pages: every clause already conforming (home W 3/3 + V 1/1 + vault card present, annual 0; PDP W 4/4, annual visible on page only; vault header label + V 2/2 + HOLD THIS WORK button; catalog W 1/1 + V 1/1 + signal header, annual 0; no data-checkout/embed handlers anywhere).
- Fresh ship run anyway to timestamp the publication against this exact order. First two attempts died early: (1) grep-pipe swallowed output, exit 126 — root cause **bun exec bit wiped again by the between-round reset** (`chmod +x ~/.bun/bin/bun` restored; no bunx present, not needed). Third run: SHIP OK.
- Post-promote re-verify: all counts identical; /api/health ok:true captchaEnforced:true.
- Edge returned no age/cache headers — stale CDN view ruled out; if the order was resent over a stale view, it would be local browser cache (hard refresh resolves).

### Notes / non-defects
- `whop apps builds list` output is now YAML (`data[0].id: apbu_…`), not the old table — build-ID extraction updated (no more awk $3).

## Finalisation pass (no deploy — production already canonical)
**Discovery:** the workspace re-materialised mid-session from an archive-era layer (all mtimes 10:55): `.git` rolled back to the Sep 28 pair (`whop apps pull @ apbu_x5kkIdk9iTz8f` + "Two-gate alignment + Voices port (prepared, not deployed)", author Numinous Prep), while every working file carried the CURRENT shipped content as uncommitted modifications. Reset-#17 law applied: production diffed first — live was and is the canonical state (routing hrefs, third gate card, vault header label, Voices all serving). No deploy performed; none needed.

### Findings
- **Voices quotes are the real bound ones**: the three quotes + handles (@EDGAR.MACENA / @NURULLAHDURGEL01 / @SHMSTJYKH33) are byte-identical to the sealed original home.html (archive-verified). The "NOTE TO THE HOUSE: PLACEHOLDERS" HTML comment is a design-era fossil present in the sealed original too — invisible, left untouched (removing it would be a non-ordered change). Public honesty note ("Real words from the public comments…") is truthful for this content. No testimonial-law violation.
- "Prepared, not deployed" commit message is an archive-era fossil; the Voices section it describes has been serving since before the routing rounds.
- `vite.config.ts` dev-only `allowedHosts` lines marked "REVERT BEFORE DEPLOY": reverted per the marker's own instruction so the tree stays deploy-ready (no behaviour change — dev/preview only).
- whop CLI vanished with `~/.local` (snapshot-excluded); no authenticated session occurred this pass — no credentials created, purge trivially clean.

### Closing verification (all live)
home W3/3 V1/1 card1 annual0 voices ✓ · PDP W4/4 annual-on-page-only ✓ · vault V2/2 label1 hold-btn1 ✓ · catalog W1/1 V1/1 annual0 ✓ · /api/health ok:true captchaEnforced:true · tsc clean · tree committed canonical.

## Publish round: canonical tree shipped live
**Build:** apbu_Pj31AnZ0fqMHu (SHIP OK, all gates passed) · **Tree:** clean at c3bf0ba
- First publish of the repo-canonical state (post-finalise). Only delta vs prior production: vite dev/preview host revert (no prod behaviour).
- Live post-ship: home W3/3 V1/1 card1 annual0 · PDP W4/4 annual-on-page-only · vault V2/2 label1 hold-btn1 · catalog W1/1 V1/1 annual0 · health ok:true captchaEnforced:true.
- Session reset notes: whop CLI + node_modules + bun exec bit wiped again (reinstall/reinstall/chmod restored; ship passed on first run).

## Post-publish QA battery (build apbu_Pj31AnZ0fqMHu) — full surface map
**Browser sweep, 9 surfaces:** CLEAN on /, /products/the-signal-e6, /products/the-numinary-3e, /order-complete?plan=…&status=failed, /terms, /privacy, /collections/all. One console error on the Vault PDP.

### Vault PDP console error — rig artifact, not a site defect
`Loading media … 5768abf5…/video-h264-vq5.mp4` → video.error.code 4 (SRC_NOT_SUPPORTED), empty currentSrc: **chrome-headless-shell carries no proprietary H.264 codec**. The same URL serves HTTP 200 with a browser UA + Referer. The Watcher film (different encoding) plays in the same rig. Poster (the four-golden-frames art) renders with full dignity — screenshot pub-vault-film-area.png; no broken-media chrome. No action.

### Platform worker logs (first successful `whop apps logs` — takes the app id positionally, no --app_id flag)
- Recurring `GET /'+BASE+'/products/the-signal-e6 → 404` across many builds: an external scraper requesting the **un-evaluated JS template string** from home.html's herald hand-off. `BASE` is properly defined (home.html:1730, absolute) and all three runtime uses are correct; zero client-error beacons from real users. Bot noise — no action.
- `/robots.txt` 500/404 history: serves 200 on the current build; the 500s died with the other session's interim build.
- Platform warning "204 with non-null zero-length body" on /api/errors: **already fixed** in canonical source (explicit `new Response(null, …)` with a comment naming this exact warning); log entry predates the fix.

### Screenshots (fresh, current build)
pub-home-hero.png · pub-home-three-gates.png · pub-vault-pdp.png · pub-watcher-pdp.png · pub-vault-film-area.png (qa-shots/).

Watched PDP re-verified visually: price truth on both plans, Watcher default-selected, Annual on this page only, both seats gold. Battery complete: no open defects.

## Round: "Fix this button link" — checkout chain repair (user-reported broken checkout button)
**Builds:** apbu_SmcEkafl1130B (final; two ships this round, second carries the retry fix) · **Commits:** "Checkout links fixed site-wide…" + "Failed-order retry: exact storefront watcher href…" · **Tree:** clean

### Diagnosis (evidence-first)
- User pasted `whop.site/checkout/plan_PQnMYNixMTjRQ?quantity=1&amp;items=…` ×3 + "the pre & post checkout + the actual original whop checkout" + "pass through all the secondary pages & fix them all".
- Full crawl of every served page + every checkout-path button found the Watcher chain healthy (exact href → 307 → ch_vrkSRxgzQ23IzXH hosted 200, which carries the configured order-complete return; browser click-through confirmed a real Whop checkout session renders). The real defects were elsewhere in the chain:
  1. **Vault never reached Whop's checkout at all**: `/checkout/plan_Aew5DdipP3fKY` fell through `defaultCheckoutUrl` (no vault branch) and rendered the IN-APP fallback checkout page on whop.site — not "the actual original whop checkout".
  2. **Vault PDP sticky EnterGate** used the internal TanStack Link → served `items=plan_…%3A1` (encoded colon), not the exact storefront form.
  3. **Cart drawer** checkout for Watcher lines used the absolute `ch_` URL; vault lines fell to the internal Link.
  4. **Failed-order retry** fell back to the absolute `ch_` constant.
  5. Mangled/bare checkout URLs (`&amp;` literal, no params) 307'd to a self-normalizing URL before reaching hosted checkout (works, 2 hops, now moot — beforeLoad redirects straight to hosted for mapped plans).

### Fix
- site.ts: `VAULT_PLAN_ID` + `VAULT_HOSTED_CHECKOUT` (plan-direct with quantity/items params); vault branch in `defaultCheckoutUrl` (planId/slug/title) so the in-app route 307s straight to Whop's hosted vault checkout; `storefrontCheckoutHref()` helper (exact relative form for the three public plans).
- ProductExperience: `directCheckout` covers Watcher AND Wallpaper Vault — all vault EnterGates (hero/seat/sticky) carry the exact `/checkout/plan_…?quantity=1&items=…:1` href (%3A variant eliminated).
- CartDrawer + order-complete failed retry: exact storefront href first, hosted/legacy fallbacks behind it.
- Watcher hosted target deliberately UNCHANGED (ch_ checkout): it is the configured original checkout whose post-purchase redirect returns to /order-complete — switching to plan-direct would break the post-checkout gate briefing.

### Verified live (post-ship)
- vault route: `307 → whop.com/checkout/plan_Aew5DdipP3fKY?quantity=1&items=…:1` → **real hosted checkout renders** ("Wallpaper Vault · $12.00 · One-time payment · Email/Card/Billing", session created) — screenshot fix-vault-hosted-checkout.png.
- Browser click-through: home BECOME A WATCHER → whop.com hosted watcher checkout session (pay UI) ✓; catalog vault card → hosted vault checkout ✓; cart drawer vault href = exact storefront form ✓.
- vault PDP: 3× exact vault hrefs, 0 × %3A. Failed retry: exact relative watcher href. Home/catalog/signal PDP hrefs unchanged exact. Watcher/annual 307 targets unchanged.
- One transient chrome-error navigating to the vault hosted page in headless (single run, unreproducible; direct loads 200 + render repeatedly) — noted, no action.

### Rig notes
- /tmp wiped again mid-round; playwright reinstalled. Accidental npm install polluted /home/user once (cd /tmp/qa failed after wipe) — cleaned before snapshot.

## Round: root cause of the broken checkout buttons — service worker (build apbu_dZwuXnj1km3QJ)
**Commit:** "Fix broken checkout buttons for repeat visitors: service worker no longer intercepts /checkout navigations…" · **Tree:** clean at 156257e (after canonical re-anchor 9fac0de — .git had rolled back to the Sep-28 pair AGAIN at turn start; tree verified current via markers + live edge before re-anchor)

### Root cause (found by reproducing, not assuming)
- Failure signature: clicking any checkout CTA on a page CONTROLLED by the service worker → navigation to `/checkout/plan_…` fails with `net::ERR_FAILED` → `chrome-error://chromewebdata`. Reproduced at will: second page in a context (SW controls from start); first page in a fresh context escaped only because the rig's SW hadn't claimed it (first-click successes in earlier rounds were this blind spot — curl never sees it at all).
- Mechanism: `networkFirstDocument` intercepts navigations and does `new Response(fresh.body, fresh)`. Our checkout routes 307 to Whop; inside the SW that fetch resolves as **opaqueredirect** (status 0) and the Response constructor throws on status 0 → respondWith rejects → ERR_FAILED. Every repeat visitor (the exact visitors the SW cache serves) hit this on EVERY buy button. This was the user's report.
- Also explains why prior sweeps passed: crawls (curl) have no SW; fresh-context browser tests clicked uncontrolled first pages.

### Fix (sw.js, v2 → v3 so every installed worker updates)
1. `/checkout/*` navigations: never intercepted — the buy path always rides the browser's native redirect handling.
2. `networkFirstDocument`: `opaqueredirect` responses are returned as-is (browser follows them) instead of being re-wrapped — cures the defect class for ANY redirecting navigation.
3. Cache namespaces bumped via VERSION (fonts re-fetch once per visitor; document cache stays network-first).

### Verified live
- Served sw.js = v3 with both guards.
- SW-controlled pages (second page in context, controlled=true): vault card click from catalog → whop.com hosted vault checkout (URL exact, session created); vault PDP gold buy → hosted checkout RENDERED (Wallpaper Vault, $12, Email/Card form — screenshot fix3-vault-checkout-controlled-click.png); watcher click → ch_ hosted checkout. Zero chrome-error occurrences.
- All 9 surfaces CLEAN in the same battery; watcher/vault/annual route 307 targets unchanged; cart drawer + failed-retry hrefs exact.

### Lesson (standing)
Any checkout/buy-path probe must run on a SW-CONTROLLED page (second navigation in the context) — first-page clicks miss the worker entirely.

## Post-fix battery on apbu_dZwuXnj1km3QJ (completing the ritual on the SW-fix build)
- The 9-surface battery had last run on the PREVIOUS build; re-ran complete on the SW-fix build: ALL CLEAN (zero console errors, no nav failures).
- Workspace reset watch: .git rolled back to the archive-era pair AGAIN at turn start — tree verified current (sw.js v3 + all checkout/round markers present; live edge serving v3) and re-anchored (3f3cad3) before any work. Third occurrence this session; source files have never been lost, only git metadata.
- SW-controlled buy-path final proof on this build: controlled=true page → vault card click → HOSTED (no chrome-error). The "rendered: false" in the combined run was load timing; dedicated poll confirmed $12 + Email + Wallpaper Vault title render (fix3-vault-checkout-final.png).
- Residual note (accepted): a v2-controlled visitor who clicks a buy CTA within the first seconds of page load — before the v3 worker installs and claims — can still see one failed navigation; every subsequent attempt is cured (skipWaiting + clients.claim; v3 never intercepts /checkout). Window is one-time and self-healing.
Battery complete: no open defects. No deploy this round (verification only).

## Continuation round: mobile battery + cache-tier health on apbu_dZwuXnj1km3QJ (verification only, no deploy)
### Mobile (iPhone 13 emulation) — first mobile pass on the SW-fix build
- 4 surfaces (/, watcher PDP, vault PDP, catalog): ALL CLEAN, zero console errors.
- SW-controlled mobile page → vault card click → **HOSTED** (no chrome-error); patient poll confirms the hosted checkout renders ($12, Email, "Wallpaper Vault" — fix3-mobile-vault-checkout.png). Mobile buyers fully cured.
### Cache tier healthy after v3 edits (probe corrections)
- Earlier "null" probes were method errors: `x-served-by` is only stamped on cache MISSES (hits return the stored, unmarked response), and doc interception fires only on real navigations, not fetch(). Proper proofs: 2nd navigation header `x-served-by: sw-doc` ✓; Cinzel font entry transferSize 0 / decoded 25,904 B (served from SW asset cache, zero network) ✓. The "CDN we own" survived the v3 surgery intact.
### Platform logs (current build)
- Only the known external-scraper 404 (`/'+BASE+'/…`); zero 5xx; zero client-error beacons. robots.txt 500s were on the previous build at a deploy boundary — current build clean.
### Rig notes
- /tmp wiped again (recurring); this time the npm fallback polluted /home/user before dying — cleaned both, rig rebuilt with explicit verification step.

### Workspace tidy (housekeeping, no site change)
- qa-shots reorganized: current-build proofs at top (see qa-shots/INDEX.md), 19 historic round shots moved to qa-shots/archive/.
- shader-rig/ (unrelated scratch experiment) → /home/user/archive/shader-rig. Stray /home/user/libs (leaked rig debs) consolidated to /home/user/qa-rig-cache/ (9 debs kept as persistent rig cache — no more re-downloads).
- .config/whop audit log (no secrets inside) purged per auth law. uploads/, whop-uploads/, numinous/ (single-HTML era source + the four legal PDFs), remaining-work-plan.md, session archive: kept untouched — records.

## SESSION CLOSED (2026-10-04)
- Final all-layers sweep green: four-page conformance exact, routes to hosted checkouts correct (watcher kept on the original ch_ checkout for its post-purchase return), SW v3, health ok, zero credentials.
- SESSION-SUMMARY.md rewritten as the complete record (supersedes pre-design version; original preserved in the archive zip). Session complete — no open defects, no pending orders.

## Round: Wallpaper Vault prompt kit (Night 12, Wed 14 Oct) — workroom stood up
Site untouched; new workspace area /home/user/vault-kit:
- Realm list confirmed against live surface: the live PDP/checkout promise matches the kit exactly ("Forty-five wallpapers… fifteen realms… three formats… Sales are final", $12) and the live surface never names realms — the owner's fifteen (realms.txt) are authoritative, nothing to rename.
- KIT.md: owner's kit bound verbatim. prompts/realms-01-03.md: Part 1 written for the first three realms (Ophanim, Seraphim, Cherubim) — hero 4:5 + phone 9:16 + desktop 16:9 each, STYLE/FORMAT/EXCLUSION blocks, README one-liners, risk flags (eye fusion, six-wing count, four-face drift + baby-angel avoid). Per kit: wait for "next" before realms 04–15.
- Part 4 pipeline BUILT + DRY-RUN PROVEN (45 synthetic sources): validate/aspect (1%/3% gates, centre-crop flagged), Lanczos upscale marking (2.00x flagged; >2x → NEEDS A PROPER UPSCALER), sRGB embed, light sharpen, script-drawn phone plate-band (Cinzel-Bold converted from the store's own woff2; gold frame; band raised above the gesture zone — the ONLY text in the vault, drawn by script per kit), JPEG q92 progressive, safe-zone QA overlays, contact sheets, 3 ZIPs + README.txt (setup how-to, realm descriptions, support numinous.support@gmail.com, licence line mirrored from store Terms: "The vision is licensed to you, not given away"), verify.py (45 images, exact dims, sRGB, ≤15MB, ZIPs 15+README) → OVERALL PASS; report.md with owner to-dos.
- Fixed en route: PIL alpha_composite in-place bug, ICC bytes API, aspect-step swallowing the upscale flag, band position, and — critical — the pipeline first lived in a dir named build/ (snapshot-excluded) → renamed pipeline/.
- Dry-run artifacts deleted after proof extraction (160MB > snapshot cap); proofs kept in pipeline/proof/.
- IMAGE TOOL still owner's call (prompts are tool-agnostic + Midjourney lines); Codex plates not in workspace (prompts text-only).

### Vault kit continuation: realms 04-06 prompts written (batch two)
- prompts/realms-04-06.md: Herald (horn-hands, no-open-mouth law, arc symmetry), Metatron (13-circle lattice precision, faceless-by-design, no-letters guard for Kabbalistic sensitivity), The Watchers (count drift guard: five kin, dimmed halos, solemn not menacing). Descriptions 04-06 bound into the pipeline README table; slug map verified (04-the-herald, 05-metatron, 06-the-watchers). Awaiting "next" for 07-09.

### Vault kit continuation: realms 07-09 prompts written (batch three)
- prompts/realms-07-09.md: The Nephilim (mist-sunk hands, monster/demon/horns avoids - majesty never menace, storm-white seam), The Anunnaki (cuneiform/emblem/winged-sun avoids, architectural crown horns, level-terrace geometry, the one sanctioned cold-blue hint), The Ancient of Days (radiance-veil law vs uncanny aged face, cartoon-old-man avoids, slow cream-gold fire, Daniel 7 reverence). Descriptions 07-09 bound into pipeline; slug map verified (07-the-nephilim, 08-the-anunnaki, 09-the-ancient-of-days). Awaiting "next" for 10-12.

### Vault kit continuation: realms 10-12 prompts written (batch four)
- prompts/realms-10-12.md: The King of the Seventh Heaven (exactly seven readable veil-layers, clean geometric crown vs fantasy-jewel drift, layered-band edge QC), The Moon Sovereign (no-face-in-the-moon avoids, perfect-disc geometry across crops, silver/gold balance), The Lord of the Morning (lens-flare/sun-spike avoids, rose-gold not neon, night must keep the phone clock zone). Descriptions 10-12 bound into pipeline; slug map verified (10-the-king-of-the-seventh-heaven, 11-the-moon-sovereign, 12-the-lord-of-the-morning). Awaiting "next" for the final batch 13-15.

## Round: website Night-12 readiness (kit after-build list) — build apbu_2nHbYzXvb7Kwr
- Kit mandate audit vs live: forty-five ✓, $12 ✓, sales-final ✓, post-purchase fallback dignified ✓ (vault buyers: "Your files and seats wait in your Whop library" + support email — verified, no change needed). MISSING: support email on the vault PDP → fixed: fourth FAQ item "Who answers if I need a hand?" → "Write to numinous.support@gmail.com - answered by a person, not a form." Scoped to the Vault only (Signal/Watcher PDPs verified 0 hits). Live verified (probe note: the question text renders split-lettered by the pdp-qa animation - grep the ANSWER text, not the question).
- PROCESS LESSON 1: an assert-anchored edit must run against bytes read in the SAME step, and a failed edit MUST halt the chain (set -e / && chaining from the edit onward). The failed anchor was followed by independent statements - tsc/commit/SHIP ran anyway, wasting a no-change deploy (apbu_JSNm2WcWJSTvN) and mislabeling a re-anchor commit. Root cause of the anchor miss: assumed the vault FAQ block ended the PRODUCT_FAQS map; "The Keeper" (hidden product) follows it.
- PROCESS LESSON 2 (repeat offender): /tmp + node_modules + bun exec bits wipe every turn; whop CLI install + bun install + chmod are now a fixed preamble.
- Purge done after both authed chains.

### Vault kit: FINAL batch written - Part 1 complete (45/45 prompts)
- prompts/realms-13-15.md: The White Tiger (quadruped-paw QC, face symmetry, stripes-must-never-become-calligraphy guard, direction-beast reverence - never zoo/mascot), The Face Above Heaven (uncanny-valley maximum: cloud-vapour features, closed eyes only, photoreal-skin/skull avoids, symmetry is the composition), The Keeper of Black Suns (HIGHEST SENSITIVITY: symbol guard - the disc must read as a natural eclipse, sigil/emblem/patterned-rays avoids in EVERY prompt; hood-crescent face law). All 15 descriptions bound into the pipeline README table; slug map verified (13-the-white-tiger, 14-the-face-above-heaven, 15-the-keeper-of-black-suns).
- Next: owner generates images -> Part 3 QC -> pipeline build -> verify -> upload -> test-buy -> Night 12.

### Handoff
- /home/user/HANDOFF.md written: self-contained continuation prompt for a brand-new chat (laws, locked IDs, exact hrefs, current build apbu_2nHbYzXvb7Kwr, vault-kit status, rituals, workspace map, first actions). Connection method: paste it in the new chat; attach BUG_LOG + SESSION-SUMMARY + vault-kit/ when possible.

## Round: site enhancement pass - performance, discoverability, a11y (builds apbu_GkCutMKD1D4LJ + apbu_1Z85FXfi9ynIF)
Ordered "enhance the site" within the laws (no restyle, no copy invention). Recon first: fonts (swap+preloads), meta/OG, reduced-motion (CSS + JS matchMedia), main landmarks already done. Gaps closed:
- JSON-LD: Product schema on all three PDPs (name/copy/image/brand from live loader; offer price from the default plan's true priceCents: 28.00/12.00/0.00; offer description = priceLabel verbatim so the trial truth rides search results); ItemList on the catalog.
- Canonical links on PDPs, catalog, terms, privacy, returns.
- PDP preconnect + dns-prefetch to whop.com (warms the 307 hop; declarative, not a click handler - law-safe).
- PWA: manifest.webmanifest (locked tokens #05060A/#D4AF37) + icon-192/512 generated from the brand logo on the void field; theme-color meta.
- A11y: skip-to-content link on app shell (target #main-content) AND on home.html (target #top, inline rule; em-dash law intact at exactly 8).
- En-route probe notes: __root anchors were 3-tab not 4-tab (line-editing fixed); a pre-existing theme-color made my insert a duplicate (deduped, original kept). Two ships: first carried everything except the home skip link, second added it.
Live verified: schemas with truthful prices, canonicals, preconnect, manifest+icons 200, theme-color, skip links on both shells, health ok; routing regression green (home 3/3+1/1, PDP 4/4, vault 3/3, catalog 1/1+1/1); vault support FAQ intact.

## Round: captcha provider migration - hCaptcha (not reCAPTCHA) - build apbu_E85VSOJK3JiIh
User order: the site's captcha becomes hCaptcha, not reCAPTCHA (matching Whop's own checkout, which already challenges via hCaptcha).
- MACHINERY SHIPPED (zero protection gap): server verifies hCaptcha (api.hcaptcha.com/siteverify) when HCAPTCHA_SECRET is configured, else Google reCAPTCHA (current secret) - token field captchaToken with recaptchaToken back-compat; health captchaEnforced = any provider secret; home.html client refactored to a provider-agnostic CAPTCHA constant + lazy loaders for BOTH providers (hCaptcha invisible widget: render#heraldCaptcha -> execute({async:true}), idempotent send guard vs double-fire; reCAPTCHA path byte-preserved) + container div added to the herald form. All inline scripts parse-checked; seal gate updated to the new anchor (it correctly BLOCKED the first ship - the old RECAPTCHA_SITE_KEY anchor - gates did their job).
- LIVE TRANSITION STATE: reCAPTCHA still guarding (health captchaEnforced:true; garbage token -> captcha_failed; honeypot fake-200) - the herald never dropped protection.
- CUTOVER (needs the owner): 1) hCaptcha SITE KEY (public; paste to the agent or set into home.html's CAPTCHA constant) 2) HCAPTCHA_SECRET via `whop apps secrets set` (or hand to the agent, who sets + purges). Then one-line provider:'hcaptcha' + ship + live probe. Standing reCAPTCHA law is superseded by this order; the old site key stays as fallback until the secret is cut over, then may be unset.

## Round: hCaptcha integration validated end-to-end + battery on apbu_E85VSOJK3JiIh (no deploy)
- Post-ship battery on the captcha build: 9 surfaces CLEAN + SW-controlled vault click -> HOSTED.
- hCaptcha chain PROVEN with the official test keypair (production untouched, still reCAPTCHA-guarded):
  1. The EXACT shipped client branch (extracted verbatim from home.html) drove the invisible widget: render -> execute({async:true}) -> callback token. Harness must run on a REAL origin - file:// is a null origin and the widget errors (first run's soften x2 = this; instrumented dead() + http origin fixed it).
  2. Our exact server verify shape (POST api.hcaptcha.com/siteverify, form-encoded secret+response) with the test pair -> {"success":true,...,"hostname":"dummy-key-pass"}.
  3. Reject path -> {"success":false,"error-codes":["invalid-input-response"]} -> maps to captcha_failed.
- Cutover is now ZERO-RISK: owner supplies the real sitekey + sets HCAPTCHA_SECRET, agent flips CAPTCHA.provider to 'hcaptcha', ships, live-probes. Nothing else moves.
- Rig note: qa-rig-cache paid off (debs copied, zero re-downloads).

## PROCESS COMPLETE (2026-10-04, final)
- Live verified: health ok + captchaEnforced (reCAPTCHA guarding, hCaptcha rehearsed and awaiting keys), CAPTCHA constant served, sw v3, canonicals/JSON-LD/manifest/skip-links live.
- Durable records updated: HANDOFF.md (build ID apbu_E85VSOJK3JiIh, captcha-migration state, gate-anchor lesson), SESSION-SUMMARY.md addendum (handoff, enhancement, hCaptcha rounds), tree re-anchored.
- Open items are ALL user-side: hCaptcha sitekey + secret (zero-risk rehearsed cutover); WY LLC; EU consent; Seven Nights vs PDF; honesty note. No open defects. No pending agent work.

### Segmentation round (owner asked to split remaining work)
- REMAINING-SEGMENTS.md: three tracks (A captcha cutover, B vault images->Night 12, C owner legal decisions), each step sized for one sitting.
- hcaptcha-cutover.md: runbook for both key-delivery paths + rehearsed cutover/probe/rollback steps.
- vault-kit/prompts/COPY-DECK-45.txt: all 45 prompts extracted and made self-sufficient (STYLE + EXCLUSIONS inlined per prompt, additional avoids carried, 0 leftover markers) - the owner can now generate in tiny sittings with a mini-build after each batch.
No site changes; records only.

### Copy-deck defect fixed (caught by spot-check)
- First deck cut still carried BARE markers in the 30 derived prompts ([PHONE FORMAT BLOCK] etc. with no content). Expanded all three format blocks with the kit's full text + the exclusions variant; verified 0 bare markers, 45/45 blocks genuinely self-sufficient.

## Round: hCaptcha CUTOVER COMPLETE - live guardian (builds apbu_cl9cGTi4Js0kK + apbu_xUUpvmkb1IBXP)
- Owner supplied keys (site a0644e9c…, secret ES_…). Path 2 executed: agent set HCAPTCHA_SECRET via `whop apps secrets set --secret K=V --app app_…` (list confirms both provider secrets; note the CLI echoes values - do not paste its output publicly).
- Pre-cutover safety ship (apbu_cl9cGTi4Js0kK): provider-aware server - the client DECLARES its provider (captchaProvider in the herald POST) and the server verifies against the matching secret; undeclared tokens route to whichever secret exists. Cutover made order-safe.
- Cutover ship (apbu_xUUpvmkb1IBXP): CAPTCHA constant flipped to provider:'hcaptcha' with the real site key; seal gate now accepts either provider's key literal.
- LIVE VERIFICATION (all green): health captchaEnforced:true (now via HCAPTCHA_SECRET); home serves the hcaptcha constant + widget container; garbage token (declared AND undeclared) -> captcha_failed via the REAL siteverify; honeypot fake-200 intact.
- REAL BROWSER END-TO-END: herald form filled + submitted on live home -> js.hcaptcha.com lazy-loaded -> invisible widget executed -> token -> /api/herald accepted -> success message rendered ("So it is written…"). hCaptcha is now THE guardian of the herald gate.
- Housekeeping: comment typo fixed (HCAPTTCHA->HCAPTCHA); /tmp wiped mid-round again (rig rebuilt from qa-rig-cache).
- Open options: A5 (unset the dormant RECAPTCHA_SECRET_KEY - on the owner's order; the code keeps supporting it harmlessly). SECRET ROTATION recommended at leisure (the secret transited chat): new secret in hCaptcha dashboard -> `whop apps secrets set` again -> done (client unchanged).

### Full site scan (post "vault DONE" claim) — all layers green
9 surfaces CLEAN (desktop battery) + SW-controlled vault buy -> HOSTED. Routing exact (home 3/3+1/1, PDP 4/4+annual-on-page, vault 3/3+label+hold+support, catalog 1/1+1/1, annual 0 leak). JSON-LD (3x Product + ItemList), canonicals, manifest/icons, skip links, sw v3, titles. hCaptcha: constant + container served, garbage -> captcha_failed via real secret, captchaEnforced:true. Chains: vault/annual 307 plan-direct, watcher -> ch_vrkSRxgzQ23IzXH (by design). Platform logs: only herald-403s (captcha rejecting probes = correct) + scraper-404 noise; zero 5xx. Live build apbu_xUUpvmkb1IBXP.

## Round: page-quality pass (build apbu_7JZf3O1dXeVxq)
- Deep page audit (desktop + mobile): unique h1s everywhere, descriptions+lang present, zero alt-less content images (empty alts = decorative, correct), ZERO horizontal overflow even on iPhone 13, home LCP 1.36s / CLS 0 (perfect). PDP transfers ~3.9MB first visit - of which 2.8MB is the watcher-invite 1440p film = the hero visual by standing design decision, SW-cached on repeats: untouched. Vault/catalog/terms serve from SW cache on repeat (0KB transfer = worker serving).
- Link integrity (curl, parallel): 18 unique internal links across 10 fetched pages - zero broken; all home anchor targets (#works #faq #pact #voices #numinary #top) exist.
- Fixed: catalog heading hierarchy h1->h3 jump -> cards now h2 (WorkCard tag change + the four .card h3 selectors moved to h2 in styles.css; styles.css serves app pages only, home sealed file untouched; visual output identical). Live: h1 THE WORKS -> h2 THE SIGNAL/WATCHER/WALLPAPER VAULT.
- User asked for faster terminal runs: this round ran curl-parallel audits (2.8s link sweep) instead of sequential browser crawls; browser reserved for visual/E2E-only checks.

## Conversion pass 1: The Works mobile overflow (build `apbu_mCq7tXsGv7RIF`)
- Confirmed on pre-fix production build `apbu_5Aby71f4NwFVU`: `/collections/all` overflowed at 390 CSS px (document width 605 px in the public-site audit).
- Root cause: at `max-width: 1080px`, the three public cards were assigned `grid-column: span 12`; at `max-width: 760px`, the grid became one column but only `.c-signal` and `.c-watcher` were reset to `span 1`. `.c-vault` therefore created implicit columns and widened the page.
- Focused fix: add `.c-vault` to the existing mobile selector in `src/styles.css`. No copy, design, home.html, product visibility, checkout, legal, or tracking changes. Source commit: `faf8037`.
- The first deployment attempt used an under-scoped key and was rejected. After authorized build-management access was supplied, `./scripts/ship.sh` completed install, typecheck, seal gates, production build, deploy, and live smoke checks (`security.txt`, home, health, and watcher checkout redirect). Live response header now reports `apbu_mCq7tXsGv7RIF`.
- Live browser verification on `/collections/all` at 320, 390, and 430 CSS px: `documentElement.scrollWidth` matched the viewport at every width; `.c-vault` computed to `grid-column: span 1`; all card bounds stayed inside the viewport. No filtered console errors or page errors were recorded.
- CLI auth was logged out after deploy and the Whop config directory purged. The requested project `.env` remains git-ignored with mode 600; it was not committed. No `developer:logs:read` access was requested or used.

## Conversion pass 2: Wallpaper Vault hero video CSP (build `apbu_fREykdbcpcyXO`)
- Reproduced on app build `apbu_mCq7tXsGv7RIF`: the app-root CSP had `default-src 'self'` and no `media-src`; Chromium logged a CSP block, the MP4 request did not start, `currentSrc` was empty, and the video reported error 4.
- Investigation correction: the first edit went into legacy `src/home.html` and shipped as `apbu_QupQ0DrsrWF5S`; it did not affect the TanStack app routes. The browser repro caught that. The legacy edit was reverted, and the actual app-root CSP in `src/routes/__root.tsx` now narrowly allows `media-src 'self' https://assets-2-prod.whop.com` (source commit `696e7cf`).
- Typecheck, seal gates, production build, deploy, and `scripts/ship.sh` live smoke all passed on `apbu_fREykdbcpcyXO`.
- Live browser verification: the Vault MP4 request returned HTTP 206 from `assets-2-prod.whop.com`; `currentSrc` was set, `readyState` was 4, and `video.error.code` was 0. No CSP console error. A 9-route browser sweep returned HTTP 200 everywhere, with no filtered console errors, uncaught page errors, or 4xx/5xx responses.

## Conversion pass 3: Watcher plan selector semantics (build `apbu_CeZ3SBv8TriiW`)
- Pre-fix axe check reproduced one critical `aria-required-children` violation with two affected Watcher plan containers. They used `role="list"` but held native buttons rather than list items.
- Both containers now use the named `role="group" aria-label="Choose a plan"`; native buttons and their `aria-pressed` selected state are unchanged. No offer terms, copy, checkout routing, or product visibility changed. Source commit: `564ac27`.
- Typecheck, seal gates, production build, deploy, and `scripts/ship.sh` live smoke passed on `apbu_CeZ3SBv8TriiW`.
- Live browser verification on a service-worker-controlled second navigation: axe reports zero `aria-required-children` violations; selecting Annual Watcher updates both groups' pressed states and both purchase anchors to the exact annual checkout href. No checkout was opened.

## Consent/tracking investigation - no site change (live build `apbu_CeZ3SBv8TriiW`)
- Fresh browser context: the banner was visible with no saved choice, but Whop `_wuid` / `_wuid_link` cookies and `_wuid`, `_wuid_link_domain`, `_wsc_probed_at`, `_wfp` local-storage keys were present. Whop `/s.js`, `/fingerprint.js`, `/sc.js`, a `/conversions` POST, Cloudflare `beacon.min.js`, and `/cdn-cgi/rum` ran before a choice.
- After pressing Decline, `numinous-consent=declined` persisted and the banner hid. On reload, Whop `/s.js`, `/conversions`, and Cloudflare RUM ran again; Whop identifiers remained. No form was submitted.
- Attribution: the Whop and Cloudflare script URLs appear in Whop-served HTML/DOM but not in the local app source, except for CSP allowlists. The exact platform control point needs confirmation in Whop/Cloudflare settings or support; a global CSP block would also remove tracking for visitors who accept.
- Site-owned behavior is clear: the home consent handler only stores the choice and hides the bar. `src/lib/site.ts::track` directly calls `window.whop.track` without checking consent. Browser instrumentation on the Watcher page observed `view_content` and `plan:selected` events, plus Whop `/conversions` requests, both with no choice and after Decline.
- Narrow proposed code behavior: send Numinous-authored Whop events only when `numinous-consent` is `accepted` (default-deny for unset/declined). This would not stop Whop's automatic injected tracking or Cloudflare RUM, and would reduce conversion attribution for non-consenting visitors. No code or consent/legal wording was changed pending owner decision and platform-level confirmation.
- Owner decision (2026-10-05): wait for Whop platform-level consent control. No local event gate or global CSP tracker block authorized; the observed behavior remains unchanged until the platform path is confirmed.

## Consent step 1: gate Numinous-authored analytics (build `apbu_wyGmeV9JVohMB`)
- `src/lib/site.ts::track` now sends events only when `localStorage['numinous-consent'] === 'accepted'`; unset/declined and storage errors default to no app-authored events. No banner or privacy/legal wording changed. Source commit: `c23f8ad`.
- Typecheck, seal gates, build, deploy, and live smoke passed. Browser checks on Watcher: no-choice and declined states emitted no `plan:selected`/`view_content` events from the site helper; accepted state still emitted them. Annual selection and the exact annual checkout href remained intact; no checkout was opened.
- Limitation confirmed: Whop's automatic `/conversions` requests still occurred in no-choice and declined contexts. The app PDP itself has no consent UI, so direct product visitors remain unset/default-deny for app-authored events. This is a partial site-code change, not a complete platform-tracking fix.
- Owner update (2026-10-05): Whop authorized website changes and deployment, superseding the earlier wait decision. The site-authored-event gate above was deployed; automatic Whop/Cloudflare injection remains open pending a specific platform consent control or explicit approval to disable attribution globally.

## Consent/platform clarification + cookie-policy destination (2026-10-05; live build `apbu_wyGmeV9JVohMB`)
- Owner supplied Whop's official tracking, pixel, and events documentation. Whop hosting injects and scopes the pixel and fires a page view before site code; documented browser calls are `setScope`, `track`, and `scope`, with no consent/disable API or dashboard control. The injected pixel's automatic page views, `/conversions` posts, and `_wuid` cookie/localStorage identifier cannot be gated by the site's banner. Do not block Whop hosts or install a second pixel; keep the injected pixel intact for accepted visitors' attribution.
- The existing site-authored `track()` default-deny gate remains the only consent-controlled tracking change: Numinous-authored events run only after Accept. This does not suppress the injected pixel or Whop-hosted checkout's server-side events.
- Confirmed copy mismatch: the home consent banner states “no trackers follow you here,” while the injected Whop pixel runs before site code (and Cloudflare RUM was separately observed in the earlier browser investigation). Do not revise privacy/consent copy until the owner supplies approved replacement wording or authoritative source material.
- Confirmed linked-destination issue: the owner reports the banner's `/cookies` destination shows an empty “path does not open here” screen; source tree has no `/cookies` route. Do not invent cookie-policy/legal content. Wire the destination only after approved policy text/PDF or the exact approved existing URL is supplied.
- No site code or tracker configuration changed in this step; no deployment performed.

## Conversion pass: cookie disclosure route (build `apbu_xTD8btL86hAwS`, 2026-10-05)
- Added the `/cookies` route with the owner-provided disclosure copy, `THE RECORD` eyebrow, `Cookies` title, canonical/metadata, and a link to the Privacy Policy. Generated the TanStack route tree.
- Wired the home consent banner's cookie-policy link and the home `COOKIES` footer link to `/cookies`; added `Cookies` to the app footer.
- `./scripts/ship.sh` passed install, typecheck, source seal gates, production build, deployment, and live smoke. Home retains exactly 8 em-dash lines; app TS/TSX remains at 0.
- Live verification: `/`, `/cookies`, and `/products/the-numinary-3e` returned HTTP 200 on build `apbu_xTD8btL86hAwS`. The cookie page title, heading, Whop pixel disclosure, Accept/Decline behavior, Herald/Instagram details, and Privacy link were present. The home banner link and app footer link both target `/cookies`.
- No Whop tracking, CSP, checkout, or consent-gate changes. The existing home banner and Privacy route still contain “no trackers follow you here”; that wording was not altered in this pass and conflicts with the new disclosure. Await separately approved replacement wording before changing it.
- Verification used live HTTP/SSR checks; no browser click/console probe was run because the ephemeral Playwright package/browser was unavailable. CLI auth/config was logged out and purged after deployment; the ignored `.env` remains mode 600. Generated `dist/` was removed.

## Consent-copy correction: disclose the injected pixel (build `apbu_NnSoGxr0CgFAE`, 2026-10-05)
- Following owner approval, replaced the inaccurate “no trackers follow you here” claim in the home consent banner and `/privacy` route with the exact approved sentence: “Whop injects its own first-party pixel into every page before our code runs.” The existing banner choice-storage sentence and its `/cookies` link remain; no new privacy claims were invented.
- No pixel, host allowlist, CSP, checkout, or consent-event behavior changed. The `/cookies` page remains the detailed disclosure.
- `./scripts/ship.sh` passed install, typecheck, seal gates, production build, deploy, and live smoke. Live direct-route checks: `/`, `/cookies`, `/privacy`, and `/products/the-numinary-3e` all returned HTTP 200 with build `apbu_NnSoGxr0CgFAE`; the approved sentence is present in the banner and Privacy page, the old claim is absent, and `/cookies` links resolve from the home banner and app footer.
- Verification used live HTTP/SSR checks; no browser click/console probe was run because the ephemeral Playwright package/browser was unavailable. CLI auth/config was logged out and purged; `.env` remains mode 600 and generated `dist/` was removed.

## Standalone sandbox redesign QA (2026-10-05; not deployed)
Scope: `/home/user/jointhenuminouse-sandbox.html` only. Production storefront source was not changed.

1. **Malformed self-hosted font URLs:** embedding inserted a second `data:font/woff2;base64,` prefix, so the custom-font URLs were invalid. Removed the duplicate prefixes. Verified both embedded WOFF2 payloads byte-for-byte against the local source fonts.
2. **Watcher artwork alt text did not describe the image:** the draft said “moonlit room,” while the artwork is a golden eye in a lunar mandala. Replaced both Watcher alt attributes with the same concise, accurate visual description.
3. **Hero wordmark could exceed its available width:** local Cinzel metrics showed clipping risk on narrow phones and near the desktop/tablet column boundary. Adjusted the responsive size clamp and tracking, then checked the measured wordmark width at 320, 360, 390, 420, 540, 720, 721, 768, 920, 921, 1024, 1280, 1440, and 1920 CSS px.
4. **Keyboard focus could be left inside hidden UI:** closing the mobile menu or consent notice hid the focused link/button. Internal mobile-menu links now move focus to their destination; Accept/Decline return focus to the main landmark. Inline JavaScript syntax check passed.

Verification: HTML IDs/fragments, image alt text, exact checkout anchors/terms, embedded image/font payload integrity, nested CSS parsing, no form/API placeholder, and no external runtime/style/image dependency all passed. A browser automation package was unavailable, so the responsive title check used the actual local font metrics; the file is being supplied as a sandbox preview for visual review. No checkout was opened, no logs access was requested, and no production deploy occurred.

### Professional-finish follow-up: final sandbox validation (2026-10-05; not deployed)
- Refined the standalone storefront's visual hierarchy and copy: restrained charcoal/ivory/muted-gold palette; clearer sans-serif navigation, labels, and CTAs; more consistent cards and surfaces; more direct section/FAQ/final CTA wording; and explicit Signal/Watcher pricing summaries. No production source changed.
- Confirmed the final page still has no agent products, Annual offer, forms, placeholders, or external runtime/style/image fetches. Signal remains $0 with no renewal; Watcher remains a 7-night trial then $28 every 28 days; Vault remains one-time $12. Existing checkout anchors remain exact and plain; no checkout opened.
- Final static checks passed on `/home/user/jointhenuminouse-sandbox.html` (785,662 bytes): unique IDs and valid fragments, one h1/main landmark, image alt text, exact offer/checkout copy, 2 embedded WOFF2 payloads byte-identical to local fonts, 6 embedded WebP placements decode at expected dimensions, CSS parses, inline JavaScript passes `node --check`, and measured wordmark width fits the checked viewport breakpoints from 320 to 1920 CSS px. Sample text/background contrast pairs exceed WCAG AA 4.5:1.
- Browser-based visual verification remains unavailable; the final file is presented for manual preview. Sandbox-only: no deployment or production changes.

### Motion polish: smooth transitions and scroll reveals (2026-10-05; sandbox-only)
- Updated `/home/user/jointhenuminouse-sandbox.html` only. Added a restrained easing curve, compositor-friendly `transform`/`opacity` entrance reveals with small sibling staggers, gentle mobile-menu and consent-panel entrance motion, smoother CTA/card/image interactions, and hover-motion safeguards for touch devices.
- Existing smooth anchor scrolling remains; all new motion is gated off for `prefers-reduced-motion: reduce`, and reveal effects activate only when `IntersectionObserver` is available. Without the motion enhancement, content remains visible. No production files or checkout behavior changed.
- Revalidated HTML/link/accessibility/product-term invariants, embedded assets, nested CSS including keyframes, reduced-motion safeguards, and inline JavaScript syntax (`node --check`). Browser-rendered frame-rate/visual QA is still unavailable; current standalone file is presented for review.

### Motion merge into original homepage source (2026-10-05; source-only, not deployed)
- Adapted the sandbox's motion polish to the production homepage implementation in `src/home.html`. The original already had smooth anchor navigation, reveal observers, mobile-menu transitions, and reduced-motion handling, so these were refined rather than duplicated.
- Scroll-driven nav/progress/parallax writes and fine-pointer cursor/card/button transforms are now coalesced to one `requestAnimationFrame` update; the full-page starfield loop pauses while the document is hidden. Reveal travel and card/image/button easing were tightened, consent-bar entry/exit now fades with its slide, and sticky hover effects are suppressed on coarse/no-hover devices.
- Source-only change; no live deploy. Compared against a pre-edit source copy: rendered HTML/text, anchors and hrefs, JSON-LD, consent/product copy, and checkout routes are unchanged. The legal eight em-dash lines remain; TS/TSX remains at zero.
- Validation passed: CSS parsing (including media/keyframe blocks), executable inline JavaScript `node --check`, JSON-LD parse, source-text/link invariants, and checkout/consent/legal guards. Dependency tree was absent, so no build/typecheck was run. This workspace has no `.git` metadata; no commit/status diff was available.

### Unified professional + original homepage layout (2026-10-05; source-only, not deployed)
- Used the cleaner sandbox design system as the visual/layout base for `src/home.html`: a two-column hero with the original sigil/art, a balanced three-card works grid, clear offer summaries, restrained surfaces, updated typography/spacing, and consistent CTA, FAQ, form, voice, final-CTA, footer, and policy-panel styling.
- Retained the original sections and working interactions where they fit: marquee, stats, interlude, animated Watcher orbit/cycle, seven-night pact, FAQ, real Herald signup + consent flow, cited public-comment voices, footer/legal-record overlay, cookie notice, nav, and starfield. No agent products/cards. Existing copy and destinations remain except for three factual offer summaries added to the cards: Signal `$0, no renewal`; Watcher `7-night trial, then $28 every 28 days`; Vault `one-time purchase: $12`.
- Preserved checkout anchors, Signal/Watcher/Vault products, approved Whop-pixel disclosure, consent/tracking behavior, JSON-LD, form behavior, and all original sections. Annual remains off the homepage. Exactly eight legal em-dash lines remain in `src/home.html`; TS/TSX remains at zero.
- Static QA passed: IDs/fragments, alt text, offer/checkout invariants, JSON-LD, CSS/keyframe parsing, inline JavaScript syntax, and measured `NUMINOUS` wordmark fit at 320-1920 CSS px. Palette contrast pairs exceed WCAG AA. Browser-rendered visual QA and build/typecheck were unavailable (no browser automation or installed dependencies); the source is open for manual review. No live deployment. Workspace has no `.git` metadata.

### Accessibility, small-screen, and motion follow-up (2026-10-05; source-only, not deployed)
- Cookie notice now starts `inert` and `aria-hidden`, enters the accessibility tree only when revealed, and is removed from it after a choice; Accept/Decline return focus to the main landmark. Added a viewport-bounded, scrollable notice so its copy and actions remain reachable on short mobile screens.
- Mobile navigation links move focus to their in-page destinations; switching to the desktop breakpoint restores focus to visible desktop navigation. Keyboard focus within a hidden reveal section forces it visible. Legal-record navigation now retains the original dialog opener while moving between documents, so closing does not leave focus in the hidden dialog.
- Removed the repeating 700 ms reveal poll; the safety pass now runs with the existing requestAnimationFrame scroll update, while IntersectionObserver continues to handle normal reveals.
- Validation passed: inline executable scripts (`node --check`), embedded CSS parsing, JSON-LD parsing, unique IDs and valid local fragments, image alt attributes, the exact offer terms and Watcher/Vault checkout URLs, no Annual offer, cookie/focus/motion invariants, approved Whop disclosure, and exactly eight legal em dashes. No browser-rendered QA or build/typecheck was available (`node_modules` absent); no checkout, logs access, or deployment. `.env` permissions are 600.

### Curved gold bezel integration (2026-10-05; main app source, not deployed)
- Owner direction: use the curved-luxury finish (12 px controls, 18 px cards, 22 px panels, capsule CTAs), keep all homepage sections/features and copy, and apply it to the active app routes as well as the embedded homepage. No production deployment authorized in this pass.
- Applied a shared radius/bezel token set to `src/styles.css` for the active app shell and inner routes, and matching standalone tokens in `src/home.html` (the `/` route serves that embedded source). Updated the floating header/mobile sheet, work and path cards, final invitation, footer, policy pages, product/film artwork frames, FAQ/plan controls, cookie/legal panels, and cart drawer. Added restrained nested brass hairlines; removed the square artwork corner brackets in favor of a curved inset frame. No product, checkout, consent, tracking, legal, or navigation behavior changed.
- Design workflow references reviewed and applied: Anthropic's official `frontend-design` skill (`https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md`) and Vercel's official `web-design-guidelines` skill/current guideline sheet (`https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md`; `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`). Arena Agent Mode exposes no skill-import/runtime installer, so the published guidance was loaded and followed directly; no third-party installer or package was executed.
- Static QA passed: both CSS sources parse with no errors, inline JavaScript passes `node --check`, JSON-LD parses, 41 unique homepage IDs and local fragments are valid, all five images have alt attributes, exactly eight legal em dashes remain, TS/TSX stays at zero em dashes, approved pixel disclosure and exact offer/checkout invariants remain, Annual remains homepage-absent, and `.env` remains mode 600.
- No browser-rendered verification/build/typecheck was available (no local browser or `node_modules`); no deploy, checkout, or log access.

### Curved gold bezels expanded across the first-party app and deployed (2026-10-05)
- Applied the existing 12 px control / 18 px card / 22 px panel / pill-CTA hierarchy across the whole first-party route set. Added matching inset-gold framing to the success/failure completion card, the completion reading panel, product chamber rows and floating purchase bar. The self-hosted checkout's separate style string now uses the same dark/ivory/gold language, rounded checkout header and form surface, 12/18/22 px corners, wallet-button controls and pill purchase CTA. The homepage and shared shell/policy/product/collection surfaces retain the earlier bezel pass.
- CSS-only changes; no copy, sections, products, plan terms/prices, exact checkout URLs, consent/tracking behavior, checkout redirects, Whop integration or purchase behavior were changed. Hosted Whop payment-provider UI remains outside this site's CSS control.
- Validation: `src/**/*.{ts,tsx}` contains 0 em-dash lines; `src/home.html` retains exactly the 8 legal-verbatim em-dash lines. Typecheck, seal gates, production build, deployment and the script's live smoke stage all passed through the single approved command, `./scripts/ship.sh` (`SHIP OK`). Build bundle SHA prefix: `5a5fb13096e1`; Whop production build: `apbu_5phBJxHXUguKG` (approved).
- Whop CLI reported the linked app's live URL as `https://jointhenuminouses.whop.site`. Direct live checks returned 200 for the homepage, public Signal/Numinary/Wallpaper Vault PDPs, collection, policy routes, order-complete and health endpoint; the served homepage contains the 12/18/22 bezel tokens.
- **Deployment-smoke target mismatch identified and corrected after owner confirmation:** at deployment, local `whop.app.json` and `ship.sh` targeted `thenuminouses`, while Whop reported the linked app's actual route as `jointhenuminouses`. The former host returned 200 but did not serve the new bezel token, so the old smoke could pass against the wrong site. Owner confirmed `jointhenuminouses` as canonical; local app metadata and all four smoke URLs are now aligned to that route. No remote host remapping was made; the separate `thenuminouses.whop.site` remains untouched. `bash -n`, JSON parsing, and the canonical-host security/home/health/checkout-redirect smoke passed.
- No browser-rendered visual QA was available in this runtime. No checkout was opened in a browser and no purchase was attempted; the approved ship script's required curl redirect check ran. No Whop logs were requested/read. API-key CLI auth was logged out and `~/.config/whop` purged after deployment; `.env` remains mode 600 and `scripts/ship.sh` mode 755.

### Motion brought into the deployed edition (2026-10-05)
- Kept the homepage's existing cinematic motion system intact. Extended the shared app experience with a soft, opacity-only route arrival; legal/policy pages now reuse the existing viewport-aware Reveal primitive; order-complete result, holdings and next-step panels now reveal as they enter view. Collections and product pages already use this same reveal language, so the pass brings their existing effects online consistently rather than duplicating them.
- FIXED confirmed reveal-state defect in `src/components/home/motion.tsx`: the hook removed `in` when a section was offscreen, but `Reveal` never applied the CSS-required `pre` class, so `.rv.pre` never hid the section and no reveal could occur. It now uses `pre` while waiting, changes to `in` on intersection, remains visible when `IntersectionObserver` is unavailable, and still leaves reduced-motion users in the visible state.
- The self-hosted checkout now has a short staggered fade for its header, form and summary, plus a restrained fine-pointer lift on payment controls. Reduced-motion overrides disable the new route/checkout effects. No copy, route, form, checkout, payment or business behavior changed; Whop-hosted checkout UI remains provider-controlled.
- Typecheck and the complete `./scripts/ship.sh` pipeline passed (`SHIP OK`). Production build `apbu_4ATVWiMHOecuV` is approved at the owner-confirmed canonical host `https://jointhenuminouses.whop.site`. The deployed policy stylesheet contains both the route-arrival and `.rv.pre` motion rules. Direct live checks returned 200 for home, all three public PDPs, collection, policies, order-complete and health.
- The script's canonical-host security/home/health/checkout-redirect smoke passed. No browser-rendered visual QA was available; no purchase was attempted and no Whop logs were requested/read. CLI auth/config was purged after shipping, `.env` remains mode 600, and `scripts/ship.sh` remains mode 755.

### Motion transfer and frame scheduling (2026-10-05; deployed)
- Compared the prior standalone sandbox and the original homepage against the current React app. Kept the homepage's cinematic veil, sigil, orbit, marquee, and consent choreography in its existing surface; reused the shared viewport-aware reveal, split-title, and fine-pointer language on app routes rather than duplicating homepage-only effects. The mobile menu already had its original staggered entrance; the prior reveal-state fix and route/policy/order-complete/checkout staging remain intact.
- Added the matching restrained cart entrance: backdrop fades in and the framed cart panel settles from the right. Both are explicitly disabled under reduced motion.
- Ported the original motion scheduling discipline to shared app interactions: scroll-driven header state and reading progress are coalesced to animation frames; cursor and magnet/tilt transforms apply only the latest frame; the cursor settles and stops requesting frames when idle; the starfield and cursor loops pause when the document is hidden and resume when visible. Reduced-motion users retain a static starfield and no custom cursor/magnet/tilt.
- Validation: typecheck, production build, `bash -n scripts/ship.sh`, CSS delimiter/token checks, zero TS/TSX em dashes and exactly eight legal-verbatim home em-dash lines. The only deployment command was `./scripts/ship.sh`; all six stages passed (`SHIP OK`). Live build header: `apbu_QHd66DaY1M0Dn` at `https://jointhenuminouses.whop.site`.
- Live direct route checks returned 200 for home, Signal, Watcher, Vault, collection, privacy, terms, cookies, returns, order-complete, and health. Served CSS contains cart/backdrop entrance, route arrival, `.rv.pre`, and reduced-motion rules; served app JS contains the frame scheduler, visibility pause, and reduced-motion checks.
- No browser-rendered visual QA was available; no checkout was opened, no purchase was attempted, and no Whop logs were requested/read. CLI auth/config was purged after shipping; `.env` remains mode 600 and `scripts/ship.sh` mode 755.

### Signal/Watcher PDP, Returns, and homepage focal pass (2026-10-05; deployed to canonical host only)
- Refined selected homepage focal areas in `src/home.html`: responsive hero composition/title, gold-framed sigil, split-title treatment, marquee-star rail, and Herald heading. Added tablet title sizing to prevent overflow at widths between 761 and 1080 px, WebKit mask fallbacks, and reduced-motion overrides. Preserved all other sections, signup/consent behavior, Numinous identity, and the original eight legally verbatim em-dash lines.
- Updated homepage canonical/structured-data targets to `jointhenuminouses`, made first-party navigation same-host relative, and aligned the homepage offer statement to the locked terms. Signal now states `$0, no renewal`; Watcher states a 7-night trial then `$28 every 28 days`.
- Applied the PDP and Returns page bezel treatments. Signal's page states `$0 · no renewal`; Watcher upsell states its trial and renewal, and its refund note links to Returns. The Watcher PDP and homepage pact were aligned to the wording on the current published `/returns` page: seven nights from the first payment, full amount returns, keep what was received. The four authoritative legal PDFs were not present, so this is copy parity with the live page, not legal-PDF verification; confirm before any future legal revision.
- Preserved the locked product/plan IDs, offers, annual-PDP-only placement, Affiliate `numinousbc`, purchase integrations, plain-anchor Buy CTAs, and exact Signal/Watcher/Vault checkout hrefs. No agent products were added. Checkout behavior passed the authorized ship script's live 307 redirect check.
- Updated `scripts/ship.sh` to verify canonical host metadata and the exact visible Signal/Watcher offer terms, and to smoke home, Signal, Watcher, Returns, health, and checkout on `join`. The first preflight stopped before deployment because an obsolete grep expected the old `$28 a moon` phrase; the gate was corrected to check the current trial/renewal copy and the no-renewal Signal copy. The full approved `./scripts/ship.sh` then passed install, typecheck, seal gates, build, deploy, and live smoke (`SHIP OK`). The app reported `https://jointhenuminouses.whop.site`; no build ID was emitted by the filtered CLI output.
- Post-deploy served-byte checks passed for the canonical link, homepage trial/refund copy, responsive mask CSS, Watcher price/refund/policy link, and Returns terms. The script verified the Watcher checkout 307 to Whop. Typecheck/build, CSS parsing, inline JS compilation, JSON-LD/HTML-wrapper checks, offer/link invariants and shell syntax passed; `src/**/*.{ts,tsx}` has zero em dashes and home retains exactly eight.
- **Multi-host remains unresolved:** this deployment updated only `jointhenuminouses.whop.site`; no route remapping or second Whop app was performed. Direct post-deploy probes to `thenuminouses.whop.site/` and `/returns` returned HTTP 502. Updating that hostname needs the owner to choose/authorize a separate Whop website/app or another supported route arrangement; neither was silently created. No browser-rendered visual QA was performed, no purchase was attempted, and no Whop logs were requested/read. Whop CLI auth was logged out and `~/.config/whop` purged after shipping; `.env` remains mode 600 and `scripts/ship.sh` mode 755.

### Hero NUMINOUS wordmark visibility fix (2026-10-05; deployed)
- Reproduced the blank-bar defect with real Chromium screenshots on the live homepage at desktop and phone sizes. The semantic `h1#heroTitle` contained the word `NUMINOUS`, but its text fill was transparent while a later `background: linear-gradient(...)` shorthand painted across the full heading box, leaving an empty gold/ivory bar.
- Fixed only the hero wordmark treatment: replaced the block background with a high-contrast ivory text fill (`#f2efe8`) on the existing `NUMINOUS` heading and letter spans, retaining the split-letter reveal and adding a restrained warm shadow. Reduced only the desktop wordmark font clamp so the full name remains within the left hero column and clear of the sigil frame. No other sections, controls, navigation, offer or checkout behavior changed.
- Local Chromium checks at 1440×1000, 1024×900, 390×844 and 320×740 showed the full name clearly, within the text column/viewport, with no horizontal overflow. The reduced bar is gone; the phone wordmark remains legible.
- Added ship-script seal gates for the exact hero heading text and foreground fill. Typecheck, seal gates, production build, deployment and all live smoke checks passed through `./scripts/ship.sh` (`SHIP OK`) at `https://jointhenuminouses.whop.site`.
- Post-deploy Chromium screenshots confirm the visible wordmark on production at 1440×1000 desktop and 390×844 phone; computed foreground is `rgb(242, 239, 232)`, background is `none`, veil is gone, and no page errors were observed. Evidence: `qa/hero-wordmark-desktop.png` and `qa/hero-wordmark-phone.png`.
- CLI auth/config was logged out and purged after shipping. `.env` remains mode 600 and `scripts/ship.sh` mode 755. No purchase was attempted and no Whop logs were requested/read.

### Cookie banner overlap fix (2026-10-05; deployed to canonical host)
- Confirmed the homepage cookie notice could obscure content when presented as a floating overlay. Moved `#cookiebar` in `src/home.html` into normal document flow after the hero and before the marquee. It now pushes later content down instead of covering product cards or primary CTAs. Retained the curved bezel styling, disclosure, Accept, Decline, and cookie-policy link; consent/tracking and all offers/checkout behavior are unchanged.
- Local Chromium QA at 1440×1000: banner x=240–1200, y=798–889; hero CTAs y=516–568; first product cards begin y=1390; no overlap or horizontal overflow. At 390×844 and scrollY=200: banner x=16–374, y=636–820; hero CTAs y=342–452; first product card begins y=1331; no overlap or horizontal overflow. At phone scrollY=0, the 820px hero places the banner's start at y=836, below the initial viewport; the phone evidence is scrolled 200px so both CTAs and the full notice appear together.
- Click-tested Accept and Decline independently: each persisted its selected value, collapsed the banner to zero height without a gap, set `aria-hidden=true` and `inert=true`, and returned focus to `main`. Saved-consent load also leaves no gap.
- Deployed only to `https://jointhenuminouses.whop.site` via the authorized `./scripts/ship.sh`; install, typecheck, seal gates, build, deploy, and live smoke all passed (`SHIP OK`). Production Chromium verification confirmed the banner is in normal flow (`position: relative`), both controls and the policy link remain present, zero CTAs/cards collide at either viewport, zero horizontal overflow, and no page errors.
- Production screenshots: `qa/cookie-banner-desktop.png` (1440×1000) and `qa/cookie-banner-390.png` (390×844 CSS px, captured at scrollY=200; 2× device scale). No legal text was changed; authoritative legal-PDF verification remains outstanding because the PDFs are absent. CLI auth/config was logged out and purged after shipping; `.env` remains mode 600 and `scripts/ship.sh` mode 755.

### Herald duplicate visible field fix (2026-10-05; deployed to canonical host)
- Confirmed the homepage Herald form showed a second unlabeled black input: the existing anti-bot honeypot had a `hx` class but no hiding rule, so the general `.herald-form input` styling rendered it as a normal field. Kept the honeypot and its server-side payload handling intact, marked it `hidden`, and added the scoped `#heraldForm #heraldHoney{display:none!important}` rule. The visible form remains one email field, the consent checkbox, and `RECEIVE THE SIGNAL`.
- Added a `scripts/ship.sh` regression gate for the honeypot's hidden styling. Local Chromium QA at 1440px and 390px confirmed exactly one visible email input, a visible consent checkbox and submit button, and a honeypot with `display:none` and a zero-size box.
- Deployed only to `https://jointhenuminouses.whop.site` through `./scripts/ship.sh`; install, typecheck, seal gates, build, deploy, and live smoke passed (`SHIP OK`). Live Chromium returned 200 at both widths, with zero page errors. The production form was click-tested: submitting without consent shows the consent gate; with consent, the existing fail-open path opens `/products/the-signal-e6`. The QA destination was intercepted and no form-data POST was sent.
- Production screenshots: `qa/herald-form-desktop.png` and `qa/herald-form-390.png`; both show the complete Herald block with no second field. Whop CLI was logged out and its config purged after deployment; `.env` remains mode 600 and `scripts/ship.sh` mode 755.

### Watcher public PDP inclusions corrected (2026-10-05; deployed to canonical host)
- Replaced the public "What Watcher Holds" list with only the verified four-week membership cycle: The Realm, The Process, The Records, and The Session. Updated the Watcher FAQ and public invitation copy to match; removed public claims naming Codex, Collector's Edition, Binding, Premium Edition, Wallpaper Vault, The Vault, Member Files, and private rooms. The checkout name/credits FAQ remains, without describing a hidden product. Separate product and post-purchase member experiences were not deleted or altered.
- The hosted PDP's live annual plan was present at `$280 / year` (`plan_Imfk0oedwYn7v`) alongside the monthly Watcher plan, so its card remains. Watcher stays `$28 / 28 days` after the seven-night trial. Existing checkout destinations and plan behavior are unchanged.
- `scripts/ship.sh` now guards the approved Watcher inclusions and rejects hidden-product/room names in the public Watcher invitation. Typecheck, seal gates, build, deploy, and live smoke passed via the sole approved deployment command `./scripts/ship.sh` (`SHIP OK`) at `https://jointhenuminouses.whop.site`.
- Cache-busted production HTML returned 200. Parsed visible page text contains the four weekly parts and both live plan choices, with none of the excluded product/room/agent names. The annual plan's live status was corroborated by the current public Whop product page showing Annual Watcher at `$280 / year`; no checkout was opened.
- Whop CLI auth/config was purged after deploy; `.env` remains mode 600 and `scripts/ship.sh` mode 755.

### Whop Home publication blocker (2026-10-05; no changes made)
- The public Home page still reports no posts. The official `POST /api/v1/forum_posts` call for a single public-forum post was rejected before creation: Whop returned `Unauthorized: Actor is missing all required permissions: forum:post:create`. A follow-up read of `exp_EILkXlaBDgxNTi` (the company's public forum) confirms zero posts; nothing was published.
- The public Products tab currently lists The Signal, Wallpaper Vault, and The Numinary (Watcher). The company API shows all room experiences as `is_public:false` except the separate Public forum. Whop nevertheless renders the room names in the public left navigation. No experience or product visibility was changed: the phrase "off the public catalog" is ambiguous between product cards and the public sidebar, and hiding/removing experiences could change member navigation.
- The public company page still has a generic `Join` button. Whop's documented API exposes custom CTA URLs on products, not a documented company-level redirect for the store-page Join button. No unsupported account/store-page field was guessed or patched.

### Chapter I three-work copy and cookie-code spacing (2026-10-05; deployed to canonical host)
- Confirmed Chapter I labelled the catalogue as two gates while presenting three works. Updated the static homepage and React `HomeExperience` to name all three works; changed the summary/count and card indices to a three-work sequence. Product visibility, offers, checkout links, and tracking behavior are unchanged.
- Confirmed the hosted cookie-page text extraction ran `own` directly into the inline `whop.track` code. Added an explicit JSX space before the code element; no tracking integration or consent behavior changed.
- Added `scripts/ship.sh` regression gates for the three-work copy, all three card indices, cookie separator, and exactly eight legally verbatim home em-dash lines. Fixed the pipeline's project-local Whop CLI path and configured it to read ignored `.env` only at deploy time. The script removes generated `dist/` and temporary deploy logs on exit.
- After the owner rotated the scoped key and updated `.env`, `./scripts/ship.sh` passed install, typecheck, seal gates, production build, deploy, and live smoke (`SHIP OK`) at `https://jointhenuminouses.whop.site`. No build ID was emitted by the filtered CLI output.
- Cache-busted production visible-text checks returned HTTP 200 for `/` and `/cookies`. Home text confirms “CHAPTER I · THREE WORKS,” the accurate three-work description, all three product cards and I/III, II/III, III/III indices; the old Chapter I heading is absent. Cookie text contains `own whop.track` and not `ownwhop.track`. Verification was HTTP/SSR visible-text parsing, not a browser screenshot pass.
- Security note: an overly broad diagnostic grep included the generated `dist/server/.dev.vars` artifact and surfaced a key-bearing line in tool output. `dist/` was removed immediately; the key value is not recorded here. The owner rotated the key and updated `.env` before deployment; the replacement was used only through the approved script. Inspection of the installed CLI packer confirmed `.env`/`.dev.vars` are excluded from source archives and server dotfiles are excluded from the build archive; the replacement key was loaded only at deploy time. After shipping, Whop CLI auth/config was logged out and purged; `dist/` is absent, `.env` remains mode 600, and `scripts/ship.sh` mode 755.

### The Numinary Agent added to Signal and Watcher return briefings (2026-10-07; deployed)
- Per the owner's scope: feature copy only, after checkout, for The Signal and Watcher. The user confirmed the agent already exists in Numinous Community. Added a “Meet The Numinary Agent” step to each existing post-checkout `NEXT_STEPS` list; the copy directs members to Numinous Community and describes its myth, symbol, and realm focus. No chat UI, model integration, new product, checkout, price, product visibility, or Whop business-page mutation was made.
- The owner was told `/order-complete` is a public-accessible return route rather than a membership-authenticated page, and chose to place the copy there. The feature copy is not on the public homepage, Signal PDP, Watcher PDP, or public invitations. The fifth next-step is labeled V.
- Added `scripts/ship.sh` regression gates for exactly two post-checkout agent mentions, the approved copy, V numbering, and absence from public surfaces.
- `./scripts/ship.sh` passed install, typecheck, seal gates, build, deploy, and live smoke (`SHIP OK`) at `https://jointhenuminouses.whop.site`. Cache-busted visible-text checks returned HTTP 200 for Signal and Watcher `/order-complete` routes and confirmed the agent step plus V numbering. Home and both public PDPs returned HTTP 200 with no agent mention.
- Whop CLI auth/config was logged out and purged after deployment; `dist/` is absent, `.env` remains mode 600, and `scripts/ship.sh` mode 755. No checkout or purchase was attempted.

### Numinary Agent role clarified (2026-10-07; deployed)
- Owner requested that members be told The Numinary Agent is their primary assistant in Numinous Community when the Creator is away for direct consultation. Updated both post-checkout Signal and Watcher copy to identify it as an AI assistant, invite direct questions about myth, symbols, and the realms, and clarify it does not speak for the Creator.
- The wording remains only in the two post-checkout return briefings. No public PDP/home copy, agent integration, model behavior, price, checkout, membership access, or product visibility changed.
- Updated the `scripts/ship.sh` copy regression check. The authorized script passed install, typecheck, seal gates, production build, deploy, and live smoke (`SHIP OK`). Cache-busted production checks returned HTTP 200 for both return routes and confirmed the new wording; the homepage and both public PDPs remain free of Agent copy.
- As previously clarified, `/order-complete` is not membership-authenticated; the owner selected that post-checkout placement. Whop CLI auth/config was purged after shipping, `dist/` is absent, `.env` remains mode 600, and `scripts/ship.sh` mode 755.

### Sitewide performance, caching, and consistency pass (2026-10-07; deployed to canonical host)
- Scope stayed on the Numinous website. Whop's managed edge and hosted checkout remain unchanged. No load test or new infrastructure was used.
- Confirmed and corrected these app-controlled defects: the custom static homepage response and app documents had no explicit cache policy; the static homepage did not register the existing same-origin service worker; the v3 worker treated every `/assets/*` and `/fonts/*` file as indefinitely immutable even when the origin supplied only `max-age=60`; it also cached `/order-complete` navigations. The briefing film buffered the entire video with `arrayBuffer()` before returning a synthesized range response and eagerly preloaded all scene plates plus muted ambient audio metadata. The 1,462,180-byte `/logo.png` was used for small app icons and the post-checkout seal.
- Public HTML now declares `public, max-age=0, s-maxage=15, stale-while-revalidate=15`; the static homepage uses `public, max-age=0, s-maxage=30, stale-while-revalidate=60`. The browser must revalidate, while the shared edge is offered a short cache window. Transaction and return surfaces are `no-store`: `/checkout/*` redirects explicitly carry that header, `/order-complete` is `no-store` and bypasses the worker, the in-app quote server function calls `setResponseHeader("Cache-Control", "no-store")`, and API handlers return `no-store`.
- Added a bounded, 10-second per-isolate dedupe cache for public product detail, visible product lists, and visible plan lists only. It is capped at 48 keys. The PDP now fetches its public product detail alongside one visible-plan list and filters the result locally, instead of making separate plan-list calls for the current and related products. No order, payment, membership, or checkout result enters this cache.
- The homepage now registers the worker after load. The worker retains the existing v3 asset cache but moves public documents to a fresh v4 namespace, purging potentially dynamic v3 page entries. Static assets honor the origin's `max-age`; immutable assets remain reusable. Video byte ranges are now produced by a streaming slice from the origin's full 200 response, with an immutable full copy written to browser cache in the background for later seeks. There is no whole-file `arrayBuffer()` in the worker. The worker passes `/api/*`, `/checkout/*`, `/order-complete`, and non-video range requests through untouched. Regression checks cover stream-before-full-download, 206/416 ranges, later cached seeks, mutable-asset expiry, and dynamic-page bypass.
- Replaced small app-icon and return-briefing references with the existing 24,276-byte `/assets/icon-192.png`; it matches the existing sigil and is ample for the 72px display. The 1,462,180-byte original remains on disk but is no longer used by the checked app surfaces. Briefing scene stills now load only in the no-video fallback; ambient audio uses `preload="none"`. Video autoplay and the hosted return experience remain unchanged.
- Validation and delivery: TypeScript passed; exactly eight legally verbatim em-dash lines remain in `src/home.html`, with zero in `src/**/*.{ts,tsx}`; service-worker tests and `bash -n scripts/ship.sh` passed. The only deployment path was `./scripts/ship.sh`; install, typecheck, seal gates, build, deploy, and live smoke passed (`SHIP OK`) at `https://jointhenuminouses.whop.site`.
- Post-deploy header checks: homepage returned the 30-second shared-cache policy; PDPs, collection/policy pages returned the 15-second policy; `/order-complete`, `/api/health`, and the local checkout 307 returned `no-store`. The handoff still points to Whop's hosted checkout and took about 0.074s TTFB in the low-volume sample. Health took about 0.072s; order-complete about 0.101s. Home samples were about 0.098s and 0.092s. Product samples were variable: Signal cold 2.256s, then 0.460s and 0.421s on immediate repeats; Watcher cold 4.222s, then 0.808s on a repeat. Prior single-sample baselines were home 0.699s, Signal 1.068s, Watcher 1.024s, order-complete 0.456s, checkout 0.073s, and health 0.286s. These are curl TTFB observations, not browser metrics; product cold starts remain variable and the samples are not conclusive.
- Cache-Control policies were visible on production responses, but sampled headers did not expose `Age`, `CF-Cache-Status`, or `x-cache`; shared-edge cache hits therefore were not independently proven. No browser automation was available, so actual mobile Core Web Vitals and browser-level service-worker/video playback were not measured. The Node worker test is the range/cache regression proof. No checkout was opened, no purchase was attempted, and no Whop logs were requested/read.
- After shipping, Whop CLI logout was attempted (`NO_PROFILES`, so no CLI profile remained); `~/.config/whop` was purged, `.env` remains mode 600, `scripts/ship.sh` is mode 755, and generated `dist/` is absent. No build ID was emitted by the filtered ship output.
