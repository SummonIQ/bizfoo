// Seeds the SummonIQ catalog into bizfoo. Idempotent — safe to re-run.
//
// Usage:
//   bun run scripts/seed-summoniq.ts
//
// Requires: DATABASE_URL, BETTER_AUTH_SECRET, and (optionally) STRIPE_SECRET_KEY
// to also sync products to Stripe via SEED_SYNC_STRIPE=true.

import "dotenv/config";
import { db } from "../lib/db/client";
import { syncProductToStripe } from "../lib/storefront";

type SeedPrice = {
  amount: number;
  interval?: "ONE_TIME" | "MONTH" | "YEAR";
};

type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  category: string;
  badge?: string;
  stack: string[];
  metadata?: Record<string, unknown>;
  prices: SeedPrice[];
};

const STOREFRONT = {
  slug: "summoniq",
  name: "SummonIQ Store",
  description:
    "Templates, boilerplates, integrations, and design systems we built while shipping client work.",
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "nextjs-saas-starter",
    name: "Next.js SaaS Starter",
    tagline: "Production-ready Next.js 16 app with auth, billing, and teams.",
    description:
      "App Router, Server Actions, Prisma 7, Better Auth, Stripe billing, role-based access, and transactional email — all wired up. Ships with a polished marketing site and a clean internal dashboard, plus seed data and tests so you can ship the first version of your product the same week.",
    category: "templates",
    badge: "popular",
    stack: ["Next.js 16", "Prisma 7", "Stripe", "Better Auth", "Tailwind v4"],
    prices: [{ amount: 24900 }],
  },
  {
    slug: "landing-page-kit",
    name: "Landing Page Kit",
    tagline: "Animated, conversion-tuned marketing site template.",
    description:
      "Hero, features, pricing, case studies, FAQ, and CTA sections — all typed, responsive, and ready to rebrand. Comes with copywriting templates and 3 color presets.",
    category: "templates",
    stack: ["Next.js", "Tailwind", "Framer Motion"],
    prices: [{ amount: 9900 }],
  },
  {
    slug: "admin-dashboard",
    name: "Admin Dashboard Template",
    tagline: "Polished internal-tool shell with tables, forms, and charts.",
    description:
      "Sidebar navigation, command palette, data tables with filtering, bulk actions, and a charts starter pack.",
    category: "templates",
    badge: "updated",
    stack: ["Next.js", "shadcn/ui", "Tanstack Table"],
    prices: [{ amount: 14900 }],
  },
  {
    slug: "marketing-site-pro",
    name: "Marketing Site Pro",
    tagline:
      "Multi-page marketing site with blog, changelog, and customer stories.",
    description:
      "Includes blog, changelog, customer stories, careers page, legal pages, and a contact flow with HubSpot/Pipedrive ready hooks.",
    category: "templates",
    badge: "new",
    stack: ["Next.js", "MDX", "Tailwind"],
    prices: [{ amount: 17900 }],
  },
  {
    slug: "auth-billing-boilerplate",
    name: "Auth + Billing Boilerplate",
    tagline: "Drop-in auth + subscription billing for any Next.js app.",
    description:
      "Email/social auth, organizations, invites, Stripe subscriptions with proration, customer portal, and seat-based billing. Webhook handler with retries.",
    category: "boilerplates",
    stack: ["Better Auth", "Stripe", "Prisma"],
    prices: [{ amount: 19900 }],
  },
  {
    slug: "ai-chat-boilerplate",
    name: "AI Chat Boilerplate",
    tagline: "Multi-model chat UI with tools, streaming, and memory.",
    description:
      "Built on AI SDK v6 through Vercel AI Gateway. Tool calling, structured output, per-user threads, message history, and MCP-ready.",
    category: "boilerplates",
    badge: "new",
    stack: ["AI SDK v6", "AI Gateway", "Next.js"],
    prices: [{ amount: 17900 }],
  },
  {
    slug: "multi-tenant-b2b",
    name: "Multi-tenant B2B Boilerplate",
    tagline: "Orgs, roles, invites, and per-tenant scoping done right.",
    description:
      "Workspace switcher, RBAC, invitation flows, audit log, data isolation patterns, and middleware-enforced tenant scoping.",
    category: "boilerplates",
    stack: ["Next.js", "Prisma", "Better Auth"],
    prices: [{ amount: 29900 }],
  },
  {
    slug: "realtime-collab-boilerplate",
    name: "Realtime Collab Boilerplate",
    tagline: "Multiplayer cursors, presence, and live document state.",
    description:
      "WebSocket-based realtime with presence, ephemeral state, and a synced data store. Wired to SummonFlow or any compatible provider.",
    category: "boilerplates",
    badge: "new",
    stack: ["SummonFlow", "Next.js", "TypeScript"],
    prices: [{ amount: 22900 }],
  },
  {
    slug: "stripe-billing-module",
    name: "Stripe Billing Module",
    tagline: "Subscriptions, metered usage, and webhooks — drop it in.",
    description:
      "Checkout, customer portal, usage-based metering, proration helpers, and a reliable webhook handler with retries.",
    category: "integrations",
    stack: ["Stripe", "Next.js", "TypeScript"],
    prices: [{ amount: 8900 }],
  },
  {
    slug: "better-auth-setup",
    name: "Better Auth Setup",
    tagline: "Opinionated Better Auth configuration with orgs + passkeys.",
    description:
      "Email, social, passkey, 2FA, organizations, impersonation, and server-side session helpers for App Router.",
    category: "integrations",
    stack: ["Better Auth", "Next.js", "Prisma"],
    prices: [{ amount: 5900 }],
  },
  {
    slug: "analytics-wireup",
    name: "Analytics Wire-up",
    tagline: "PostHog + GA4 + UTM persistence with a clean event taxonomy.",
    description:
      "Typed event helpers, funnel definitions per tier, UTM capture through to CRM, and a minimal privacy banner.",
    category: "integrations",
    stack: ["PostHog", "GA4", "Next.js"],
    prices: [{ amount: 7900 }],
  },
  {
    slug: "signalsplash-kit",
    name: "SignalSplash Starter Kit",
    tagline: "Self-host the SummonIQ analytics stack on your own infra.",
    description:
      "API ingest service, dashboard, and SDK pre-configured. Includes per-app keys, retention controls, and a privacy-first defaults file.",
    category: "integrations",
    badge: "new",
    stack: ["SignalSplash", "Next.js", "Prisma"],
    prices: [{ amount: 12900 }],
  },
  {
    slug: "summoniq-leads-dfw-commercial-roofing-pilot",
    name: "SummonIQ Leads — DFW Commercial Roofing Pilot",
    tagline: "Premium pilot for a DFW commercial roofing sales team.",
    description:
      "One vertical, one metro, sample lead report, scoring model, and CRM-ready export for a commercial roofing sales team.",
    longDescription:
      "Deliverables include a DFW commercial roofing prospecting model, 25-100 sample prospects depending on source data availability, roof-fit scoring rules, CRM-ready export, sample outreach context, and a review call. This is a premium pilot, not a commodity lead list.",
    category: "summoniq-leads",
    badge: "new",
    stack: ["SummonIQ Leads", "Commercial Roofing", "DFW", "CRM", "SignalSplash"],
    metadata: {
      type: "Premium Pilot",
      tags: ["summoniq-leads", "sales-intelligence", "crm", "local-leads", "commercial-roofing", "dfw"],
      deliverables: [
        "DFW commercial roofing prospecting model",
        "25-100 sample prospects depending on source data availability",
        "roof-fit scoring rules",
        "CRM-ready export",
        "sample outreach context",
        "review call",
      ],
    },
    prices: [{ amount: 250000 }],
  },
  {
    slug: "summoniq-leads-local-lead-engine-starter-kit",
    name: "SummonIQ Leads — Local Lead Engine Starter Kit",
    tagline: "Developer starter kit for vertical-specific local lead engines.",
    description:
      "A developer starter kit for building vertical-specific local lead engines with scoring, sample data, and CRM preview.",
    longDescription:
      "Includes a Next.js dashboard, Prisma schema, scoring engine, CSV importer scaffold, mock CRM push, and example DFW roofing template.",
    category: "summoniq-leads",
    stack: ["Next.js", "Prisma 7", "Scoring", "CRM Preview", "CSV"],
    metadata: {
      type: "Code/Template Bundle",
      tags: ["summoniq-leads", "sales-intelligence", "crm", "local-leads", "commercial-roofing", "dfw"],
      deliverables: [
        "Next.js dashboard",
        "Prisma schema",
        "scoring engine",
        "CSV importer scaffold",
        "mock CRM push",
        "example DFW roofing template",
      ],
    },
    prices: [{ amount: 29900 }],
  },
  {
    slug: "summoniq-leads-hubspot-crm-add-on",
    name: "SummonIQ Leads — HubSpot CRM Add-On",
    tagline: "HubSpot field mapping and push workflow for a SummonIQ Leads pilot.",
    description:
      "Connect a SummonIQ Leads pilot to HubSpot with CRM field mapping, company/contact/deal payloads, and push workflow.",
    category: "summoniq-leads",
    stack: ["HubSpot", "CRM", "Field Mapping", "SummonIQ Leads"],
    metadata: {
      type: "Integration Add-On",
      tags: ["summoniq-leads", "sales-intelligence", "crm", "hubspot", "local-leads"],
    },
    prices: [{ amount: 150000 }],
  },
  {
    slug: "summoniq-leads-salesforce-crm-add-on",
    name: "SummonIQ Leads — Salesforce CRM Add-On",
    tagline: "Salesforce object mapping for CRM-ready opportunity creation.",
    description:
      "Connect a SummonIQ Leads pilot to Salesforce with object mapping, validation, and CRM-ready opportunity creation.",
    category: "summoniq-leads",
    stack: ["Salesforce", "CRM", "Object Mapping", "SummonIQ Leads"],
    metadata: {
      type: "Integration Add-On",
      tags: ["summoniq-leads", "sales-intelligence", "crm", "salesforce", "local-leads"],
    },
    prices: [{ amount: 250000 }],
  },
  {
    slug: "summoniq-leads-monthly-data-refresh",
    name: "SummonIQ Leads — Monthly Data Refresh",
    tagline: "Managed monthly source refresh, scoring QA, and CRM-ready delivery.",
    description:
      "Monthly refresh of source data, lead scoring, QA, and CRM-ready delivery.",
    category: "summoniq-leads",
    stack: ["Managed Service", "Data Refresh", "QA", "CRM"],
    metadata: {
      type: "Managed Service",
      tags: ["summoniq-leads", "sales-intelligence", "crm", "local-leads"],
    },
    prices: [{ amount: 100000, interval: "MONTH" }],
  },
  {
    slug: "buyer-signals-to-crm-setup",
    name: "Buyer Signals to CRM Setup",
    tagline: "Turn SignalSplash buyer-signal analytics into CRM follow-up.",
    description:
      "Connect SignalSplash buyer-signal analytics to a CRM workflow so high-intent activity can become sales follow-up.",
    category: "summoniq-leads",
    badge: "new",
    stack: ["SignalSplash", "CRM", "Buyer Signals", "SummonIQ Leads"],
    metadata: {
      type: "Analytics + CRM Package",
      tags: ["summoniq-leads", "sales-intelligence", "crm", "signalsplash", "local-leads"],
    },
    prices: [{ amount: 350000 }],
  },
  {
    slug: "resend-email-kit",
    name: "Resend + React Email Kit",
    tagline: "Branded transactional + product email pipeline.",
    description:
      "Welcome, verify, reset, invite, receipt, weekly summary. Themeable React Email templates plus a typed sender helper.",
    category: "integrations",
    stack: ["Resend", "React Email"],
    prices: [{ amount: 6900 }],
  },
  {
    slug: "summoniq-ui-kit",
    name: "SummonIQ UI Kit",
    tagline: "The buttons, tabs, and glow cards you see on this site.",
    description:
      "Tokens, primitives, and marketing blocks with dark-first theming, motion defaults, and shadcn interop.",
    category: "design-systems",
    badge: "popular",
    stack: ["Tailwind", "Radix", "Framer Motion"],
    prices: [{ amount: 12900 }],
  },
  {
    slug: "motion-primitives",
    name: "Motion Primitives Pack",
    tagline: "Ready-to-use transitions, stagger grids, and page motion.",
    description:
      "Entrance animations, shared layout transitions, scroll-linked effects, and reduced-motion defaults.",
    category: "design-systems",
    stack: ["Framer Motion", "Tailwind"],
    prices: [{ amount: 6900 }],
  },
  {
    slug: "email-template-set",
    name: "Transactional Email Set",
    tagline: "Branded React Email templates for the common flows.",
    description:
      "Welcome, verify, reset, invite, receipt, and usage alert templates — all themeable and provider-agnostic.",
    category: "design-systems",
    badge: "new",
    stack: ["React Email", "Resend"],
    prices: [{ amount: 0 }],
  },
  {
    slug: "dashboard-design-kit",
    name: "Dashboard Design Kit",
    tagline: "Figma + code components for SaaS dashboards.",
    description:
      "Sidebar, top nav, command palette, table, drawer, modal, empty states, and a documented spacing system.",
    category: "design-systems",
    stack: ["Figma", "Tailwind", "Radix"],
    prices: [{ amount: 14900 }],
  },
  {
    slug: "iconography-pack",
    name: "Iconography Pack",
    tagline: "200 hand-drawn product icons in two weights.",
    description:
      "SVG and React components, optimized for 16/20/24px. Includes a Figma library and a CLI for tree-shaking.",
    category: "design-systems",
    stack: ["SVG", "React", "Figma"],
    prices: [{ amount: 4900 }],
  },
  // ── AI agents
  { slug: "chat-agent-platform", name: "Multi-channel Chat Agent", tagline: "One agent codebase. Slack, Discord, web, Telegram, Teams.", description: "A unified chat agent runtime built on the Vercel Chat SDK. Threads, modals, cards, streaming, and per-channel adapters — write once, ship everywhere.", category: "ai-agents", badge: "new", stack: ["AI SDK v6", "Chat SDK", "Next.js"], prices: [{ amount: 24900 }] },
  { slug: "ai-sales-agent", name: "AI Sales Agent Kit", tagline: "Outbound + inbound sales agent with CRM hooks and call summaries.", description: "Voice-capable sales agent that books meetings, qualifies leads, and writes call summaries to your CRM. Pluggable LLM provider and a local eval harness.", category: "ai-agents", badge: "new", stack: ["AI SDK v6", "Twilio", "HubSpot"], prices: [{ amount: 34900 }] },
  { slug: "job-search-agent", name: "Job Search Agent", tagline: "Personal AI that hunts roles, drafts applications, preps interviews.", description: "Crawls job boards, ranks fit against your resume, drafts a tailored cover letter, and runs mock interview rounds. Inspired by gimme-job.", category: "ai-agents", stack: ["AI SDK", "Playwright", "Next.js"], prices: [{ amount: 19900 }] },
  { slug: "codebase-audit-agent", name: "Codebase Audit Agent", tagline: "Deterministic codebase scanner with explainable findings.", description: "Walks a repo, surfaces dead code, type holes, security smells, and architecture drift. Outputs reports as MDX and PR-ready diffs.", category: "ai-agents", stack: ["TypeScript", "AST", "MDX"], prices: [{ amount: 22900 }] },
  { slug: "lead-enrichment-agent", name: "Lead Enrichment Agent", tagline: "Inbound leads, fully enriched, scored, and routed.", description: "Webhook in → company enrichment, persona match, fit + intent score, then routed to the right rep or sequence. Works with HubSpot, Pipedrive, Customer.io.", category: "ai-agents", stack: ["AI Gateway", "Clearbit", "HubSpot"], prices: [{ amount: 17900 }] },
  // ── Desktop
  { slug: "tauri-desktop-starter", name: "Tauri Desktop Starter", tagline: "Fast Tauri 2 desktop app: React, TS, Vite, vitest, auto-updates.", description: "Production-grade Tauri starter with deep links, auto-update, signed installers (mac + win), tray menu, and a tested Rust↔JS bridge. Inspired by the-workshop.", category: "desktop", badge: "new", stack: ["Tauri 2", "React", "Vite", "Rust"], prices: [{ amount: 19900 }] },
  { slug: "electron-starter", name: "Electron + Vite Starter", tagline: "Modern Electron with Vite, TS, auto-update, and crash reports.", description: "ESM-first Electron starter with multi-window support, native menus, IPC types, OAuth helpers, and signed/notarized builds via GitHub Actions.", category: "desktop", stack: ["Electron", "Vite", "TypeScript"], prices: [{ amount: 14900 }] },
  { slug: "mac-menubar-app", name: "Mac Menubar App Template", tagline: "SwiftUI menubar app with login items and Sparkle updates.", description: "A polished menubar starter for Mac apps with global hotkeys, login items, settings panel, and Sparkle-based auto-update.", category: "desktop", stack: ["Swift", "SwiftUI", "Sparkle"], prices: [{ amount: 12900 }] },
  { slug: "domain-hunter-app", name: "Domain Hunter Desktop", tagline: "Live domain availability + drop-list scanner desktop app.", description: "Search across hundreds of TLDs, watch favorites, get notified on drops, and see WHOIS history. Inspired by domain-jane.", category: "desktop", stack: ["Electron", "Node", "WHOIS"], prices: [{ amount: 11900 }] },
  { slug: "electrobun-starter", name: "Electrobun Desktop Starter", tagline: "Tiny, fast desktop apps with Electrobun + Bun + TS.", description: "An Electrobun-based desktop starter for teams who want Electron-style ergonomics without Chromium bloat. Multi-window, native menus, IPC types, auto-update, and signed installers for macOS and Windows — all running on Bun's TypeScript runtime.", category: "desktop", badge: "new", stack: ["Electrobun", "Bun", "TypeScript"], prices: [{ amount: 16900 }] },
  // ── Niche templates
  { slug: "booking-template", name: "Booking Platform Template", tagline: "Cal.com-style booking flow you can rebrand and ship.", description: "Availability rules, multi-host events, group bookings, Stripe payments, calendar integrations, and a polished public booking page. Inspired by grabbatime.", category: "templates", badge: "new", stack: ["Next.js", "Prisma", "Stripe"], prices: [{ amount: 22900 }] },
  { slug: "personal-finance-pwa", name: "Personal Finance PWA", tagline: "Multi-currency budgeting, investments, goals, offline-first.", description: "PWA-ready personal finance template with category budgets, recurring rules, goals, investment tracking, and an offline-first IndexedDB sync. Inspired by budgetbloom.", category: "templates", stack: ["Next.js", "PWA", "IndexedDB"], prices: [{ amount: 16900 }] },
  { slug: "job-board-template", name: "Job Board Template", tagline: "Niche job board you can launch in a weekend.", description: "Posting flow with Stripe-paid listings, employer dashboard, candidate alerts, and a clean public board with filters and SEO.", category: "templates", stack: ["Next.js", "Stripe", "Resend"], prices: [{ amount: 17900 }] },
  { slug: "publishing-platform", name: "Publishing Platform", tagline: "Long-form authoring + Stripe-monetized reading. Substack-shaped.", description: "Editor-grade authoring with TipTap, paid subscriptions, paywalled posts, comment threads, and a clean reading experience. Inspired by margin.", category: "templates", badge: "new", stack: ["Next.js", "TipTap", "Stripe"], prices: [{ amount: 24900 }] },
  { slug: "mentorship-platform", name: "Mentorship Platform", tagline: "Match mentors and mentees, schedule sessions, take payments.", description: "Profiles, matching, async messaging, scheduled video calls (Daily.co), and Stripe payouts to mentors. Built for engineering or coaching markets.", category: "templates", stack: ["Next.js", "Daily.co", "Stripe Connect"], prices: [{ amount: 27900 }] },
  { slug: "workshop-course-platform", name: "Workshop & Course Platform", tagline: "Run cohort-based workshops or self-paced courses.", description: "Cohorts, lessons, video player, assignments, drip schedules, and a Stripe checkout for one-time + subscription tiers.", category: "templates", stack: ["Next.js", "Mux", "Stripe"], prices: [{ amount: 24900 }] },
  { slug: "elderly-care-coordinator", name: "Care Coordinator", tagline: "Care plan + caregiver scheduling for families and small agencies.", description: "Manage medications, appointments, vitals, and caregiver shifts. HIPAA-aware patterns, audit log, and family read-only access.", category: "templates", stack: ["Next.js", "Prisma", "Better Auth"], prices: [{ amount: 29900 }] },
  // ── Boilerplates
  { slug: "workflow-engine", name: "Workflow Engine", tagline: "Durable flows for backoffice automations.", description: "Author n8n-style flows in code or UI: triggers, steps, retries, idempotency, secrets, and webhook callbacks. Inspired by flow.", category: "boilerplates", stack: ["Next.js", "Vercel Workflow", "Postgres"], prices: [{ amount: 26900 }] },
  // ── Guides
  { slug: "tech-lead-guide", name: "Tech Lead Guide", tagline: "The first-90-days playbook for new tech leads and engineering managers.", description: "A practical guide with the rituals, templates, and operating cadence you need when you inherit a team: first-week setup, 1:1s, ADRs, RFCs, planning, project reviews, post-mortems, feedback, and quarterly planning. Ships as MDX plus copy-pasteable Notion docs.", category: "guides", badge: "new", stack: ["MDX", "Notion"], prices: [{ amount: 4900 }] },
  { slug: "overemployed-guide", name: "Overemployed Guide", tagline: "The operating manual for software engineers running two (or more) full-time remote jobs.", description: "A practical guide for engineers running J1 + J2 (and sometimes J3): the primary-job doctrine, two-laptop/two-audio setup, calendar geometry that absorbs conflicts, output posture for four real focus hours, role-stacking decisions, manager-of-two cadence, PIP defense, operational security, legal/contract reading, sustainability math, and clean exits. Written for software engineers but applicable to most remote knowledge work.", category: "guides", badge: "new", stack: ["MDX", "Notion"], prices: [{ amount: 5900 }] },
  { slug: "indie-launch-playbook", name: "Indie Launch Playbook", tagline: "Ship a paid product in 14 days. Day-by-day plan + templates.", description: "A practical playbook with daily goals, copy templates, ad creative ideas, launch lists, and email sequences for indie makers shipping their first paid product.", category: "guides", stack: ["MDX", "Notion"], prices: [{ amount: 3900 }] },
  { slug: "pricing-playbook", name: "Pricing Playbook", tagline: "How to price templates, SaaS, and consultancy work.", description: "Frameworks, anchor strategies, copy templates for pricing pages, and FAQ patterns that make buyers commit. With 12 worked examples.", category: "guides", stack: ["MDX"], prices: [{ amount: 2900 }] },
  { slug: "seo-playbook", name: "SEO Playbook for SaaS", tagline: "Programmatic SEO + content engine + sitemap automation.", description: "How to ship hundreds of indexable pages from a small Postgres table, plus the content patterns that actually rank. Includes a Next.js example repo.", category: "guides", stack: ["MDX", "Next.js"], prices: [{ amount: 4900 }] },
  // ── More integrations
  { slug: "summonflow-realtime", name: "SummonFlow Realtime Kit", tagline: "Channels, presence, encrypted events — drop-in.", description: "Pre-configured SummonFlow client + server bindings, with React hooks, encrypted channels, and a small example chat app to crib from.", category: "integrations", stack: ["SummonFlow", "Next.js", "TypeScript"], prices: [{ amount: 9900 }] },
  { slug: "hubspot-pipeline-sync", name: "HubSpot Pipeline Sync", tagline: "Two-way sync between your app and HubSpot deals.", description: "Mirror users → contacts, plans → deals, churn → lifecycle. Idempotent webhook handler, batch backfill, conflict resolution.", category: "integrations", stack: ["HubSpot", "Next.js"], prices: [{ amount: 9900 }] },
  { slug: "loops-email-automation", name: "Loops Email Automation", tagline: "Lifecycle email flows that don't make you cry.", description: "Welcome, onboarding, trial → paid, dunning, win-back. Pre-built triggers, a typed Loops client, and a copy bank to start from.", category: "integrations", stack: ["Loops", "Next.js"], prices: [{ amount: 7900 }] },
  { slug: "typeform-intake-flow", name: "Typeform Intake → CRM", tagline: "Multi-step intake forms that route to the right place.", description: "Branching forms, conditional logic, file uploads, and routed creation in HubSpot/Pipedrive/Linear/Slack — all via a single webhook.", category: "integrations", stack: ["Typeform", "HubSpot", "Slack"], prices: [{ amount: 6900 }] },
  { slug: "salesforce-pipeline-sync", name: "Salesforce Pipeline Sync", tagline: "Two-way sync between your app and Salesforce accounts, contacts, and opportunities.", description: "Mirror users and accounts, plans and opportunities, and product activity into Salesforce. Idempotent inbound webhook handler, batch backfill that respects API limits, per-field conflict rules, and a debuggable change log so sales and product can self-serve answers.", category: "integrations", badge: "new", stack: ["Salesforce", "Next.js", "Postgres"], prices: [{ amount: 12900 }] },
  { slug: "pipedrive-pipeline-sync", name: "Pipedrive Pipeline Sync", tagline: "Two-way sync between your app and Pipedrive deals.", description: "Mirror users to people, plans to deals, and product activity to notes and timeline events. Idempotent webhook handler, batch backfill, conflict resolution, and a small ops surface to spot drift before it becomes a sales argument.", category: "integrations", stack: ["Pipedrive", "Next.js", "Postgres"], prices: [{ amount: 9900 }] },
  { slug: "intercom-sync", name: "Intercom Sync Kit", tagline: "Customer + company sync, in-app messages, and a typed Intercom client.", description: "Push users, companies, plans, and product events to Intercom; receive conversation events back. Includes a typed client, a webhook handler with deduplication, suppression rules, and patterns for in-app message and tour triggers from your own app state.", category: "integrations", stack: ["Intercom", "Next.js", "Postgres"], prices: [{ amount: 8900 }] },
  { slug: "zendesk-sync", name: "Zendesk Sync Kit", tagline: "Tickets, users, and SLA-aware automations between your app and Zendesk.", description: "Two-way sync of users, organizations, and tickets. Create tickets from product errors, enrich tickets with usage and plan context, and route based on tier. Includes webhook handler, backfill runner, and SLA-aware automation hooks.", category: "integrations", stack: ["Zendesk", "Next.js", "Postgres"], prices: [{ amount: 8900 }] },
  { slug: "notion-database-sync", name: "Notion Database Sync", tagline: "Treat a Notion database as a typed read/write surface from your app.", description: "Two-way sync between Notion databases and your Postgres tables, with typed properties, schema validation, conflict resolution, and a webhook listener for Notion changes. Useful for ops dashboards, content pipelines, and lightweight admin surfaces backed by Notion.", category: "integrations", stack: ["Notion API", "Next.js", "Postgres"], prices: [{ amount: 7900 }] },
  { slug: "airtable-sync", name: "Airtable Sync Kit", tagline: "Typed read/write sync between Airtable bases and your app.", description: "Mirror Airtable bases into your Postgres schema and write back without writing the same rate-limit and pagination glue twice. Includes a typed client, schema-aware diffs, batch backfill, change webhooks, and a small operations dashboard.", category: "integrations", stack: ["Airtable", "Next.js", "Postgres"], prices: [{ amount: 7900 }] },
  { slug: "slack-app-starter", name: "Slack App Starter", tagline: "Slash commands, modals, Block Kit, and OAuth — wired correctly.", description: "A production-grade Slack app starter with OAuth install flow, signature verification, slash commands, Block Kit cards, modals, action handlers, and per-workspace state. Built on the Vercel Chat SDK so the same handler can later route to Discord, Teams, or web.", category: "integrations", badge: "new", stack: ["Slack API", "Chat SDK", "Next.js"], prices: [{ amount: 9900 }] },
  { slug: "discord-app-starter", name: "Discord App Starter", tagline: "Slash commands, embeds, components, and OAuth — wired correctly.", description: "A production-grade Discord app starter with OAuth install, signature verification, slash commands, components, embeds, modals, and per-guild state. Built on the Vercel Chat SDK so the same handler can run on Slack, Teams, or web with the right adapter.", category: "integrations", badge: "new", stack: ["Discord API", "Chat SDK", "Next.js"], prices: [{ amount: 9900 }] },
  { slug: "microsoft-teams-app-starter", name: "Microsoft Teams App Starter", tagline: "Adaptive Cards, tabs, bots, and SSO — wired correctly.", description: "A production-grade Microsoft Teams app starter with manifest setup, SSO, Adaptive Cards, conversation bots, tabs, message extensions, and per-tenant state. Built on the Vercel Chat SDK so the same handler can run on Slack, Discord, or web with the right adapter.", category: "integrations", badge: "new", stack: ["Teams API", "Chat SDK", "Next.js"], prices: [{ amount: 11900 }] },
  { slug: "linear-issue-sync", name: "Linear Issue Sync", tagline: "Two-way sync between your app and Linear issues, projects, and cycles.", description: "Mirror product errors, customer feedback, and feature requests into Linear; receive issue updates back to your dashboard. Idempotent webhook handler, batch backfill, conflict resolution, and a typed Linear client so issue creation is one autocompleted call.", category: "integrations", stack: ["Linear API", "Next.js", "Postgres"], prices: [{ amount: 8900 }] },
  { slug: "mailchimp-sync", name: "Mailchimp Sync Kit", tagline: "Audience, tag, and event sync between your app and Mailchimp.", description: "Push users, plans, and product events to Mailchimp audiences and tags; receive bounce, unsubscribe, and engagement events back. Includes a typed client, suppression handling, double-opt-in patterns, and a small ops surface.", category: "integrations", stack: ["Mailchimp API", "Next.js", "Postgres"], prices: [{ amount: 7900 }] },
  { slug: "google-workspace-sync", name: "Google Workspace Sync", tagline: "Gmail, Drive, and Calendar integrations done right — OAuth, scopes, refresh.", description: "A complete Google Workspace integration kit: OAuth install with incremental scope upgrades, Gmail send and watch, Drive read/write with shared-drive support, Calendar read/write with availability querying, and refresh-token handling that does not silently expire users.", category: "integrations", badge: "new", stack: ["Google APIs", "Next.js", "Postgres"], prices: [{ amount: 12900 }] },
  // ── More design systems
  { slug: "form-design-kit", name: "Form Design Kit", tagline: "Production-ready form components with Zod validation and async submit states.", description: "A comprehensive form kit covering single inputs, multi-step forms, file upload, async validation, server-action submission, optimistic state, and accessible error handling. Built so the next form you build is composition, not from scratch.", category: "design-systems", stack: ["Tailwind", "Zod", "React Hook Form"], prices: [{ amount: 8900 }] },
  { slug: "chart-visualization-kit", name: "Chart Visualization Kit", tagline: "Production-ready chart components for dashboards and analytics surfaces.", description: "Line, bar, area, scatter, sparkline, KPI tile, funnel, and cohort heatmap components calibrated for dense dashboards. Token-driven theming, accessible defaults, and responsive sizing so charts read well at every breakpoint.", category: "design-systems", stack: ["Recharts", "Tailwind", "TypeScript"], prices: [{ amount: 9900 }] },
  { slug: "onboarding-tour-kit", name: "Onboarding Tour Kit", tagline: "Anchored tooltips, multi-step product tours, and progress checklists.", description: "Build product tours, anchored tooltips, and onboarding checklists without forcing a heavyweight tour library. Includes step orchestration, persistence per user, conditional gating, and accessibility-first focus management.", category: "design-systems", stack: ["Tailwind", "Framer Motion", "TypeScript"], prices: [{ amount: 7900 }] },
  { slug: "empty-state-kit", name: "Empty + Error State Kit", tagline: "A complete library of empty, error, loading, and zero-data states.", description: "Stop reinventing empty states for every list, table, and dashboard. A library of empty, error, loading, and permission-denied state components with illustration slots, primary/secondary actions, and brand-token theming.", category: "design-systems", stack: ["Tailwind", "Framer Motion", "TypeScript"], prices: [{ amount: 4900 }] },

  // ── More full apps
  { slug: "crm-pipeline-app", name: "CRM Pipeline App", tagline: "Pipeline, contacts, deals, activities, and email tracking — turnkey CRM you rebrand and sell.", description: "A complete CRM product for small sales teams that need a working pipeline without paying per-seat to one of the big platforms. Pipelines, deals, contacts, accounts, activities, email tracking, task management, and a clean reporting view. Better Auth, Stripe billing, Resend, and Sentry wired in.", category: "apps", badge: "new", stack: ["Next.js 16", "Better Auth", "Stripe", "Resend", "Sentry"], prices: [{ amount: 129900 }] },
  { slug: "helpdesk-saas-app", name: "Helpdesk SaaS App", tagline: "Tickets, SLA, macros, knowledge base, and a public portal — Zendesk-shaped, white-label.", description: "A complete helpdesk product: tickets with SLA, macros and templates, internal notes, agent collision detection, customer portal, and a knowledge-base surface. Better Auth (with customer + agent role split), Stripe billing, Resend, Pusher real-time, and Sentry.", category: "apps", badge: "new", stack: ["Next.js 16", "Better Auth", "Stripe", "Pusher", "Resend", "Sentry"], prices: [{ amount: 139900 }] },
  { slug: "changelog-saas-app", name: "Changelog SaaS App", tagline: "Multi-product changelog publishing with subscriptions, RSS, and in-app feed.", description: "A complete changelog product for SaaS teams that want to publish updates without rolling their own. Multi-product channels, MDX entries, subscriptions (email + RSS), in-app feed widget, reaction tracking, and a public-facing site. Better Auth, Stripe, Resend, Sentry.", category: "apps", stack: ["Next.js 16", "Better Auth", "Stripe", "Resend", "Sentry"], prices: [{ amount: 99900 }] },
  { slug: "waitlist-saas-app", name: "Waitlist SaaS App", tagline: "Waitlist, referral position bumps, and email confirmation — turnkey.", description: "A complete waitlist platform for indie founders and large launches alike. Position-based ranking, referral bumps that move people up the list, email confirmation, custom-branded waitlist pages, and a small admin dashboard. Better Auth, Stripe (optional paid skip-the-line), Resend.", category: "apps", stack: ["Next.js 16", "Better Auth", "Stripe", "Resend"], prices: [{ amount: 79900 }] },
  { slug: "survey-saas-app", name: "Survey SaaS App", tagline: "NPS, CSAT, and custom surveys with branching, analytics, and webhooks.", description: "A complete survey product covering NPS, CSAT, custom multi-step surveys with conditional branching, response analytics, segmentation, webhooks, and a clean public response surface. Better Auth, Stripe, Resend.", category: "apps", stack: ["Next.js 16", "Better Auth", "Stripe", "Resend"], prices: [{ amount: 89900 }] },
  // ── More design systems
  { slug: "landing-blocks-pack", name: "Landing Blocks Pack", tagline: "60 production-ready hero, feature, pricing, and CTA blocks.", description: "Drop into any Next.js / Astro project. Brand-tokenized, fully responsive, motion-friendly, all in dark + light variants.", category: "design-systems", badge: "new", stack: ["Tailwind", "Framer Motion"], prices: [{ amount: 9900 }] },
  { slug: "data-table-kit", name: "Data Table Kit", tagline: "Sorting, filtering, virtualized rows, bulk actions, exports.", description: "TanStack Table v8 with virtualization, column resizing, persisted state, server-driven pagination, and CSV/Excel export.", category: "design-systems", stack: ["TanStack Table", "Tailwind"], prices: [{ amount: 8900 }] },

  // ── Full apps (turnkey, rebrand-and-ship)
  { slug: "margin-author-suite", name: "Margin — Author Suite", tagline: "Full book authoring + cover design + multi-format publishing app, ready to rebrand.", description: "An AI-assisted writing and publishing platform for authors: rich Plate.js editor, drag-drop chapter management, AI-powered cover designer, semantic note retrieval, real-time collaboration, and DOCX/PDF/print exports. Ships as a Vercel-deployable Next.js app with auth, Stripe subscriptions, Resend email, Vercel Blob storage, web + product analytics, and Sentry — every brand string lives in one config file.", category: "apps", badge: "popular", stack: ["Next.js 16", "Plate.js", "Better Auth", "Stripe", "Resend", "Vercel Blob", "Sentry"], prices: [{ amount: 149900 }] },
  { slug: "tech-lead-toolkit-app", name: "Tech Lead Toolkit — Engineering OS", tagline: "The engineering leader's operating system: capacity, mentorship, 1:1s, metrics — all in one dashboard.", description: "A full SaaS for engineering managers and tech leads. Team directory, capacity planning, mentor matching, 1:1 notes with templates, decision logs, project delivery dashboards, and tech-debt tracking. Ships with Better Auth (incl. 2FA), Stripe checkout + customer portal, Vercel Analytics + Speed Insights + Sentry, Pusher real-time, and Vercel Blob. Rebrand the config, deploy to Vercel, charge customers.", category: "apps", badge: "new", stack: ["Next.js 16", "Better Auth", "Stripe", "Vercel Analytics", "Sentry", "Pusher"], prices: [{ amount: 119900 }] },
  { slug: "agency-dashboard-app", name: "Agency Dashboard", tagline: "Client + project management for service teams. Time tracking, invoicing, client portal — turnkey.", description: "A complete agency back-office app: clients, projects, timelines, time tracking, Stripe-issued invoices with hosted payment links, internal notes, and a branded client portal for sharing deliverables. Includes Better Auth for staff + magic-link client logins, Resend for invoice + reminder emails, Sentry for error tracking, and Vercel Analytics. Brand-tokenized.", category: "apps", stack: ["Next.js 16", "Better Auth", "Stripe", "Resend", "Sentry", "Vercel Analytics"], prices: [{ amount: 129900 }] },
  { slug: "saas-metrics-hub-app", name: "SaaS Metrics Hub", tagline: "MRR/ARR, cohorts, churn, and revenue forecasting for B2B SaaS founders.", description: "Plug your Stripe (and optionally Postgres / Segment) and get an honest, founder-friendly metrics dashboard: MRR/ARR with growth deltas, cohort retention, net + gross dollar retention, churn prediction, and forecast scenarios. Ships with Better Auth, Stripe metering ready, Vercel Analytics, Sentry, and a clean white-label config.", category: "apps", badge: "new", stack: ["Next.js 16", "Stripe", "Better Auth", "Vercel Analytics", "Sentry"], prices: [{ amount: 139900 }] },
  { slug: "community-platform-app", name: "Community Platform", tagline: "Private membership + community + events app. Substack-meets-Circle, fully white-label.", description: "Run a paid community on your own brand and infra. Member directory, threaded discussions, resource library, event scheduling with RSVPs, real-time chat, and email digest newsletters. Stripe memberships (one-off + recurring), Better Auth, Pusher real-time, Resend email, Sentry. Configurable theming via tokens.", category: "apps", stack: ["Next.js 16", "Better Auth", "Stripe", "Pusher", "Resend", "Sentry"], prices: [{ amount: 119900 }] },
  { slug: "knowledge-base-app", name: "Knowledge Management System", tagline: "Internal wiki + KB with search, RBAC, AI summaries, and usage analytics.", description: "An internal docs / wiki app for teams. Collaborative editor, full-text search, fine-grained RBAC, per-doc analytics, and AI-powered summaries + Q&A. Better Auth + RBAC, Vercel Blob for attachments, Resend for share notifications, Sentry, and a brandable config.", category: "apps", stack: ["Next.js 16", "Better Auth", "Vercel Blob", "AI SDK v6", "Resend", "Sentry"], prices: [{ amount: 109900 }] },
  { slug: "coaching-platform-app", name: "Coaching Platform", tagline: "Coach ↔ client app: programs, check-ins, payments, messaging — fully white-label.", description: "A turnkey coaching SaaS. Coaches enroll clients, ship plans (workouts / nutrition / habits / curriculum), schedule check-ins, message in-app, and bill via Stripe (one-off or recurring). Better Auth for both roles, Resend reminders, Vercel Analytics, Sentry, brand tokens.", category: "apps", stack: ["Next.js 16", "Better Auth", "Stripe", "Resend", "Vercel Analytics", "Sentry"], prices: [{ amount: 109900 }] },
];

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "workspace"
  );
}

async function ensureOwnerAndOrg(ownerEmail: string) {
  let owner = await db.user.findUnique({ where: { email: ownerEmail } });

  if (!owner) {
    if (process.env.SEED_CREATE_OWNER !== "true") {
      console.error(
        `No user with email ${ownerEmail}. Either sign up at /sign-up first, ` +
          `or re-run with SEED_CREATE_OWNER=true to bootstrap a placeholder owner.`,
      );
      process.exit(1);
    }
    const [first, ...rest] = (process.env.SEED_OWNER_NAME ?? "Workspace Owner").split(" ");
    owner = await db.user.create({
      data: {
        email: ownerEmail,
        emailVerified: true,
        firstName: first,
        lastName: rest.join(" ") || "Owner",
        name: process.env.SEED_OWNER_NAME ?? `${first} Owner`,
      },
    });
    console.log(`Bootstrapped placeholder owner: ${owner.email}`);
  }

  let member = await db.member.findFirst({
    where: { userId: owner.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  if (!member) {
    const orgName =
      process.env.SEED_ORG_NAME ?? `${owner.firstName} Workspace`;
    let slug = slugify(orgName);
    for (let i = 0; i < 5; i += 1) {
      const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
      const exists = await db.organization.findUnique({
        where: { slug: candidate },
      });
      if (!exists) {
        slug = candidate;
        break;
      }
    }
    const org = await db.organization.create({
      data: { name: orgName, slug },
    });
    await db.member.create({
      data: {
        userId: owner.id,
        organizationId: org.id,
        role: "owner",
      },
    });
    console.log(`Created organization: ${org.name} (/${org.slug})`);
    member = await db.member.findFirst({
      where: { userId: owner.id },
      include: { organization: true },
    });
  }

  return member!;
}

async function main() {
  const ownerEmail = process.env.SEED_OWNER_EMAIL;
  if (!ownerEmail) {
    console.error(
      "SEED_OWNER_EMAIL is required (the workspace owner that will own this storefront).",
    );
    process.exit(1);
  }

  const member = await ensureOwnerAndOrg(ownerEmail);

  console.log(`Seeding into org: ${member.organization.name}`);

  let storefront = await db.storefront.findUnique({
    where: { slug: STOREFRONT.slug },
  });
  if (!storefront) {
    storefront = await db.storefront.create({
      data: {
        organizationId: member.organizationId,
        slug: STOREFRONT.slug,
        name: STOREFRONT.name,
        description: STOREFRONT.description,
      },
    });
    console.log(`Created storefront /${STOREFRONT.slug}`);
  } else {
    console.log(`Found existing storefront /${STOREFRONT.slug}`);
  }

  for (const p of PRODUCTS) {
    const existing = await db.product.findUnique({
      where: {
        storefrontId_slug: { storefrontId: storefront.id, slug: p.slug },
      },
    });
    if (existing) {
      await db.product.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          longDescription: p.longDescription ?? undefined,
          category: p.category,
          badge: p.badge ?? null,
          stack: p.stack,
          metadata: p.metadata ?? undefined,
        },
      });
      console.log(`  ↺ updated ${p.slug}`);
    } else {
      await db.product.create({
        data: {
          storefrontId: storefront.id,
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          longDescription: p.longDescription,
          category: p.category,
          badge: p.badge ?? null,
          stack: p.stack,
          metadata: p.metadata,
          prices: {
            create: p.prices.map((price) => ({
              amount: price.amount,
              currency: "usd",
              interval: price.interval ?? "ONE_TIME",
            })),
          },
        },
      });
      console.log(`  + created ${p.slug}`);
    }
  }

  if (process.env.SEED_SYNC_STRIPE === "true") {
    console.log("Syncing products to Stripe...");
    const all = await db.product.findMany({
      where: { storefrontId: storefront.id },
    });
    for (const p of all) {
      try {
        await syncProductToStripe(p.id);
        console.log(`  ✔ stripe ${p.slug}`);
      } catch (err) {
        console.warn(
          `  ✘ stripe ${p.slug}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  const refreshed = await db.storefront.findUnique({
    where: { id: storefront.id },
  });
  console.log("\nDone.");
  console.log(`  Storefront ID: ${refreshed?.id}`);
  console.log(`  Public key:    ${refreshed?.publicKey}`);
  console.log(`  Secret key:    ${refreshed?.secretKey}`);
  console.log(
    `  Public catalog: /api/v1/storefronts/${refreshed?.slug}/products`,
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
