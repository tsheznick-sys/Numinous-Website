# Numinous 2.0 — Full Release QA Report

**Run date:** 14 October 2026 (Africa/Nairobi)
**Release candidate:** `dist/assets/index-CAcIqu6p.js` + `dist/assets/index-7N3N00G5.css`
**Preview:** port 4175
**Requested matrix:** desktop (1440px), tablet (768px), and mobile (390px)
**Checkout validation boundary:** internal UX and URL syntax only — no Whop checkout session was opened or submitted.

## Overall result

**Conditional release pass.** The compiled storefront, route matrix, local media, product facts, commerce links, keyboard paths, responsive source rules, and archive packaging passed. Two items remain external / environment-bound before an unconditional launch sign-off:

1. **Rendered visual review is blocked in this sandbox.** A headless Chrome run was attempted, but the downloaded Chrome binary cannot start because system libraries such as `libnspr4.so` are unavailable. The requested 1440px, 768px, and 390px responsive checks therefore received a source/CSS structural audit rather than a pixel-level screenshot audit.
2. **`npm audit` reports 7 build-tool dependency advisories** (5 high, 2 moderate; no critical). The direct affected package is Tailwind CSS; the remaining advisory paths are transitive build dependencies. No `npm audit fix` was applied during this QA run because the requested deliverable was a report, not a dependency upgrade.

Whop payment execution and authoritative fulfillment/webhooks are intentionally not covered: the user selected URL/UX validation only, and the static storefront cannot configure Whop return URLs or validate payment completion.

---

## 1. Build and runtime checks — PASS

| Check | Result | Evidence |
|---|---|---|
| Clean dependency install | PASS | `npm ci` completed. |
| TypeScript + Vite production build | PASS | `npm run build` completed successfully. |
| Current preview served current build | PASS | `/` returned `index-CAcIqu6p.js`. |
| Main compiled assets | PASS | Current JS and CSS returned HTTP 200. |
| Build payload | PASS / reviewed | Build is 19 MiB, almost entirely intentional local media. Gzip estimates: JS 138,758 bytes; CSS 14,346 bytes. |

## 2. Route and state matrix — PASS

All **27** requested internal route/state URLs returned HTTP 200 from the production preview:

- `/`, `/gates`
- All four Gate pages: Signal, Watcher, Wallpaper Vault, Numinary Agent
- All four Gate pre-checkout pages
- Confirmation states: success for Signal, Watcher, Vault, and Agent; failed Agent return
- Legal records: Returns, Refunds, Terms, Privacy, EULA, Cookies
- Legacy compatibility: old Herald Gate, old Herald pre-checkout, old product slug, legacy checkout, welcome, and order-complete paths

The client routes preserve legacy Herald links while presenting the customer-facing product as **The Numinary Agent**.

## 3. Media and delivery assets — PASS (with repair)

### Verified

All **10** local media files referenced from source exist in both `public/media` and the delivered `dist/media`, and each returned HTTP 200 from the preview:

- Background and logo art
- Signal and Watcher product art
- Vault and Numinary Agent art
- Signal and Watcher briefing films
- Signal and Watcher invitation films

### Safe repair made during QA

The source referenced `signal-invite-1440.mp4` and `watcher-invite-1440.mp4`, but those two files were absent from the active public-media folder. The matching existing local films were restored from the preserved local Numinous bundle, copied into `public/media`, built, and HTTP-checked. No third-party media dependency was introduced.

## 4. Product, content, and commerce accuracy — PASS

Source validation confirmed:

- Signal: free, no-card/free-forever record.
- Watcher: `$28 / 28 days · $280 / year` and seven-night guarantee wording.
- Wallpaper Vault: 15 works for phone, portrait, and desktop.
- Numinary Agent: free app entry plus four supplied Key-plan URLs:
  - $29.99/month
  - $359.88/year
  - 60-Key $19.99/month
  - 60-Key $199.99/year
- Every Whop URL uses HTTPS and the expected `whop.com` host. **No external Whop page was opened**, in line with the selected link-only QA boundary.
- The Numinary Agent’s free entry and four Key-plan choices are represented on its pre-checkout page.
- No customer-facing `Herald` label remains; compatibility redirects remain deliberately in source.

## 5. Conversion and customer-flow checks — PASS

| Flow / control | Result |
|---|---|
| Full-card Gate navigation on the homepage | PASS |
| Full-card Gate navigation on `/gates` | PASS |
| Full-card pre-checkout product-summary navigation | PASS |
| Visible, keyboard-focusable card targets | PASS |
| Small “Open gate” links removed from cards | PASS |
| Customer-facing post-checkout preview/confirmation action removed before purchase | PASS |
| Agent free entry + Key-path selection | PASS |
| Support route in pre-checkout | PASS |
| Confirmation and failed-state routes available for provider returns | PASS |

The confirmation route remains provider-return-only in the customer flow; it is not offered as a pre-payment user action.

## 6. Accessibility and interaction checks — PASS (static/source review)

- All 6 JSX `<img>` elements have an `alt` attribute; decorative images use empty alternative text intentionally.
- Full-card links expose specific accessible labels.
- Full-card link, pre-checkout card, and menu controls have visible keyboard focus styles.
- Mobile menu button has `type="button"`, accessible name, `aria-expanded`, and `aria-controls`.
- Escape closes the mobile menu.
- Mobile drawer includes all Gates, the free-entry route, legal access, and a visible `Speak to a person` mailto link.
- A reduced-motion media query disables non-essential animation and transition behavior.
- No TODO, FIXME, placeholder, or lorem ipsum text was found in `src` or `public`.

## 7. Responsive matrix — PASS (source/CSS structural review)

| Viewport | Verified behavior |
|---|---|
| 1440px desktop | Multi-column Gate/collection layouts and full desktop navigation remain declared. |
| 768px tablet | The 800px breakpoint hides desktop nav links, exposes the hamburger control, uses the drawer pattern, and collapses target layouts. |
| 390px mobile | The same mobile-navigation behavior applies; target Gate, collection, content, facts, archive, and split layouts collapse to one column; headline clamp rules reduce type scale. |

The CSS also preserves the required near-invisible liquid-glass fills and masked gradient-stroke borders, as well as light body type and tightly tracked italic headings.

> **Evidence limitation:** pixel screenshots and live click-path inspection were attempted but blocked by missing system shared libraries required by the only available Chrome binary. This is not a storefront build failure; it is an audit-environment limitation.

## 8. Restored scoped experience elements — PASS

The QA run found that several already-styled features were absent from their page markup, then restored and compiled them:

- Gate intent recommendation, comparison matrix, and Gate FAQ on `/gates`.
- Product practical-facts record on all Gate pages.
- Reading progress on product and legal pages.
- Mobile hamburger drawer with accessible state, Escape handling, and human support.
- No repeated closing product purchase CTA; the product hero remains the primary entry decision.

## 9. Security and dependency review — ACTION REQUIRED FOR UNCONDITIONAL SIGN-OFF

`npm audit` summary:

- Critical: 0
- High: 5
- Moderate: 2
- Low: 0

Reported packages: `tailwindcss` (direct) plus transitive `braces`, `chokidar`, `fast-glob`, `micromatch`, `postcss-nested`, and `postcss-selector-parser`.

**Recommended follow-up:** test a targeted Tailwind/dependency update in a branch, rebuild, rerun this QA matrix, and only then publish the upgraded lockfile. Do not use a forced audit upgrade without regression testing.

## 10. External release actions still required

1. In Whop, configure the correct product-specific return URL for each plan: `/gates/confirmed?offer=<product-id>`; do not hard-code a success state.
2. Use Whop’s webhook/receipt systems as the authoritative fulfillment and payment source; browser query status is presentation-only.
3. Open the live deployed site in a real desktop, tablet, and mobile browser for final pixel-level sign-off, including the hamburger drawer and the expected external Whop plan titles.
4. Resolve or explicitly accept the listed build-tool dependency advisories before an unconditional security sign-off.

## 11. Deliverables checked

- `/home/user/numinous2-rebuild/` — editable routed source
- `/home/user/numinous2-index-bundle/` — compiled standalone build
- `/home/user/numinous2-rebuild.zip` — refreshed source archive
- `/home/user/numinous2-index-bundle.zip` — refreshed standalone archive
