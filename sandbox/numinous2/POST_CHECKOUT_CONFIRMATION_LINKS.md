# Numinous — Post-Checkout Return Links

This document separates the **Whop redirect configuration** from **browser-return presentation links**. That distinction matters: a query string can shape the presentation of this site, but it cannot prove a payment or grant access. Whop’s receipt, order record, entitlement state, and verified webhooks are authoritative.

Replace `https://YOUR-DOMAIN` with the final deployed HTTPS domain before configuring Whop.

## 1. Configure these return URLs in Whop

Use the product-specific return URL below in the matching Whop checkout configuration. Do **not** hard-code `status=success` in the configured redirect URL: the confirmation page deliberately waits for a recognized provider-return state rather than claiming a completed purchase from a static link alone.

| Offer | Whop redirect / return URL |
|---|---|
| The Signal | `https://YOUR-DOMAIN/gates/confirmed?offer=signal` |
| The Watcher | `https://YOUR-DOMAIN/gates/confirmed?offer=watcher` |
| Wallpaper Vault | `https://YOUR-DOMAIN/gates/confirmed?offer=vault` |
| The Numinary Agent | `https://YOUR-DOMAIN/gates/confirmed?offer=agent` |

If the Whop configuration supplies a documented checkout status parameter on return, preserve it when redirecting to the matching offer URL. The page recognizes `success` / `completed`, `failed` / `error` / `declined`, `canceled` / `cancelled`, and `pending` / `processing` as presentation states.

## 2. Browser-return presentation links

These links are useful for staging, QA, and for a provider return that includes a recognized status. They only control the page presentation and must never be used as payment proof.

### Completed-return previews

| Product | Confirmation route |
|---|---|
| The Signal | `/gates/confirmed?offer=signal&status=success` |
| The Watcher | `/gates/confirmed?offer=watcher&status=success` |
| Wallpaper Vault | `/gates/confirmed?offer=vault&status=success` |
| The Numinary Agent | `/gates/confirmed?offer=agent&status=success` |

### Other state previews

Substitute `signal`, `watcher`, `vault`, or `agent` after `offer=` as needed.

| State | Example route |
|---|---|
| Failed / declined | `/gates/confirmed?offer=watcher&status=failed` |
| Canceled | `/gates/confirmed?offer=watcher&status=canceled` |
| Pending / processing | `/gates/confirmed?offer=watcher&status=pending` |
| Error | `/gates/confirmed?offer=watcher&status=error` |
| Awaiting provider status | `/gates/confirmed?offer=watcher` |

## 3. Safe operations rule

1. Configure the exact product return URL inside Whop; do not attach assumed return values to a static checkout hyperlink.
2. Let Whop’s receipt, account record, and verified payment-success webhook control fulfillment and entitlements.
3. The confirmation page may display a provider reference such as an order ID for support, but never place personal, card, or secret data in the URL.
4. A customer who cannot access their purchase should sign into the Whop account used for checkout or contact `numinous.support@gmail.com` with their receipt, checkout email, and product name.
