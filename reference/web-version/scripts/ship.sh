#!/usr/bin/env bash
# Gated ship pipeline for the Numinous app at jointhenuminouses.
#
# This is the CI/CD the runtime actually has: every deploy passes typecheck,
# seal gates, build, deploy, and a live smoke check, in order, and stops at
# the first failure. A hosted CI (GitHub Actions) and an external git remote
# are user-side steps - this sandbox holds no remote credentials. Version
# control = the local git history; every deploy is a commit, every commit is
# deployable, and known-good build IDs are recorded in BUG_LOG.md for
# rollback (whop apps promote <build-id>).
set -euo pipefail
cd "$(dirname "$0")/.."
# Clean generated artifacts, including the deploy log, on success or failure.
deploy_log=""
cleanup() {
  rm -rf dist
  if [ -n "$deploy_log" ]; then rm -f "$deploy_log"; fi
}
trap cleanup EXIT

echo "[1/6] install"
export PATH="$HOME/.bun/bin:$PATH"
bun install >/dev/null 2>&1 || bun install

echo "[2/6] typecheck"
./node_modules/.bin/tsc --noEmit

echo "[3/6] seal gates"
node scripts/test-sw-cache.mjs
# Public HTML may use only the short shared cache policy; purchase and return
# surfaces and every API response remain outside shared and browser caches.
grep -qF 'HOMEPAGE_CACHE_CONTROL' src/routes/index.tsx || { echo "FAIL: homepage cache policy missing"; exit 1; }
for route_file in 'src/routes/products.$slug.tsx' 'src/routes/collections.$label.tsx' src/routes/cookies.tsx src/routes/privacy.tsx src/routes/returns.tsx src/routes/terms.tsx; do
  grep -qF 'PUBLIC_DOCUMENT_CACHE_CONTROL' "$route_file" || { echo "FAIL: public document cache policy missing from $route_file"; exit 1; }
done
grep -qF 'NO_STORE_CACHE_CONTROL' src/routes/order-complete.tsx 'src/routes/checkout.$planId.tsx' || { echo "FAIL: return/checkout no-store policy missing"; exit 1; }
grep -qF 'setResponseHeader("Cache-Control", NO_STORE_CACHE_CONTROL)' 'src/routes/checkout.$planId.tsx' || { echo "FAIL: order quote server function is not no-store"; exit 1; }
grep -qF 'PUBLIC_READ_TTL_MS = 10_000' src/whop.server.ts || { echo "FAIL: public data cache TTL changed"; exit 1; }
# Em-dash law: home keeps only the 8 legal-verbatim lines (bound records);
# app source must be at ZERO.
em=$(grep -c "—" src/home.html || true)
[ "${em:-0}" -eq 8 ] || { echo "FAIL: home em-dash legal-verbatim line count changed ($em != 8)"; exit 1; }
appem=$((grep -rn "—" src/ --include="*.tsx" --include="*.ts" || true) | wc -l)
[ "${appem:-0}" -eq 0 ] || { echo "FAIL: $appem em-dash lines in app source"; exit 1; }
# Offer ladder anchors must be present and truthful.
grep -qF 'CHAPTER&nbsp;I&nbsp;·&nbsp;THREE&nbsp;WORKS' src/home.html || { echo "FAIL: three-work chapter heading missing"; exit 1; }
grep -qF 'Three works: The Signal is free, Watcher is a 28-day membership, and Wallpaper Vault is a one-time $12 purchase.' src/home.html || { echo "FAIL: three-work chapter copy missing"; exit 1; }
grep -qF 'I&nbsp;/&nbsp;III' src/home.html || { echo "FAIL: first work index missing"; exit 1; }
grep -qF 'II&nbsp;/&nbsp;III' src/home.html || { echo "FAIL: second work index missing"; exit 1; }
grep -qF 'III&nbsp;/&nbsp;III' src/home.html || { echo "FAIL: third work index missing"; exit 1; }
grep -qF 'const works = ["The Signal", "The Numinary", "Wallpaper Vault"]' src/components/home/HomeExperience.tsx || { echo "FAIL: React home is not showing all three works"; exit 1; }
grep -qF 'CHAPTER&nbsp;I&nbsp;·&nbsp;THREE&nbsp;WORKS' src/components/home/HomeExperience.tsx || { echo "FAIL: React home chapter heading is stale"; exit 1; }
grep -qF 'this site’s own{" "}' src/routes/cookies.tsx || { echo "FAIL: cookie tracker disclosure spacing missing"; exit 1; }
# The agent is mentioned only after checkout, for Signal and Watcher.
agent_steps=$(grep -cF 'title: "Meet The Numinary Agent"' src/routes/order-complete.tsx || true)
[ "${agent_steps:-0}" -eq 2 ] || { echo "FAIL: Numinary Agent must appear in both post-checkout briefings"; exit 1; }
grep -qF 'copy: "When the Creator is away, The Numinary Agent is your primary AI assistant in Numinous Community. Consult it directly about myth, symbols, and the realms; it does not speak for the Creator."' src/routes/order-complete.tsx || { echo "FAIL: Numinary Agent role and boundaries copy missing"; exit 1; }
grep -qF '["I", "II", "III", "IV", "V"][i]' src/routes/order-complete.tsx || { echo "FAIL: post-checkout step numbering is incomplete"; exit 1; }
if grep -qF 'The Numinary Agent' src/home.html src/components/product/ProductExperience.tsx src/lib/briefings.ts; then
  echo "FAIL: Numinary Agent mention leaked into public homepage/PDP or invitation copy"; exit 1
fi
grep -qF '7-night trial, then $28 every 28 days' src/home.html || { echo "FAIL: Watcher trial/renewal anchor missing"; exit 1; }
grep -qF 'Free: $0, no renewal' src/home.html || { echo "FAIL: Signal price/no-renewal anchor missing"; exit 1; }
grep -qF 'The Signal is free' src/home.html || { echo "FAIL: signal anchor missing"; exit 1; }
grep -q 'name="referrer"' src/home.html || { echo "FAIL: referrer policy missing"; exit 1; }
grep -q 'origin: "https://jointhenuminouses.whop.site"' src/lib/site.ts || { echo "FAIL: canonical app origin drift"; exit 1; }
grep -q '<link rel="canonical" href="https://jointhenuminouses.whop.site/">' src/home.html || { echo "FAIL: homepage canonical host drift"; exit 1; }
grep -qF '<h1 class="hero-title split" id="heroTitle">NUMINOUS</h1>' src/home.html || { echo "FAIL: hero wordmark text missing"; exit 1; }
grep -qF '.hero-title .ch{background:none;color:#f2efe8;-webkit-text-fill-color:#f2efe8}' src/home.html || { echo "FAIL: hero wordmark foreground fill missing"; exit 1; }
grep -qF '#cookiebar{position:relative;inset:auto;left:auto;right:auto;top:auto;bottom:auto;z-index:3' src/home.html || { echo "FAIL: cookie consent is not in the page flow"; exit 1; }
grep -qF 'data-consent="accepted"' src/home.html || { echo "FAIL: cookie Accept control missing"; exit 1; }
grep -qF 'data-consent="declined"' src/home.html || { echo "FAIL: cookie Decline control missing"; exit 1; }
grep -qF 'href="/cookies">cookie policy</a>' src/home.html || { echo "FAIL: cookie policy link missing"; exit 1; }
grep -q "Content-Security-Policy" src/home.html || { echo "FAIL: CSP missing"; exit 1; }
# Public Watcher copy lists only the four-week cycle, not hidden products or rooms.
grep -qF 'One 28-day cycle, delivered in four weekly chapters.' src/components/product/ProductExperience.tsx || { echo "FAIL: Watcher inclusions copy missing"; exit 1; }
grep -qF '7-night trial, then $28 every 28 days.' src/components/product/ProductExperience.tsx || { echo "FAIL: Watcher plan terms missing"; exit 1; }
if sed -n '/const WATCHER_INVITE/,/^};/p' src/lib/briefings.ts | grep -qiE 'Codex|Collector|Binding|Premium Edition|Wallpaper Vault|Member Files|Sanctuary|The Vault|Numinary chat|Numinary forum'; then
  echo "FAIL: Watcher public invitation mentions a hidden product or room"; exit 1
fi
# Honeypot must exist as a real element, not only in script text.
grep -q 'id="heraldHoney"' src/home.html || { echo "FAIL: herald honeypot input missing"; exit 1; }
grep -qF '#heraldForm #heraldHoney{display:none!important}' src/home.html || { echo "FAIL: herald honeypot is visibly rendered"; exit 1; }
# reCAPTCHA v3 site key wired (public by design; secret lives in whop secrets).
# captcha site key (provider-agnostic CAPTCHA constant; recaptcha key during the hCaptcha migration)
grep -q "CAPTCHA={provider:" src/home.html || { echo "FAIL: captcha site key constant missing"; exit 1; }
grep -qE "6LcqIdktAAAAAPbYorHhJvAK-XMQA8hzzh-xT-0m|a0644e9c-f63e-4e2a-bbca-1e8ea40c96f2" src/home.html || { echo "FAIL: captcha site key missing"; exit 1; }
# Watcher checkout anchor verbatim (offer-ladder law); the app route
# /checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ%3A1 is
# verified behaviorally in the live smoke stage.
grep -q "ch_vrkSRxgzQ23IzXH" src/lib/site.ts || \
  { echo "FAIL: watcher checkout anchor altered"; exit 1; }
# Sealed works never public (home + app shell only; briefing copy is gated inside).
if grep -rihoE "codex|collector" src/home.html src/routes/__root.tsx | grep -qiE "." ; then
  echo "FAIL: sealed work named on a public surface"; exit 1
fi

echo "[4/6] build"
npm run build 2>&1 | grep -E "packed" | tail -1

echo "[5/6] deploy"
export PATH="$HOME/.local/bin:$PWD/node_modules/.bin:$PATH"
# Use the ignored local key only for this deploy subprocess; do not print it.
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi
deploy_log=$(mktemp)
if ! whop apps deploy >"$deploy_log" 2>&1; then
  rm -f "$deploy_log"
  echo "FAIL: Whop app deployment returned a nonzero status; CLI output withheld." >&2
  exit 1
fi
grep -iE "url|error" "$deploy_log" | head -2 || true
rm -f "$deploy_log"
deploy_log=""
unset WHOP_API_KEY || true

echo "[6/6] live smoke"
sleep 8
curl -sf https://jointhenuminouses.whop.site/.well-known/security.txt >/dev/null || { echo "FAIL: security.txt"; exit 1; }
curl -sf -o /dev/null https://jointhenuminouses.whop.site/ || { echo "FAIL: home"; exit 1; }
for route in /products/the-signal-e6 /products/the-numinary-3e /returns; do
  curl -sf -o /dev/null "https://jointhenuminouses.whop.site${route}" || { echo "FAIL: route ${route}"; exit 1; }
done
curl -sf https://jointhenuminouses.whop.site/api/health | grep -q '"ok":true' || { echo "FAIL: health probe"; exit 1; }
# The verbatim watcher checkout URL must still 307 into Whop's checkout.
loc=$(curl -s -o /dev/null -w "%{redirect_url}" "https://jointhenuminouses.whop.site/checkout/plan_PQnMYNixMTjRQ?quantity=1&items=plan_PQnMYNixMTjRQ%3A1")
case "$loc" in
  https://whop.com/checkout/*) : ;;
  *) echo "FAIL: watcher checkout no longer 307s to Whop (got: ${loc:-none})"; exit 1 ;;
esac
echo "SHIP OK"
