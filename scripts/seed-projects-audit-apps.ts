// Seeds 3 new products from the ~/Projects audit: solo-operator-os-app
// (derived from flow), floating-browser-frames-app (derived from pagelet),
// upwork-proposal-tool-app (a focused subset of flow).

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

type App = {
  slug: string; name: string; tagline: string; description: string; longDescription: string;
  badge?: string; category: string; stack: string[]; amount: number; template: string;
  features: Array<{ icon?: string; title: string; desc: string }>;
  integrations?: Array<{ name: string; purpose: string; required?: boolean }>;
  assets?: Array<{ label: string; detail: string }>;
  highlights?: Array<{ value: string; label: string }>;
  dependencies?: Array<{ name: string; purpose?: string; category?: string; required?: boolean; homepageUrl?: string }>;
  setupBundles: string[];
};

const APPS: App[] = [
  {
    slug: "solo-operator-os-app",
    name: "Solo Operator OS",
    tagline: "The complete freelance / solo-consultant SaaS — CRM, lead gen, proposals, automation, billing — one app.",
    description: "A full-stack operator app for solo consultants and small agencies. Client CRM, project + task mgmt, invoicing, lead generation + outreach, email automation, AI agents, and an embedded browser for automation. Rebrand and charge, or use internally.",
    longDescription: `The complete solo-operator SaaS. Built for freelance engineers, solo consultants, and micro-agencies who are tired of gluing together Notion + Pipedrive + Calendly + QuickBooks + ChatGPT + Zapier into something coherent.

## What's in the box

- **CRM** — clients, contacts, pipeline, notes, tagged activity history, with a per-client portal
- **Projects + tasks** with estimate/actual tracking, phases, and deliverables
- **Invoicing** — Stripe-issued invoices with hosted payment links, automatic reminders, retainer + recurring billing
- **Lead generation + outreach** — scraping tools, saved searches, lists, and multi-step email sequences
- **Upwork proposal tool** (optional module) — AI-drafted proposals tuned to your portfolio
- **Email automation + marketing** — drip sequences, segmentation, deliverability-aware send
- **LinkedIn integration** (via Unipile) — connection + message automation, human-in-the-loop
- **AI agents** — orchestration + workflow + tickets + MCP tools wired up for task automation
- **RAG / knowledge** — ingest your docs, templates, past proposals; agents answer with citations
- **Embedded browser** (Electron + generic webview scraper) for capture + automation workflows
- **Execution calendar** — unified view of client work + marketing + admin tasks
- **Stripe billing**, **Better Auth** (incl. 2FA + passkey), **Vercel Analytics**, **Sentry**
- **Full brand config** — rebrand for your niche (legal freelancers, marketing consultants, etc.)

## Why this vs rolling your own

This is the kind of app that takes 6-12 months to build right. You could buy Accelo for $49/user/mo or Bonsai for $39/mo — this is self-hosted, one-time, customizable to your exact workflow.

## Known limits

- Heavy app — bring a good Postgres (Neon or Supabase)
- Embedded browser requires Electron build; web-only fallback works but loses automation capabilities`,
    badge: "popular",
    category: "apps",
    stack: ["Next.js 16", "Prisma 7", "Better Auth", "Stripe", "Electron", "AI SDK v6", "Playwright", "Unipile"],
    amount: 249900,
    template: "nextjs-app-base",
    features: [
      { icon: "Users", title: "CRM + client portal", desc: "Contacts, pipeline, notes, tagged activity, per-client branded portal." },
      { icon: "Workflow", title: "Projects + tasks", desc: "Estimate/actual tracking, phases, deliverables, kanban + list views." },
      { icon: "CreditCard", title: "Stripe invoicing", desc: "Hosted payment links, automatic reminders, retainer + recurring billing." },
      { icon: "Sparkles", title: "AI agents + RAG", desc: "MCP-tool agents, workflow orchestration, RAG over your past proposals + templates." },
      { icon: "Mail", title: "Email automation", desc: "Drip sequences, segmentation, deliverability-aware send via Resend." },
      { icon: "Plug", title: "LinkedIn via Unipile", desc: "Connection + message automation with human-in-the-loop approval." },
      { icon: "Zap", title: "Upwork proposal tool", desc: "AI-drafted proposals tuned to your portfolio; applies only to gigs that match." },
      { icon: "Layers", title: "Embedded browser", desc: "Electron webview + scraper tool for capture + human-in-the-loop automation." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Invoicing + retainer billing", required: true },
      { name: "Better Auth", purpose: "Auth with 2FA + passkey", required: true },
      { name: "Resend", purpose: "Transactional + sequence email", required: true },
      { name: "AI Gateway", purpose: "LLM routing for agents + RAG", required: true },
      { name: "Unipile", purpose: "LinkedIn + email OAuth" },
      { name: "Playwright", purpose: "Lead scraping + automation" },
    ],
    assets: [
      { label: "CRM + pipeline", detail: "Contacts, deals, notes, activities, saved views, tags" },
      { label: "Project + task mgmt", detail: "Phases, deliverables, kanban/list/calendar views, attachments" },
      { label: "Invoicing", detail: "Stripe invoices, retainer mode, hosted payment, auto-chasing" },
      { label: "Lead gen + outreach", detail: "Saved searches, lists, multi-step sequences, approval queue" },
      { label: "Agents + RAG", detail: "Workflow + ticket models, MCP tools, RAG context, memory" },
      { label: "Embedded browser", detail: "Generic webview + scraper for capture + automation" },
      { label: "Client portal", detail: "Per-client branded deliverable + invoice portal" },
    ],
    highlights: [
      { value: "All-in-one", label: "Replaces 6+ SaaS subscriptions" },
      { value: "Self-hosted", label: "Own your client + proposal data" },
      { value: "AI-native", label: "Agents + RAG baked in from the start" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "resend", "ai-gateway", "branding"],
  },

  {
    slug: "upwork-proposal-tool-app",
    name: "Upwork Proposal Tool",
    tagline: "AI-drafted Upwork proposals tuned to your portfolio and the specific job post — so you only apply where you fit.",
    description: "A focused app: pulls Upwork job posts matching your saved filters, scores fit against your portfolio, drafts a tailored proposal in your voice, and tracks which drafts convert. Self-hosted, your data.",
    longDescription: `A focused Upwork proposal tool — not a full operator suite, just the part that turns "I should apply to more Upwork jobs" into "the right 3 apps drafted, ready to send." Derived from the Upwork module of a production freelance platform, shipped as a standalone you can deploy in an afternoon.

## What's in the box

- **Saved filters + feed** — configure your target categories, budget band, client location, hire rate; get a ranked feed of new postings
- **Fit scoring per post** — explainable breakdown (skills match, client history, budget match) so you know *why* a post was surfaced
- **AI-drafted proposals** — tailored to the specific job post, in your voice, referencing your relevant portfolio work with citations
- **Portfolio library** — past projects tagged by skill + industry; AI pulls matching pieces into each draft
- **Outcome tracking** — which drafts got responses, which converted to hires, average response time — feedback that sharpens the scorer
- **Template bank** — reusable intro paragraphs, case-study snippets, pricing conventions
- **Daily digest email** — "here are today's top 5 posts you should apply to" via Resend
- **Stripe billing** for a free + paid tier (unlimited drafts, historical analytics)
- **Full brand config**

## Why this vs rolling your own

"I'll draft a GPT prompt for Upwork proposals" takes you 2 hours. A proposal tool that actually surfaces the right posts, remembers your portfolio, learns from outcomes, and doesn't produce obviously-AI-written text takes 2 months. This is that.

## Known limits

- Upwork has anti-automation measures — this tool supports drafting + analysis, not auto-submission
- Requires an AI Gateway key (bring your own) for drafting`,
    badge: "new",
    category: "apps",
    stack: ["Next.js 16", "AI SDK v6", "Playwright", "Better Auth", "Stripe", "Prisma", "Resend"],
    amount: 49900,
    template: "nextjs-app-base",
    features: [
      { icon: "Workflow", title: "Saved filters + feed", desc: "Ranked feed of new Upwork posts matching your target criteria." },
      { icon: "Sparkles", title: "Explainable fit scoring", desc: "Skills match, client history, budget match — not a black-box score." },
      { icon: "Wand2", title: "AI-drafted proposals", desc: "Tuned to the specific post + your portfolio, in your voice." },
      { icon: "Layers", title: "Portfolio library", desc: "Tag past work by skill + industry; AI pulls matches into each draft." },
      { icon: "LineChart", title: "Outcome tracking", desc: "Response + hire rate; feeds back into the scorer." },
      { icon: "Mail", title: "Daily digest", desc: "Top-5 email every morning — skip the scroll." },
    ],
    integrations: [
      { name: "AI Gateway", purpose: "LLM routing for drafts + scoring", required: true },
      { name: "Better Auth", purpose: "User accounts", required: true },
      { name: "Stripe", purpose: "Free + paid tier billing", required: true },
      { name: "Resend", purpose: "Daily digest email", required: true },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "resend", "ai-gateway"],
  },

  {
    slug: "floating-browser-frames-app",
    name: "Floating Browser Frames",
    tagline: "A Mac utility that creates always-on-top minimal browser windows with full WebAuthn / OAuth support.",
    description: "A native Mac app (PyQt) for floating, always-on-top browser frames. Perfect for keeping a YouTube, music player, Slack channel, or reference doc always visible — with full WebAuthn / YouTube + Google login support.",
    longDescription: `A native Mac utility that creates **minimal, always-on-top browser frames** — for the developer who wants a YouTube window hovering over their code, the designer who keeps a reference doc pinned, or the streamer who wants their chat visible without alt-tabbing. What sets it apart from \`open -a Safari\` in a small window: full support for modern auth (WebAuthn, Google OAuth, YouTube login) that most minimal-browser tools break.

## What's in the box

- **Always-on-top frames** — create as many as you want, each with its own URL, size, and position memory
- **WebAuthn + OAuth support** — YouTube login, Google sign-in, Slack OAuth, GitHub — all work (they don't in typical minimal-browser wrappers)
- **Transparent window chrome** — frames are just the content, no browser UI clutter
- **Per-frame profiles** — separate cookie jars per frame so you can have multiple Slack workspaces or Gmail accounts side by side
- **Pin to desktop / Space** — stays visible when you switch apps, optional per-Space pinning
- **Keyboard shortcuts** — global hotkey to toggle frames, show/hide all, etc.
- **Menubar control** — quick access to all active frames, create new, adjust opacity
- **PyInstaller-bundled** as a signed .app; auto-update ready

## Why this vs rolling your own

Every minimal-browser wrapper breaks on modern auth. PyQt with the right WebEngine flags + persistent cookie storage gets it right. This app is the sum of those fixes plus the polish (per-frame profiles, menubar control, Space pinning).

## Known limits

- macOS only
- PyQt-based; if you prefer a native Swift rewrite, the logic translates`,
    category: "desktop",
    stack: ["Python", "PyQt", "WebEngine", "PyInstaller"],
    amount: 69900,
    template: "nextjs-app-base", // placeholder — pagelet-style python carrier doesn't exist yet; scaffold as nextjs shell with python notes
    features: [
      { icon: "Layers", title: "Always-on-top frames", desc: "Multiple frames, each with URL + size + position memory." },
      { icon: "Fingerprint", title: "WebAuthn + OAuth", desc: "YouTube, Google, Slack, GitHub — all work, unlike typical minimal-browser wrappers." },
      { icon: "Users", title: "Per-frame profiles", desc: "Separate cookie jars — multiple Slack workspaces or Gmail accounts side by side." },
      { icon: "Zap", title: "Keyboard shortcuts", desc: "Global hotkey toggles, show/hide all, cycle frames." },
      { icon: "Palette", title: "Transparent chrome", desc: "Just the content, no browser UI clutter." },
    ],
    dependencies: [
      { name: "Python", purpose: "Application language", category: "runtime" },
      { name: "PyQt", purpose: "Native desktop UI + WebEngine", category: "framework" },
      { name: "QtWebEngine", purpose: "Chromium with WebAuthn support", category: "runtime" },
      { name: "PyInstaller", purpose: "Signed .app bundling", category: "tooling" },
    ],
    setupBundles: ["environment", "signing-mac"],
  },
];

const SETUP_BLOCKS: Record<string, { title: string; description?: string; category?: string; required?: boolean; inputs: Array<{ key: string; label: string; inputType?: string; placeholder?: string; required?: boolean }> }> = {
  environment: { title: "Environment", description: "Core configuration.", category: "Core", required: true, inputs: [{ key: "NEXT_PUBLIC_APP_URL", label: "Public app URL", inputType: "URL", required: true }] },
  postgres: { title: "Postgres database", category: "Data", required: true, inputs: [{ key: "DATABASE_URL", label: "Pooled connection string", inputType: "SECRET", required: true }, { key: "DATABASE_URL_UNPOOLED", label: "Direct connection string", inputType: "SECRET", required: false }] },
  "better-auth": { title: "Better Auth", category: "Auth", required: true, inputs: [{ key: "BETTER_AUTH_SECRET", label: "Session secret", inputType: "SECRET", required: true }, { key: "BETTER_AUTH_URL", label: "Auth base URL", inputType: "URL", required: true }] },
  stripe: { title: "Stripe", category: "Billing", required: true, inputs: [{ key: "STRIPE_SECRET_KEY", label: "Secret key", inputType: "SECRET", required: true }, { key: "STRIPE_WEBHOOK_SECRET", label: "Webhook secret", inputType: "SECRET", required: true }, { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Publishable key", required: true }] },
  resend: { title: "Resend", category: "Email", required: true, inputs: [{ key: "RESEND_API_KEY", label: "API key", inputType: "SECRET", required: true }, { key: "RESEND_FROM_EMAIL", label: "From address", inputType: "EMAIL", required: true }] },
  "ai-gateway": { title: "Vercel AI Gateway", category: "AI", required: true, inputs: [{ key: "AI_GATEWAY_API_KEY", label: "API key", inputType: "SECRET", required: true }] },
  branding: { title: "Branding", category: "Branding", required: false, inputs: [{ key: "BRAND_NAME", label: "Brand name", required: false }, { key: "BRAND_PRIMARY_COLOR", label: "Primary color", inputType: "COLOR", required: false }] },
  "signing-mac": { title: "macOS code signing", category: "Release", required: true, inputs: [{ key: "APPLE_ID", label: "Apple ID email", inputType: "EMAIL", required: true }, { key: "APPLE_ID_PASSWORD", label: "App-specific password", inputType: "SECRET", required: true }, { key: "APPLE_TEAM_ID", label: "Team ID", required: true }] },
};

const DEFAULT_HOW = [
  { title: "Buy + clone", desc: "GitHub collaborator invite; clone the private repo." },
  { title: "Configure", desc: "Fill the Setup checklist — env vars, service keys, brand." },
  { title: "Deploy", desc: "Vercel (or signed .app) — push to main and ship." },
];
const DEFAULT_FAQS = [
  { q: "How do I get access after I buy?", a: "**Account → My purchases** in the top-right menu, then accept the GitHub invite." },
  { q: "Client work?", a: "Yes — unlimited use in projects you build. Don't redistribute the source." },
  { q: "Lifetime updates?", a: "You keep repo access; pull improvements as they ship." },
  { q: "Refund policy?", a: "14 days, email us and we'll make it right." },
];

async function main() {
  const storefront = await db.storefront.findUnique({ where: { slug: "summoniq" } });
  if (!storefront) { console.error("storefront not found"); process.exit(1); }

  for (const app of APPS) {
    let product = await db.product.findFirst({ where: { storefrontId: storefront.id, slug: app.slug } });
    const data = {
      name: app.name, tagline: app.tagline, description: app.description, longDescription: app.longDescription,
      category: app.category, badge: app.badge ?? null, stack: app.stack, active: true,
    };
    if (product) {
      await db.product.update({ where: { id: product.id }, data });
      console.log(`  ↻ updated ${app.slug}`);
    } else {
      product = await db.product.create({
        data: {
          storefrontId: storefront.id, slug: app.slug, ...data,
          prices: { create: [{ amount: app.amount, currency: "usd", interval: "ONE_TIME", intervalCount: 1, active: true }] },
        },
      });
      console.log(`  + created ${app.slug}`);
    }

    await Promise.all([
      db.productFeature.deleteMany({ where: { productId: product.id } }),
      db.productIntegration.deleteMany({ where: { productId: product.id } }),
      db.productAsset.deleteMany({ where: { productId: product.id } }),
      db.productHowStep.deleteMany({ where: { productId: product.id } }),
      db.productFaq.deleteMany({ where: { productId: product.id } }),
      db.productHighlightStat.deleteMany({ where: { productId: product.id } }),
      db.productDependency.deleteMany({ where: { productId: product.id } }),
      db.setupStep.deleteMany({ where: { productId: product.id } }),
    ]);

    if (app.features.length) await db.productFeature.createMany({ data: app.features.map((f, i) => ({ productId: product.id, icon: f.icon ?? null, title: f.title, desc: f.desc, position: i })) });
    if (app.integrations?.length) await db.productIntegration.createMany({ data: app.integrations.map((it, i) => ({ productId: product.id, name: it.name, purpose: it.purpose, required: it.required ?? false, position: i })) });
    if (app.assets?.length) await db.productAsset.createMany({ data: app.assets.map((a, i) => ({ productId: product.id, label: a.label, detail: a.detail, position: i })) });
    await db.productHowStep.createMany({ data: DEFAULT_HOW.map((s, i) => ({ productId: product.id, title: s.title, desc: s.desc, position: i })) });
    await db.productFaq.createMany({ data: DEFAULT_FAQS.map((q, i) => ({ productId: product.id, question: q.q, answer: q.a, position: i })) });
    if (app.highlights?.length) await db.productHighlightStat.createMany({ data: app.highlights.map((h, i) => ({ productId: product.id, value: h.value, label: h.label, position: i })) });
    if (app.dependencies?.length) await db.productDependency.createMany({ data: app.dependencies.map((d, i) => ({ productId: product.id, name: d.name, purpose: d.purpose ?? null, category: d.category ?? null, required: d.required ?? true, homepageUrl: d.homepageUrl ?? null, position: i })) });

    for (let i = 0; i < app.setupBundles.length; i++) {
      const block = SETUP_BLOCKS[app.setupBundles[i]];
      if (!block) continue;
      const step = await db.setupStep.create({
        data: { productId: product.id, title: block.title, description: block.description ?? null, category: block.category ?? null, position: i, required: block.required ?? true },
      });
      if (block.inputs.length) {
        await db.setupInput.createMany({
          data: block.inputs.map((inp, j) => ({
            setupStepId: step.id, key: inp.key, label: inp.label,
            inputType: (inp.inputType ?? "TEXT") as any,
            placeholder: inp.placeholder ?? null, required: inp.required ?? true, choices: [], position: j,
          })),
        });
      }
    }
  }

  console.log(`\nDone. ${APPS.length} new products seeded.`);
  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
