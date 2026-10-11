# NUMINOUS · the site

Two gates: The Signal (free, forever) and The Watcher / The Numinary
($28 each moon, cancel any moon). The sealed editions are never on the open
page; they are found inside The Numinary after joining the Signal.

## Stack (repo law, per brief section 5)

TanStack Start + Vite + Cloudflare, deployed as a Whop app. Not Next.js, not
Vercel: this repo IS the live app at thenuminouses.whop.site and the deploy
chain is Whop's.

## Commands

    bun install          # dependencies (bun 1.4.x; chmod +x ~/.bun/bin/bun after installs)
    npm run dev          # dev server
    npm run build        # production build -> dist/ + whop-build.zip

## Deploy

    whop apps deploy     # from this directory, authenticated (one build = one promote)
    whop apps builds promote <build_id>   # rollback to any prior build

Authentication: `whop auth login --api-key <key>` (key transits once, then
`whop auth logout --all`, delete ~/.config/whop/credentials.json + logs, verify
`profiles: []`).

## Before any deploy (law)

1. Revert the `allowedHosts` lines in vite.config.ts (preview-only).
2. `git log` vs the working tree (sandbox resets roll HEAD while sparing files).
3. Gates: `tsc --noEmit`, banned-token grep, fresh build.

## Custom domain

Whop app settings (biz Gvi4LMiAxYxpLX, app_YYGHDJQJ2JnCku) → domain: point the
record, set the host. The site serves from thenuminouses.whop.site today.
