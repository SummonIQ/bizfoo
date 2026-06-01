// Seeds "full app" products derived from real projects in ~/Projects.
// Buyers get the entire repo — everything baked — and can play with
// the live branded version at demoUrl before buying.

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
  stack: string[];
  amount: number;
  demoUrl?: string;
  template: "nextjs-app-base" | "electron-base" | "tauri-base" | "swift-macos-base";
  features: Array<{ icon?: string; title: string; desc: string }>;
  integrations?: Array<{ name: string; purpose: string; required?: boolean }>;
  assets?: Array<{ label: string; detail: string }>;
  highlights?: Array<{ value: string; label: string }>;
  setupBundles: string[];
};

const APPS: App[] = [
  {
    slug: "budgetbloom-app",
    name: "BudgetBloom — Personal Finance App",
    tagline: "The full personal finance PWA — budgets, goals, investments, offline-first. Play with it live, then make it yours.",
    description: "The complete BudgetBloom app, unbranded. Multi-currency category budgets, recurring rules, goal tracking, investment tracking, PWA offline mode. Live at budgetbloom.app — clone, rebrand, ship.",
    longDescription: `The complete BudgetBloom app — ready to rebrand and ship as your own. Not a starter kit, not a tutorial — the production codebase behind [budgetbloom.app](https://budgetbloom.app), packaged so you can make it yours in a weekend.

## What's in the box

- **Category budgets** with monthly rollover, per-category limits, visual progress bars, and multi-currency support with live FX rates
- **Recurring transaction rules** that auto-categorize repeating patterns from your history — the app learns your habits without a trained classifier
- **Goal tracking** with target amounts, projected completion from current savings rate, and visual progress charts
- **Investment tracking** — positions across brokerages, cost basis, returns, and a portfolio allocation view
- **Offline-first via IndexedDB** with a CRDT-like sync layer that reconciles cleanly on reconnect
- **PWA installable** with home-screen icon, offline capability, and push notifications for budget alerts
- **CSV import** from Mint, YNAB, and raw bank exports; manual entry as fallback
- **Multi-device sync** via your own Postgres, with encrypted at rest
- **Brand config** — rename, recolor, swap logo via a single tokens file

## Live demo

Play with the branded version at **[budgetbloom.app](https://budgetbloom.app)** — sign up, add some transactions, feel the app. When you buy, you get the same codebase to rebrand.

## Why this vs a template

Templates leave you 80% of the work. This is the 100%: the UI decisions are made, the data model is battle-tested, the offline sync works, the PWA installs correctly on iOS + Android. You rebrand the tokens file, swap in your Stripe keys, and you're live.

## Known limits

- No bank-API integrations (Plaid) — feature for most buyers who want the privacy positioning
- Market prices need an API key (Alpha Vantage / IEX — free tiers work)`,
    badge: "popular",
    stack: ["Next.js 16", "React 19", "Prisma 7", "Better Auth", "PWA", "IndexedDB", "Tailwind v4"],
    amount: 199900,
    demoUrl: "https://budgetbloom.app",
    template: "nextjs-app-base",
    features: [
      { icon: "Database", title: "Offline-first sync", desc: "IndexedDB cache with conflict-free sync when you're back online." },
      { icon: "LineChart", title: "Investments", desc: "Positions, cost basis, returns across brokerages." },
      { icon: "Workflow", title: "Recurring rules", desc: "Auto-categorize repeating transactions from history." },
      { icon: "Sparkles", title: "Multi-currency", desc: "Live FX rates, display in preferred currency, store in native." },
      { icon: "Rocket", title: "PWA installable", desc: "Home-screen icon, offline capability, push alerts." },
      { icon: "Palette", title: "Brand tokens", desc: "Rename, recolor, rebrand in one tokens file." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Email + passkey auth", required: true },
      { name: "Neon Postgres", purpose: "Sync backend", required: true },
      { name: "Alpha Vantage / IEX", purpose: "Market price data for investments" },
    ],
    assets: [
      { label: "Budget + transactions", detail: "Category boards, transaction ledger, recurring rules, CSV import" },
      { label: "Goals + insights", detail: "Target tracking, savings-rate projection, trend charts" },
      { label: "Investments", detail: "Positions, cost basis, allocation view, returns" },
      { label: "Settings + brand", detail: "Profile, currencies, categories, theme tokens" },
    ],
    highlights: [
      { value: "budgetbloom.app", label: "Play with the live branded version" },
      { value: "Offline-first", label: "Works on the subway, syncs on reconnect" },
      { value: "PWA", label: "Installs to iOS + Android home screen" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "branding"],
  },
  {
    slug: "gimme-job-app",
    name: "Gimme Job — AI Job Search App",
    tagline: "The complete AI-powered job hunt app — crawling, ranking, drafting, interview prep. Try it live.",
    description: "The production Gimme Job app, unbranded. AI that crawls job boards, ranks fit against your resume, drafts tailored applications, and runs mock interviews. Deploy and charge users.",
    longDescription: `The complete Gimme Job app — the full AI job-search product, packaged for resale. Not a scaffold: the production codebase with Playwright crawlers, resume-vs-role fit scoring, AI-drafted applications, and a mock-interview runner.

## What's in the box

- **Multi-source job crawler** (Playwright) — LinkedIn, Hacker News "Who's Hiring", AngelList, configurable company career pages, with dedup across sources
- **Fit scoring** against your resume with an explainable breakdown — skills match, seniority band, location/remote fit, compensation match — not just a black-box number
- **AI-drafted applications** — tailored cover letters and resume tweaks in your voice, with per-company tone toggle (formal / direct / warm)
- **Mock interview runner** — behavioral, system design, and role-specific technical rounds, with feedback scoring
- **Application tracker** — kanban with statuses (applied → phone → on-site → offer / rejected / ghosted), automatic follow-up reminders
- **Resume + cover letter version history** so you can see what converted
- **Google + Apple OAuth**, Stripe-paid premium tiers (unlimited crawls, priority AI), branded email via Resend
- **Full brand config** — rename, recolor, retool for your niche

## Live demo

Try the branded product — sign up, connect your resume, see the crawler and AI in action. Your buyers do the same before they commit.

## Why this vs rolling your own

Every individual piece (crawler, AI draft, interview sim) takes days. Stitching them into a product with user accounts, billing, and a kanban that doesn't feel like a hack is weeks. This is that product, shippable.

## Known limits

- Crawlers can break when sources change DOM — updates shipped, but there's always some lag
- AI costs are yours to pay (bring your own AI Gateway key)`,
    badge: "popular",
    stack: ["Next.js 16", "AI SDK v6", "Playwright", "Better Auth", "Stripe", "Prisma", "Resend"],
    amount: 179900,
    template: "nextjs-app-base",
    features: [
      { icon: "Workflow", title: "Multi-source crawler", desc: "LinkedIn, HN Who's Hiring, AngelList, custom pages. Dedup'd." },
      { icon: "Sparkles", title: "Explainable fit scoring", desc: "Why each role made the shortlist — skills, seniority, comp, location." },
      { icon: "Wand2", title: "AI-drafted applications", desc: "Tailored cover letters + resume tweaks, per-company tone." },
      { icon: "Users", title: "Mock interview runner", desc: "Behavioral, system design, role-specific technicals with scoring." },
      { icon: "Layers", title: "Application kanban", desc: "Status tracking, follow-up reminders, version history." },
      { icon: "CreditCard", title: "Stripe premium tiers", desc: "Unlimited crawls, priority AI, managed through customer portal." },
    ],
    integrations: [
      { name: "AI Gateway", purpose: "Model routing for drafts + scoring", required: true },
      { name: "Better Auth", purpose: "Email + Google + Apple OAuth", required: true },
      { name: "Stripe", purpose: "Premium subscriptions", required: true },
      { name: "Resend", purpose: "Notification email", required: true },
    ],
    assets: [
      { label: "Crawler workers", detail: "Playwright-based, schedulable, per-source configurable" },
      { label: "Application kanban", detail: "Status columns, follow-up reminders, attachments" },
      { label: "Resume + cover letter editor", detail: "Version history, AI-draft, export to PDF/DOCX" },
      { label: "Mock interview runner", detail: "Multiple round types with scoring rubrics" },
    ],
    highlights: [
      { value: "4+ sources", label: "Job boards crawled out of the box" },
      { value: "Per-role tone", label: "Draft in your voice, tuned to the company" },
      { value: "$179/mo saved", label: "Vs paying for 3 separate job-tool subscriptions" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "ai-gateway", "resend"],
  },
  {
    slug: "gankr-app",
    name: "Gankr — Scraping Workspace",
    tagline: "Project-scoped scraping workspace with persistence, visual drag-drop workflow, and AI-assisted selectors.",
    description: "The full Gankr app — a unified scraping workspace where you design scrapers visually, persist results per project, and let AI suggest selectors when pages change. Deploy and charge.",
    longDescription: `The complete Gankr app, unbranded. A production-grade scraping workspace for teams that need to pull data from the web reliably — with project scoping, visual workflow building, result persistence, and AI-assisted selector maintenance.

## What's in the box

- **Project workspaces** — each scrape lives in a project with its own schedule, credentials, and result history
- **Visual workflow builder** — drag-and-drop scrape steps (visit → wait → extract → transform → save)
- **AI-assisted selectors** — when a page changes and your selector breaks, the assistant suggests a replacement based on the surrounding DOM
- **Scheduled runs** with cron-style frequency, retries on failure, and email + webhook alerts on break
- **Result persistence** in Postgres with full-text search, export to CSV / JSON, and a REST API per project
- **Proxy + captcha plumbing** — wire your own proxies (Bright Data, Oxylabs) and captcha solvers (2Captcha, Anti-Captcha)
- **Team workspaces** with role-based access and an audit log
- **Stripe-paid tiers** based on run-minutes and project count

## Why this vs rolling your own

Scrapers always start simple and grow into unmaintainable forests. Gankr gives you the structure (projects, versioned workflows, AI selector repair, alerting) that keeps a 50-scraper operation sane instead of a 2am fire.

## Known limits

- Headless browser runs on your infra (Playwright in a worker) — no managed browser farm included
- Rate limiting + ethical scraping is your responsibility`,
    stack: ["Next.js 16", "Playwright", "Better Auth", "Stripe", "Prisma", "Vercel Workflow"],
    amount: 149900,
    template: "nextjs-app-base",
    features: [
      { icon: "Layers", title: "Visual workflow builder", desc: "Drag-drop steps: visit, wait, extract, transform, save." },
      { icon: "Wand2", title: "AI selector repair", desc: "Page changes? Assistant suggests replacement selectors automatically." },
      { icon: "Workflow", title: "Scheduled runs", desc: "Cron frequency, retries, email + webhook alerts on break." },
      { icon: "Database", title: "Result persistence", desc: "Postgres with full-text search, CSV/JSON export, REST API per project." },
      { icon: "Users", title: "Team workspaces", desc: "RBAC, audit log, seat-based billing." },
      { icon: "Plug", title: "Pluggable proxies", desc: "Bring your own Bright Data / Oxylabs, 2Captcha / Anti-Captcha." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Team + API key auth", required: true },
      { name: "Stripe", purpose: "Tiered per-run-minute + project billing", required: true },
      { name: "Vercel Workflow", purpose: "Durable scheduled runs" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "vercel-workflow"],
  },
  {
    slug: "maczen-app",
    name: "MacZen — Screenshot + Recording Organizer",
    tagline: "A native Mac app for organizing screenshots and screen recordings with adaptive theming.",
    description: "The full MacZen app — a Mac-native screenshot + recording organizer with search, tags, and cloud sync. Ships as Electron desktop + Next.js web control plane. Rebrand and sell.",
    longDescription: `The complete MacZen app — a modern adaptive screenshot + screen recording organizer with both a native desktop experience and a web dashboard. For productivity buyers, Mac power users, or anyone drowning in \`~/Desktop/Screenshot 2026-04-...\`

## What's in the box

- **Native desktop capture** — hotkey-triggered screenshots + recordings with smart file naming based on active app + window title
- **Auto-organize** into project folders based on rules you define (app name, URL keyword, file size)
- **Full-text OCR search** — find that screenshot with "dashboard" text in it even if the filename is \`Screenshot 2026-04-19 at 3.47.11 PM.png\`
- **Adaptive theme** — matches macOS system light/dark mode automatically
- **iCloud + Dropbox + S3 sync** — backup originals, keep a searchable local index
- **Annotations** — crop, arrow, text, blur, redact, with single-keystroke exports
- **Web dashboard** for team sharing with signed URLs, expiration, and view tracking
- **Stripe subscription** for the cloud sync + dashboard features

## Why this vs rolling your own

Screenshot tools feel solved until you hit the edge cases — OCR that works on UI screenshots (not just documents), multi-monitor capture, adaptive theming, and a sharing layer that's actually secure. This app has those handled.

## Known limits

- macOS only (no Windows port — would require a separate codebase)
- OCR uses Apple Vision framework (native accuracy, macOS-only)`,
    stack: ["Electron", "Next.js 16", "Swift", "Tailwind v4", "TypeScript"],
    amount: 129900,
    template: "electron-base",
    features: [
      { icon: "Zap", title: "Hotkey capture", desc: "Screenshot + recording with smart file naming from active app/window." },
      { icon: "Workflow", title: "Rule-based auto-organize", desc: "Sort into project folders by app, URL keyword, or size." },
      { icon: "Sparkles", title: "Full-text OCR search", desc: "Find by UI text even when the filename is useless." },
      { icon: "Palette", title: "Adaptive theme", desc: "Follows macOS light/dark mode automatically." },
      { icon: "Plug", title: "Sync options", desc: "iCloud, Dropbox, or S3 — keep originals safe, local index fast." },
      { icon: "Users", title: "Team sharing dashboard", desc: "Signed URLs with expiration, view tracking, annotations." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Auth for web dashboard" },
      { name: "Stripe", purpose: "Cloud sync subscription" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "signing-mac"],
  },
  {
    slug: "snoopi-app",
    name: "Attentively — AI Meeting Assistant",
    tagline: "A Mac-native AI meeting assistant that transcribes, summarizes, and pulls action items automatically.",
    description: "The complete Attentively app — native Mac meeting recorder with on-device transcription, AI summarization, and action-item extraction. Desktop + marketing site + admin.",
    longDescription: `The complete Attentively app — a Mac-native AI meeting assistant that runs in the background, transcribes calls locally (on-device, privacy-first), and produces structured summaries + action items you can paste into your notes or Jira.

## What's in the box

- **Native recording** via system audio + mic with per-meeting separation — no Zoom plugin, works with any video app
- **On-device transcription** using whisper.cpp — your audio never leaves your Mac unless you choose to upload
- **AI summarization** with configurable styles (bullet / narrative / decisions-only) and speaker attribution
- **Action items extraction** with assignee inference (who said "I'll do X")
- **Calendar integration** (Google + Outlook) so every meeting auto-records
- **Marketing website** with pricing, landing, FAQs (bundled in the repo, Next.js)
- **Stripe subscription** with a free tier + paid (longer meetings, cloud sync)
- **Export integrations** — Notion, Linear, Jira, email

## Why this vs rolling your own

The integration of OS-level audio capture + whisper + speaker diarization + calendar API + summary UI is a 3-month project. This ships it.

## Known limits

- macOS only for the desktop app (web-based fallback included)
- whisper.cpp uses local CPU — M-series Macs handle it fine`,
    badge: "new",
    stack: ["Electron", "Next.js 16", "whisper.cpp", "AI SDK v6", "Better Auth", "Stripe"],
    amount: 169900,
    template: "electron-base",
    features: [
      { icon: "Zap", title: "System-wide recording", desc: "Captures any video app's audio + your mic. No plugins." },
      { icon: "Shield", title: "On-device transcription", desc: "whisper.cpp runs locally; audio never leaves your Mac by default." },
      { icon: "Wand2", title: "AI summarization", desc: "Bullet, narrative, or decisions-only — with speaker attribution." },
      { icon: "Workflow", title: "Action item extraction", desc: "'I'll do X' → assignee-attributed action with due date." },
      { icon: "Plug", title: "Calendar auto-record", desc: "Google + Outlook; every meeting captured automatically." },
      { icon: "CreditCard", title: "Stripe tiers", desc: "Free + paid with cloud sync + longer meeting limits." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Web dashboard + sync auth", required: true },
      { name: "Stripe", purpose: "Subscription tiers", required: true },
      { name: "Google Calendar", purpose: "Auto-record scheduled meetings" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "signing-mac", "google-calendar"],
  },
  {
    slug: "winzen-app",
    name: "Winzen — macOS Spaces Manager",
    tagline: "A power-user Mac app for organizing, labeling, and switching between Spaces effortlessly.",
    description: "The full Winzen app — a native macOS Spaces (desktop) manager with keyboard-first switching, per-Space layouts, and menu-bar presence. Rebrand for your niche.",
    longDescription: `The complete Winzen app — a native macOS utility that makes Spaces (virtual desktops) actually usable. For anyone who's wished Apple spent 10 more minutes on Mission Control.

## What's in the box

- **Named + labeled Spaces** — assign colors and names so "Space 3" becomes "Design" at a glance
- **Keyboard switching** — global hotkeys for jump-to-space, cycle, and named jumps
- **Per-Space layouts** — remember window positions per Space and restore on switch
- **Menu-bar app** with the current Space, quick switcher, and a peek mode
- **App-to-Space pinning** — Slack always on Space 4, regardless of where it opens
- **Sparkle auto-update** with channel support
- **Login items** using modern ServiceManagement APIs

## Why this vs rolling your own

macOS Spaces/Mission Control APIs are underdocumented. This app has them figured out — window positioning, space labeling, hotkey conflict resolution. Rebrand it into a productivity suite, a Mac power-user tool, or a team-ops helper.

## Known limits

- macOS 14+ only
- Requires Accessibility permission for window management`,
    stack: ["Swift", "SwiftUI", "Sparkle", "AppKit"],
    amount: 89900,
    template: "swift-macos-base",
    features: [
      { icon: "Layers", title: "Named + colored Spaces", desc: "'Space 3' becomes 'Design' with an icon and color." },
      { icon: "Zap", title: "Keyboard-first switching", desc: "Global hotkeys for jump, cycle, and named jumps." },
      { icon: "Workflow", title: "Per-Space layouts", desc: "Remember window positions per Space, restore on switch." },
      { icon: "Plug", title: "App-to-Space pinning", desc: "Slack always on Space 4, no matter where it opens." },
      { icon: "Rocket", title: "Sparkle auto-update", desc: "Code-signed updates with staging/beta/stable channels." },
    ],
    setupBundles: ["environment", "signing-mac", "sparkle"],
  },
  {
    slug: "mac-rabbit-app",
    name: "Mac Rabbit — macOS Service Manager",
    tagline: "Native Mac app for managing system services, launch agents, and performance tuning.",
    description: "The complete Mac Rabbit app — a native macOS service + launchd manager with one-click kill, disable, performance tuning, and privacy controls. For Mac power users.",
    longDescription: `The complete Mac Rabbit app — a native macOS power-user utility for managing the dozens of background services, launch agents, and daemons that accumulate on any Mac over time.

## What's in the box

- **launchd browser** — every active agent / daemon, grouped by system / user / third-party, with full plist inspection
- **One-click toggle** — disable, enable, or permanently remove any service, with a confirm-and-rollback flow
- **Performance view** — live CPU + RAM + network per service, with a 24h trend
- **Privacy audit** — flag services that phone home or run on every boot without your install
- **Startup optimization** — one-click "fast boot" that disables non-essential launchd items on login
- **Snapshot + rollback** — before making changes, snapshot your state; restore if something breaks
- **Sparkle auto-update** + EdDSA signing

## Why this vs rolling your own

Getting launchd right requires knowing the difference between \`LaunchAgents\` / \`LaunchDaemons\` / \`SystemAgents\`, the privileged vs non-privileged operations, and how to restart things without breaking the system. This app has those rules encoded.

## Known limits

- macOS 13+ only
- Some privileged operations require admin password each time (Apple requirement)`,
    stack: ["Swift", "SwiftUI", "Sparkle"],
    amount: 79900,
    template: "swift-macos-base",
    features: [
      { icon: "Layers", title: "launchd browser", desc: "Every agent + daemon grouped by system/user/third-party with plist inspection." },
      { icon: "Zap", title: "One-click toggle", desc: "Disable, enable, or remove with confirm-and-rollback." },
      { icon: "LineChart", title: "Live performance", desc: "Per-service CPU + RAM + network with 24h trend." },
      { icon: "Shield", title: "Privacy audit", desc: "Flags services that phone home or run at every boot uninvited." },
      { icon: "Rocket", title: "Startup optimization", desc: "'Fast boot' mode disables non-essential login items." },
    ],
    setupBundles: ["environment", "signing-mac", "sparkle"],
  },
];

const SETUP_BLOCKS: Record<string, { title: string; description?: string; category?: string; required?: boolean; helpUrl?: string; inputs: Array<{ key: string; label: string; description?: string; inputType?: string; placeholder?: string; helpUrl?: string; required?: boolean }> }> = {
  environment: { title: "Environment", description: "Core configuration.", category: "Core", required: true, inputs: [{ key: "NEXT_PUBLIC_APP_URL", label: "Public app URL", inputType: "URL", required: true }] },
  postgres: { title: "Postgres database", category: "Data", required: true, inputs: [{ key: "DATABASE_URL", label: "Pooled connection string", inputType: "SECRET", required: true }, { key: "DATABASE_URL_UNPOOLED", label: "Direct connection string", inputType: "SECRET", required: false }] },
  "better-auth": { title: "Better Auth", category: "Auth", required: true, inputs: [{ key: "BETTER_AUTH_SECRET", label: "Session secret", inputType: "SECRET", required: true }, { key: "BETTER_AUTH_URL", label: "Auth base URL", inputType: "URL", required: true }] },
  stripe: { title: "Stripe", category: "Billing", required: true, inputs: [{ key: "STRIPE_SECRET_KEY", label: "Secret key", inputType: "SECRET", required: true }, { key: "STRIPE_WEBHOOK_SECRET", label: "Webhook signing secret", inputType: "SECRET", required: true }, { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Publishable key", required: true }] },
  resend: { title: "Resend", category: "Email", required: true, inputs: [{ key: "RESEND_API_KEY", label: "API key", inputType: "SECRET", required: true }, { key: "RESEND_FROM_EMAIL", label: "From address", inputType: "EMAIL", required: true }] },
  "ai-gateway": { title: "Vercel AI Gateway", category: "AI", required: true, inputs: [{ key: "AI_GATEWAY_API_KEY", label: "API key", inputType: "SECRET", required: true }] },
  "vercel-workflow": { title: "Vercel Workflow", category: "Infra", required: true, inputs: [{ key: "VERCEL_WORKFLOW_TOKEN", label: "Workflow token", inputType: "SECRET", required: true }] },
  branding: { title: "Branding", category: "Branding", required: false, inputs: [{ key: "BRAND_NAME", label: "Brand name", required: false }, { key: "BRAND_PRIMARY_COLOR", label: "Primary color", inputType: "COLOR", required: false }] },
  "signing-mac": { title: "macOS code signing + notarization", category: "Release", required: true, inputs: [{ key: "APPLE_ID", label: "Apple ID email", inputType: "EMAIL", required: true }, { key: "APPLE_ID_PASSWORD", label: "App-specific password", inputType: "SECRET", required: true }, { key: "APPLE_TEAM_ID", label: "Team ID", required: true }, { key: "APPLE_DEVELOPER_ID_CERT", label: "Developer ID cert (base64 p12)", inputType: "SECRET", required: true }] },
  sparkle: { title: "Sparkle auto-update", category: "Release", required: false, inputs: [{ key: "SPARKLE_FEED_URL", label: "Feed URL", inputType: "URL", required: false }, { key: "SPARKLE_EDDSA_KEY", label: "EdDSA private key", inputType: "SECRET", required: false }] },
  "google-calendar": { title: "Google Calendar", category: "Integrations", required: false, inputs: [{ key: "GOOGLE_CLIENT_ID", label: "OAuth client ID", inputType: "SECRET", required: false }, { key: "GOOGLE_CLIENT_SECRET", label: "OAuth client secret", inputType: "SECRET", required: false }] },
};

const DEFAULT_HOW = [
  { title: "Buy + clone", desc: "Get an invite to a private GitHub repo with the full source." },
  { title: "Configure", desc: "Fill the Setup checklist — env vars, service keys, brand tokens." },
  { title: "Deploy", desc: "Push to main; Vercel (or your GH Actions for native apps) takes it from there." },
];

const DEFAULT_FAQS = [
  { q: "How do I get access after I buy?", a: "Your purchase lands in **Account → My purchases** in the top-right menu. You'll get a private GitHub collaborator invite." },
  { q: "Can I use it in client work?", a: "Yes — unlimited use in projects you build. Don't redistribute the source." },
  { q: "Lifetime updates — how does that work?", a: "You keep repo access forever; improvements ship as commits you can pull when ready." },
  { q: "What if I get stuck?", a: "Every product has a Setup checklist. Email support@summoniq.com for help. Paid 1-on-1 implementation available — book via /contact." },
  { q: "Refund policy?", a: "14 days, email us and we'll make it right." },
];

async function main() {
  const storefront = await db.storefront.findUnique({ where: { slug: "summoniq" } });
  if (!storefront) { console.error("storefront 'summoniq' not found"); process.exit(1); }

  for (const app of APPS) {
    let product = await db.product.findFirst({ where: { storefrontId: storefront.id, slug: app.slug } });
    const data = {
      name: app.name, tagline: app.tagline, description: app.description, longDescription: app.longDescription,
      category: "apps", badge: app.badge ?? null, stack: app.stack, active: true,
      demoUrl: app.demoUrl ?? null,
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
      if (!block) { console.log(`    ⨯ unknown setup block "${key}"`); continue; }
      const step = await db.setupStep.create({
        data: { productId: product.id, title: block.title, description: block.description ?? null, category: block.category ?? null, position: i, required: block.required ?? true, helpUrl: block.helpUrl ?? null },
      });
      if (block.inputs.length) {
        await db.setupInput.createMany({
          data: block.inputs.map((inp, j) => ({
            setupStepId: step.id, key: inp.key, label: inp.label, description: inp.description ?? null,
            inputType: (inp.inputType ?? "TEXT") as any,
            placeholder: inp.placeholder ?? null, helpUrl: inp.helpUrl ?? null,
            required: inp.required ?? true, choices: [], position: j,
          })),
        });
      }
    }
  }

  console.log(`\nDone. ${APPS.length} project-based apps seeded.`);

  // Print the scaffold commands for convenience
  console.log(`\nTo scaffold repos:`);
  for (const app of APPS) {
    console.log(`  npx tsx scripts/scaffold-product-repo.ts ${app.slug} --template ${app.template}`);
  }

  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
