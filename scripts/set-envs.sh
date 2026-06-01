#!/usr/bin/env bash
# Bulk-set BizFoo Vercel env vars via the REST API.
# Reads VERCEL_TOKEN from ~/Library/Application Support/com.vercel.cli/auth.json
# Reads project + org IDs from .vercel/project.json
#
# Usage: ./scripts/set-envs.sh

set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"

if [ ! -f .vercel/project.json ]; then
  echo "Run 'vercel link' first."
  exit 1
fi

AUTH_FILE_DARWIN="$HOME/Library/Application Support/com.vercel.cli/auth.json"
AUTH_FILE_LINUX="$HOME/.config/vercel/auth.json"
AUTH_FILE="$AUTH_FILE_DARWIN"
[ ! -f "$AUTH_FILE" ] && AUTH_FILE="$AUTH_FILE_LINUX"

VERCEL_TOKEN=$(sed -n 's/.*"token": *"\([^"]*\)".*/\1/p' "$AUTH_FILE" | head -1)
PROJECT_ID=$(sed -n 's/.*"projectId": *"\([^"]*\)".*/\1/p' .vercel/project.json | head -1)
TEAM_ID=$(sed -n 's/.*"orgId": *"\([^"]*\)".*/\1/p' .vercel/project.json | head -1)

if [ -z "$VERCEL_TOKEN" ] || [ -z "$PROJECT_ID" ] || [ -z "$TEAM_ID" ]; then
  echo "Failed to read Vercel auth/project IDs."
  exit 1
fi

set_env() {
  local key="$1"; local val="$2"; local target="$3"
  curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID&upsert=true" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$key\",\"value\":\"$val\",\"type\":\"encrypted\",\"target\":[\"$target\"]}" \
    > /dev/null
  echo "  ✓ $key → $target"
}

set_all() {
  local key="$1"; local val="$2"
  set_env "$key" "$val" production
  set_env "$key" "$val" preview
  set_env "$key" "$val" development
}

echo "Setting BizFoo envs..."

# Better Auth
SECRET=$(openssl rand -hex 32)
set_all BETTER_AUTH_SECRET "$SECRET"
set_env BETTER_AUTH_URL "https://bizfoo.com" production
set_env BETTER_AUTH_URL "https://bizfoo.vercel.app" preview
set_env BETTER_AUTH_URL "http://localhost:30240" development
set_env NEXT_PUBLIC_APP_URL "https://bizfoo.com" production
set_env NEXT_PUBLIC_APP_URL "https://bizfoo.vercel.app" preview
set_env NEXT_PUBLIC_APP_URL "http://localhost:30240" development

# Stripe — pulled from `stripe config --list` (test mode by default)
STRIPE_SECRET=$(stripe config --list 2>/dev/null | sed -n "s/^test_mode_api_key = '\(.*\)'/\1/p")
if [ -n "$STRIPE_SECRET" ]; then
  set_all STRIPE_SECRET_KEY "$STRIPE_SECRET"
else
  echo "  ! STRIPE_SECRET_KEY skipped — set it manually."
fi

# Analytics
set_all NEXT_PUBLIC_ANALYTICS_ENABLED "true"
set_all NEXT_PUBLIC_ANALYTICS_ENDPOINT "https://api.signalsplash.com/api/events"

echo "Done. Run 'vercel env pull .env.local' to sync locally."
