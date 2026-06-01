// Seeds a default build plan + initial milestones for every product in the
// SummonIQ storefront that doesn't already have one. Idempotent.
//
// Usage:
//   bun run scripts/seed-build-plans.ts
//   STOREFRONT_SLUG=summoniq bun run scripts/seed-build-plans.ts

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

const STAGES = [
  "IDEA",
  "SPEC",
  "SCAFFOLDED",
  "IN_DEV",
  "ALPHA",
  "BETA",
  "RELEASED",
] as const;

type Stage = (typeof STAGES)[number];

type SeedPlan = {
  stage?: Stage;
  problem: string;
  audience: string;
  outcome: string;
  scope: string;
  outOfScope: string;
  techNotes: string;
};

const DEFAULT_MILESTONES = [
  { title: "Lock the spec", estimateHours: 2, description: "Problem, audience, outcome, in/out of scope." },
  { title: "Scaffold the repo", estimateHours: 1, description: "Create GH repo, README, CI pipeline." },
  { title: "Stand up the core flow", estimateHours: 12, description: "Happy path end-to-end with stub data." },
  { title: "Wire real integrations", estimateHours: 8, description: "Stripe, auth, DB, third parties." },
  { title: "Polish UI + brand", estimateHours: 6, description: "Marketing assets, copy, visuals." },
  { title: "Write setup docs", estimateHours: 3, description: "README + getting-started checklist + .env.example." },
  { title: "Cut v0.1 release", estimateHours: 1, description: "Tag, draft release notes, sync to bizfoo." },
];

// Per-slug overrides for richer seed plans. Anything not listed gets a
// generic plan derived from the product's tagline + description.
const OVERRIDES: Record<string, Partial<SeedPlan>> = {
  "nextjs-saas-starter": {
    stage: "IN_DEV",
    problem:
      "Every new SaaS reinvents auth, billing, teams, and the marketing site — burning the first 2-3 weeks before any real product work.",
    audience: "Indie makers and 1-3 person teams shipping their first SaaS.",
    outcome: "Clone, brand, deploy, and start charging money the same week.",
    scope:
      "App Router; Better Auth (email + passkey); Stripe subscriptions + customer portal; org/role/invites; Resend email; marketing site + dashboard + billing page.",
    outOfScope: "Mobile app, role-based admin features beyond owner/admin/member, custom analytics.",
    techNotes:
      "Next.js 16, Prisma 7, Better Auth, Stripe, Resend, Tailwind v4, TypeScript. Vercel-first deploy.",
  },
  "auth-billing-boilerplate": {
    problem: "Auth + subscription billing is the same plumbing every project needs and nobody wants to rebuild.",
    audience: "Devs who already have a Next.js app and just need login + paid plans yesterday.",
    outcome: "Drop the lib/ + api/ folder into any Next.js app, set envs, ship paid plans.",
    scope: "Better Auth (email + passkey + GitHub), Stripe subs + portal + webhooks, orgs + invites.",
    outOfScope: "Marketing site, dashboard chrome, transactional email.",
    techNotes: "Better Auth, Stripe, Prisma. Idempotent webhook handler with retry-safe upserts.",
  },
  "ai-chat-boilerplate": {
    problem: "Building a multi-model chat UI from scratch is a week of yak-shaving before you can ship a single conversation.",
    audience: "Teams shipping LLM features into existing apps.",
    outcome: "A typed chat UI with model routing, tools, structured output, and per-user history.",
    scope: "AI SDK v6 via Gateway; tool calling; structured output with retry; thread persistence; MCP support.",
    outOfScope: "RAG pipeline (separate product), embedded widget mode, voice.",
    techNotes: "AI SDK v6, AI Gateway, Postgres, Next.js App Router. Stream with React Server Components where possible.",
  },
  "tauri-desktop-starter": {
    problem: "Spinning up a real desktop app means fighting auto-update, signing, deep links, and IPC types for a week.",
    audience: "Devs shipping a Mac/Windows desktop app this month.",
    outcome: "A working signed installer for both platforms with auto-update, multi-window, and tray menu.",
    scope: "Tauri 2; React + Vite shell; signed installers via GH Actions; auto-update; tray; IPC types; vitest.",
    outOfScope: "Native modules beyond what Tauri ships; mobile (Tauri mobile is its own product).",
    techNotes: "Tauri 2, Rust. Sign with bizfoo-managed certs in CI. Updater hosted on GH releases.",
  },
  "booking-template": {
    problem: "Cal.com-style booking is too complex to roll yourself, but every Cal.com fork is too opinionated.",
    audience: "Coaches, agencies, and teams that need scheduling on their own brand and stack.",
    outcome: "A clean, brandable booking flow with paid bookings via Stripe.",
    scope: "Multi-host events, group bookings, availability rules, Google + Outlook sync, Stripe checkout, public booking page.",
    outOfScope: "SMS reminders (use Resend/Twilio later), team-wide round-robin (v2).",
    techNotes: "Next.js + Prisma + Stripe. Calendar sync via providers' webhooks.",
  },
  "summoniq-ui-kit": {
    problem: "Every site I ship needs the same buttons, tabs, glow cards, and motion defaults — repeated work.",
    audience: "Teams that want a tasteful design system without committing to a heavy vendor.",
    outcome: "Drop-in primitives + marketing blocks that look like SummonIQ on day one.",
    scope: "Tokens, Button/Tab/Card/Glow primitives, marketing blocks (hero/features/pricing/FAQ), motion defaults, dark + light.",
    outOfScope: "Form library, table library (own products).",
    techNotes: "Tailwind v4 with @theme tokens; Radix interop; Framer Motion.",
  },
  "agency-dashboard-app": { stage: "SPEC" },
  "author-publishing-suite-app": { stage: "SPEC" },
  "coaching-platform-app": { stage: "SPEC" },
  "community-platform-app": { stage: "SPEC" },
  "knowledge-base-app": { stage: "SPEC" },
  "saas-metrics-hub-app": { stage: "SPEC" },
  "tech-lead-toolkit-app": { stage: "SPEC" },
};

function genericPlan(name: string, tagline: string | null, description: string | null): SeedPlan {
  return {
    problem: tagline ?? `${name} addresses an unmet need indie makers face today.`,
    audience: "Indie makers and small teams shipping fast.",
    outcome: `Buyer can clone, brand, and deploy ${name} in under a day.`,
    scope: description ?? "Core happy-path flow + setup docs + a polished landing.",
    outOfScope: "Anything beyond the core scope is V2.",
    techNotes: "Next.js 16, Prisma, TypeScript. Deploy on Vercel.",
  };
}

async function main() {
  const slug = process.env.STOREFRONT_SLUG ?? "summoniq";
  const storefront = await db.storefront.findUnique({ where: { slug } });
  if (!storefront) {
    console.error(`No storefront with slug ${slug}`);
    process.exit(1);
  }

  const products = await db.product.findMany({
    where: { storefrontId: storefront.id },
    include: { buildPlan: { include: { milestones: true } } },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Seeding build plans into /${slug} (${products.length} products)`);

  let created = 0;
  let updated = 0;
  let milestonesAdded = 0;

  for (const p of products) {
    const override = OVERRIDES[p.slug] ?? {};
    const generic = genericPlan(p.name, p.tagline, p.description);
    const planData = { ...generic, ...override };

    let plan = p.buildPlan;
    if (!plan) {
      plan = await db.buildPlan.create({
        data: {
          productId: p.id,
          stage: planData.stage ?? "IDEA",
          ...planData,
        },
        include: { milestones: true },
      });
      console.log(`  + plan  ${p.slug}`);
      created += 1;
    } else if (!plan.problem && !plan.outcome) {
      plan = await db.buildPlan.update({
        where: { id: plan.id },
        data: planData,
        include: { milestones: true },
      });
      console.log(`  ↺ plan  ${p.slug}`);
      updated += 1;
    }

    if ((plan.milestones ?? []).length === 0) {
      for (let i = 0; i < DEFAULT_MILESTONES.length; i += 1) {
        const m = DEFAULT_MILESTONES[i];
        await db.milestone.create({
          data: {
            buildPlanId: plan.id,
            title: m.title,
            description: m.description,
            estimateHours: m.estimateHours,
            status: "TODO",
            position: i,
          },
        });
      }
      milestonesAdded += DEFAULT_MILESTONES.length;
      console.log(`    + ${DEFAULT_MILESTONES.length} milestones`);
    }
  }

  console.log(
    `\nDone. ${created} plans created, ${updated} plans updated, ${milestonesAdded} milestones added.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
