#!/usr/bin/env bash
# fix-live-site.sh — point the deploy at the app that actually serves
# https://jointhenuminouses.whop.site, then ship the storefront there.
#
#   bash fix-live-site.sh which                 # 1. find the WEBSITE app id (read-only)
#   bash fix-live-site.sh deploy app_XXXXXXXX   # 2. deploy the site to that app (goes live)
#   bash fix-live-site.sh builds app_XXXXXXXX   # see every web build of that app (dates, ids)
#   bash fix-live-site.sh rollback abld_XXXXXX  # promote an older build (= roll back)
#   bash fix-live-site.sh pull app_XXXXXXXX     # download that app's deployed source
#
# Needs Node 22+, and WHOP_API_KEY in the environment or in ./.env (gitignored).
# Get the key at https://whop.com/dashboard/developer — never paste it into chat.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -z "${WHOP_API_KEY:-}" ] && [ -f .env ]; then
  WHOP_API_KEY="$(grep -E '^[[:space:]]*WHOP_API_KEY[[:space:]]*=' .env | tail -1 | cut -d= -f2- | tr -d '\r' | sed -E 's/^[[:space:]]*//; s/[[:space:]]*$//; s/^"//; s/"$//')"
fi
if [ -z "${WHOP_API_KEY:-}" ]; then
  echo "No WHOP_API_KEY (environment or ./.env). Get one at https://whop.com/dashboard/developer"
  exit 1
fi
export WHOP_API_KEY

command -v npx >/dev/null || { echo "npx not found — install Node 22+ (https://nodejs.org)"; exit 1; }
WHOP="npx -y whop"

CMD="${1:-which}"

case "$CMD" in
  which)
    echo "== Website apps on this key (plain 'whop apps list' HIDES these) =="
    echo "   looking for the one whose route is: jointhenuminouses"
    echo
    # shellcheck disable=SC2086
    $WHOP apps list --app_type website --first 50 --format json \
      | node -e '
        let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
          let j;try{j=JSON.parse(s)}catch{console.log(s);process.exit(0)}
          const rows=(j.data||j.apps||j.items||[]);
          if(!rows.length){console.log("(no website apps returned)");return}
          for(const a of rows) console.log(`  ${a.id}\troute=${a.route||"?"}\tname=${a.name||"?"}\thosted=${a.hosted_url||"?"}`);
        })'
    echo
    echo "== Resolving the app that owns the route (docs: get accepts a route) =="
    # shellcheck disable=SC2086
    $WHOP apps get jointhenuminouses --format json || true
    echo
    echo "Next: bash fix-live-site.sh deploy <app_id of route jointhenuminouses>"
    ;;

  deploy)
    APP_ID="${2:-}"
    [ -n "$APP_ID" ] || { echo "Usage: bash fix-live-site.sh deploy app_XXXXXXXX"; exit 1; }
    case "$APP_ID" in app_*) ;; *) echo "That does not look like an app id (app_…)"; exit 1;; esac
    echo "Deploying this repo's build to $APP_ID (writes whop.app.json, then reaches production)..."
    echo "It will build, typecheck, upload, and promote to https://jointhenuminouses.whop.site"
    $WHOP apps deploy --app "$APP_ID"
    echo
    echo "DONE. Check https://jointhenuminouses.whop.site/products/the-numinary-3e"
    echo "whop.app.json now points at $APP_ID — commit it so future deploys stay correct:"
    grep -n '"app_id"' whop.app.json
    ;;

  builds)
    APP_ID="${2:-}"
    [ -n "$APP_ID" ] || { echo "Usage: bash fix-live-site.sh builds app_XXXXXXXX"; exit 1; }
    # shellcheck disable=SC2086
    $WHOP apps builds list --app_id "$APP_ID" --platform web --first 50 --format json \
      | node -e '
        let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
          let j;try{j=JSON.parse(s)}catch{console.log(s);process.exit(0)}
          const rows=(j.data||j.builds||j.items||[]);
          if(!rows.length){console.log("(no web builds returned)");return}
          for(const b of rows) console.log(`  ${b.id}\t${b.status||"?"}\t${b.created_at||"?"}\t${b.checksum?String(b.checksum).slice(0,12):""}`);
        })'
    echo
    echo "Roll back (or move forward) with: bash fix-live-site.sh rollback abld_XXXXXXXX"
    ;;

  rollback)
    BUILD_ID="${2:-}"
    [ -n "$BUILD_ID" ] || { echo "Usage: bash fix-live-site.sh rollback abld_XXXXXXXX"; exit 1; }
    case "$BUILD_ID" in abld_*) ;; *) echo "That does not look like a build id (abld_…)"; exit 1;; esac
    echo "Promoting $BUILD_ID to production (promoting an older build is how you roll back)..."
    $WHOP apps builds promote "$BUILD_ID"
    echo "DONE — verify the site."
    ;;

  pull)
    APP_ID="${2:-}"
    [ -n "$APP_ID" ] || { echo "Usage: bash fix-live-site.sh pull app_XXXXXXXX"; exit 1; }
    DIR="${3:-pulled-site}"
    mkdir -p "$DIR"
    echo "Downloading $APP_ID's production source (the deployed code, i.e. the older working version) into $DIR ..."
    $WHOP apps pull --app "$APP_ID" --dir "$DIR" --overwrite true
    echo "Source is in $DIR — inspect its product/collection routes there."
    ;;

  *)
    echo "Unknown task: $CMD"
    echo "Use: which | deploy <app_...> | builds <app_...> | rollback <abld_...> | pull <app_...> [dir]"
    exit 2
    ;;
esac
