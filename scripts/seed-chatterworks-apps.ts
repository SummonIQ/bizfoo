// Adds 3 new products derived from the chatterworks codebase — intended
// to be scaffolded then populated by porting the relevant chatterworks
// modules into each product repo.

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
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  badge?: string;
  category: string;
  stack: string[];
  amount: number;
  features: Array<{ icon?: string; title: string; desc: string }>;
  integrations?: Array<{ name: string; purpose: string; required?: boolean }>;
  assets?: Array<{ label: string; detail: string }>;
  highlights?: Array<{ value: string; label: string }>;
  setupBundles: string[];
};

const APPS: App[] = [
  {
    slug: "message-center-dashboard",
    name: "Message Center Dashboard",
    tagline: "Draggable dashboard cards, parallel + intercepting routes, modal-as-page patterns — wired and ready.",
    description: "A production dashboard shell built around draggable cards, Next.js parallel routes, and intercepting routes so modals open over the current page but deep-link to the real page on refresh. Plug in your own data.",
    longDescription: `A production-grade dashboard shell that solves the three things every serious app needs and most half-finish: **draggable personalized cards**, **intercepting-route modals** (that deep-link correctly on refresh), and **parallel routes** for multi-panel views. Ported from the dashboard behind a live product, packaged so you hook up your own data source.

## What's in the box

- **Draggable card dashboard** — per-user layout (reorder, resize, hide/show), persisted to the DB, with a catalog of card types (stats, lists, charts, activity feeds, quick-actions)
- **Intercepting-route modals** — clicking a contact / item opens a modal over the current page; refreshing the URL renders the full page instead, so deep-links always work the way users expect
- **Parallel routes** for dashboard surfaces — the notifications panel, live activity, and primary content all render independently and stream
- **Add-a-card picker** with categories, previews, and a permissioned "admin-only card types" split
- **Responsive layout** with a grid that collapses cleanly on mobile (cards stack, modals become full-page)
- **Keyboard-first navigation** with ⌘K palette scoped to dashboard actions
- **Pluggable data source** — each card type exposes a \`load(scope)\` contract; wire to your DB, an API, or a mock for local dev

## Architecture

- Next.js 16 App Router with route groups (\`(dashboard)\`), parallel routes (\`@notifications\`, \`@modal\`), and intercepting routes (\`(.)contacts/[id]\`)
- Drag-and-drop via \`@dnd-kit\` with keyboard-accessible sensors
- Card state persisted per-user via typed Server Actions + Prisma
- All styling via Tailwind v4 tokens

## Why this vs rolling your own

Parallel + intercepting routes are a subtle App Router feature — most teams either skip them or implement them wrong (refresh breaks deep-links). This kit has them working correctly, with example contact, project, and item modals you can copy-paste for your own routes.

## Known limits

- Postgres + Prisma assumed for card-layout persistence (swappable)
- Not a no-code dashboard builder — you wire card types in TypeScript`,
    badge: "new",
    category: "boilerplates",
    stack: ["Next.js 16", "React 19", "Prisma 7", "Better Auth", "@dnd-kit", "Tailwind v4", "TypeScript"],
    amount: 89900,
    features: [
      { icon: "Layers", title: "Draggable cards", desc: "Per-user reorder, resize, show/hide. Persisted to the DB. Keyboard accessible." },
      { icon: "Workflow", title: "Intercepting-route modals", desc: "Click opens modal; refresh renders full page. Deep-links always work." },
      { icon: "Sparkles", title: "Parallel routes", desc: "Notifications + activity + content stream independently via @slots." },
      { icon: "Zap", title: "⌘K palette", desc: "Keyboard-first navigation scoped to dashboard actions." },
      { icon: "Plug", title: "Pluggable data source", desc: "Each card type has a load(scope) contract. Wire your DB, API, or mocks." },
      { icon: "Shield", title: "Role-gated cards", desc: "Admin-only card types split from member-visible, with server-enforced gating." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Sessions for per-user layout", required: true },
      { name: "Prisma", purpose: "Card layout persistence", required: true },
    ],
    assets: [
      { label: "Dashboard shell", detail: "Sidebar, card grid, picker, ⌘K palette, mobile layout" },
      { label: "Card catalog", detail: "Stats, list, chart, activity feed, quick-action, empty-state card types" },
      { label: "Modals-as-pages", detail: "Working contact + item modal examples with full-page fallback" },
      { label: "Parallel route examples", detail: "@notifications + @activity wired to the dashboard layout" },
    ],
    highlights: [
      { value: "Parallel routes", label: "Correctly implemented App Router feature most teams skip" },
      { value: "Drag + persist", label: "Per-user layouts that survive reload" },
      { value: "Pluggable", label: "Wire any data source in a typed load() fn" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "branding"],
  },
  {
    slug: "rich-text-composer-kit",
    name: "Rich Text Composer Kit",
    tagline: "Signature editor, message composer, and chat-view editor — one composable rich-text primitive.",
    description: "A polished rich-text editor stack that powers a signature editor, a message composer (like Gmail/Outlook), and an inline chat editor from the same core. Typed, tokenized, and ready to wire to your data.",
    longDescription: `A complete rich-text editor stack — not just a TipTap wrapper. Three distinct surfaces (**signature editor**, **message composer**, **chat input**) built on one composable primitive, so your app has a consistent editing experience across very different contexts.

## What's in the box

- **Core editor** built on TipTap 2 with a strict, opinionated schema (no runaway divs, predictable output)
- **Signature editor** — block-level layout (name, title, socials, image, disclaimer), variable-token insertion (\`{{first_name}}\` etc.), live preview
- **Message composer** — Gmail/Outlook-style compose with to/cc/bcc, attachments (via Blob), subject, body, signature inclusion toggle, schedule-send
- **Chat-view editor** — inline, auto-growing, with @-mentions, /-slash commands, paste-upload for images, multi-line on shift+enter
- **Toolbar library** — every formatting control typed, composable, brandable; shared between the three surfaces so your app is consistent
- **Slash menu** — extensible command registry with keyboard navigation
- **Paste handling** — HTML from Word/Google Docs cleaned to the schema's allowed set; images pasted → uploaded; URLs pasted over selection → linked
- **Variable token support** — typed tokens with autocomplete and live-resolution preview (for signatures + templates)
- **Serialization** — emit clean HTML for email, plain text for chat, or ProseMirror JSON for storage

## Why this vs rolling your own

Rich-text editors are a three-week detour that never ends. This ships the three most common shapes (signature / compose / chat) from one engine — consistent feel, shared fixes, shared improvements.

## Architecture

- **Look + feel** ported from a \`/dev\` component playground (grid of color + spacing tokens) already aligned with modern SaaS UI
- **Functionality** ported from a live signature + compose + chat implementation
- **Extensions**: @-mention, /-slash, variable tokens, image paste/drag, emoji, keyboard shortcuts

## Known limits

- Collaborative editing (CRDT sync) is not baseline — compose with the realtime-collab-boilerplate if needed
- Email rendering across clients is your responsibility — the serializer emits portable HTML but test with Litmus`,
    badge: "new",
    category: "boilerplates",
    stack: ["Next.js 16", "TipTap", "React 19", "Tailwind v4", "TypeScript", "Vercel Blob"],
    amount: 79900,
    features: [
      { icon: "Palette", title: "3 surfaces, 1 engine", desc: "Signature + message compose + chat input — one core, shared toolbar." },
      { icon: "Wand2", title: "Slash menu + @-mentions", desc: "Extensible command registry with keyboard navigation." },
      { icon: "Layers", title: "Variable tokens", desc: "Typed tokens with autocomplete and live-resolution preview." },
      { icon: "Zap", title: "Smart paste", desc: "Word/Docs HTML cleaned to schema, images auto-upload, URLs auto-link." },
      { icon: "Workflow", title: "Typed serialization", desc: "Emit clean email HTML, plain text for chat, or ProseMirror JSON." },
      { icon: "Plug", title: "Pluggable extensions", desc: "Drop in emoji pickers, custom embeds, GIF search — typed API." },
    ],
    integrations: [
      { name: "TipTap", purpose: "Rich-text editor engine", required: true },
      { name: "Vercel Blob", purpose: "Image upload storage" },
    ],
    assets: [
      { label: "Signature editor", detail: "Block layout, token insertion, live preview" },
      { label: "Message composer", detail: "Gmail/Outlook-style with attachments, schedule-send, signature toggle" },
      { label: "Chat input", detail: "Inline auto-grow with @-mentions, /-commands, paste-upload" },
      { label: "Toolbar + slash menu primitives", detail: "All formatting controls typed + composable" },
    ],
    highlights: [
      { value: "3 surfaces", label: "Signature, compose, chat — one codebase" },
      { value: "Schema-strict", label: "No rogue divs; predictable serialization" },
      { value: "Token-aware", label: "Variable tokens with live preview" },
    ],
    setupBundles: ["environment", "vercel-blob", "branding"],
  },
  {
    slug: "unified-inbox-oauth-kit",
    name: "Unified Inbox OAuth Kit (Unipile)",
    tagline: "OAuth connection flows for Outlook, Gmail, LinkedIn, and more via Unipile — user accounts to real inboxes.",
    description: "A production OAuth kit that connects your users' Outlook, Gmail, LinkedIn, and messaging accounts via Unipile. Ready to drop into any Next.js app that needs to send/receive on behalf of users.",
    longDescription: `A production OAuth kit for connecting your users' **real email and messaging accounts** (Outlook, Gmail, LinkedIn, WhatsApp, Instagram DMs) via Unipile's unified API. The last-mile plumbing every "send outreach on my behalf" product needs but nobody ships cleanly.

## What's in the box

- **Unipile OAuth flows** for **Outlook + Exchange**, **Gmail + Google Workspace**, **LinkedIn**, **WhatsApp**, **Instagram DMs**, and **Telegram** (whichever Unipile supports at your tier)
- **Per-user account storage** with encrypted refresh tokens, scope tracking, and re-auth prompts on expiry
- **Account management UI** — list connected accounts, show sync status, disconnect, reconnect with updated scopes
- **Webhook ingestion** — Unipile pushes new messages / events, this kit routes them to your handlers with signature verification + idempotency
- **Send-on-behalf-of** helpers — typed \`sendEmail()\` / \`sendDM()\` / \`sendMessage()\` that abstract the per-provider differences
- **Rate limiting + backoff** built in (Unipile's per-account limits are different per provider)
- **Account health monitoring** — detects disconnects, scope drift, sync stalls; notifies user + admin
- **Full encryption** — tokens at rest, webhook signatures verified, all tokens rotated on detection of abuse

## Architecture

- Built on Unipile's unified API, so adding a new provider is config, not code
- Webhook handler is idempotent (per Unipile event ID) so retries are safe
- Account store is Postgres + Prisma with pluggable encryption (uses a KMS key or env-var-based AES-GCM by default)

## Why this vs rolling your own

Each provider's OAuth is a different adventure — Gmail + Google Workspace have separate scopes, LinkedIn restricts third-party API usage heavily, Outlook EWS vs Graph API is a choice, WhatsApp Business is a three-week project on its own. Unipile abstracts most of that; this kit handles the app-side plumbing around Unipile.

## Known limits

- Unipile subscription required (bring your own API key) — their tier determines which providers you can connect
- No native Gmail/Outlook direct API fallback — Unipile is the single integration surface by design`,
    badge: "new",
    category: "integrations",
    stack: ["Next.js 16", "Prisma 7", "Better Auth", "Unipile", "TypeScript"],
    amount: 69900,
    features: [
      { icon: "Plug", title: "6+ providers via Unipile", desc: "Outlook, Gmail, LinkedIn, WhatsApp, Instagram DMs, Telegram — one abstraction." },
      { icon: "Shield", title: "Encrypted token store", desc: "Refresh tokens at rest, KMS or AES-GCM key handling." },
      { icon: "Workflow", title: "Idempotent webhooks", desc: "Unipile event IDs deduped; retries are always safe." },
      { icon: "Users", title: "Account management UI", desc: "List, sync status, disconnect, reconnect with scope changes." },
      { icon: "Zap", title: "Send-on-behalf helpers", desc: "Typed sendEmail/sendDM/sendMessage that abstract provider quirks." },
      { icon: "LineChart", title: "Account health", desc: "Detect disconnects, scope drift, sync stalls; auto-notify user + admin." },
    ],
    integrations: [
      { name: "Unipile", purpose: "Unified messaging + email API", required: true },
      { name: "Better Auth", purpose: "App user auth (connects to account owner)", required: true },
      { name: "Prisma", purpose: "Account + token persistence", required: true },
    ],
    assets: [
      { label: "OAuth flows", detail: "Connect screens for Outlook, Gmail, LinkedIn, WhatsApp, Instagram, Telegram" },
      { label: "Account settings", detail: "Sync status, disconnect, re-auth, scope visibility" },
      { label: "Webhook handler", detail: "Idempotent + signed, dispatches to your app-side handlers" },
      { label: "Send helpers", detail: "Typed, provider-abstracted send functions" },
    ],
    highlights: [
      { value: "6+", label: "Providers supported via Unipile" },
      { value: "Idempotent", label: "Webhook handler is retry-safe by design" },
      { value: "Encrypted", label: "All tokens at rest + in transit" },
    ],
    setupBundles: ["environment", "postgres", "better-auth"],
  },
];

const SETUP_BLOCKS: Record<string, { title: string; description?: string; category?: string; required?: boolean; inputs: Array<{ key: string; label: string; description?: string; inputType?: string; placeholder?: string; required?: boolean }> }> = {
  environment: { title: "Environment", description: "Core configuration.", category: "Core", required: true, inputs: [{ key: "NEXT_PUBLIC_APP_URL", label: "Public app URL", inputType: "URL", required: true }] },
  postgres: { title: "Postgres database", category: "Data", required: true, inputs: [{ key: "DATABASE_URL", label: "Pooled connection string", inputType: "SECRET", required: true }, { key: "DATABASE_URL_UNPOOLED", label: "Direct connection string", inputType: "SECRET", required: false }] },
  "better-auth": { title: "Better Auth", category: "Auth", required: true, inputs: [{ key: "BETTER_AUTH_SECRET", label: "Session secret", inputType: "SECRET", required: true }, { key: "BETTER_AUTH_URL", label: "Auth base URL", inputType: "URL", required: true }] },
  "vercel-blob": { title: "Vercel Blob", category: "Storage", required: true, inputs: [{ key: "BLOB_READ_WRITE_TOKEN", label: "Read/write token", inputType: "SECRET", required: true }] },
  branding: { title: "Branding", category: "Branding", required: false, inputs: [{ key: "BRAND_NAME", label: "Brand name", required: false }, { key: "BRAND_PRIMARY_COLOR", label: "Primary color", inputType: "COLOR", required: false }] },
};

const DEFAULT_HOW = [
  { title: "Buy + clone", desc: "GitHub collaborator invite lands in your account, clone the private repo." },
  { title: "Configure", desc: "Fill the Setup checklist — env vars, service keys, brand tokens." },
  { title: "Deploy", desc: "Vercel-ready. Push to main, preview URL + prod promote." },
];

const DEFAULT_FAQS = [
  { q: "How do I get access after I buy?", a: "**Account → My purchases** in the top-right menu, then accept the GitHub invite." },
  { q: "Can I use it in client work?", a: "Yes — unlimited use in projects you build. Don't redistribute the source." },
  { q: "Lifetime updates?", a: "You keep repo access; pull improvements when they ship." },
  { q: "Refund policy?", a: "14 days, email us and we'll make it right." },
];

async function main() {
  const storefront = await db.storefront.findUnique({ where: { slug: "summoniq" } });
  if (!storefront) { console.error("storefront 'summoniq' not found"); process.exit(1); }

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
      db.setupStep.deleteMany({ where: { productId: product.id } }),
    ]);

    if (app.features.length) {
      await db.productFeature.createMany({ data: app.features.map((f, i) => ({ productId: product.id, icon: f.icon ?? null, title: f.title, desc: f.desc, position: i })) });
    }
    if (app.integrations?.length) {
      await db.productIntegration.createMany({ data: app.integrations.map((it, i) => ({ productId: product.id, name: it.name, purpose: it.purpose, required: it.required ?? false, position: i })) });
    }
    if (app.assets?.length) {
      await db.productAsset.createMany({ data: app.assets.map((a, i) => ({ productId: product.id, label: a.label, detail: a.detail, position: i })) });
    }
    await db.productHowStep.createMany({ data: DEFAULT_HOW.map((s, i) => ({ productId: product.id, title: s.title, desc: s.desc, position: i })) });
    await db.productFaq.createMany({ data: DEFAULT_FAQS.map((q, i) => ({ productId: product.id, question: q.q, answer: q.a, position: i })) });
    if (app.highlights?.length) {
      await db.productHighlightStat.createMany({ data: app.highlights.map((h, i) => ({ productId: product.id, value: h.value, label: h.label, position: i })) });
    }

    for (let i = 0; i < app.setupBundles.length; i++) {
      const key = app.setupBundles[i];
      const block = SETUP_BLOCKS[key];
      if (!block) continue;
      const step = await db.setupStep.create({
        data: { productId: product.id, title: block.title, description: block.description ?? null, category: block.category ?? null, position: i, required: block.required ?? true },
      });
      if (block.inputs.length) {
        await db.setupInput.createMany({
          data: block.inputs.map((inp, j) => ({
            setupStepId: step.id, key: inp.key, label: inp.label, description: inp.description ?? null,
            inputType: (inp.inputType ?? "TEXT") as any,
            placeholder: inp.placeholder ?? null, required: inp.required ?? true, choices: [], position: j,
          })),
        });
      }
    }
  }

  console.log(`\nDone. ${APPS.length} chatterworks-derived products seeded.`);
  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
