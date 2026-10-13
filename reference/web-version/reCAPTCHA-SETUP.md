# reCAPTCHA setup — ENFORCED AND LIVE

**Status: fully enforced in production.** The keys below were registered,
the secret was set via `whop apps secrets set` (encrypted at rest, injected
as an env binding), the site key is wired client-side with a lazy loader,
and the end-to-end flow is browser-verified (token -> siteverify -> herald
accepted; bot posts without a valid token draw 403). This file remains as
the record of how it was done.

---

# Original walkthrough (for reference)

The site's reCAPTCHA wiring is already live and dormant. The moment a secret
key exists in the app environment, enforcement flips on with no code change.
Follow these steps and hand over the two keys as described in step 7.

## Step 1 — Open the reCAPTCHA admin console

Go to: **https://www.google.com/recaptcha/admin/create**

Sign in with any Google account (a dedicated account for the business is
fine).

## Step 2 — Register a new site

1. **Label:** `Numinous Herald`
2. **Type:** choose **reCAPTCHA v3** (the site's wiring uses the v3 score
   API: `grecaptcha.execute` with an action name, invisible to visitors).
3. **Domains:** add BOTH:
   - `thenuminouses.whop.site`
   - any future custom domain you plan to use (you can add it later too)

## Step 3 — Submit and copy both keys

After submitting, Google shows:

- **Site key** (public, safe to appear in the page source)
- **Secret key** (private, must live server-side only)

## Step 4 — Give me the keys (either path)

**Path A (zero-transit, recommended):** set the secret yourself on Whop:
1. Whop dashboard → **Apps** → the app for thisuminouses (app_YYGHDJQJ2JnCku)
2. **Settings → Environment Variables** (or Build/Deploy settings)
3. Add: name `RECAPTCHA_SECRET_KEY`, value = the secret key. Save.
4. Tell me it is set, and paste ONLY the **site key** in chat (public).

**Path B:** paste both keys in chat. I will place the site key in the page
and instruct you to set the secret via Path A's dashboard step (the secret
must never be baked into source files - the app's source zip is
downloadable, so a baked secret would leak).

## Step 5 — What I deploy when the keys arrive

1. Site key into `RECAPTCHA_SITE_KEY` in `src/home.html`.
2. CSP additions (home + app root): `script-src` gains `https://www.google.com`
   and `https://www.gstatic.com`; `frame-src` gains `https://www.google.com`;
   `style-src` gains `https://www.gstatic.com` (v3 badge).
3. Server side needs no change: `/api/herald` already calls Google
   `siteverify` when `RECAPTCHA_SECRET_KEY` is present and rejects with 403
   on failure.

## Step 6 — Verification (I run this after deploy)

- Form submit still succeeds for a human (score-based; v3 rarely blocks).
- A scripted flood without a token draws 403 `captcha_failed` (once
  enforcement is on, the strict rate tier is the second wall).
- Console clean on all surfaces; CSP violation check zero.

## Honest notes

- reCAPTCHA v3 is score-based; it does not replace the honeypot or the
  strict rate tier - it layers on top. All three stay.
- Whop's hosted checkout already runs Cloudflare Turnstile; the money path
  is protected by Whop regardless of this setup.
- Until keys arrive, the herald gate is protected by server validation +
  honeypot + 5/min/address rate limiting (all live in production).
