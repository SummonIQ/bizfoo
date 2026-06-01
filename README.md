<!-- SUMMONIQ-OSS-HEADER:START -->
<div align="center">

  <img src="public/logo.svg" alt="Bizfoo logo" width="112">

  <h1>Bizfoo</h1>
  <p>Storefronts that ship in an afternoon. Live: https://bizfoo.com</p>

  <p>
    <a href="https://github.com/SummonIQ/bizfoo"><img alt="Repository" src="https://img.shields.io/badge/github-SummonIQ%2Fbizfoo-24292f?logo=github"></a>
    <a href="https://unlicense.org/"><img alt="License: Unlicense" src="https://img.shields.io/badge/license-Unlicense-blue.svg"></a>
  </p>

</div>

---
<!-- SUMMONIQ-OSS-HEADER:END -->
# bizfoo

Storefronts that ship in an afternoon. Live: https://bizfoo.com

bizfoo is a multi-tenant product and storefront management platform. Manage
products, sync them to Stripe, and serve a clean catalog + checkout API to
any frontend.

## Stack

- Next.js 16 (App Router)
- Prisma 7 + Postgres (Neon, via Vercel Marketplace)
- Better Auth (email + passkey + organizations)
- Stripe (platform billing + tenant storefront checkout)
- Tailwind v4
- TypeScript
- @summoniq/analytics (SignalSplash) — optional, ships once GH Packages auth is wired

## Layout

- `app/(marketing)` — public landing + pricing + docs
- `app/(auth)` — sign-in, sign-up
- `app/(app)/dashboard` — protected workspace dashboard
- `app/api/v1/storefronts/[slug]/...` — public catalog + checkout API
- `app/api/stripe/...` — platform billing checkout + unified webhook
- `lib/auth`, `lib/db`, `lib/stripe`, `lib/storefront` — server libs
- `packages/client` — `@summoniq/bizfoo-client-sdk` consumed by tenant sites
- `scripts/` — bootstrap + seed automation

## Local development

```bash
cp .env.example .env
bun install
vercel env pull .env.local      # pull prod-shaped envs locally
bun run db:push
bun run dev                     # http://localhost:30240
bun run stripe:listen           # forward webhooks
```

## Bootstrap from scratch (idempotent)

The `scripts/bootstrap.sh` script does everything below in one go. Each step is
independently re-runnable if you only need to repair part of the chain.

```bash
# Prereqs (one-time):
brew install gh vercel stripe bun
gh auth login
vercel login
stripe login

cd ~/Projects/bizfoo
./scripts/bootstrap.sh all          # full bootstrap
./scripts/bootstrap.sh repo         # 1. GitHub repo
./scripts/bootstrap.sh link         # 2. Vercel project + GH connect
./scripts/bootstrap.sh db           # 3. Neon (interactive — see note)
./scripts/bootstrap.sh envs         # 4. all env vars via REST API
./scripts/bootstrap.sh pull         # 5. .env.local
./scripts/bootstrap.sh schema       # 6. prisma db push
./scripts/bootstrap.sh deploy-prod  # 7. vercel --prod
./scripts/bootstrap.sh attach-domain # 8. add bizfoo.com + www
```

**Step 3 note:** Provisioning Neon via the marketplace is a one-time thing —
the script invokes `vercel integration add neon` which fans out to a browser
flow on first install. Subsequent runs skip if `DATABASE_URL` already exists.

## Seeding the SummonIQ storefront

After deploy, sign up at `https://bizfoo.com/sign-up` (creates a workspace),
then:

```bash
SEED_OWNER_EMAIL=you@example.com bun run scripts/seed-summoniq.ts
SEED_SYNC_STRIPE=true SEED_OWNER_EMAIL=you@example.com \
  bun run scripts/seed-summoniq.ts   # also creates Stripe products + prices
```

The script is idempotent — re-runs update existing products in place.

The SummonIQ seed includes a `summoniq-leads` collection with pilot,
starter-kit, CRM add-on, monthly refresh, and SignalSplash-to-CRM packages.
These products reuse Bizfoo's existing product/price and Stripe sync flow.

For Stripe setup, prefer:

```bash
SEED_SYNC_STRIPE=true SEED_OWNER_EMAIL=you@example.com \
  bun run scripts/seed-summoniq.ts
```

If the database seed path is not available, `scripts/create-summoniq-leads-stripe-products.sh`
documents manual test-mode Stripe product creation. Do not create live prices
without explicit confirmation.

After seeding, copy the printed public key and set it in SummonIQ's env:

```bash
# ~/Projects/summoniq/.env.local
BIZFOO_BASE_URL=https://bizfoo.com
BIZFOO_STOREFRONT_SLUG=summoniq
BIZFOO_PUBLIC_KEY=bf_pk_...
```

SummonIQ's `/store` will flip from local catalog to the live bizfoo API
automatically.

## Stripe webhook

After deploy, point a webhook at:

```
https://bizfoo.com/api/stripe/webhook
```

with events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Then add `STRIPE_WEBHOOK_SECRET` via `vercel env add` or re-run
`./scripts/set-envs.sh` after exporting it.
