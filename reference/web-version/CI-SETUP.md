# CI setup — push the repo to GitHub and let Actions ship

The local git history is the source of truth. GitHub becomes the remote
backup and (optionally) the hosted pipeline. This sandbox holds no GitHub
credentials, so steps 1-3 are yours; everything else is already prepared.

## One-time: create the remote and push

```bash
# 1. On github.com: create an EMPTY private repository (no README, no .gitignore)
#    e.g. github.com/<you>/thenuminouses

# 2. From the project root locally:
cd thenuminouses
git remote add origin git@github.com:<you>/thenuminouses.git
#    (or HTTPS: git remote add origin https://github.com/<you>/thenuminouses.git)

git push -u origin main
#    If your local branch has another name: git branch -M main first.
#    Authenticate over SSH (recommended) or a fine-grained personal access token.
```

## One-time: enable the pipeline

The workflow lives at `.github/workflows/ship.yml` and runs on every push
to `main`:

- **verify job (always runs):** install, typecheck, seal gates (offer-ladder
  anchors, referrer, CSP, honeypot element, checkout anchor, sealed-works
  naming, em-dash budget), full build.
- **deploy job (opt-in):** only when BOTH are true:
  - repository secret `WHOP_API_KEY` exists (Settings → Secrets and
    variables → Actions → New repository secret), and
  - repository variable `ENABLE_DEPLOY` is set to `true`
    (Settings → Secrets and variables → Actions → Variables tab).
  This double gate means merely adding the key does NOT give Actions deploy
  power - you flip `ENABLE_DEPLOY` when you trust the pipeline.

## Security notes (read before enabling)

- The WHOP_API_KEY is stored only in GitHub Secrets, used transiently in the
  deploy step, and logged out at the end of the job. It never appears in
  logs or artifacts.
- `main` should be a protected branch (Settings → Branches → require pull
  request before merging is optional for a solo operation; at minimum
  forbid force pushes).
- The workflow file runs with your repository's permissions; review any
  change to `.github/workflows/*` in pull requests.

## Day to day

- Push to `main` → verify runs (~2 min). With deploy enabled, a green run
  ships to production exactly like `./scripts/ship.sh` does locally.
- Emergency rollback stays `whop apps promote <build-id>` from anywhere the
  CLI is installed; known-good build IDs live in BUG_LOG.md.
