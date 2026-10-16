# Numinous 2.0 — Final Submission & Operations Guide

## Delivered package

- **Editable source:** `numinous2-rebuild.zip`
- **Compiled standalone site:** `numinous2-index-bundle.zip`
- **Production folder:** `dist/`
- **Framework:** React + Vite + TypeScript + Framer Motion
- **Media:** all active image, font, and film assets are locally served from `public/`

## Final experience structure

### Main page

1. Cinematic Signal-first portal
2. Free-entry decision and factual confidence record
3. Editorial Numinous statement
4. Four-path Gate finder
5. Full-card Gate collection
6. Watcher’s 28-day story
7. Watcher briefing film
8. The Pact and site-wide FAQ
9. Editorial closing horizon and compact footer support

### Gate collection

- Intent-based Gate recommendation
- Four full-card Gate entries
- Factual price, delivery, and return comparison
- Gate-selection FAQ

### Product pages

Every Gate page includes:

- Product-specific editorial hero
- One clear primary action
- Practical facts before deeper story
- Rich chapter/ritual content
- Product FAQ and support guidance
- Product-specific briefing/invitation films only where factual local films exist

The Watcher additionally contains the four-turn, 28-day visual cycle.

### Checkout and confirmation

- Product review before Whop handoff
- Access, delivery, and return/Key clarity cards
- Product-specific briefing film where available
- No customer-facing pre-payment confirmation control
- Status, receipt, access verification, FAQ, and human-support guidance after return

### Legal/Pact pages

- Expanded Pact and refund language
- Anchor navigation to each legal record section
- Legal FAQ, direct support guidance, and a compact footer

## Route map

| Purpose | Route |
|---|---|
| Home | `/` |
| All Gates | `/gates` |
| Signal | `/gates/signal` |
| Watcher | `/gates/watcher` |
| Wallpaper Vault | `/gates/vault` |
| Numinary Agent | `/gates/numinary-agent` |
| Watcher pre-checkout | `/gates/watcher/enter` |
| Vault pre-checkout | `/gates/vault/enter` |
| Numinary Agent pre-checkout | `/gates/numinary-agent/enter` |
| Confirmation return | `/gates/confirmed?offer=<id>` |
| Access verification | `/access` |
| Pact | `/returns` |
| Refund policy | `/refunds` |
| Terms | `/terms` |
| Privacy | `/privacy` |
| EULA | `/eula` |
| Cookies | `/cookies` |

### Signal consolidation

`/gates/signal` is the single public Signal product page and carries the free Whop handoff. The former `/gates/signal/enter` route redirects to it.

### Legacy links preserved

- `/gates/herald` → Numinary Agent
- `/gates/herald/enter` → Numinary Agent pre-checkout
- `/products/herald-app` → Numinary Agent
- `offer=herald` confirmation values resolve to the Numinary Agent

## Post-checkout confirmation routes

See `POST_CHECKOUT_CONFIRMATION_LINKS.md` for the exact Whop redirect URLs plus success, failed, canceled, pending, error, and waiting-state browser-return previews.

## Whop operations: required external setup

The website prepares the customer-facing flow but cannot configure Whop account settings.

### Checkout flow

- Signal: `/gates/signal` → hosted Whop free entry
- Watcher, Vault, Agent: `/gates/:gate` → `/gates/:gate/enter` → hosted Whop checkout

### Configure return URLs in Whop

For each actual Whop checkout configuration, set its deployed-domain product return URL in this form:

```text
https://YOUR-DOMAIN/gates/confirmed?offer=signal
https://YOUR-DOMAIN/gates/confirmed?offer=watcher
https://YOUR-DOMAIN/gates/confirmed?offer=vault
https://YOUR-DOMAIN/gates/confirmed?offer=agent
```

Do not hard-code `status=success` into the configured redirect URL: a browser query string only controls presentation. If a documented Whop return supplies a recognized state, preserve it on the matching product URL. Use Whop webhooks, receipts, purchase records, and entitlement state as the authoritative sources for payment, fulfillment, and access.

### Member-access verification checkpoint

The post-order **Verify library access** action routes through `/access` before opening Whop. This page is deliberately a hard verification checkpoint rather than a fake client-side membership test:

1. The member signs into the exact Whop account used at checkout.
2. Whop verifies the account and controls the library access.
3. The Whop receipt is the durable order record.
4. If access is unavailable, the customer can request human verification with the receipt, checkout email, and product name, or return to The Watcher to review that member room.

The static website must never ask a customer to submit a Whop password, full card number, or security code. A truly automatic membership decision beyond hosted Whop authentication requires a secure backend and authorized Whop API/webhook integration.

### Support workflow

Ask the customer for:

1. Their receipt
2. The email used at checkout
3. The relevant product name
4. A concise description of the request

Support email: `numinous.support@gmail.com`

## Build and deployment

```bash
npm ci
npm run build
```

Deploy the contents of `dist/` to any static host with SPA fallback enabled. The host must return `index.html` for client routes such as `/gates/watcher` and `/returns`.

## Final launch checklist

- [ ] Deploy `dist/` with SPA fallback.
- [ ] Confirm all Whop checkout URLs remain current.
- [ ] Configure the Whop return URLs above.
- [ ] Configure/verify Whop fulfillment webhooks.
- [ ] Test one free Signal entry and one paid test purchase in a live-safe environment.
- [ ] Verify receipt email, member library access, confirmation state, and support mailto link.
- [ ] Test desktop, tablet, and mobile navigation including the hamburger drawer.
- [ ] Respect `prefers-reduced-motion` during final visual review.
- [ ] Run `npm audit` and complete a tested dependency update policy before production deployment.

## Final validation in this workspace

The latest production build passed. The main route families, Gate pages, pre-checkout pages, confirmation state, legal records, living local background field, full-card navigation, 3D surfaces, and archive-integrity checks were validated before packaging.
