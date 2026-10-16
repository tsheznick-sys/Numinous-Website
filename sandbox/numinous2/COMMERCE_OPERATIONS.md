# Numinous commerce operations checklist

This is the production handoff for the hosted Whop checkout flow. The React application provides the review and browser-return experiences; Whop remains the payment, receipt, account, entitlement, and order-record authority.

## 1. Configure one product-specific return URL per Whop offer

Configure the hosted checkout configuration in Whop—not by appending an assumed parameter to an existing checkout link—to return to the deployed site:

| Offer | Hosted checkout destination | Configure this return URL |
| --- | --- | --- |
| The Signal | `https://whop.com/checkout/ch_wYXFulML0v6LIoJ/` | `https://YOUR-DOMAIN/gates/confirmed?offer=signal` |
| The Watcher | `https://whop.com/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ:1` | `https://YOUR-DOMAIN/gates/confirmed?offer=watcher` |
| Wallpaper Vault | `https://whop.com/checkout/plan_Aew5DdipP3fKY?quantity=1&items=plan_Aew5DdipP3fKY:1` | `https://YOUR-DOMAIN/gates/confirmed?offer=vault` |
| The Numinary Agent | `https://whop.com/thenuminouses/numinary-agent/` | `https://YOUR-DOMAIN/gates/confirmed?offer=agent` |

Do **not** configure a static `status=success` parameter in the return URL. A static query parameter only changes what the browser page says; it is not proof of payment. If a documented Whop return includes a recognized status, preserve it on the matching offer URL for presentation only.

## 2. Keep fulfillment authoritative

1. Configure Whop payment-success webhooks to the production fulfillment system.
2. Verify the webhook signature before granting or changing entitlements.
3. Treat Whop’s receipt, order record, and entitlement state as the source of truth.
4. Do not grant access based only on `status=success` in a browser URL.
5. Store only the minimum order reference required for support; do not put personal or payment data in the return URL.

## 3. Run the pre-launch test matrix

For each of the four offers:

- Open `/gates/:gate` and confirm factual price, access path, terms, and product art.
- Open the matching checkout handoff and confirm the hosted Whop destination is correct. Signal uses its single public Gate page; Watcher, Vault, and Agent have review routes at `/gates/:gate/enter`.
- Complete a Whop test purchase and verify the matching product-specific return route.
- Confirm the receipt email, Whop library access, and product access link work with the purchaser account.
- Confirm canceled, declined, processing, and closed checkout states do not display completed-order language or an access link.
- Confirm the support contact can resolve an inquiry from a Whop receipt reference.

## 4. Operational support rules

- **Watcher:** honor the stated seven-night guarantee through the published return policy.
- **Wallpaper Vault:** follow the listed one-time-download return conditions.
- **Signal and Numinary Agent:** keep their stated free-entry terms clear at every update.
- Use `numinous.support@gmail.com` and request the Whop receipt plus purchaser email when locating an order.

## 5. Deployment guardrails

- Deploy the SPA with an HTML fallback for all listed application routes.
- Serve all local media and fonts over HTTPS.
- Confirm no environment replaces the Whop hosted checkout URLs.
- Add the final public domain to Whop return/redirect configuration before publishing.
- Re-run the route, media, build, and audit checks after any checkout, legal, or product-data change.

For exact copy-ready routes and browser-return QA links, see [`POST_CHECKOUT_CONFIRMATION_LINKS.md`](./POST_CHECKOUT_CONFIRMATION_LINKS.md).
