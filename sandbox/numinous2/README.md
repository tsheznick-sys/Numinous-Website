> **Sandbox candidate, not the live Whop deployment.** This directory is the
> editable source from the two Drive archives supplied on 2026-10-16. The
> compiled archive matched the untouched source build byte-for-byte (Vite
> hashes `index-BkAWubPN.css` and `index-s1iOg19l.js`). The source has since
> received sandbox repairs; see [SANDBOX_STATUS.md](./SANDBOX_STATUS.md).
> Do not run the root `npm run deploy` for this candidate.

# Numinous 2.0 website rebuild

A from-scratch React + Vite + TypeScript site inspired by the @numinous2.0 world: cinematic dark imagery, mythic editorial typography, celestial atmosphere, and a deliberate gate-to-checkout journey.

## What is included

- Cinematic @numinous2.0-inspired home page
- A dedicated immersive `/gates` product segment: The Signal, The Watcher, Wallpaper Vault, and The Numinary Agent
- Product-specific storytelling routes at `/gates/:gate`
- Product-specific pre-checkout reviews at `/gates/:gate/enter`, followed by secure hosted Whop checkout
- Product-specific browser-return route at `/gates/confirmed?offer=:offer`, with clear pending, failed, canceled, and completed presentation states
- Locally hosted Signal and Watcher briefing films before checkout, with invitation films after a completed return presentation
- Returns, refunds, terms, privacy, EULA, and cookies routes
- Local product art and briefing films
- Responsive navigation, editorial layouts, and reduced-motion support

## Commands

```bash
npm install
npm run dev
npm run build
```

## Main routes

| Route | Purpose |
|---|---|
| `/` | Cinematic homepage |
| `/gates` | All four gates |
| `/gates/signal` | The Signal immersive product page |
| `/gates/watcher` | The Watcher immersive product page |
| `/gates/vault` | Wallpaper Vault immersive product page |
| `/gates/numinary-agent` | Numinary Agent immersive product page |
| `/gates/:gate/enter` | Product-specific pre-checkout review |
| `/gates/confirmed?offer=:offer` | Product-specific post-checkout browser return; the provider return state controls presentation |
| `/products/*`, `/checkout`, `/welcome` | Legacy routes that redirect into the new Gates segment |
| `/returns`, `/refunds`, `/terms`, `/privacy`, `/eula`, `/cookies` | Records and policies |

## Commerce operations

See [`COMMERCE_OPERATIONS.md`](./COMMERCE_OPERATIONS.md) for the offer-by-offer Whop return setup, authoritative fulfillment guidance, support rules, deployment guardrails, and a full pre-launch test matrix.

## Whop deployment

Whop checkout URLs remain the actual payment handoffs. Configure each Whop checkout configuration with its product-specific return URL, for example:

```text
https://your-domain.com/gates/confirmed?offer=watcher
```

Do not hard-code `status=success` in that configuration. Browser status is presentation-only; Whop receipts, entitlement records, and verified payment-success webhooks remain the authoritative fulfillment record. See [`POST_CHECKOUT_CONFIRMATION_LINKS.md`](./POST_CHECKOUT_CONFIRMATION_LINKS.md) for all four configured return URLs and QA previews.

## Sandbox validation

From this folder:

```bash
npm ci
npm run test:smoke
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

This is a static SPA preview. It does not prove compatibility with the root
Whop/Cloudflare Worker deployment. Product pages, prices and returns must be
reviewed with the [sandbox status](./SANDBOX_STATUS.md) before launch.

## Product cards and narrated films

The entire home and collection product cards link to each work's detail page;
the review-page product summary links back to that detail page. The four
Signal/Watcher briefing and invitation videos now contain ambient music and
spoken factual narration, with matching English captions. The homepage
background stays silent; sound begins only when a visitor plays a controlled
video. See [`audio/README.md`](audio/README.md) to reproduce the mix.

### Current film review state

The four original films have been re-rendered with accurate on-screen wording
and full-length narration; see [`audio/README.md`](audio/README.md). The
requested licensed music replacement is **pending shorter audio files**. The
preview's old ambient bed is provisional, not release-approved.
