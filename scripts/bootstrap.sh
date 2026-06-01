#!/usr/bin/env bash
# BizFoo bootstrap script.
# Idempotent — safe to re-run; each step checks before acting.
#
# Prereqs (run once on your machine):
#   brew install gh vercel stripe
#   gh auth login            # logs into GitHub
#   vercel login             # logs into Vercel
#   stripe login             # logs into Stripe (test mode is enough)
#   bun install -g vercel    # if not on PATH
#
# Usage:
#   cd ~/Projects/bizfoo
#   ./scripts/bootstrap.sh                 # full first-time bootstrap
#   ./scripts/bootstrap.sh deploy          # just redeploy
#   ./scripts/bootstrap.sh seed            # seed SummonIQ catalog into the DB
#   ./scripts/bootstrap.sh attach-domain   # add bizfoo.com to the project
#
# What it does (in order):
#   1. git init + commit + create private GitHub repo + push
#   2. vercel link to a project on the SummonIQ team
#   3. provision Neon Postgres via Vercel marketplace
#   4. set required env vars in Vercel (test-mode Stripe, Better Auth, analytics)
#   5. vercel env pull -> .env.local
#   6. prisma db push (schema → Neon)
#   7. deploy preview
#   8. (manual) seed: bun run scripts/seed-summoniq.ts
#   9. promote to production + attach bizfoo.com

set -euo pipefail

PROJECT_NAME="bizfoo"
GH_REPO_VISIBILITY="--private"      # change to --public if you want it public
VERCEL_TEAM="summon-iq"
DOMAIN="bizfoo.com"
NEON_INTEGRATION="neon"             # vercel integration slug
HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"

log() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
warn() { printf "\033[33m! %s\033[0m\n" "$*"; }
ok() { printf "\033[32m✓ %s\033[0m\n" "$*"; }

ensure_git_repo() {
  log "Step 1: GitHub repo"
  if [ ! -d .git ]; then
    git init -q
    git add -A
    git -c commit.gpgsign=false commit -q -m "Initial BizFoo scaffold"
    ok "Initialized local git repo."
  else
    ok "Local git repo exists."
  fi

  if ! git remote get-url origin >/dev/null 2>&1; then
    GH_USER=$(gh api user --jq .login)
    if gh repo view "$GH_USER/$PROJECT_NAME" >/dev/null 2>&1; then
      ok "GitHub repo $GH_USER/$PROJECT_NAME already exists."
    else
      gh repo create "$PROJECT_NAME" $GH_REPO_VISIBILITY --source . --push --remote origin --description "BizFoo — storefront management platform"
      ok "Created GitHub repo $GH_USER/$PROJECT_NAME and pushed."
      return
    fi
    git remote add origin "git@github.com:$GH_USER/$PROJECT_NAME.git"
  fi

  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git -c commit.gpgsign=false commit -q -m "chore: bootstrap update" || true
  fi
  git push -u origin HEAD || true
  ok "Pushed latest to origin."
}

ensure_vercel_project() {
  log "Step 2: Vercel project"
  if [ -f .vercel/project.json ]; then
    ok "Vercel project already linked."
    return
  fi
  vercel link --yes --project "$PROJECT_NAME" --scope "$VERCEL_TEAM"
  ok "Linked to Vercel project $PROJECT_NAME on team $VERCEL_TEAM."
}

ensure_neon_db() {
  log "Step 3: Neon Postgres (Vercel marketplace)"
  if vercel env ls production 2>/dev/null | grep -q "DATABASE_URL"; then
    ok "DATABASE_URL already set in production env."
    return
  fi
  warn "DATABASE_URL not present yet."
  warn "Open the dashboard to provision Neon (free tier is fine):"
  warn "  https://vercel.com/$VERCEL_TEAM/$PROJECT_NAME/stores"
  warn "Choose 'Marketplace Database' → Neon → connect to this project."
  warn "Re-run this script after the Neon integration is connected."
  exit 1
}

set_env() {
  local name="$1"
  local value="$2"
  local target="${3:-development preview production}"
  for env_target in $target; do
    if vercel env ls "$env_target" 2>/dev/null | grep -q "^[[:space:]]*$name "; then
      ok "  $name already set in $env_target"
    else
      printf '%s' "$value" | vercel env add "$name" "$env_target" >/dev/null
      ok "  $name → $env_target"
    fi
  done
}

ensure_envs() {
  log "Step 4: Vercel env vars (uses set-envs.sh — REST API)"
  ./scripts/set-envs.sh
}

pull_envs() {
  log "Step 5: vercel env pull → .env.local"
  vercel env pull .env.local --yes
  ok "Wrote .env.local"
}

push_schema() {
  log "Step 6: prisma db push"
  bun install
  bun run db:generate
  bun run db:push
  ok "Schema pushed to Neon."
}

deploy_preview() {
  log "Step 7: vercel deploy (preview)"
  local url
  url=$(vercel deploy --yes 2>&1 | tail -n 1)
  echo "Preview: $url"
  ok "Preview deployed."
}

deploy_prod() {
  log "Step 9a: vercel --prod"
  local url
  url=$(vercel deploy --prod --yes 2>&1 | tail -n 1)
  echo "Production: $url"
  ok "Production deployed."
}

attach_domain() {
  log "Step 9b: attach $DOMAIN + www.$DOMAIN"
  vercel domains add "$DOMAIN" 2>&1 | tail -2 || true
  vercel domains add "www.$DOMAIN" 2>&1 | tail -2 || true
  warn "If DNS isn't auto-handled (Vercel-registered domains usually are),"
  warn "add an A record: @ → 76.76.21.21 and a CNAME: www → cname.vercel-dns.com"
  ok "Domain attached. Verify at https://$DOMAIN"
}

seed_db() {
  log "Step 8: seed SummonIQ catalog"
  if [ -z "${SEED_OWNER_EMAIL:-}" ]; then
    warn "Set SEED_OWNER_EMAIL to the email of an existing BizFoo workspace owner."
    warn "  SEED_OWNER_EMAIL=you@example.com bun run scripts/seed-summoniq.ts"
    exit 1
  fi
  bun run scripts/seed-summoniq.ts
  ok "Seeded."
}

case "${1:-all}" in
  all)
    ensure_git_repo
    ensure_vercel_project
    ensure_neon_db
    ensure_envs
    pull_envs
    push_schema
    deploy_preview
    log "Next:"
    echo "  1. Visit the preview URL, sign up at /sign-up."
    echo "  2. Run: SEED_OWNER_EMAIL=<your-email> ./scripts/bootstrap.sh seed"
    echo "  3. Run: ./scripts/bootstrap.sh deploy-prod"
    echo "  4. Run: ./scripts/bootstrap.sh attach-domain"
    ;;
  repo) ensure_git_repo ;;
  link) ensure_vercel_project ;;
  db) ensure_neon_db ;;
  envs) ensure_envs ;;
  pull) pull_envs ;;
  schema) push_schema ;;
  deploy) deploy_preview ;;
  deploy-prod) deploy_prod ;;
  attach-domain) attach_domain ;;
  seed) seed_db ;;
  *)
    echo "Usage: $0 [all|repo|link|db|envs|pull|schema|deploy|deploy-prod|attach-domain|seed]"
    exit 1
    ;;
esac
