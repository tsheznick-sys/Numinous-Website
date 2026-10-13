# MEASUREMENT · WHAT EACH EVENT MEANS

Privacy-respecting by construction: the site sets no cookies and uses no
third-party pixels. Events go through the app's existing `track()` bridge
(Whop analytics). No consent banner is needed.

## Events

| Event | Fires when | Why it exists |
|---|---|---|
| `view_content` | A product page is seen, with plan price | Baseline for every rate below |
| `add_to_cart` | Enter/claim clicked, or cart line added | Intent signal |
| `plan:selected` | A plan option chosen on multi-plan products | Option preference |
| `dial:week` | One of the four weeks is opened on the moon dial | Which week sells the seat |
| `faq:open` | A question is expanded | Which objection matters |
| `upsell:watcher` | The Signal page's Numinary band is clicked | Signal-to-Numinary path |
| `invite:watched_full` | The invitation film plays to the end | Does the film convert |
| `briefing:watched_full` | The post-purchase briefing plays to the end | Onboarding completion |
| `data-cta` + `data-cta-location` | Any CTA click (`signal`/`watcher` at `hero`/`sticky`/`upsell`/`closing`) | Placement-by-placement conversion |

## Attribution

Any `utm_source`, `utm_medium`, `utm_campaign` (and `ref`) on the page URL rides
along to the Whop checkout automatically. Instagram bio link shape:

    https://thenuminouses.whop.site/products/the-numinary-3e?utm_source=instagram&utm_medium=story

## The two numbers to watch first

1. **Signal CTA click-through from the hero** (`data-cta=signal`, `hero`).
2. **Watcher CTA click-through from the hero** (`data-cta=watcher`, `hero`).

Everything else on the page exists to move those two numbers.
