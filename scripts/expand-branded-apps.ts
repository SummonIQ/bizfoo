// Rewrites longDescriptions for the 7 original branded-apps (margin, tech-
// lead, agency, saas-metrics, community, knowledge-base, coaching) to the
// full multi-paragraph + bullet structure. Also renames margin-author-suite
// since "margin" is the user's project name.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

const ORG = "SummonIQ";

type Update = {
  oldSlug: string;
  newSlug?: string;
  name?: string;
  tagline?: string;
  description?: string;
  longDescription: string;
};

const UPDATES: Update[] = [
  {
    oldSlug: "margin-author-suite",
    newSlug: "author-publishing-suite-app",
    name: "Author + Publishing Suite",
    tagline: "Full book authoring + cover design + multi-format publishing app, ready to rebrand.",
    description: "An AI-assisted writing and publishing platform for authors: rich editor, chapter management, AI cover designer, semantic note retrieval, real-time collaboration, DOCX/PDF/print exports.",
    longDescription: `The complete AI-assisted writing and publishing platform for authors — not a template, the production codebase ready to rebrand.

## What's in the box

- **Rich editor** (Plate.js) with slash menu, markdown shortcuts, code blocks, footnotes, and citation management
- **Drag-and-drop chapter management** with reorder, outline view, progress tracking, and word-count targets per chapter
- **AI-powered cover designer** — generate cover art via text-to-image, compose typography, preview on mockups
- **Semantic note retrieval** — vector-searchable notes/research that surface in the editor when you write related content
- **Real-time collaboration** with presence + cursors for multi-author works
- **Exports**: DOCX, EPUB, print-ready PDF, Kindle-ready MOBI with per-format typography profiles
- **Paywalled serialization** option for publishing chapters over time as a Stripe-paid subscription
- **Auth + organizations** (Better Auth), email (Resend), file storage (Vercel Blob), error monitoring (Sentry)
- **Full brand config** — logo, colors, app name, domain — in a single tokens file

## Why this vs rolling your own

Authoring tools are a deep specialty — rich-text editor quirks, export fidelity across formats, the AI generation loop that doesn't break the writer's flow. This is the full stack, shipped.

## Known limits

- Cover designer uses third-party image gen (bring your own API key — OpenAI / Replicate / Black Forest Labs)
- EPUB export is single-spine; multi-volume series editors plan for v0.2`,
  },
  {
    oldSlug: "tech-lead-toolkit-app",
    longDescription: `A full SaaS for engineering managers and tech leads — the operating system that runs your team's rituals, docs, and metrics in one place.

## What's in the box

- **Team directory** with roles, skills, levels, location, timezone, and availability
- **Capacity planning** — sprint-level capacity by person, factoring PTO, on-call, meeting load
- **Mentor matching** — pair senior + junior engineers based on skill gaps + availability, with periodic rotation
- **1:1 notes** with templates (weekly, quarterly, career), action-item tracking, and a shared-vs-private visibility toggle
- **Decision log (ADRs)** with tagged status (proposed / accepted / superseded), diff view between versions, and comments
- **Project delivery dashboards** with burndown, velocity, and risk indicators pulled from linked issue trackers
- **Tech-debt tracking** — scored by impact + effort, with a "pay-it-down" kanban and burn-rate charts
- **Ships with Better Auth (incl. 2FA), Stripe checkout + customer portal, Vercel Analytics + Speed Insights + Sentry, Pusher real-time, Vercel Blob**
- **Full brand config** — rename, recolor, rebrand, deploy, charge

## Why this vs rolling your own

Engineering leadership tooling is the space Jira wishes it could own but can't — it needs to feel built-by-leaders-for-leaders. This is that product, shippable as your own.

## Known limits

- Single-organization per install (multi-tenant enterprise edition is a composition with the multi-tenant-b2b boilerplate)
- Issue tracker integrations (GitHub Issues, Linear, Jira) cover the majority — niche trackers are a small extension`,
  },
  {
    oldSlug: "agency-dashboard-app",
    longDescription: `A complete agency back-office SaaS — the app most service teams cobble together from 4 different tools (Notion + Toggl + HelloBonsai + Dropbox). This rolls them into one branded experience you can resell or use internally.

## What's in the box

- **Clients** with contact records, contract history, engagement notes, and a branded portal per client
- **Projects + phases** with Gantt-style timelines, budgets, and status (prospect → active → on hold → complete)
- **Time tracking** with timer + manual entry + Calendar import, with per-project and per-person reports
- **Stripe-issued invoices** with hosted payment links, auto-chasing via Resend, and deposit/retainer handling
- **Internal notes** (team-only) vs **client portal messages** (visible) with clear separation and audit trail
- **Branded client portal** — clients log in via magic link, see deliverables, approve milestones, pay invoices
- **Resend** for invoice + reminder emails, **Sentry** for error tracking, **Vercel Analytics** for team dashboards
- **Brand-tokenized** — rename, recolor, and deploy as your agency's internal tool or a branded product

## Why this vs rolling your own

Agencies waste enormous time on back-office plumbing. This is that plumbing, already built, ready to brand.

## Known limits

- Per-invoice tax calc uses Stripe Tax (bring your own Stripe account)
- Not a full time-and-materials billing platform (no cost-of-labor rollups) — add as needed`,
  },
  {
    oldSlug: "saas-metrics-hub-app",
    longDescription: `Plug your Stripe (and optionally Postgres / Segment) into this app and get an honest, founder-friendly metrics dashboard in minutes.

## What's in the box

- **MRR + ARR** with growth deltas, new / expansion / contraction / churn breakdown, and a 13-month rolling chart
- **Cohort retention** — by month, by plan, by acquisition source; visualizes as heatmap + curve
- **NDR + GDR** (net / gross dollar retention) with industry benchmarks overlay
- **Churn prediction** — simple heuristic-based scoring out of the box; pluggable to a real model when ready
- **Forecast scenarios** — conservative / base / aggressive, with configurable assumptions (growth rate, churn, CAC)
- **Alerts** on anomalies (MRR drop >5%, churn spike, sudden cancellation cluster) via email + Slack
- **Cohort deep-dive pages** so you can click from the big-number dashboard into the individual customers driving it
- **Stripe webhook** ingestion with real-time updates; Segment pass-through optional
- **Better Auth + Stripe + Vercel Analytics + Sentry**; white-label brand tokens

## Why this vs rolling your own

ChartMogul is $200/mo. Baremetrics is $200/mo. This is the same dataset, your infra, one-time purchase — and customizable to your definitions of "churn" and "expansion" instead of fighting the SaaS tool's opinions.

## Known limits

- Stripe-centric; Paddle and Chargebee adapters are a v0.2 add-on
- Revenue recognition is cash-basis by default; accrual-basis is a pluggable calc`,
  },
  {
    oldSlug: "community-platform-app",
    longDescription: `A complete Substack-meets-Circle community app you run on your own infra and brand. Memberships, discussions, events, real-time chat, and email digests — one product.

## What's in the box

- **Member directory** with profiles, interests, expertise tags, and opt-in visibility
- **Threaded discussions** organized by topic/channel with voting, pinning, and moderation
- **Resource library** — curated links, files, and docs, with per-resource reactions and comments
- **Events** — RSVPs, calendar sync, reminders, and post-event recap threads
- **Real-time chat** (Pusher) for immediate conversation alongside the async discussions
- **Email digests** — daily or weekly summaries via Resend, configurable per member
- **Stripe memberships** — one-off access, recurring ($X/mo), and tiered paid communities within the same app
- **Better Auth** with email + social + magic link for frictionless signup
- **Brand-tokenized** for recoloring, renaming, and custom domain

## Why this vs rolling your own

Discord feels like gaming. Slack feels corporate. Circle takes 20%. This is the self-hosted middle that most niche paid communities actually want — visual, calm, member-focused, brandable.

## Known limits

- No voice chat (text-first by design)
- Federation (ActivityPub) not baseline; single-instance model`,
  },
  {
    oldSlug: "knowledge-base-app",
    longDescription: `An internal docs / wiki SaaS with search, fine-grained access, AI summaries, and usage analytics. For teams tired of paying $10/user/mo for Notion and wishing it felt a bit more serious.

## What's in the box

- **Collaborative block editor** with real-time cursors, rich blocks (code, callouts, embeds, tables), and version history
- **Full-text search** across all docs with highlighting, filters (author, date, tag), and keyboard-first navigation
- **Fine-grained RBAC** — per-doc, per-space, per-role permissions; "anyone with link" vs "invited-only" toggle
- **AI-powered Q&A** — ask "how do we onboard new customers?" and get a synthesized answer with citations back to the source docs
- **AI summarization** — auto-generate TL;DRs and executive summaries on long documents
- **Per-doc analytics** — reads, unique readers, search queries that landed here, orphan-doc detection
- **Activity feed + notifications** — subscribe to docs, get updates on changes, @mentions resolve to notifications + email
- **Vercel Blob** for attachments, **AI SDK v6** for the AI features, **Resend** for share notifications, **Sentry** for errors
- **Brandable config** — rename, recolor, custom domain, logo

## Why this vs rolling your own

Internal wikis decay the moment they stop feeling maintained. This has the features (AI Q&A, analytics, RBAC) that make a wiki feel serious instead of a Google Doc graveyard.

## Known limits

- No offline editing baseline (online-first)
- Vector store is Postgres pgvector; bring your own pgvector-capable DB (Neon works)`,
  },
  {
    oldSlug: "coaching-platform-app",
    longDescription: `A turnkey coaching SaaS for fitness, nutrition, life, business, or any skill-for-hire practice. Coaches onboard clients, ship programs, check in, message, and get paid — all from one app.

## What's in the box

- **Coach + client dual accounts** with Better Auth; magic-link onboarding for clients so they never "create a password"
- **Program builder** — workouts, meal plans, habit trackers, skill curricula, or any structured plan with checkboxes + notes
- **Scheduled check-ins** — daily / weekly / custom cadence with auto-reminders via Resend
- **In-app messaging** (text + voice memos + photos) scoped per coaching pair, with read receipts
- **Progress tracking** — weigh-ins, measurements, mood logs, or any metric the coach defines, with charts
- **Stripe billing** — one-off programs, recurring monthly coaching, cohort-priced group programs
- **Group programs** (optional) — multi-client programs with shared content + group messaging
- **Vercel Analytics + Sentry** wired; **brand tokens** for coach / practice branding

## Why this vs rolling your own

Most coaching businesses cobble together Calendly + Google Docs + Venmo + WhatsApp. This is one branded app that handles the whole relationship — professional, charge-able, scalable.

## Known limits

- Video sessions not baseline (integrates with Zoom / Google Meet via link, or add Daily.co as an extension)
- Programs are templated — live 1:1 customization is easy but not automated`,
  },
];

async function main() {
  for (const u of UPDATES) {
    const p = await db.product.findFirst({ where: { slug: u.oldSlug } });
    if (!p) { console.log(`  ⨯ ${u.oldSlug} not found`); continue; }

    // If renaming, also rename the GitHub repo.
    if (u.newSlug && u.newSlug !== u.oldSlug) {
      try {
        execSync(`gh api -X PATCH /repos/${ORG}/${u.oldSlug} -f name=${u.newSlug}`, { stdio: "pipe" });
        console.log(`  ↻ gh repo renamed ${u.oldSlug} → ${u.newSlug}`);
      } catch (err) {
        console.log(`  ⚠ gh rename failed for ${u.oldSlug}: ${(err as Error).message.split("\n")[0]}`);
      }
    }

    const newSlug = u.newSlug ?? u.oldSlug;
    const newRepoUrl = `https://github.com/${ORG}/${newSlug}`;

    await db.product.update({
      where: { id: p.id },
      data: {
        slug: newSlug,
        ...(u.name ? { name: u.name } : {}),
        ...(u.tagline ? { tagline: u.tagline } : {}),
        ...(u.description ? { description: u.description } : {}),
        longDescription: u.longDescription,
        ...(u.newSlug ? { repoUrl: newRepoUrl } : {}),
      },
    });

    if (u.newSlug) {
      await db.deliverable.updateMany({
        where: { productId: p.id, type: "REPO" },
        data: { url: newRepoUrl, title: `${u.name ?? p.name} repo` },
      });
    }

    console.log(`  ✓ ${u.oldSlug}${u.newSlug ? ` → ${u.newSlug}` : ""}`);
  }
  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
