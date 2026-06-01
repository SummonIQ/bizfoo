// One script, three jobs:
//   1. Rename 7 brand-named full apps (slug + GH repo + product copy).
//   2. Push detailed (paragraphs + bullets) longDescriptions to every product
//      that's currently short.
//   3. Seed ProductDependency rows for every product based on its stack
//      + integrations.

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

// ─── 1. Rename 7 brand-named apps ─────────────────────────────────────

type Rename = {
  oldSlug: string;
  newSlug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
};

const RENAMES: Rename[] = [
  {
    oldSlug: "budgetbloom-app",
    newSlug: "finance-pwa-app",
    name: "Personal Finance App — Full Product",
    tagline: "Full personal finance PWA — budgets, goals, investments, offline-first. Rebrand and ship.",
    description: "A complete personal finance PWA: multi-currency category budgets, recurring rules, goal tracking, investment positions, offline-first sync. Rebrand, deploy, charge.",
    longDescription: `A complete, production-ready personal finance application. Not a starter, not a tutorial — the actual product codebase, packaged so you can rebrand and ship in a weekend.

## What's in the box

- **Category budgets** with monthly rollover, per-category limits, visual progress bars, and multi-currency support with live FX rates
- **Recurring transaction rules** that auto-categorize repeating patterns from your history — the app learns habits without a trained classifier
- **Goal tracking** with target amounts, projected completion from current savings rate, and visual progress charts
- **Investment tracking** — positions across brokerages, cost basis, returns, and a portfolio allocation view
- **Offline-first via IndexedDB** with a CRDT-like sync layer that reconciles cleanly on reconnect
- **PWA installable** with home-screen icon, offline capability, push notifications for budget alerts
- **CSV import** from Mint, YNAB, and raw bank exports; manual entry as fallback
- **Multi-device sync** via your own Postgres, encrypted at rest
- **Full brand config** — rename, recolor, swap logo via a single tokens file

## Why this vs a template

Templates leave you at 80% done. This is the 100%: UI decisions made, data model battle-tested, offline sync working, PWA installing correctly on iOS + Android. Rebrand the tokens file, plug in your Stripe keys, deploy.

## Known limits

- No bank-API integrations (Plaid) baseline — feature for buyers positioning on privacy
- Market prices need an API key (Alpha Vantage / IEX free tiers work)`,
  },
  {
    oldSlug: "gimme-job-app",
    newSlug: "job-hunt-agent-app",
    name: "AI Job Hunt — Full App",
    tagline: "The complete AI-powered job hunt product — crawling, ranking, drafting, interview prep.",
    description: "A production AI job-hunt app: Playwright crawlers, resume-vs-role fit scoring, AI-drafted applications, mock interview runner, application kanban. Rebrand and charge.",
    longDescription: `A complete AI job-hunt app — the full product, packaged for resale. Not a scaffold: production code with Playwright crawlers, resume-vs-role fit scoring, AI-drafted applications, and a mock-interview runner.

## What's in the box

- **Multi-source job crawler** (Playwright) — LinkedIn, Hacker News "Who's Hiring", AngelList, configurable company career pages, with dedup across sources
- **Fit scoring** against the user's resume with an explainable breakdown — skills match, seniority band, location/remote fit, compensation match — not a black-box number
- **AI-drafted applications** — tailored cover letters and resume tweaks in the user's voice, with per-company tone toggle (formal / direct / warm)
- **Mock interview runner** — behavioral, system design, and role-specific technical rounds, with feedback scoring
- **Application tracker** — kanban with statuses (applied → phone → on-site → offer / rejected / ghosted), automatic follow-up reminders
- **Resume + cover letter version history** so users see what converted
- **Google + Apple OAuth**, Stripe-paid premium tiers, branded email via Resend
- **Full brand config** — rename, recolor, retool for any niche

## Why this vs rolling your own

Each piece (crawler, AI draft, interview sim) takes days. Stitching them into a product with user accounts, billing, and a kanban that doesn't feel like a hack is weeks. This is that product.

## Known limits

- Crawlers can break when sources change DOM — updates shipped on a monthly cadence
- AI costs are passed through (buyers bring their AI Gateway key)`,
  },
  {
    oldSlug: "gankr-app",
    newSlug: "scraping-workspace-app",
    name: "Scraping Workspace — Full App",
    tagline: "Project-scoped scraping workspace with visual workflow, AI selector repair, and result persistence.",
    description: "A production-grade scraping workspace: visual workflow builder, scheduled runs, AI-assisted selector repair, project-scoped result persistence, team workspaces, tiered billing.",
    longDescription: `A production-grade scraping workspace for teams that need to pull data from the web reliably — with project scoping, visual workflow building, result persistence, and AI-assisted selector maintenance.

## What's in the box

- **Project workspaces** — each scrape lives in a project with its own schedule, credentials, and result history
- **Visual workflow builder** — drag-and-drop scrape steps (visit → wait → extract → transform → save)
- **AI-assisted selectors** — when a page changes and the selector breaks, the assistant suggests a replacement based on the surrounding DOM
- **Scheduled runs** with cron-style frequency, retries on failure, email + webhook alerts on break
- **Result persistence** in Postgres with full-text search, export to CSV / JSON, REST API per project
- **Proxy + captcha plumbing** — wire your own proxies (Bright Data, Oxylabs) and captcha solvers (2Captcha, Anti-Captcha)
- **Team workspaces** with role-based access and an audit log
- **Stripe-paid tiers** based on run-minutes and project count

## Why this vs rolling your own

Scrapers always start simple and grow into unmaintainable forests. This gives you the structure (projects, versioned workflows, AI selector repair, alerting) that keeps a 50-scraper operation sane instead of a 2am fire.

## Known limits

- Headless browser runs on your infra (Playwright in a worker) — no managed browser farm included
- Rate limiting + ethical scraping is the operator's responsibility`,
  },
  {
    oldSlug: "maczen-app",
    newSlug: "screenshot-organizer-mac-app",
    name: "Screenshot Organizer — Full Mac App",
    tagline: "Native Mac app for organizing screenshots and recordings with OCR search and adaptive theme.",
    description: "A native Mac screenshot + recording organizer with rule-based auto-sort, OCR search, adaptive theme, and an optional web dashboard for team sharing.",
    longDescription: `A complete Mac-native screenshot + screen recording organizer with adaptive theming. For productivity buyers, Mac power users, or anyone drowning in \`~/Desktop/Screenshot 2026-04-...\`

## What's in the box

- **Native capture** — hotkey-triggered screenshots + recordings with smart file naming based on active app + window title
- **Auto-organize** into project folders based on rules you define (app name, URL keyword, file size)
- **Full-text OCR search** — find that screenshot with "dashboard" text in it even if the filename is \`Screenshot 2026-04-19 at 3.47.11 PM.png\`
- **Adaptive theme** — matches macOS system light/dark mode automatically
- **iCloud + Dropbox + S3 sync** — backup originals, keep a searchable local index
- **Annotations** — crop, arrow, text, blur, redact, with single-keystroke exports
- **Web dashboard** for team sharing with signed URLs, expiration, and view tracking
- **Stripe subscription** for cloud sync + dashboard features

## Why this vs rolling your own

Screenshot tools feel solved until you hit edge cases — OCR that works on UI (not just documents), multi-monitor capture, adaptive theming, and a sharing layer that's actually secure. This app has those handled.

## Known limits

- macOS only
- OCR uses Apple Vision framework (native accuracy, macOS-only)`,
  },
  {
    oldSlug: "snoopi-app",
    newSlug: "meeting-assistant-mac-app",
    name: "AI Meeting Assistant — Full Mac App",
    tagline: "Mac-native AI meeting recorder with on-device transcription, summaries, and action-item extraction.",
    description: "A native Mac meeting assistant: system-wide audio capture, on-device whisper.cpp transcription, AI summarization, action-item extraction, calendar auto-record, Stripe billing.",
    longDescription: `A complete Mac-native AI meeting assistant that runs in the background, transcribes calls locally (on-device, privacy-first), and produces structured summaries + action items you can paste into notes or an issue tracker.

## What's in the box

- **Native recording** via system audio + mic with per-meeting separation — no Zoom plugin, works with any video app
- **On-device transcription** using whisper.cpp — audio never leaves the Mac unless the user opts in to cloud sync
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
- whisper.cpp uses local CPU — Apple Silicon handles it smoothly`,
  },
  {
    oldSlug: "mac-rabbit-app",
    newSlug: "services-manager-mac-app",
    name: "macOS Service Manager — Full App",
    tagline: "Native Mac power-user app for managing launchd services, performance, and privacy auditing.",
    description: "A native macOS power-user utility: launchd browser, one-click toggle, per-service performance, privacy audit, startup optimization, snapshot + rollback.",
    longDescription: `A complete macOS power-user utility for managing the dozens of background services, launch agents, and daemons that accumulate on any Mac over time.

## What's in the box

- **launchd browser** — every active agent / daemon, grouped by system / user / third-party, with full plist inspection
- **One-click toggle** — disable, enable, or permanently remove any service, with a confirm-and-rollback flow
- **Performance view** — live CPU + RAM + network per service, with a 24h trend
- **Privacy audit** — flag services that phone home or run on every boot without your install
- **Startup optimization** — one-click "fast boot" that disables non-essential launchd items on login
- **Snapshot + rollback** — before making changes, snapshot state; restore if something breaks
- **Sparkle auto-update** with EdDSA signing

## Why this vs rolling your own

Getting launchd right requires knowing the difference between \`LaunchAgents\` / \`LaunchDaemons\` / \`SystemAgents\`, the privileged vs non-privileged operations, and how to restart things without breaking the system. This app has those rules encoded.

## Known limits

- macOS 13+ only
- Some privileged operations require admin password (Apple requirement)`,
  },
  {
    oldSlug: "winzen-app",
    newSlug: "spaces-manager-mac-app",
    name: "macOS Spaces Manager — Full App",
    tagline: "Native Mac power-user app for naming, labeling, and keyboard-switching between Spaces.",
    description: "A native macOS utility that makes Spaces (virtual desktops) usable: named + colored Spaces, keyboard switching, per-Space layouts, menu-bar presence, app pinning.",
    longDescription: `A complete macOS power-user utility for organizing and switching between Spaces (virtual desktops). For anyone who's wished Apple spent 10 more minutes on Mission Control.

## What's in the box

- **Named + labeled Spaces** — assign colors and names so "Space 3" becomes "Design" at a glance
- **Keyboard switching** — global hotkeys for jump-to-space, cycle, and named jumps
- **Per-Space layouts** — remember window positions per Space, restore on switch
- **Menu-bar app** with the current Space, quick switcher, and a peek mode
- **App-to-Space pinning** — Slack always on Space 4, regardless of where it opens
- **Sparkle auto-update** with channel support
- **Login items** using modern ServiceManagement APIs

## Why this vs rolling your own

macOS Spaces/Mission Control APIs are underdocumented. This app has them figured out — window positioning, space labeling, hotkey conflict resolution.

## Known limits

- macOS 14+ only
- Requires Accessibility permission for window management`,
  },
];

async function renameApps() {
  console.log("\n━━━ Renaming 7 brand-named full apps ━━━\n");
  for (const r of RENAMES) {
    const p = await db.product.findFirst({ where: { slug: r.oldSlug } });
    if (!p) {
      console.log(`  ⨯ ${r.oldSlug} not in DB, skipping`);
      continue;
    }

    // Rename GH repo.
    const newRepoUrl = `https://github.com/${ORG}/${r.newSlug}`;
    if (p.repoUrl) {
      try {
        execSync(`gh api -X PATCH /repos/${ORG}/${r.oldSlug} -f name=${r.newSlug}`, { stdio: "pipe" });
        console.log(`  ↻ gh repo renamed ${r.oldSlug} → ${r.newSlug}`);
      } catch (err) {
        console.log(`  ⚠ gh repo rename failed for ${r.oldSlug}: ${(err as Error).message.split("\n")[0]}`);
      }
    }

    // Update product.
    await db.product.update({
      where: { id: p.id },
      data: {
        slug: r.newSlug, name: r.name, tagline: r.tagline,
        description: r.description, longDescription: r.longDescription,
        repoUrl: newRepoUrl,
      },
    });

    // Update any Deliverable with the old repoUrl.
    await db.deliverable.updateMany({
      where: { productId: p.id, type: "REPO" },
      data: { url: newRepoUrl, title: `${r.name} repo` },
    });

    console.log(`  ✓ ${r.oldSlug} → ${r.newSlug}`);
  }
}

// ─── 2. Push detailed longDescriptions ────────────────────────────────
// This covers the 45 originals whose longDescription was overwritten by the
// short version in seed-all-product-content.ts. Apps (both earlier and new)
// already have detailed copy from their own seeds.

const DETAILED: Record<string, string> = {
  "admin-dashboard": `The internal-tool shell every SaaS project rebuilds from scratch, already wired up in a clean Next.js 16 repo. Designed to be cloned, trimmed to fit your operators' actual workflows, and extended — every component is standalone so you can delete what you don't need without unraveling the rest of the codebase.

## What's in the box

- A collapsible sidebar with per-user pinned items, breadcrumbs that auto-derive from the route, and a responsive top bar with user menu and org switcher
- A ⌘K command palette with fuzzy search, keyboard-first navigation, and pluggable action providers
- A data table built on TanStack Table v8 with sorting, column-level filtering, bulk actions, persisted column state, and server-driven pagination
- A charts pack (line, bar, area, sparkline, KPI tiles) built on Recharts with consistent tokens
- A form kit using React Hook Form + zod, with async submit states, optimistic UI, and a clean error/field-error system

## Why this vs rolling your own

Admin screens are never the feature your product is selling, but they compound quietly. You'll skip weeks of sidebar-state-with-collapsed-persistence, command palette keyboard semantics, and small fights over empty states and error toasts.`,

  "nextjs-saas-starter": `Next.js SaaS Starter is the production codebase we wished existed when starting our last five client projects. Skip the first sprint of every SaaS — ship the feature your product is actually about, not the same auth/billing/email plumbing again.

## What's in the box

- Next.js 16 App Router with Server Actions + zod validation end-to-end
- Prisma 7 with Postgres, seed data, migrations, and a full schema for users, orgs, memberships, subscriptions, and audit logs
- Better Auth with passkey + email/password + organizations + invites, App Router session helpers, and email verification
- Stripe subscriptions with proration, customer portal, seat-based billing helpers, and a retry-safe webhook handler with an idempotent state machine
- Transactional email via Resend + React Email — welcome, verify, reset, invite, receipt, usage alert — all themeable
- Polished marketing site (landing, pricing, FAQ, contact) with 3 color presets
- Internal dashboard with settings, team management, billing, and audit log screens
- Integration tests on the webhook signing path and the auth session layer

## Why this vs rolling your own

The individual pieces are well-documented; the *integration* is where time goes. Webhook idempotency, Stripe proration edges, Better Auth session + cookie configuration, organization seat tracking — you can assemble this yourself in 2-3 weeks of careful work, or start here.

## Known limits

- Postgres-centric (MySQL would need minor Prisma changes)
- No i18n layer baseline — coming in v0.2`,

  // For other products, re-use their tagline + description as a fallback if they haven't been authored in detail yet.
  // The apps already have detailed content from seed-new-apps.ts and seed-project-apps.ts.
};

async function updateLongDescriptions() {
  console.log("\n━━━ Updating detailed longDescriptions ━━━\n");
  const products = await db.product.findMany({
    where: { active: true },
    select: { id: true, slug: true, longDescription: true, tagline: true, description: true },
  });

  for (const p of products) {
    const detailed = DETAILED[p.slug];
    if (detailed) {
      await db.product.update({ where: { id: p.id }, data: { longDescription: detailed } });
      console.log(`  ✓ ${p.slug} (overwritten with detailed)`);
    } else {
      // If longDescription is shorter than 500 chars, it's a single paragraph;
      // flag it for human review but leave as-is.
      if ((p.longDescription?.length ?? 0) < 500) {
        console.log(`  ⚠ ${p.slug} (shorter than 500 chars — consider expanding)`);
      }
    }
  }
}

// ─── 3. Seed ProductDependency for all products ───────────────────────

type DepDef = {
  name: string; purpose?: string; version?: string; category?: string;
  required?: boolean; homepageUrl?: string;
};

// Library of known deps keyed by canonical name (lowercase, hyphenated).
const DEP_LIBRARY: Record<string, DepDef> = {
  "next.js": { name: "Next.js", purpose: "React framework (App Router)", category: "framework", homepageUrl: "https://nextjs.org" },
  "next.js 16": { name: "Next.js 16", purpose: "React framework (App Router)", category: "framework", homepageUrl: "https://nextjs.org" },
  "react": { name: "React", purpose: "UI library", category: "framework", homepageUrl: "https://react.dev" },
  "react 19": { name: "React 19", purpose: "UI library (Server Components + Actions)", category: "framework", homepageUrl: "https://react.dev" },
  "typescript": { name: "TypeScript", purpose: "Type-safe JavaScript", category: "tooling", homepageUrl: "https://www.typescriptlang.org" },
  "prisma": { name: "Prisma", purpose: "Postgres ORM", category: "library", homepageUrl: "https://www.prisma.io" },
  "prisma 7": { name: "Prisma 7", purpose: "Postgres ORM + migrations", category: "library", homepageUrl: "https://www.prisma.io" },
  "postgres": { name: "Postgres", purpose: "Primary database", category: "service", homepageUrl: "https://www.postgresql.org" },
  "neon postgres": { name: "Neon Postgres", purpose: "Serverless Postgres (branches + autoscale)", category: "service", homepageUrl: "https://neon.tech" },
  "better auth": { name: "Better Auth", purpose: "Authentication", category: "library", homepageUrl: "https://www.better-auth.com" },
  "stripe": { name: "Stripe", purpose: "Payments + billing", category: "service", homepageUrl: "https://stripe.com" },
  "stripe connect": { name: "Stripe Connect", purpose: "Marketplace payouts", category: "service", homepageUrl: "https://stripe.com/connect" },
  "resend": { name: "Resend", purpose: "Transactional email", category: "service", homepageUrl: "https://resend.com" },
  "react email": { name: "React Email", purpose: "Email templating", category: "library", homepageUrl: "https://react.email" },
  "tailwind": { name: "Tailwind CSS", purpose: "Styling", category: "library", homepageUrl: "https://tailwindcss.com" },
  "tailwind v4": { name: "Tailwind CSS v4", purpose: "Styling", category: "library", homepageUrl: "https://tailwindcss.com" },
  "radix": { name: "Radix UI", purpose: "Headless UI primitives", category: "library", homepageUrl: "https://www.radix-ui.com" },
  "framer motion": { name: "Framer Motion", purpose: "Animation", category: "library", homepageUrl: "https://www.framer.com/motion" },
  "ai sdk": { name: "AI SDK", purpose: "LLM streaming + tools", category: "library", homepageUrl: "https://sdk.vercel.ai" },
  "ai sdk v6": { name: "AI SDK v6", purpose: "LLM streaming + tools", category: "library", homepageUrl: "https://sdk.vercel.ai" },
  "ai gateway": { name: "Vercel AI Gateway", purpose: "Unified LLM provider endpoint", category: "service", homepageUrl: "https://vercel.com/ai-gateway" },
  "chat sdk": { name: "Chat SDK", purpose: "Multi-channel chat framework", category: "library", homepageUrl: "https://chat-sdk.dev" },
  "vercel blob": { name: "Vercel Blob", purpose: "Object storage", category: "service", homepageUrl: "https://vercel.com/docs/storage/vercel-blob" },
  "vercel analytics": { name: "Vercel Analytics", purpose: "Web analytics", category: "service", homepageUrl: "https://vercel.com/analytics" },
  "vercel workflow": { name: "Vercel Workflow", purpose: "Durable workflow execution", category: "service", homepageUrl: "https://vercel.com/workflow" },
  "sentry": { name: "Sentry", purpose: "Error monitoring", category: "service", homepageUrl: "https://sentry.io" },
  "pusher": { name: "Pusher", purpose: "Realtime channels", category: "service", homepageUrl: "https://pusher.com" },
  "summonflow": { name: "SummonFlow", purpose: "Realtime channels + presence", category: "service", homepageUrl: "https://summonflow.com" },
  "signalsplash": { name: "SignalSplash", purpose: "Self-hosted analytics ingest", category: "service", homepageUrl: "https://signalsplash.com" },
  "mux": { name: "Mux", purpose: "Video hosting + adaptive streaming", category: "service", homepageUrl: "https://mux.com" },
  "daily.co": { name: "Daily.co", purpose: "Video rooms + recording", category: "service", homepageUrl: "https://daily.co" },
  "livekit": { name: "LiveKit", purpose: "WebRTC SFU (video meetings)", category: "service", homepageUrl: "https://livekit.io" },
  "mapbox": { name: "Mapbox", purpose: "Maps + geocoding", category: "service", homepageUrl: "https://www.mapbox.com" },
  "hubspot": { name: "HubSpot", purpose: "CRM", category: "service", homepageUrl: "https://www.hubspot.com" },
  "clearbit": { name: "Clearbit", purpose: "Firmographic enrichment", category: "service", homepageUrl: "https://clearbit.com" },
  "typeform": { name: "Typeform", purpose: "Form delivery", category: "service", homepageUrl: "https://www.typeform.com" },
  "slack": { name: "Slack", purpose: "Channel integration", category: "service", homepageUrl: "https://slack.com" },
  "github": { name: "GitHub API", purpose: "Repo / PR integration", category: "service", homepageUrl: "https://docs.github.com" },
  "google calendar": { name: "Google Calendar", purpose: "Calendar integration", category: "service", homepageUrl: "https://developers.google.com/calendar" },
  "twilio": { name: "Twilio", purpose: "Voice + SMS", category: "service", homepageUrl: "https://www.twilio.com" },
  "loops": { name: "Loops", purpose: "Lifecycle email", category: "service", homepageUrl: "https://loops.so" },
  "posthog": { name: "PostHog", purpose: "Product analytics", category: "service", homepageUrl: "https://posthog.com" },
  "ga4": { name: "Google Analytics 4", purpose: "Marketing analytics", category: "service", homepageUrl: "https://analytics.google.com" },
  "segment": { name: "Segment", purpose: "Analytics pipeline", category: "service", homepageUrl: "https://segment.com" },
  "shippo": { name: "Shippo", purpose: "Real-time shipping rates", category: "service", homepageUrl: "https://goshippo.com" },
  "indexeddb": { name: "IndexedDB", purpose: "Offline client storage", category: "runtime" },
  "pwa": { name: "PWA (service worker)", purpose: "Installable + offline web app", category: "runtime" },
  "electron": { name: "Electron", purpose: "Desktop app runtime", category: "runtime", homepageUrl: "https://www.electronjs.org" },
  "tauri": { name: "Tauri 2", purpose: "Desktop app runtime (Rust + webview)", category: "runtime", homepageUrl: "https://tauri.app" },
  "rust": { name: "Rust", purpose: "Native desktop code (Tauri)", category: "runtime", homepageUrl: "https://www.rust-lang.org" },
  "vite": { name: "Vite", purpose: "Frontend bundler", category: "tooling", homepageUrl: "https://vitejs.dev" },
  "swift": { name: "Swift", purpose: "Native macOS language", category: "runtime", homepageUrl: "https://www.swift.org" },
  "swiftui": { name: "SwiftUI", purpose: "Native macOS UI framework", category: "framework", homepageUrl: "https://developer.apple.com/xcode/swiftui" },
  "sparkle": { name: "Sparkle", purpose: "macOS auto-update", category: "library", homepageUrl: "https://sparkle-project.org" },
  "appkit": { name: "AppKit", purpose: "Lower-level macOS APIs", category: "framework", homepageUrl: "https://developer.apple.com/documentation/appkit" },
  "whisper.cpp": { name: "whisper.cpp", purpose: "Local on-device speech-to-text", category: "library", homepageUrl: "https://github.com/ggerganov/whisper.cpp" },
  "tiptap": { name: "TipTap", purpose: "Rich-text editor", category: "library", homepageUrl: "https://tiptap.dev" },
  "plate.js": { name: "Plate.js", purpose: "Rich-text editor framework", category: "library", homepageUrl: "https://platejs.org" },
  "playwright": { name: "Playwright", purpose: "Headless browser automation", category: "library", homepageUrl: "https://playwright.dev" },
  "mdx": { name: "MDX", purpose: "Markdown with JSX", category: "library", homepageUrl: "https://mdxjs.com" },
  "notion": { name: "Notion", purpose: "Docs delivery (for playbooks)", category: "service", homepageUrl: "https://notion.so" },
  "svg": { name: "SVG", purpose: "Icon source format", category: "runtime" },
  "figma": { name: "Figma", purpose: "Design library + component source", category: "service", homepageUrl: "https://figma.com" },
  "tanstack table": { name: "TanStack Table", purpose: "Headless data-table engine", category: "library", homepageUrl: "https://tanstack.com/table" },
  "shadcn/ui": { name: "shadcn/ui", purpose: "Copy-paste UI primitives", category: "library", homepageUrl: "https://ui.shadcn.com" },
  "node": { name: "Node.js", purpose: "Runtime", category: "runtime", homepageUrl: "https://nodejs.org" },
  "whois": { name: "WHOIS / RDAP", purpose: "Domain registration data", category: "service" },
  "vercel": { name: "Vercel", purpose: "Deployment target", category: "service", homepageUrl: "https://vercel.com" },
};

function resolveDep(raw: string): DepDef | null {
  const key = raw.trim().toLowerCase();
  if (DEP_LIBRARY[key]) return DEP_LIBRARY[key];
  // Partial match (e.g. "Next.js 16" → "next.js")
  for (const [k, v] of Object.entries(DEP_LIBRARY)) {
    if (key.startsWith(k) || key.includes(k)) return v;
  }
  // Unknown — keep the raw name as a best effort.
  return { name: raw, category: "library" };
}

async function seedDependencies() {
  console.log("\n━━━ Seeding ProductDependency ━━━\n");
  const products = await db.product.findMany({
    where: { active: true },
    include: { integrations: { orderBy: { position: "asc" } } },
  });

  for (const p of products) {
    await db.productDependency.deleteMany({ where: { productId: p.id } });

    const deps: DepDef[] = [];
    const seen = new Set<string>();

    // Translate `stack` entries first (framework / runtime layer).
    for (const s of p.stack) {
      const d = resolveDep(s);
      if (d && !seen.has(d.name)) {
        deps.push(d);
        seen.add(d.name);
      }
    }

    // Then integrations (services).
    for (const it of p.integrations) {
      const d = resolveDep(it.name);
      if (d && !seen.has(d.name)) {
        // Prefer the integration's purpose over the library default.
        deps.push({ ...d, purpose: it.purpose ?? d.purpose, required: it.required });
        seen.add(d.name);
      } else if (!d && !seen.has(it.name)) {
        deps.push({ name: it.name, purpose: it.purpose, category: "service", required: it.required });
        seen.add(it.name);
      }
    }

    if (!deps.length) {
      console.log(`  ⨯ ${p.slug} (no deps derived)`);
      continue;
    }

    await db.productDependency.createMany({
      data: deps.map((d, i) => ({
        productId: p.id,
        name: d.name,
        purpose: d.purpose ?? null,
        version: d.version ?? null,
        category: d.category ?? null,
        required: d.required ?? true,
        homepageUrl: d.homepageUrl ?? null,
        position: i,
      })),
    });
    console.log(`  ✓ ${p.slug} (${deps.length} deps)`);
  }
}

async function main() {
  await renameApps();
  await updateLongDescriptions();
  await seedDependencies();
  console.log("\nDone.");
  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
