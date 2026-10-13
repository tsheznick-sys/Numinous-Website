# INFRASTRUCTURE-BLUEPRINT — thenuminouses

The honest structure of the whole operation. Every item from the infrastructure
checklist is mapped to what is real, who owns it, and what was built. Nothing
here is claimed that was not verified against the live site.

The ground truth first: **this site runs as a Cloudflare Worker on Whop's
platform** (`wrangler.jsonc`, deployed via `whop apps deploy` to
`https://thenuminouses.whop.site`). Whop provides the edge, TLS, DDoS
protection, hosted checkout, OAuth, and entitlement data. The app controls its
own code, its own server routes, and nothing else. Pretending otherwise would
be fabrication; this document refuses to.

---

## 1. Rate limits (AI endpoints, Auth endpoints, Public Data endpoints)

App-side enforcement built this round: `src/lib/rate-limit.ts`, a token-bucket
limiter keyed on the requester address (CF-Connecting-IP first, then the first
X-Forwarded-For hop), with three tiers:

| Tier | Limit | Covers |
|---|---|---|
| `strict` | 5 / minute / address | Stateful POSTs: the herald gate (`POST /api/herald`) |
| `standard` | 30 / minute / address | Whop-backed reads (reserved for order previews on request context) |
| `loose` | 120 / minute / address | Error intake (`POST /api/errors`) |

Honest scope: counters are per Worker isolate. The platform edge runs its own
global protections on top of anything this app can see. A single-address flood
now degrades gracefully (429 + Retry-After) before Whop's API ever notices.

- **AI endpoints: none exist.** The site serves no AI endpoints. Documented as
  not applicable by your decision. If one is ever ordered, `api.herald.ts` is
  the pattern: strict tier + server-side key from the environment + shape
  validation before any provider is touched.
- **Auth endpoints: none of ours.** Auth IS Whop (their OAuth, their session).
  Rate limiting for login/auth lives at Whop's edge, platform-side.
- **Public data endpoints:** product/collection reads are server functions
  scoped to the public catalog (see §2 and §7).

## 2. Row-level security & general security

There is no database, so there are no rows - and no RLS to configure. The
equivalent discipline here is **query-level scoping**, every Whop API call
carries the narrowest possible surface:

- `listAllProducts` / `listAllPlans` request `visibilities: ["visible"]` only;
  hidden and archived products cannot leak through a grid or a slug.
- `HIDDEN_SHOP_IDS` (6 sealed IDs incl. Codex and Collector) are filtered from
  every collection response; the leak is impossible by construction.
- Order quoting (`loadOrder`) accepts only the two public plan IDs and
  rejects every other string by shape check + whitelist - sealed works are
  not quotable, and unknown plans short-circuit to null without touching the
  Whop API.
- CSP on every page (strict on home; allowlisted app shell), strict-origin-
  when-cross-origin referrer, RFC 9116 security.txt, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'none'` on home.
- Server key handling: `WHOP_API_KEY` is injected by the platform at runtime,
  never in the client bundle (verified: no keys in the bundle).

## 3. CI/CD pipeline & version control

- **Version control:** local git history in this workspace. Every deploy is a
  commit; every commit is deployable. An external remote (GitHub etc.)
  requires user-side credentials this sandbox does not hold.
- **Pipeline:** `scripts/ship.sh` - install → typecheck → seal gates (em-dash
  baseline, offer-ladder anchors, referrer, CSP, watcher checkout URL,
  sealed-works naming) → build → deploy → live smoke (security.txt + home).
  Stops at first failure.
- **Rollback** (see §9): `whop apps promote <build-id>`; known-good IDs are
  recorded in BUG_LOG.md.
- Hosted CI (GitHub Actions) is the user-side step: push the repo, and
  `scripts/ship.sh` translates directly into a workflow.

## 4. Caching & CDNs

Measured reality of the platform edge: **HTML responses carry no
Cache-Control, cf-cache-status, Age, or ETag headers** - Whop's edge serves
documents uncached or strips those headers; neither is app-settable from this
runtime. What the app controls, it does right:

- All static assets are content-hashed by the build (Vite), so they are
  immutable and safely cached by browsers and any edge in the path.
- Fonts are self-hosted (8 latin woff2, zero third-party font requests);
  films are static files; both are ideal edge-cache material.
- Both API routes return `Cache-Control: no-store` (they are stateful and
  personal-adjacent - caching them would be wrong, not an optimization gap).
- "Cache all queries": query data is request-scoped per visitor; the honest
  caching layer is the edge + hashed assets + preloaded fonts, which already
  measured LCP 0.50s cache-warm.

## 5. The cloud & compute, and reCAPTCHA

- **Compute:** Whop's runtime = Cloudflare Workers (`nodejs_compat`).
  Scaling, isolation, and placement are platform-managed; the app ships a
  standard worker entry (`@tanstack/react-start/server-entry`).
- **reCAPTCHA:** Whop's hosted checkout already runs **Cloudflare Turnstile**
  platform-side - the money path is covered without our keys.
- **The herald form** (the only first-party form): server-side validation +
  strict rate tier + honeypot now. Google reCAPTCHA is fully wired: when a
  secret key exists as `RECAPTCHA_SECRET_KEY` in the environment, the server
  enforces siteverify; the client fills `RECAPTCHA_SITE_KEY` in home.html and
  loads Google's script with that public key (its CSP allowances are
  documented and added at flip time). Providing keys = enforcement, no code
  change.

## 6. Database & storage endpoints

None, by your decision: **Whop is the data layer.** Products, plans, prices,
entitlements, membership, and the email capture (joining The Signal on Whop)
all live in Whop's systems, reached only through their SDK/API with visible-
only scoping. No database of ours exists, so no database can leak, drift, or
need backing up. Storage: static assets are served from the build; films and
fonts ship with the app.

## 7. Endpoints × auth & permissions (the correct mixing)

| Endpoint | Method(s) | Auth model | Data scope |
|---|---|---|---|
| `/` (home) | GET | public | static, sealed copy |
| `/products/:slug` | GET | public read via Whop SDK | visible products only; hidden IDs filtered |
| `/collections/:label` | GET | public read via Whop SDK | visible only; `HIDDEN_SHOP_IDS` enforced |
| `/checkout/:planId` | GET | public; **plan whitelist** | only the two public plans redirect to Whop checkout |
| `/order-complete` | GET | public page; order truth lives in Whop | reflects Whop's return params only |
| `/api/herald` | POST (405 else) | public + strict rate + validation (+ captcha when keyed) | stores nothing; handoff to Whop |
| `/api/errors` | POST (405 else) | public + loose rate + shaping | logs only; no storage |
| `/api/health` | GET (405 else) | public, stateless probe | uptime/recovery checks; exposes service + version only |
| `/api/$` (Whop proxy) | manifest only | server-side, platform key + **standard rate tier** | `listProducts`, `retrieveProduct`, `listPlans`, `retrievePlan` upstream paths - nothing else is proxied |

Admin/Keeper surfaces: none public. Sealed works: reachable only after
joining, inside Whop - never from this site's public surface.

## 8. API & backend logic

- `src/whop.server.ts`: the only place that holds Whop SDK construction.
  Server functions are kept behind `createServerFn` so nothing server-side
  leaks into route module scope (a loader runs in the browser on client
  navigation - the file documents this trap).
- Server functions: product loads, collection loads, order quoting (now
  whitelist-scoped), all visible-only.
- API proxy: manifest-selected read methods only.
- First-party API: `/api/herald`, `/api/errors` (this round).
- Payment logic: none of ours - checkout sessions are created by Whop's
  elements SDK in the browser with Whop's own publishable credentials; our
  server never touches card data (PCI stays at Whop).

## 9. Availability & recovery (superfast recovery)

- **Rollback:** `whop apps promote <build-id>` - one command, minutes to
  restore. Known-good anchors live in BUG_LOG.md (current chain documented
  per deploy). This is the superfast path: promote the last approved build,
  done.
- **Re-deploy from scratch:** `scripts/ship.sh` end-to-end (install → smoke)
  is the cold-start path.
- **Verification ritual:** after every deploy, live checks (security.txt,
  home, checkout 307, film autoplay) - recovery without verification is not
  recovery.
- Platform availability (edge, DNS, TLS, checkout) is Whop's SLA, not ours to
  configure.

## 10. Error tracking & logs

- Client: one-shot beacons on `error` and `unhandledrejection` (home + every
  app page via the root document) → `POST /api/errors` → shaped (truncated,
  ASCII-folded, no PII) → the platform's worker logs, the only log sink this
  runtime exposes. Rate-limited (loose tier); one shot per page keeps the
  flood risk nil.
- Server: outcomes logged with address fingerprints (non-reversible), never
  raw addresses, never emails.
- External aggregation (Sentry or similar) is a user-side step: create the
  project, hand over the DSN, and the beacon code gains a second transport.
  Honest limit: platform logs are ephemeral and not queryable from here.

## 11. Load balancing & scaling

Owned entirely by the platform: Cloudflare's anycast edge terminates every
request and Workers scale per-isolate automatically - there is no app-run
load balancer to configure, and inventing one would be fiction. The app's
contribution to scaling is discipline: per-isolate rate buckets that fail
open under memory pressure, no server-side session state, no database in the
request path, static assets everywhere.

---

## What was NOT done, on purpose

- No database, no AI endpoints, no auth endpoints: your decisions this round.
- No HTML cache headers: not app-settable in this runtime; measured and
  documented rather than faked.
- No reCAPTCHA enforcement: waits on your keys; wiring complete.
- No edits to sealed copy beyond the herald block this order covered (27
  em-dash lines remain, flagged for your decision).
