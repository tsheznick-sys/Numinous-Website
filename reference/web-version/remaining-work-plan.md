# remaining-work-plan — thenuminouses

## Phase 4.5 — THE LAW (recorded after sandbox reset 16; supersedes autonomous improvement hunting)

**"Move with the changes I show you only."** User messages are the change orders.
- No self-directed source changes. Audits, verification, and QA are unrestricted.
- Deploy after every change + verify live remain the ritual (explicitly not reversed).
- §12 three hard gates still apply. BUG_LOG records every defect found.
- After ANY sandbox reset: diff local vs production FIRST, re-apply missing edits, only then build/deploy.
- Auth law: after every authenticated session, `whop auth logout --all`, delete credentials, verify `profiles: []`.

## Phase 4.6 — Infrastructure hardening round (this phase, user-ordered)

Done:
- Dependency audit triage: prod tree clean; undici/yaml advisories are dev-toolchain only (miniflare/@whop/cli); lockfiles fixed non-breaking; --force downgrade rejected.
- CSP on every page (strict home; app allowlist incl. Whop platform origins). 8/8 surfaces zero violations.
- Rate limiting (per-isolate token buckets): strict 5/min (herald POST), standard 30/min (order previews — reserved), loose 120/min (error beacons).
- Herald gate: server validation + honeypot + strict tier + fail-open handoff on network error; reCAPTCHA enforcement flips on when RECAPTCHA_SECRET_KEY exists (site key slot prepared in home.html).
- Client error beacons (home + app root) → POST /api/errors → platform worker logs; one-shot per page, truncated, no PII.
- loadOrder server-side scoping: only plan_5IYhtCsv2Buv1 + plan_PQnMYNixMTjRQ quotable; plan-shape regex; anything else short-circuits to null.
- scripts/ship.sh: install → typecheck → seal gates → build → deploy → live smoke.
- INFRASTRUCTURE-BLUEPRINT.md: full honest map of the user's infrastructure checklist vs platform-managed reality.

Open (user-side or future orders):
- reCAPTCHA keys (site + secret) → flip enforcement.
- 27 em-dash lines remain in sealed home copy (title/og tags, lede copy, aria-labels) — standing no-em-dash law needs a user-visible pass to clear.
- External git remote / hosted CI = user credentials required.
- Counsel decisions (WY LLC, EU consent, Seven Nights vs PDF) unchanged.
