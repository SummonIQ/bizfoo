// Seeds just the 7 "apps" category products that exist in seed-summoniq.ts
// but never made it into the DB. Uses Prisma directly to dodge the
// server-only import in lib/db/client.ts.

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

const APPS = [
  {
    slug: "margin-author-suite",
    name: "Margin — Author Suite",
    tagline: "Full book authoring + cover design + multi-format publishing app, ready to rebrand.",
    description:
      "An AI-assisted writing and publishing platform for authors: rich Plate.js editor, drag-drop chapter management, AI-powered cover designer, semantic note retrieval, real-time collaboration, and DOCX/PDF/print exports. Ships as a Vercel-deployable Next.js app with auth, Stripe subscriptions, Resend email, Vercel Blob storage, web + product analytics, and Sentry — every brand string lives in one config file.",
    category: "apps",
    badge: "popular",
    stack: ["Next.js 16", "Plate.js", "Better Auth", "Stripe", "Resend", "Vercel Blob", "Sentry"],
    amount: 149900,
  },
  {
    slug: "tech-lead-toolkit-app",
    name: "Tech Lead Toolkit — Engineering OS",
    tagline: "The engineering leader's operating system: capacity, mentorship, 1:1s, metrics — all in one dashboard.",
    description:
      "A full SaaS for engineering managers and tech leads. Team directory, capacity planning, mentor matching, 1:1 notes with templates, decision logs, project delivery dashboards, and tech-debt tracking. Ships with Better Auth (incl. 2FA), Stripe checkout + customer portal, Vercel Analytics + Speed Insights + Sentry, Pusher real-time, and Vercel Blob. Rebrand the config, deploy to Vercel, charge customers.",
    category: "apps",
    badge: "new",
    stack: ["Next.js 16", "Better Auth", "Stripe", "Vercel Analytics", "Sentry", "Pusher"],
    amount: 119900,
  },
  {
    slug: "agency-dashboard-app",
    name: "Agency Dashboard",
    tagline: "Client + project management for service teams. Time tracking, invoicing, client portal — turnkey.",
    description:
      "A complete agency back-office app: clients, projects, timelines, time tracking, Stripe-issued invoices with hosted payment links, internal notes, and a branded client portal for sharing deliverables. Includes Better Auth for staff + magic-link client logins, Resend for invoice + reminder emails, Sentry for error tracking, and Vercel Analytics. Brand-tokenized.",
    category: "apps",
    stack: ["Next.js 16", "Better Auth", "Stripe", "Resend", "Sentry", "Vercel Analytics"],
    amount: 129900,
  },
  {
    slug: "saas-metrics-hub-app",
    name: "SaaS Metrics Hub",
    tagline: "MRR/ARR, cohorts, churn, and revenue forecasting for B2B SaaS founders.",
    description:
      "Plug your Stripe (and optionally Postgres / Segment) and get an honest, founder-friendly metrics dashboard: MRR/ARR with growth deltas, cohort retention, net + gross dollar retention, churn prediction, and forecast scenarios. Ships with Better Auth, Stripe metering ready, Vercel Analytics, Sentry, and a clean white-label config.",
    category: "apps",
    badge: "new",
    stack: ["Next.js 16", "Stripe", "Better Auth", "Vercel Analytics", "Sentry"],
    amount: 139900,
  },
  {
    slug: "community-platform-app",
    name: "Community Platform",
    tagline: "Private membership + community + events app. Substack-meets-Circle, fully white-label.",
    description:
      "Run a paid community on your own brand and infra. Member directory, threaded discussions, resource library, event scheduling with RSVPs, real-time chat, and email digest newsletters. Stripe memberships (one-off + recurring), Better Auth, Pusher real-time, Resend email, Sentry. Configurable theming via tokens.",
    category: "apps",
    stack: ["Next.js 16", "Better Auth", "Stripe", "Pusher", "Resend", "Sentry"],
    amount: 119900,
  },
  {
    slug: "knowledge-base-app",
    name: "Knowledge Management System",
    tagline: "Internal wiki + KB with search, RBAC, AI summaries, and usage analytics.",
    description:
      "An internal docs / wiki app for teams. Collaborative editor, full-text search, fine-grained RBAC, per-doc analytics, and AI-powered summaries + Q&A. Better Auth + RBAC, Vercel Blob for attachments, Resend for share notifications, Sentry, and a brandable config.",
    category: "apps",
    stack: ["Next.js 16", "Better Auth", "Vercel Blob", "AI SDK v6", "Resend", "Sentry"],
    amount: 109900,
  },
  {
    slug: "coaching-platform-app",
    name: "Coaching Platform",
    tagline: "Coach ↔ client app: programs, check-ins, payments, messaging — fully white-label.",
    description:
      "A turnkey coaching SaaS. Coaches enroll clients, ship plans (workouts / nutrition / habits / curriculum), schedule check-ins, message in-app, and bill via Stripe (one-off or recurring). Better Auth for both roles, Resend reminders, Vercel Analytics, Sentry, brand tokens.",
    category: "apps",
    stack: ["Next.js 16", "Better Auth", "Stripe", "Resend", "Vercel Analytics", "Sentry"],
    amount: 109900,
  },
];

async function main() {
  const storefront = await db.storefront.findUnique({ where: { slug: "summoniq" } });
  if (!storefront) {
    console.error("storefront 'summoniq' not found");
    process.exit(1);
  }

  for (const app of APPS) {
    const existing = await db.product.findFirst({
      where: { storefrontId: storefront.id, slug: app.slug },
    });
    if (existing) {
      console.log(`  ↻ ${app.slug} already exists, skipping`);
      continue;
    }
    await db.product.create({
      data: {
        storefrontId: storefront.id,
        slug: app.slug,
        name: app.name,
        tagline: app.tagline,
        description: app.description,
        category: app.category,
        badge: app.badge ?? null,
        stack: app.stack,
        active: true,
        prices: {
          create: [{
            amount: app.amount,
            currency: "usd",
            interval: "ONE_TIME",
            intervalCount: 1,
            active: true,
          }],
        },
      },
    });
    console.log(`  + created ${app.slug}`);
  }

  console.log("Done.");
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
