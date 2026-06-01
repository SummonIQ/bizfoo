// Master storefront-content seed. Authoritative source for every product's
// long description, features, integrations, assets, how-it-works steps,
// faqs, highlight stats, code sample, and related slugs.
//
// Idempotent: for each product we wipe its six child-tables and re-insert.
// Safe to re-run after editing this file.

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

type ProductContent = {
  longDescription: string;
  relatedSlugs?: string[];
  codeSample?: { lang: string; filename?: string; code: string };
  features?: Array<{ icon?: string; title: string; desc: string }>;
  integrations?: Array<{ name: string; purpose: string; required?: boolean }>;
  assets?: Array<{ label: string; detail: string }>;
  howItWorks?: Array<{ title: string; desc: string }>;
  faqs?: Array<{ q: string; a: string }>;
  highlights?: Array<{ value: string; label: string }>;
};

const DEFAULT_HOW = [
  { title: "Buy + clone", desc: "Get an invite to a private GitHub repo with the source." },
  { title: "Drop in your branding", desc: "Tokens, logo, copy, fonts — all centralized." },
  { title: "Deploy", desc: "Vercel-ready. One click and you're live." },
];

// Mirrors scripts/seed-build-plans.ts so a freshly-created plan from
// inside this content seeder gets the same shape.
const SPEC_MILESTONES = [
  { title: "Lock the spec", estimateHours: 2, description: "Problem, audience, outcome, in/out of scope." },
  { title: "Scaffold the repo", estimateHours: 1, description: "Create GH repo, README, CI pipeline." },
  { title: "Stand up the core flow", estimateHours: 12, description: "Happy path end-to-end with stub data." },
  { title: "Wire real integrations", estimateHours: 8, description: "Stripe, auth, DB, third parties." },
  { title: "Polish UI + brand", estimateHours: 6, description: "Marketing assets, copy, visuals." },
  { title: "Write setup docs", estimateHours: 3, description: "README + getting-started checklist + .env.example." },
  { title: "Cut v0.1 release", estimateHours: 1, description: "Tag, draft release notes, sync to bizfoo." },
];

const DEFAULT_FAQS = [
  { q: "How do I get the source code?", a: "Right after checkout you get an invite to a private GitHub repo with the code, plus the setup docs." },
  { q: "Can I use it in client work?", a: "Yes — your license is unlimited for projects you build (yours or your clients'). Just don't redistribute the source." },
  { q: "What does 'lifetime updates' mean?", a: "Every framework upgrade, security patch, and feature improvement we ship goes to you for free, forever." },
  { q: "Refund policy?", a: "If it doesn't fit your project, email us within 14 days and we'll make it right." },
];

const CONTENT: Record<string, ProductContent> = {
  "admin-dashboard": {
    longDescription:
      "A polished internal-tool shell with everything an admin screen actually needs: sidebar nav, command palette, data tables with filtering and bulk actions, role-aware controls, audit log, and a charts starter pack — all typed and themed so you can plug in real data the same day you clone. Built so common admin workflows (search, filter, bulk update, export, audit) ship out of the box and you spend your time on domain logic.",
    features: [
      { icon: "Layers", title: "Sidebar + command palette", desc: "Collapsible sidebar, ⌘K palette, breadcrumbs, and keyboard shortcuts baked in across every page." },
      { icon: "Database", title: "Data tables", desc: "Sorting, filtering, bulk actions, persisted column state, and server-driven pagination on the included data-table kit." },
      { icon: "LineChart", title: "Charts pack", desc: "Line, bar, area, sparkline, and KPI tiles tuned for dense dashboards with sane axis defaults." },
      { icon: "Users", title: "Role-aware UI", desc: "Hide and disable controls by role from a single permission helper — no ternaries or copy-pasted gates in components." },
      { icon: "Activity", title: "Audit log + impersonation", desc: "Append-only audit log for privileged actions and a support-impersonation flow with banner and rollback." },
    ],
    integrations: [
      { name: "Next.js App Router", purpose: "Server-component dashboard with route segments per surface", required: true },
      { name: "Tailwind CSS", purpose: "Token-driven theming and dark-first defaults", required: true },
      { name: "Better Auth", purpose: "Sessions, organizations, role gating, and impersonation" },
      { name: "Postgres", purpose: "Audit log and bulk-action ledger" },
    ],
    assets: [
      { label: "Dashboard shell", detail: "Sidebar, top bar, command palette, and breadcrumb nav with keyboard-first navigation" },
      { label: "Table kit", detail: "Column presets, filter chips, bulk-action toolbar, empty states, and URL-synced state" },
      { label: "Charts pack", detail: "Line, bar, area, sparkline, and KPI tiles tuned for dense dashboards" },
      { label: "Form kit", detail: "Zod-validated form panels with async submit states and inline error handling" },
      { label: "Audit + impersonation", detail: "Append-only audit log, support-impersonation flow with banner, and rollback affordance" },
    ],
    howItWorks: [
      { title: "Drop in the shell", desc: "Clone, set your brand tokens, and get a working sidebar, command palette, and breadcrumb nav out of the box." },
      { title: "Plug in real data", desc: "Use the typed table and form kits with your existing data layer — bulk actions, filters, and pagination already wired." },
      { title: "Turn on audit + roles", desc: "Enable the role helper and audit log so privileged work is gated and reconstructable from day one." },
    ],
    highlights: [
      { value: "5 surfaces", label: "shell, tables, charts, forms, audit" },
      { value: "role-aware", label: "single permission helper instead of ternaries" },
      { value: "audit-ready", label: "every privileged action logged" },
    ],
    relatedSlugs: ["dashboard-design-kit", "data-table-kit", "landing-blocks-pack"],
  },

  "ai-chat-boilerplate": {
    longDescription:
      "A multi-model chat UI that does not lock you in. Built on AI SDK v6 through the Vercel AI Gateway, with first-class tool calling, structured output, per-user conversation history, MCP-ready tool registry, and the streaming UI patterns you would otherwise rebuild from scratch. The boilerplate that gets you from 'we want to add chat' to a working production-grade surface in days, not months.",
    features: [
      { icon: "Workflow", title: "Multi-model routing", desc: "Switch between Claude, GPT, Gemini, and Grok per conversation or via fallback chains with automatic provider failover." },
      { icon: "Wand2", title: "Tool calling", desc: "Typed tools with schema validation, streamed results, and a small registry pattern that scales past two tools." },
      { icon: "Layers", title: "Structured output", desc: "Zod-validated JSON output with retry on schema mismatch and explainable errors when generation drifts." },
      { icon: "Users", title: "Per-user threads", desc: "Persistent conversation history with title generation, full-text search, pinning, and shareable read-only links." },
      { icon: "Plug", title: "MCP support", desc: "Connect Model Context Protocol servers as tools so your agent can talk to your existing tools and data sources." },
      { icon: "Sparkles", title: "Streaming UI patterns", desc: "Token streaming, progressive rendering, tool-call status, and graceful interrupt — without re-implementing the SSE plumbing." },
    ],
    integrations: [
      { name: "Vercel AI Gateway", purpose: "Single endpoint for every model provider with cost tracking and zero data retention", required: true },
      { name: "AI SDK v6", purpose: "Streaming, tool calls, structured output, and unified provider interface", required: true },
      { name: "Postgres", purpose: "Per-user thread, message, and tool-call history" },
      { name: "Better Auth", purpose: "Per-user identity for thread ownership and shareable links" },
      { name: "MCP", purpose: "Optional Model Context Protocol server integration as tools" },
    ],
    assets: [
      { label: "Chat UI shell", detail: "Composer, message list, thread sidebar, model selector, and tool-call status surface" },
      { label: "Multi-model router", detail: "Per-conversation model selection plus fallback-chain configuration" },
      { label: "Tool registry", detail: "Typed tool definitions, schema validation, streamed results, and an MCP adapter" },
      { label: "Persistence layer", detail: "Thread, message, tool-call, and attribution schemas with Postgres adapter" },
      { label: "Sharing + history", detail: "Title generation, full-text search, pinning, and shareable read-only thread links" },
    ],
    howItWorks: [
      { title: "Clone and configure", desc: "Set your AI Gateway key, pick the models you want enabled, and the chat UI works on first run." },
      { title: "Add tools", desc: "Use the typed tool registry to add functions your agent can call — schema validation and streaming are already wired." },
      { title: "Ship with persistence", desc: "Turn on per-user threads and shareable links so conversations survive reloads and can be referenced later." },
    ],
    highlights: [
      { value: "4+ models", label: "claude, gpt, gemini, grok with fallbacks" },
      { value: "MCP-ready", label: "model context protocol tools out of the box" },
      { value: "shareable", label: "threads with read-only links and search" },
    ],
    relatedSlugs: ["chat-agent-platform", "multi-tenant-b2b"],
  },

  "ai-sales-agent": {
    longDescription:
      "An outbound and inbound sales agent that actually closes loops. Voice-capable via Twilio, writes call summaries directly into your CRM, qualifies leads against a customizable rubric, and books meetings without making the prospect dance through a form. Includes a local eval harness so prompt changes are regression-tested before they reach production, and routing rules so high-fit leads go to humans instead of dying in the agent loop.",
    features: [
      { icon: "Users", title: "Voice + chat", desc: "Works over Twilio voice and embedded web chat with the same handler and playbook." },
      { icon: "Workflow", title: "Meeting booking", desc: "Checks rep availability and books on the spot — no back-and-forth, no form." },
      { icon: "Database", title: "CRM sync", desc: "Writes enriched leads, call summaries, and timeline events to HubSpot, Salesforce, or Pipedrive." },
      { icon: "Shield", title: "Local eval harness", desc: "Regression-test every prompt change against a fixture set so quality does not silently regress." },
      { icon: "Activity", title: "Human handoff", desc: "Routing rules escalate high-fit, high-intent prospects to a human rep instead of trapping them in the agent loop." },
    ],
    integrations: [
      { name: "Twilio", purpose: "Inbound and outbound voice with call recording and transcription", required: true },
      { name: "AI Gateway", purpose: "Model routing with provider fallbacks and per-call cost tracking", required: true },
      { name: "HubSpot", purpose: "Contact, deal, and activity sync with lifecycle updates" },
      { name: "Salesforce", purpose: "Account, contact, and opportunity sync via the Salesforce sync kit" },
      { name: "Pipedrive", purpose: "Person and deal sync for Pipedrive-first orgs" },
    ],
    assets: [
      { label: "Voice + chat handler", detail: "Single agent handler for Twilio voice and web chat with shared playbook and tools" },
      { label: "Lead qualification rubric", detail: "Customizable rubric for fit and intent scoring with explainable outputs" },
      { label: "Booking flow", detail: "Calendar-aware scheduling that books on the spot and writes back to the CRM" },
      { label: "CRM sync layer", detail: "Bi-directional sync to HubSpot, Salesforce, or Pipedrive with timeline events" },
      { label: "Eval harness", detail: "Fixture-based regression tests for prompts, tool calls, and routing decisions" },
    ],
    howItWorks: [
      { title: "Wire your channels", desc: "Connect Twilio for voice and the embedded chat widget for web — both run on the same handler." },
      { title: "Tune the rubric", desc: "Customize fit and intent scoring so the agent qualifies against your ICP, not a generic template." },
      { title: "Ship with eval coverage", desc: "Run the eval harness before each prompt or tool change so quality regressions surface in CI, not in production." },
    ],
    highlights: [
      { value: "voice + chat", label: "one handler across twilio and web" },
      { value: "CRM-native", label: "hubspot, salesforce, pipedrive sync" },
      { value: "eval-tested", label: "fixture-based regression suite" },
    ],
    relatedSlugs: ["lead-enrichment-agent", "chat-agent-platform", "hubspot-pipeline-sync", "salesforce-pipeline-sync"],
  },

  "analytics-wireup": {
    longDescription:
      "Sane analytics in an afternoon. Typed event helpers, tier-aware funnel definitions, UTM capture that survives the session all the way through to your CRM, server-side gating that respects consent, and a privacy banner that does not look like it was drawn by a lawyer. Built so that adding a new event is one typed call, your funnel definitions live in code instead of in dashboards, and PII never leaks into client-side trackers.",
    features: [
      { icon: "LineChart", title: "Typed event SDK", desc: "Autocomplete event names and properties — no more stringly-typed analytics or schema drift across teams." },
      { icon: "Workflow", title: "UTM + first-touch", desc: "First-touch attribution preserved through signup to Stripe to your CRM, surviving page reloads and OAuth bounces." },
      { icon: "Shield", title: "Privacy banner + gating", desc: "Minimal consent banner with category toggles and server-side gating so non-essential trackers are never loaded without consent." },
      { icon: "Layers", title: "Funnel definitions in code", desc: "Define funnels and conversions in TypeScript so they live with the product code, not buried in a dashboard." },
      { icon: "ShieldCheck", title: "PII safety", desc: "Server-side hashing, allowlisted properties, and a redaction layer that keeps personal data out of client-side trackers." },
    ],
    integrations: [
      { name: "PostHog", purpose: "Product analytics, funnels, and session replay", required: true },
      { name: "Google Analytics 4", purpose: "Marketing analytics and ad-platform integrations" },
      { name: "Segment", purpose: "Optional pass-through for downstream tools" },
      { name: "SignalSplash", purpose: "Self-hosted ingest if you want to keep data on your own infra" },
    ],
    assets: [
      { label: "Typed event SDK", detail: "Generated event-name and property types with helpers for client and server usage" },
      { label: "UTM + attribution layer", detail: "First-touch capture, persistence across reloads and OAuth bounces, and CRM-ready payloads" },
      { label: "Consent banner + gating", detail: "Category-aware consent UI plus server-side gating for non-essential trackers" },
      { label: "Funnel definitions", detail: "Code-defined funnels and conversions kept in sync with product changes" },
      { label: "PII redaction layer", detail: "Server-side hashing and allowlisted properties so personal data never leaks client-side" },
    ],
    howItWorks: [
      { title: "Drop in the SDK", desc: "Add the typed event SDK and emit events from existing boundaries with one autocompleted call." },
      { title: "Wire UTM + consent", desc: "Enable the UTM persistence layer and consent banner so attribution and privacy are correct from day one." },
      { title: "Define funnels in code", desc: "Move funnels and conversions into the codebase so they evolve with the product instead of drifting in dashboards." },
    ],
    highlights: [
      { value: "typed", label: "events with autocompleted properties" },
      { value: "first-touch", label: "UTM survives signup and OAuth bounces" },
      { value: "consent-gated", label: "non-essential trackers never load without it" },
    ],
    relatedSlugs: ["signalsplash-kit", "seo-playbook"],
  },

  "agency-dashboard-app": {
    longDescription:
      "A white-label operations app for agencies that need one system for projects, retainers, invoicing, and client communication. It combines delivery planning, time tracking, invoice issuance, payment follow-up, and a client-facing portal so the handoff from sales to delivery does not fall apart across tools.",
    features: [
      { icon: "Briefcase", title: "Client + project workspace", desc: "Track accounts, retainers, projects, owners, deadlines, and delivery health in one operating view." },
      { icon: "Clock3", title: "Time + utilization", desc: "Capture hours by project, compare against budgeted blocks, and surface margin risk before invoicing goes out." },
      { icon: "CreditCard", title: "Invoices + collections", desc: "Draft invoices from tracked work, send hosted payment links, and automate overdue reminders." },
      { icon: "MessagesSquare", title: "Client portal", desc: "Share updates, deliverables, notes, and approval checkpoints in a branded external workspace." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Invoices, hosted payment links, and payment collection", required: true },
      { name: "Better Auth", purpose: "Internal staff auth plus magic-link client access", required: true },
      { name: "Resend", purpose: "Invoice sends, reminders, and project update emails", required: true },
      { name: "Sentry", purpose: "Operational monitoring across staff and client surfaces" },
    ],
    assets: [
      { label: "Operations dashboard", detail: "Revenue at risk, utilization, due invoices, and project health cards" },
      { label: "Project workspace", detail: "Scope, timeline, tasks, tracked time, files, and internal notes" },
      { label: "Billing center", detail: "Invoice composer, payment status, reminder cadence, and ledger view" },
      { label: "Client portal", detail: "Branded progress view with approvals, shared files, and message threads" },
    ],
    howItWorks: [
      { title: "Configure your service model", desc: "Set retainers, project templates, billable rates, and default client-facing update structures." },
      { title: "Run delivery in one workspace", desc: "Track hours, notes, files, milestones, and billing status without juggling separate PM and finance tools." },
      { title: "Keep clients in the loop", desc: "Expose only the branded portal surfaces your clients need while your team keeps the full internal workspace." },
    ],
    highlights: [
      { value: "4 surfaces", label: "ops, projects, billing, portal" },
      { value: "1 workspace", label: "for staff and client handoff" },
      { value: "0 spreadsheet drift", label: "for margin and invoice status" },
    ],
    relatedSlugs: ["auth-billing-boilerplate", "dashboard-design-kit", "workflow-engine"],
  },

  "author-publishing-suite-app": {
    longDescription:
      "A publishing product for authors who need drafting, collaboration, packaging, and release workflows in one place. It covers long-form writing, chapter organization, editorial review, cover-art generation, export pipelines, and reader delivery instead of forcing those steps into separate tools and manual exports.",
    features: [
      { icon: "BookOpenText", title: "Long-form authoring", desc: "Chapter-aware editing, manuscript structure, inline notes, version history, and export-safe formatting." },
      { icon: "Palette", title: "Cover + packaging tools", desc: "Generate covers, promo assets, and edition variants without leaving the product workflow." },
      { icon: "Users", title: "Editorial collaboration", desc: "Invite editors, reviewers, and co-authors into scoped review flows with comments and approvals." },
      { icon: "FileOutput", title: "Multi-format publishing", desc: "Export DOCX, PDF, EPUB, and print-ready packages from the same source manuscript." },
    ],
    integrations: [
      { name: "Plate.js", purpose: "Structured long-form editing experience", required: true },
      { name: "Vercel Blob", purpose: "Cover assets, attachments, and export artifact storage", required: true },
      { name: "Stripe", purpose: "Paid releases, bundles, and direct reader sales" },
      { name: "Resend", purpose: "Reviewer invites, publication notices, and release emails" },
    ],
    assets: [
      { label: "Manuscript workspace", detail: "Chapter rail, editor canvas, notes, outline, and revision history" },
      { label: "Publishing pipeline", detail: "Edition setup, release checklist, export jobs, and distribution status" },
      { label: "Cover studio", detail: "Prompted cover concepts, variants, and campaign-image packaging" },
      { label: "Reader delivery surface", detail: "Purchased library, release notes, and multi-format download access" },
    ],
    howItWorks: [
      { title: "Build the manuscript once", desc: "Write and organize the book inside a chapter-aware workspace designed for long-form editing and review." },
      { title: "Package editions and visuals", desc: "Create covers, export variants, and launch assets from the same canonical manuscript content." },
      { title: "Sell or distribute directly", desc: "Publish reader-facing releases, gated downloads, and update notices without moving into another system." },
    ],
    highlights: [
      { value: "4 formats", label: "docx, pdf, epub, print" },
      { value: "1 source", label: "for writing and release assets" },
      { value: "editorial-ready", label: "review and approval workflow" },
    ],
    relatedSlugs: ["publishing-platform", "tech-lead-guide", "rich-text-composer-kit"],
  },

  "auth-billing-boilerplate": {
    longDescription:
      "Drop into any Next.js app to get a complete auth + subscription billing stack in one afternoon. Better Auth with passkeys, Stripe subscriptions with proration and customer portal, organizations with invites — all glued together with proper TypeScript types and tests.",
    features: [
      { icon: "Fingerprint", title: "Passkey + email", desc: "Modern WebAuthn flow with email/password fallback." },
      { icon: "Users", title: "Org invites", desc: "Magic-link invites with role assignment on accept." },
      { icon: "CreditCard", title: "Customer portal", desc: "Stripe-hosted self-serve portal for plan changes." },
      { icon: "Workflow", title: "Webhook reliability", desc: "Idempotent handler with retry-safe state machine." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Email + passkey + organizations", required: true },
      { name: "Stripe", purpose: "Subscriptions, portal, webhooks", required: true },
      { name: "Prisma", purpose: "DB layer with migrations", required: true },
    ],
    assets: [
      { label: "Auth surface", detail: "Sign in, sign up, verify email, password reset, and passkey enrollment" },
      { label: "Organization flows", detail: "Workspace switcher, invites, member roles, and acceptance handoff" },
      { label: "Billing surface", detail: "Plan selection, upgrade path, customer portal entry, and billing history" },
      { label: "Webhook layer", detail: "Retry-safe subscription sync with deterministic state transitions" },
    ],
    howItWorks: [
      { title: "Connect auth + billing env", desc: "Drop in your Better Auth, Stripe, and database secrets without changing the core flow wiring." },
      { title: "Choose your workspace model", desc: "Keep the organization layer as-is for B2B products or trim it back for a single-tenant app." },
      { title: "Ship your first paid seat", desc: "Point the checkout, webhook, and portal routes at your domain and take subscriptions immediately." },
    ],
    highlights: [
      { value: "1 afternoon", label: "To first paid signup flow" },
      { value: "4 core surfaces", label: "Auth, orgs, billing, webhook sync" },
      { value: "0 guesswork", label: "On passkeys, seats, or Stripe state" },
    ],
    relatedSlugs: ["nextjs-saas-starter", "stripe-billing-module", "better-auth-setup"],
  },

  "better-auth-setup": {
    longDescription:
      "An opinionated Better Auth configuration that saves a week of reading docs and debugging session cookies. Email, social, passkey, 2FA, magic link, organizations, impersonation, and server-side session helpers for the App Router — all wired together the way they actually fit. Includes the secure-cookie defaults, CSRF protection, and middleware patterns that production apps need but rarely document.",
    features: [
      { icon: "Fingerprint", title: "Every method", desc: "Email/password, social, passkey, 2FA, and magic link in a single coherent config." },
      { icon: "Users", title: "Organizations + impersonation", desc: "Role-gated impersonation for support, scoped sessions, and an audit trail you can actually query." },
      { icon: "Server", title: "App Router helpers", desc: "requireSession, ensureOrg, getSessionUser, and typed session in every RSC and route handler." },
      { icon: "Shield", title: "Secure defaults", desc: "Production-ready cookie attributes, CSRF protection, rate-limited auth endpoints, and password-policy hooks." },
      { icon: "Workflow", title: "Migration recipes", desc: "Patterns for migrating from NextAuth, Clerk, or hand-rolled auth without forcing a re-login." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Core auth engine and session model", required: true },
      { name: "Prisma", purpose: "User, account, session, and audit-log storage", required: true },
      { name: "Postgres", purpose: "Persistent session and audit storage", required: true },
      { name: "Resend", purpose: "Transactional auth emails (verify, reset, invite)" },
    ],
    assets: [
      { label: "Auth config", detail: "Single auth.ts with email, social, passkey, 2FA, and magic link enabled with secure defaults" },
      { label: "App Router helpers", detail: "requireSession, ensureOrg, getSessionUser, and typed session for RSC and route handlers" },
      { label: "Org + impersonation", detail: "Workspace switcher, scoped sessions, and a support-impersonation flow with audit log" },
      { label: "Auth surface components", detail: "Sign in, sign up, verify email, password reset, and passkey enrollment screens" },
      { label: "Migration recipes", detail: "NextAuth, Clerk, and hand-rolled-auth migration playbooks with re-login-free patterns" },
    ],
    howItWorks: [
      { title: "Drop in the auth config", desc: "Copy auth.ts, point it at your database, and enable the methods you actually want — passkey and email by default." },
      { title: "Use the helpers in your routes", desc: "Use requireSession and ensureOrg in route handlers and RSC instead of repeating session checks everywhere." },
      { title: "Add orgs when you need them", desc: "Turn on the organization layer for B2B products without re-architecting the user model." },
    ],
    highlights: [
      { value: "5 methods", label: "email, social, passkey, 2fa, magic link" },
      { value: "1 config", label: "auth.ts with secure defaults" },
      { value: "audit-ready", label: "impersonation log built in" },
    ],
    relatedSlugs: ["auth-billing-boilerplate", "multi-tenant-b2b"],
  },

  "booking-template": {
    longDescription:
      "Cal.com-shaped booking platform you can rebrand and ship. Multiple event types, group bookings, availability rules, calendar integrations (Google + Outlook), Stripe-paid bookings, and a polished public booking page.",
    features: [
      { icon: "Layers", title: "Event types", desc: "Solo, group, round-robin, collective." },
      { icon: "Workflow", title: "Availability rules", desc: "Working hours, breaks, buffers, date overrides." },
      { icon: "Plug", title: "Calendar sync", desc: "Two-way sync with Google + Outlook." },
      { icon: "CreditCard", title: "Paid bookings", desc: "Charge for sessions via Stripe before confirming." },
    ],
    integrations: [
      { name: "Google Calendar", purpose: "Availability + event write-back" },
      { name: "Microsoft Outlook", purpose: "Availability + event write-back" },
      { name: "Stripe", purpose: "Paid bookings + deposits" },
    ],
    assets: [
      { label: "Public booking page", detail: "Branded scheduling page with host context, slot selection, and confirmation flow" },
      { label: "Availability console", detail: "Working hours, overrides, buffers, blackout dates, and booking windows" },
      { label: "Host calendar sync", detail: "Connected calendars, conflict handling, and event write-back controls" },
      { label: "Paid booking checkout", detail: "Stripe-backed payment step for deposits, one-off sessions, or full prepay" },
    ],
    highlights: [
      { value: "4 types", label: "solo, group, round-robin, collective" },
      { value: "2 providers", label: "google and outlook calendar sync" },
      { value: "1 flow", label: "booking through payment and confirmation" },
    ],
    relatedSlugs: ["mentorship-platform", "publishing-platform"],
  },

  "coaching-platform-app": {
    longDescription:
      "A full coaching product for service businesses that need programs, accountability, and billing in one place. Coaches can enroll clients, deliver plans, review progress, and keep conversations moving without stitching together forms, docs, calendars, and payment links by hand.",
    features: [
      { icon: "ClipboardList", title: "Program delivery", desc: "Ship structured plans for workouts, habits, nutrition, education, or bespoke coaching tracks." },
      { icon: "MessageSquareHeart", title: "Check-ins + messaging", desc: "Run recurring reviews, async client chat, and intervention prompts in the same workspace." },
      { icon: "CalendarDays", title: "Scheduling cadence", desc: "Manage session timing, reminder windows, and client follow-up without leaving the app." },
      { icon: "CreditCard", title: "Paid coaching flows", desc: "Handle recurring subscriptions, one-off offers, and paid program access through Stripe." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Coach and client role boundaries with secure account flows", required: true },
      { name: "Stripe", purpose: "Program billing, subscriptions, and checkout delivery", required: true },
      { name: "Resend", purpose: "Reminders, check-in notices, and session follow-ups", required: true },
      { name: "Vercel Analytics", purpose: "Measure retention and coaching-program engagement" },
    ],
    assets: [
      { label: "Coach dashboard", detail: "Client roster, upcoming check-ins, program adherence, and revenue snapshot" },
      { label: "Program builder", detail: "Modules, milestones, habits, attachments, and templated coaching plans" },
      { label: "Client workspace", detail: "Daily tasks, progress history, chat, and check-in responses" },
      { label: "Billing + offers", detail: "Plans, checkout links, active subscriptions, and client purchase history" },
    ],
    howItWorks: [
      { title: "Set up your coaching model", desc: "Define offers, billing cadence, program templates, and the check-in rhythm that fits your service." },
      { title: "Deliver coaching in-app", desc: "Assign plans, track compliance, and keep client conversations anchored to the program itself." },
      { title: "Scale without losing context", desc: "Reuse templates, automate reminders, and review each client from one dashboard instead of scattered docs." },
    ],
    highlights: [
      { value: "2 roles", label: "coach and client surfaces" },
      { value: "1 workflow", label: "programs, chat, billing" },
      { value: "repeatable", label: "template-first service delivery" },
    ],
    relatedSlugs: ["mentorship-platform", "booking-template", "stripe-billing-module"],
  },

  "community-platform-app": {
    longDescription:
      "A paid-community product that gives you memberships, conversations, content delivery, and events under your own brand. It is shaped for operators who want recurring revenue and direct member relationships without giving up ownership to a hosted community platform.",
    features: [
      { icon: "Users", title: "Membership structure", desc: "Run member directories, access tiers, private spaces, and invite flows inside one product." },
      { icon: "MessagesSquare", title: "Threads + chat", desc: "Mix durable discussion spaces with real-time chat for faster member interaction." },
      { icon: "CalendarRange", title: "Events + RSVPs", desc: "Publish sessions, collect attendance, and keep event context tied to the member space." },
      { icon: "Mail", title: "Digest + retention email", desc: "Keep members warm with automated digests, announcements, and re-engagement sequences." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Membership billing, paid tiers, and recurring renewals", required: true },
      { name: "Better Auth", purpose: "Member identity, gated access, and role-aware admin tools", required: true },
      { name: "Pusher", purpose: "Real-time chat, activity updates, and presence" },
      { name: "Resend", purpose: "Digests, invites, and event reminders" },
    ],
    assets: [
      { label: "Member home", detail: "Feed, spaces, events, and resource entry points for the community" },
      { label: "Discussion system", detail: "Threads, replies, moderation, reactions, and pinned updates" },
      { label: "Event center", detail: "Upcoming sessions, RSVP flow, host controls, and attendance history" },
      { label: "Operator tools", detail: "Tier management, moderation queue, and membership health reporting" },
    ],
    howItWorks: [
      { title: "Define your membership model", desc: "Configure free or paid tiers, role boundaries, and the spaces each audience gets." },
      { title: "Run conversations and programming", desc: "Keep discussions, events, and resources in one coherent member experience." },
      { title: "Retain members over time", desc: "Use built-in email, chat, and event loops to keep the community active without external tooling." },
    ],
    highlights: [
      { value: "3 loops", label: "discussion, events, retention" },
      { value: "owned brand", label: "no third-party community shell" },
      { value: "membership-ready", label: "billing and access included" },
    ],
    relatedSlugs: ["publishing-platform", "loops-email-automation", "booking-template"],
  },

  "chat-agent-platform": {
    longDescription:
      "One agent codebase, every channel. Built on the Vercel Chat SDK with adapters for Slack, Discord, web embed, Telegram, Microsoft Teams, GitHub, and Linear. The handler, tools, persistence, and rendering primitives are unified so you write the agent once and let the adapter layer translate threads, cards, modals, attachments, and streaming into each channel's native shape — instead of maintaining seven divergent forks of the same bot.",
    features: [
      { icon: "Workflow", title: "One handler, every channel", desc: "Same agent handler runs on Slack, Discord, web, Telegram, Teams, GitHub, and Linear via typed adapters." },
      { icon: "Layers", title: "Channel-native UI", desc: "Cards, modals, threads, attachments, and reactions render in each channel's idiomatic format without per-channel branches." },
      { icon: "Zap", title: "Streaming first-class", desc: "Token streaming and progressive rendering wherever the channel supports it, with graceful fallback to chunked updates where it does not." },
      { icon: "Database", title: "Per-thread state", desc: "Persistent conversation memory and thread-scoped state with pluggable storage so context survives restarts and channel hops." },
      { icon: "Wand2", title: "Typed tool registry", desc: "Tools are typed once and exposed everywhere, with schema-validated arguments and structured results streamed back to the user." },
      { icon: "Shield", title: "Auth and routing", desc: "Per-channel signature verification, workspace and user mapping, and rate-limit aware retries built into the adapter layer." },
    ],
    integrations: [
      { name: "Vercel Chat SDK", purpose: "Multi-platform chat runtime, adapters, and rendering primitives", required: true },
      { name: "AI Gateway", purpose: "Model routing, fallbacks, and streaming across providers", required: true },
      { name: "Slack", purpose: "Workspace bot with Block Kit cards, modals, and threads" },
      { name: "Discord", purpose: "Guild bot with components, embeds, and slash commands" },
      { name: "Microsoft Teams", purpose: "Tenant app with Adaptive Cards, threads, and DMs" },
      { name: "Telegram", purpose: "Bot API with inline keyboards and message threading" },
      { name: "Linear", purpose: "Issue and comment integration for workflow agents" },
      { name: "GitHub", purpose: "Issue, PR, and discussion bot via App or webhook" },
      { name: "Postgres", purpose: "Thread, message, tool-call, and user-mapping persistence" },
    ],
    assets: [
      { label: "Adapter layer", detail: "Slack, Discord, web, Telegram, Teams, GitHub, and Linear adapters with shared event normalization" },
      { label: "Agent handler shell", detail: "Single handler entry point with tool registry, state hooks, and streaming response helpers" },
      { label: "Rich-UI rendering kit", detail: "Cards, modals, attachments, and thread primitives with per-channel renderers" },
      { label: "Persistence layer", detail: "Thread, message, tool-call, and channel-mapping schemas with Postgres adapter" },
      { label: "Deployment recipes", detail: "Vercel deployment, webhook setup, and per-channel app-registration walkthroughs" },
    ],
    howItWorks: [
      { title: "Write the agent once", desc: "Define your handler, tools, and state model in one place — no channel-specific branches in your business logic." },
      { title: "Pick your channels", desc: "Enable the adapters you need (Slack, Discord, web, etc.), set the credentials, and let the platform translate to channel-native UI." },
      { title: "Ship and iterate", desc: "Deploy on Vercel, add tools and personalities incrementally, and watch threads and tool calls in one persistence layer regardless of source channel." },
    ],
    highlights: [
      { value: "7 channels", label: "slack, discord, web, telegram, teams, github, linear" },
      { value: "1 handler", label: "shared agent code across every adapter" },
      { value: "streaming", label: "token streaming with graceful fallback" },
    ],
    relatedSlugs: ["ai-chat-boilerplate", "ai-sales-agent", "summonflow-realtime"],
  },

  "codebase-audit-agent": {
    longDescription:
      "Deterministic codebase scanner with explainable findings. Walks a repo, surfaces dead code, type holes, security smells, and architecture drift. Outputs MDX reports and PR-ready diffs — no more vague 'could be better' reviews.",
    features: [
      { icon: "Shield", title: "Security smells", desc: "Taint tracking, auth boundary checks, secret leak detection." },
      { icon: "Layers", title: "Architecture drift", desc: "Flags layers that started calling each other the wrong way." },
      { icon: "Wand2", title: "PR-ready diffs", desc: "Applies safe fixes as diffs you can review and merge." },
    ],
    assets: [
      { label: "Repo scan workspace", detail: "Entry point selection, scan scope, and analysis-run controls" },
      { label: "Findings report", detail: "Severity buckets, grouped issues, code references, and explanation panels" },
      { label: "Diff export path", detail: "Patch-ready changes that can be reviewed before application" },
      { label: "Rules registry", detail: "Security, dead-code, architecture, and hygiene checks with explainable output" },
    ],
    highlights: [
      { value: "deterministic", label: "repeatable scans and findings" },
      { value: "pr-ready", label: "diffs instead of vague review notes" },
      { value: "cross-layer", label: "security and architecture checks together" },
    ],
    relatedSlugs: ["tech-lead-guide", "job-search-agent"],
  },

  "dashboard-design-kit": {
    longDescription:
      "A Figma + code design kit for SaaS dashboards. Sidebar, top nav, command palette, data table, drawer, modal, empty states, and a documented spacing and motion system — cohesive, dark-first, and built to grow with your app instead of being thrown away the moment requirements change. Every component ships in both a headless and an opinionated variant so you can swap layers without re-skinning the whole app.",
    features: [
      { icon: "Palette", title: "Tokens + theming", desc: "Every color, radius, type ramp, spacing step, and motion duration captured as a token with dark and light themes." },
      { icon: "Layers", title: "Primitives + patterns", desc: "Buttons, inputs, dropdowns, dialogs, drawers, command palette, data table, and dashboard-shell layouts with documented use cases." },
      { icon: "Sparkles", title: "Motion guidance", desc: "Durations, easings, and stagger rules calibrated for dashboards and respectful of prefers-reduced-motion." },
      { icon: "Workflow", title: "Headless + opinionated", desc: "Each component ships in a headless variant for full control and an opinionated variant for fast adoption." },
      { icon: "FileText", title: "Documented patterns", desc: "MDX docs with copyable examples for sidebar, command palette, empty states, error states, and data dense layouts." },
    ],
    assets: [
      { label: "Figma library", detail: "Components, variables, auto-layout, dark + light themes, and pattern pages" },
      { label: "React components", detail: "Headless and opinionated variants side by side with shared tokens" },
      { label: "Docs site", detail: "MDX documentation with copyable examples and a live preview for every component" },
      { label: "Pattern recipes", detail: "Sidebar, top nav, command palette, data-dense table, and empty-state recipes" },
      { label: "Theming guide", detail: "Token re-skin walkthrough and brand-variant patterns" },
    ],
    howItWorks: [
      { title: "Drop in the tokens", desc: "Add the token layer and Tailwind config so every primitive immediately picks up your brand." },
      { title: "Compose dashboards", desc: "Use the patterns for sidebar, command palette, and data table to assemble dashboards instead of rebuilding the same layouts." },
      { title: "Re-skin without forking", desc: "Tweak tokens or layer a brand variant — no fork required and no class-order war with shadcn." },
    ],
    highlights: [
      { value: "dark-first", label: "tokens with first-class dark and light themes" },
      { value: "headless + opinionated", label: "two variants of every component" },
      { value: "motion-aware", label: "respects prefers-reduced-motion by default" },
    ],
    relatedSlugs: ["summoniq-ui-kit", "landing-blocks-pack", "data-table-kit"],
  },

  "data-table-kit": {
    longDescription:
      "Tables that don't buckle at 10,000 rows. Sorting, filtering, virtualized rows, column resizing, persisted state, server-driven pagination, and CSV/Excel export — all built on TanStack Table v8 and ready to drop into any React app.",
    features: [
      { icon: "Database", title: "Virtualized rows", desc: "Smooth at 100k+ rows thanks to TanStack Virtual." },
      { icon: "Workflow", title: "Server-driven", desc: "Pagination, filter, sort state serializes to URL and API." },
      { icon: "Layers", title: "Bulk actions", desc: "Select with shift-click, range-select, and a sticky toolbar." },
    ],
    codeSample: {
      lang: "typescript",
      filename: "examples/users-table.tsx",
      code: `import { DataTable, createColumns } from "data-table-kit";
import type { User } from "@/lib/users";

const columns = createColumns<User>([
  { accessor: "name", header: "Name", sort: true },
  { accessor: "email", header: "Email", filter: "text" },
  { accessor: "plan", header: "Plan", filter: "select", options: ["free", "pro", "team"] },
  { accessor: "createdAt", header: "Joined", sort: true, cell: (v) => format(v, "PP") },
]);

export function UsersTable({ rows }: { rows: User[] }) {
  return <DataTable columns={columns} rows={rows} virtualized pageSize={50} />;
}`,
    },
    assets: [
      { label: "Core table shell", detail: "Header groups, sticky controls, pagination, and empty/loading states" },
      { label: "Column system", detail: "Typed column builder, resize handles, visibility toggles, and persistence hooks" },
      { label: "Filter + bulk bar", detail: "Search, select filters, bulk actions, and URL-synced table state" },
      { label: "Export path", detail: "CSV or Excel output from the current server-driven or filtered result set" },
    ],
    highlights: [
      { value: "100k+", label: "rows with virtualization support" },
      { value: "url-synced", label: "server-driven sort and filter state" },
      { value: "typed", label: "column definitions and cell renderers" },
    ],
    relatedSlugs: ["admin-dashboard", "dashboard-design-kit"],
  },

  "domain-hunter-app": {
    longDescription:
      "Live domain availability + drop-list scanner in a desktop app. Search across hundreds of TLDs, watch favorites, get notified the moment a drop happens, and pull WHOIS history to see who held it before.",
    features: [
      { icon: "Zap", title: "Live availability", desc: "Parallelized lookups across every TLD that matters." },
      { icon: "Workflow", title: "Drop watch", desc: "Native desktop notifications the instant a watched domain drops." },
      { icon: "Database", title: "WHOIS history", desc: "See prior owners, registration dates, and sunset events." },
    ],
    assets: [
      { label: "Search console", detail: "Bulk domain queries, TLD filters, and live availability response grid" },
      { label: "Watchlist manager", detail: "Tracked names, drop windows, and alert thresholds" },
      { label: "WHOIS history panel", detail: "Registrar snapshots, registration dates, and prior-owner timeline" },
      { label: "Desktop alerts", detail: "Native notifications for drops, status changes, and watched-domain activity" },
    ],
    highlights: [
      { value: "hundreds", label: "of TLDs searched in parallel" },
      { value: "native", label: "desktop alerts for domain drops" },
      { value: "historical", label: "whois and ownership context" },
    ],
    relatedSlugs: ["electron-starter", "mac-menubar-app"],
  },

  "elderly-care-coordinator": {
    longDescription:
      "A care plan + caregiver scheduling app designed for families and small agencies. Manage medications, appointments, vitals, and shifts, with HIPAA-aware patterns, an audit log, and family read-only access so everyone stays in the loop without stepping on permissions.",
    features: [
      { icon: "Users", title: "Caregiver scheduling", desc: "Shifts, swaps, time-off, and handoff notes." },
      { icon: "Shield", title: "HIPAA-aware", desc: "Encryption at rest, audit log, minimum-necessary access patterns." },
      { icon: "Workflow", title: "Meds + vitals", desc: "Schedule, track, and log — with reminders on missed doses." },
    ],
    assets: [
      { label: "Care dashboard", detail: "Appointments, missed meds, shift coverage, and current health alerts" },
      { label: "Schedule planner", detail: "Caregiver shifts, swaps, availability, and handoff note chain" },
      { label: "Medication + vitals log", detail: "Dose schedule, completion tracking, and trend history by patient" },
      { label: "Family access view", detail: "Read-only updates, visit notes, and permission-safe visibility controls" },
    ],
    highlights: [
      { value: "hipaa-aware", label: "care coordination patterns and auditability" },
      { value: "shared", label: "family and caregiver visibility without overlap" },
      { value: "daily ops", label: "scheduling, meds, vitals in one app" },
    ],
    relatedSlugs: ["mentorship-platform", "workshop-course-platform"],
  },

  "electron-starter": {
    longDescription:
      "Modern Electron with Vite, TypeScript, auto-update, and crash reports. ESM-first, multi-window support, native menus, typed IPC, OAuth helpers, and signed/notarized builds via GitHub Actions — so your first release ships with the polish of a mature app.",
    features: [
      { icon: "Layers", title: "Multi-window + menus", desc: "Open, focus, close windows by id with proper macOS menu behavior." },
      { icon: "Rocket", title: "Signed auto-update", desc: "Code-signed, notarized builds with rollback on failure." },
      { icon: "Shield", title: "Typed IPC", desc: "End-to-end types between main and renderer — no any in the bridge." },
    ],
    assets: [
      { label: "Desktop shell", detail: "Window lifecycle, native menus, tray behavior, and renderer boot path" },
      { label: "IPC bridge", detail: "Typed main-renderer messaging with guardrails around unsafe channels" },
      { label: "Release pipeline", detail: "Signing, notarization, auto-update publishing, and rollback support" },
      { label: "OAuth + auth helpers", detail: "Desktop-safe external auth flow and callback handoff utilities" },
    ],
    highlights: [
      { value: "esm-first", label: "modern electron app structure" },
      { value: "signed", label: "release-ready update and notarization flow" },
      { value: "typed", label: "ipc bridge without loose any channels" },
    ],
    relatedSlugs: ["tauri-desktop-starter", "mac-menubar-app", "domain-hunter-app"],
  },

  "email-template-set": {
    longDescription:
      "Branded React Email templates for the flows every product needs: welcome, verify, reset, invite, receipt, usage alert, and weekly summary. Themeable via a single tokens file and provider-agnostic so you can swap Resend for SES, Postmark, or Loops without rewriting a template. Plain-text fallbacks, accessible color contrast, and a local preview server are included so you stop sending test emails to yourself.",
    features: [
      { icon: "Palette", title: "Single tokens file", desc: "Color, type, spacing, and footer — change brand once and every template updates consistently." },
      { icon: "Mail", title: "Complete set", desc: "Seven core flows already written plus a CLI to scaffold new ones with the same conventions." },
      { icon: "Plug", title: "Provider-agnostic", desc: "Resend, SES, Postmark, and Loops — adapter pattern over a typed sender so swapping providers is one config change." },
      { icon: "FileText", title: "Plain-text + accessibility", desc: "Hand-tuned plain-text fallbacks and accessible color contrast on every template by default." },
      { icon: "Workflow", title: "Local preview", desc: "Local preview server with seed data and dark/light variants so you stop sending test emails to your inbox." },
    ],
    integrations: [
      { name: "React Email", purpose: "Template authoring, preview, and rendering", required: true },
      { name: "Resend", purpose: "Default delivery provider with adapter for swap-out" },
      { name: "Postmark", purpose: "Optional alternate delivery provider via the same adapter" },
      { name: "AWS SES", purpose: "Optional alternate delivery provider for high-volume orgs" },
    ],
    assets: [
      { label: "Welcome", detail: "First-touch email with quick wins, onboarding next steps, and support links" },
      { label: "Verify + reset", detail: "Auth emails with secure code formatting and a clear action CTA" },
      { label: "Invite", detail: "Organization invite with role preview and accept-link deep linking" },
      { label: "Receipt", detail: "Transactional receipt matching Stripe metadata with line items and tax" },
      { label: "Usage alert + summary", detail: "Soft-limit warning email plus a weekly summary template with editable copy slots" },
    ],
    howItWorks: [
      { title: "Set your brand tokens", desc: "Edit one tokens file with color, logo, and type and watch every template pick the change up." },
      { title: "Pick your provider", desc: "Resend by default; swap to Postmark, SES, or Loops via the adapter without changing template code." },
      { title: "Send with the typed helper", desc: "Use the typed sender from anywhere in your app and let the kit handle plain-text, suppression, and bounces." },
    ],
    highlights: [
      { value: "7 templates", label: "welcome, verify, reset, invite, receipt, alert, summary" },
      { value: "provider-agnostic", label: "resend, postmark, ses, loops" },
      { value: "accessible", label: "contrast and plain-text on every template" },
    ],
    relatedSlugs: ["resend-email-kit", "loops-email-automation"],
  },

  "hubspot-pipeline-sync": {
    longDescription:
      "A drop-in HubSpot sync layer that mirrors your product state into the CRM and pulls sales-side updates back without spreadsheets, Zaps, or 2 AM debugging sessions. Maps users to contacts, plans to deals, churn to lifecycle stages, and trial activity to engagement — with idempotent webhook processing, a batch backfill that respects HubSpot rate limits, and a debuggable conflict resolution model so you can always answer the question 'why did this field flip back?'",
    features: [
      { icon: "Workflow", title: "Two-way sync", desc: "Writes and reads both directions with per-field conflict rules and a clear winner-picking strategy you can audit." },
      { icon: "Database", title: "Batch backfill", desc: "Seed HubSpot from your existing users with rate-limit aware batching, resumable runs, and a dry-run mode for first-time imports." },
      { icon: "Shield", title: "Idempotent webhooks", desc: "Retries are safe and double-processing is impossible thanks to event-id deduplication and a state machine that converges to the same outcome." },
      { icon: "Activity", title: "Activity timeline", desc: "Push trial events, plan changes, and feature usage into HubSpot timelines so AEs see product context without leaving the CRM." },
      { icon: "RefreshCcw", title: "Conflict resolution log", desc: "Every overridden field is recorded with the source, value, and reason so disputes between sales and product can be resolved with data." },
    ],
    integrations: [
      { name: "HubSpot", purpose: "Contacts, deals, pipelines, lifecycle stages, and timeline events", required: true },
      { name: "Postgres", purpose: "Local mirror, sync ledger, and conflict-resolution log", required: true },
      { name: "Vercel Workflow", purpose: "Durable backfill jobs and retried sync steps" },
      { name: "Slack", purpose: "Optional alerts on sync failures, conflict spikes, or backfill completion" },
    ],
    assets: [
      { label: "Field mapping config", detail: "Typed mapping between product entities and HubSpot contact, company, and deal fields" },
      { label: "Webhook handler", detail: "Idempotent inbound handler with signature verification, deduplication, and replay tooling" },
      { label: "Backfill runner", detail: "Resumable batch sync with rate-limit pacing, dry-run mode, and per-batch reporting" },
      { label: "Conflict ledger", detail: "Per-field change log with source, prior value, new value, and resolution reason" },
      { label: "Operations dashboard", detail: "Sync health, queue depth, error rate, and recent conflict overview" },
    ],
    howItWorks: [
      { title: "Map your fields", desc: "Use the typed mapping config to declare which product entities map to which HubSpot objects and how each field is owned." },
      { title: "Backfill before you go live", desc: "Run the batch backfill in dry-run, review the diff, then promote to a real sync without rate-limit drama." },
      { title: "Let the webhook handle the rest", desc: "Inbound and outbound changes flow through the idempotent handler with a debuggable conflict log so support and sales can self-serve answers." },
    ],
    highlights: [
      { value: "2-way", label: "sync with per-field conflict resolution" },
      { value: "idempotent", label: "webhook handler with replay tooling" },
      { value: "auditable", label: "conflict ledger for every overridden field" },
    ],
    relatedSlugs: ["typeform-intake-flow", "lead-enrichment-agent", "ai-sales-agent"],
  },

  "iconography-pack": {
    longDescription:
      "200 hand-drawn product icons in two weights. SVG + React components, optimized for 16/20/24px. Ships with a Figma library and a CLI that tree-shakes to only what you use — so your bundle doesn't bloat when you reach for a single pictogram.",
    features: [
      { icon: "Palette", title: "Two weights", desc: "Regular and bold for primary + secondary actions." },
      { icon: "Layers", title: "Pixel-snapped", desc: "Hand-tuned at 16, 20, and 24px. Never fuzzy." },
      { icon: "Zap", title: "Tree-shakable", desc: "CLI generates an import-per-icon bundle so only what you use ships." },
    ],
    assets: [
      { label: "SVG set", detail: "Icon sources in two weights and multiple pixel-tuned sizes" },
      { label: "React package", detail: "Tree-shakable icon exports for app and site usage" },
      { label: "Figma library", detail: "Design-ready icon set with naming parity to the code package" },
      { label: "Build CLI", detail: "Subset generation so teams can ship only the icons they actually use" },
    ],
    highlights: [
      { value: "200", label: "hand-drawn product icons" },
      { value: "2 weights", label: "regular and bold variants" },
      { value: "16/20/24", label: "pixel-snapped target sizes" },
    ],
    relatedSlugs: ["dashboard-design-kit", "summoniq-ui-kit", "landing-blocks-pack"],
  },

  "indie-launch-playbook": {
    longDescription:
      "Ship a paid product in 14 days. A practical, day-by-day playbook with daily goals, copy templates, ad creative ideas, launch lists, and email sequences for indie makers shipping their first paid product.",
    features: [
      { icon: "Workflow", title: "Day-by-day plan", desc: "Fourteen ordered days, each with a single focused deliverable." },
      { icon: "Mail", title: "Copy + email templates", desc: "Landing, launch, and nurture sequences you can edit in place." },
      { icon: "Rocket", title: "Launch list", desc: "ProductHunt, indie newsletters, relevant subreddits — all vetted." },
    ],
    assets: [
      { label: "14-day roadmap", detail: "Daily milestones, decision checkpoints, and a focused launch sequence" },
      { label: "Copy kit", detail: "Landing page drafts, launch emails, and announcement copy starters" },
      { label: "Launch checklist", detail: "Distribution channels, promo prep, and day-of launch execution steps" },
      { label: "Follow-up plan", detail: "Post-launch outreach, retention touchpoints, and iteration prompts" },
    ],
    highlights: [
      { value: "14 days", label: "structured launch timeline" },
      { value: "copy-ready", label: "landing and email templates included" },
      { value: "indie-focused", label: "built for solo or tiny teams" },
    ],
    relatedSlugs: ["pricing-playbook", "seo-playbook", "marketing-site-pro"],
  },

  "job-board-template": {
    longDescription:
      "Niche job board you can launch in a weekend. Stripe-paid listings, employer dashboard, candidate email alerts, and a clean public board with filters, facets, and strong SEO out of the box.",
    features: [
      { icon: "CreditCard", title: "Paid listings", desc: "Stripe Checkout for job posts, tiered featured slots." },
      { icon: "Mail", title: "Candidate alerts", desc: "Weekly digest email matching candidate preferences." },
      { icon: "Globe", title: "SEO-ready", desc: "Per-listing sitemap, structured data, indexable filter pages." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Paid job listings", required: true },
      { name: "Resend", purpose: "Candidate email alerts" },
    ],
    assets: [
      { label: "Public jobs board", detail: "Search, filters, featured listings, and SEO-friendly job detail pages" },
      { label: "Employer dashboard", detail: "Listing status, invoice history, candidate volume, and post management" },
      { label: "Paid posting flow", detail: "Tiered listing checkout, featured slots, and publish-after-payment path" },
      { label: "Candidate alerts", detail: "Saved preferences, digest scheduling, and unsubscribe-safe email delivery" },
    ],
    highlights: [
      { value: "weekend", label: "to first niche board launch" },
      { value: "paid", label: "stripe-backed listing monetization" },
      { value: "seo-ready", label: "public board and listing pages" },
    ],
    relatedSlugs: ["marketing-site-pro", "publishing-platform", "job-search-agent"],
  },

  "job-search-agent": {
    longDescription:
      "Personal AI that hunts roles, drafts applications, and preps you for interviews. Crawls job boards, ranks fit against your resume, drafts tailored cover letters, and runs mock interview rounds — so the search stops eating your evenings.",
    features: [
      { icon: "Workflow", title: "Fit ranking", desc: "Scores each role against your resume with explainable reasons." },
      { icon: "Mail", title: "Tailored drafts", desc: "Cover letter + custom resume per role, in your voice." },
      { icon: "Users", title: "Mock interviews", desc: "Practice rounds tuned to the role and stack." },
    ],
    assets: [
      { label: "Opportunity tracker", detail: "Saved roles, fit scoring, application stage, and follow-up timeline" },
      { label: "Application workspace", detail: "Resume tailoring, cover-letter drafting, and role-specific notes" },
      { label: "Interview prep board", detail: "Mock sessions, likely question sets, and answer refinement loops" },
      { label: "Search analytics", detail: "Pipeline health, role-source quality, and response-rate trends" },
    ],
    highlights: [
      { value: "role-ranked", label: "fit scoring before you spend time applying" },
      { value: "tailored", label: "resume and cover-letter drafting workflow" },
      { value: "prep-ready", label: "mock interviews built into the search loop" },
    ],
    relatedSlugs: ["ai-sales-agent", "lead-enrichment-agent"],
  },

  "knowledge-base-app": {
    longDescription:
      "A branded internal knowledge system for teams that need writing, access control, and retrieval in the same product. It handles collaborative authoring, document structure, permissions, attachments, search, and AI-assisted summaries without forcing knowledge work into generic docs tooling.",
    features: [
      { icon: "BookOpen", title: "Structured knowledge spaces", desc: "Organize docs, hubs, policies, and team playbooks with clear ownership and navigation." },
      { icon: "Shield", title: "Fine-grained access", desc: "Restrict sensitive documents by team, role, or audience without separate permission systems." },
      { icon: "Search", title: "Search + AI retrieval", desc: "Combine full-text search with summary and Q&A flows grounded in the actual document base." },
      { icon: "Paperclip", title: "Attachment-aware docs", desc: "Keep supporting files, screenshots, and exports attached to the knowledge entry that needs them." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Identity, organization scoping, and RBAC enforcement", required: true },
      { name: "AI SDK v6", purpose: "Summaries, doc Q&A, and retrieval-driven assistance" },
      { name: "Vercel Blob", purpose: "Attachment storage and file delivery", required: true },
      { name: "Resend", purpose: "Share notifications, review prompts, and stale-doc reminders" },
    ],
    assets: [
      { label: "Knowledge home", detail: "Topic hubs, recent edits, watchlists, and team-specific navigation" },
      { label: "Document editor", detail: "Structured page editing, mentions, attachments, and history controls" },
      { label: "Search + ask", detail: "Query surface with ranked results, summaries, and answer citations" },
      { label: "Admin controls", detail: "Permissions, content ownership, stale-doc audits, and usage reports" },
    ],
    howItWorks: [
      { title: "Define your knowledge structure", desc: "Set spaces, owners, and permission boundaries before content and retrieval start sprawling." },
      { title: "Write and maintain docs in place", desc: "Use one editor and one storage model for living documentation, attachments, and revision flow." },
      { title: "Retrieve the right answer fast", desc: "Search, summarize, and ask questions against the actual knowledge base without duplicating content elsewhere." },
    ],
    highlights: [
      { value: "1 system", label: "for docs, files, retrieval" },
      { value: "RBAC-ready", label: "for internal and sensitive content" },
      { value: "answerable", label: "with search and AI Q&A" },
    ],
    relatedSlugs: ["better-auth-setup", "ai-chat-boilerplate", "data-table-kit"],
  },

  "landing-blocks-pack": {
    longDescription:
      "60+ production-ready hero, feature, pricing, FAQ, testimonial, and CTA blocks for marketing pages. Drop into any Next.js or Astro project. Brand-tokenized, fully responsive, motion-friendly, dark and light variants — enough building blocks to compose any marketing page without opening Figma. Each block is independently importable so the bundle stays small even when you only use four of them.",
    features: [
      { icon: "Palette", title: "Tokenized", desc: "Recolor the entire set by editing a single tokens file with dark and light variants." },
      { icon: "Sparkles", title: "Motion baked in", desc: "Subtle entrance and scroll-driven animations that respect prefers-reduced-motion." },
      { icon: "Layers", title: "Composable", desc: "Mix hero, feature grid, pricing, FAQ, testimonial, logo strip, and CTA blocks like Lego pieces." },
      { icon: "Zap", title: "Tree-shakable", desc: "Each block is independently importable so the bundle stays small even when you only use a handful." },
      { icon: "ShieldCheck", title: "Accessible defaults", desc: "Semantic landmarks, focus order, and color contrast checked across every variant." },
    ],
    integrations: [
      { name: "Tailwind CSS", purpose: "Token-driven utility layer and theming", required: true },
      { name: "Framer Motion", purpose: "Entrance, hover, and scroll-driven motion" },
      { name: "Next.js", purpose: "First-class App Router and server-component compatibility" },
      { name: "Astro", purpose: "Drop-in usage as Astro components" },
    ],
    assets: [
      { label: "Heroes", detail: "12 variants — split, centered, animated, video background, with-form, with-screenshot" },
      { label: "Feature grids", detail: "10 variants — icon grid, alternating, bento, tabbed, image-paired, comparison" },
      { label: "Pricing", detail: "8 variants — tiered, toggle, comparison table, single-product, usage-based" },
      { label: "FAQs + CTAs", detail: "Accessible disclosure FAQs and CTA blocks for waitlist, signup, and demo flows" },
      { label: "Testimonials + logo strip", detail: "Quote cards, video testimonial slot, and a responsive logo strip with motion" },
    ],
    howItWorks: [
      { title: "Drop in the tokens", desc: "Add the token layer and Tailwind config so every block immediately picks up your brand." },
      { title: "Compose the page", desc: "Import only the blocks you need and assemble the page in minutes instead of designing from scratch." },
      { title: "Re-skin without forking", desc: "Tweak tokens or add a brand variant — no fork required, no class-order war with the rest of your UI." },
    ],
    highlights: [
      { value: "60+ blocks", label: "heroes, features, pricing, faqs, ctas, testimonials" },
      { value: "tokenized", label: "single-file recolor with dark and light" },
      { value: "tree-shakable", label: "import only what you use" },
    ],
    relatedSlugs: ["landing-page-kit", "marketing-site-pro", "summoniq-ui-kit"],
  },

  "landing-page-kit": {
    longDescription:
      "An animated, conversion-tuned marketing site template. Hero, features, pricing, case studies, FAQ, and CTA sections — all typed, responsive, and ready to rebrand. Ships with copywriting templates, three color presets, and the SEO and OG defaults that mean a brand-new site does not need a separate launch checklist before it is shareable.",
    features: [
      { icon: "Palette", title: "3 color presets", desc: "Violet, emerald, and amber presets — pick one and swap a single token later to re-skin." },
      { icon: "Sparkles", title: "Motion defaults", desc: "Scroll-linked reveals, hover states, and entrance animations that respect prefers-reduced-motion." },
      { icon: "Mail", title: "Copy templates", desc: "Headline, subhead, feature, FAQ, and CTA copy patterns with examples for B2B and B2C tones." },
      { icon: "LineChart", title: "SEO + OG", desc: "Sitemap, OG image generation, and JSON-LD structured data wired so launch day does not need a separate SEO sweep." },
      { icon: "Zap", title: "Performance defaults", desc: "Image optimization, font loading, and minimal client JS so Lighthouse scores stay above 90 by default." },
    ],
    integrations: [
      { name: "Next.js App Router", purpose: "MDX content, ISR, and OG image generation", required: true },
      { name: "Tailwind CSS", purpose: "Token-driven theming and responsive layout", required: true },
      { name: "Framer Motion", purpose: "Scroll-linked reveals and entrance animations" },
      { name: "Resend", purpose: "Optional contact-form delivery and waitlist confirmations" },
    ],
    highlights: [
      { value: "1 day", label: "From clone to live marketing site" },
      { value: "90+", label: "Lighthouse performance out of the box" },
      { value: "3 presets", label: "Recolor with a single token change" },
    ],
    assets: [
      { label: "Hero system", detail: "Headline, subhead, CTA, proof row, media slot, and motion defaults" },
      { label: "Conversion sections", detail: "Feature grids, pricing layouts, social proof, FAQ, and CTA endings" },
      { label: "Copy pack", detail: "Headline formulas, subhead templates, offer framing, and objection prompts" },
      { label: "Theme presets", detail: "Three shipped palettes with token-driven recoloring" },
    ],
    howItWorks: [
      { title: "Swap the brand layer", desc: "Replace logo, colors, and fonts in one token pass instead of rewriting each section." },
      { title: "Rewrite the message fast", desc: "Use the included headline and offer patterns as a starting point, then tighten for your audience." },
      { title: "Ship the live page", desc: "Deploy the typed landing shell as-is or lift sections into your existing marketing site." },
    ],
    relatedSlugs: ["marketing-site-pro", "landing-blocks-pack", "nextjs-saas-starter"],
  },

  "lead-enrichment-agent": {
    longDescription:
      "Inbound leads — fully enriched, scored, and routed in one pipeline. Webhook in, company enrichment out, persona match, fit and intent score, then routed to the right rep or sequence. Works with HubSpot, Salesforce, Pipedrive, and Customer.io out of the box, and ships with explainable scoring so reps trust the routing instead of resenting it.",
    features: [
      { icon: "Database", title: "Company enrichment", desc: "Firmographic data, tech stack detection, headcount, and funding signals normalized into a single payload." },
      { icon: "Workflow", title: "Fit + intent scoring", desc: "Rule-based plus model-based scoring with explainable outputs so reps can see why a lead scored where it did." },
      { icon: "Users", title: "Round-robin routing", desc: "Route to the right rep by territory, capacity, language, or named-account ownership with safe fallbacks." },
      { icon: "Shield", title: "Dedup + suppression", desc: "Detect repeat submissions, existing customers, and competitor domains before they hit the pipeline." },
      { icon: "Activity", title: "Audit log", desc: "Every enrichment, score, and routing decision recorded so disputes between marketing, sales, and ops can be resolved with data." },
    ],
    integrations: [
      { name: "AI Gateway", purpose: "Intent scoring with model fallback and per-call cost tracking", required: true },
      { name: "Clearbit", purpose: "Firmographic enrichment and tech stack detection" },
      { name: "HubSpot", purpose: "CRM contact and deal creation with timeline events" },
      { name: "Salesforce", purpose: "Account, contact, and opportunity creation via the Salesforce sync kit" },
      { name: "Pipedrive", purpose: "Person and deal creation for Pipedrive-first orgs" },
      { name: "Customer.io", purpose: "Sequence enrollment for marketing-qualified leads" },
    ],
    assets: [
      { label: "Inbound webhook", detail: "Single intake endpoint that accepts form, demo, and trial submissions with signature verification" },
      { label: "Enrichment + scoring engine", detail: "Firmographic and behavioral enrichment plus rule-based and model-based scoring with explainable outputs" },
      { label: "Routing rules", detail: "Round-robin, territory, capacity, language, and named-account routing with safe fallbacks" },
      { label: "CRM handoff layer", detail: "HubSpot, Salesforce, and Pipedrive creators with timeline events and deduplication" },
      { label: "Audit log + dashboard", detail: "Per-lead enrichment, score, and routing decision history with a small ops view" },
    ],
    howItWorks: [
      { title: "Point your forms at the webhook", desc: "Send form, demo, and trial submissions to the inbound endpoint with no per-form glue code." },
      { title: "Tune scoring for your ICP", desc: "Customize the rule-based and model-based scoring so the routing matches the way your reps actually want to work." },
      { title: "Let the routing do the work", desc: "Round-robin or named-account rules deliver leads to the right rep with full enrichment and explainable scores attached." },
    ],
    highlights: [
      { value: "explainable", label: "scoring with reasons reps trust" },
      { value: "multi-CRM", label: "hubspot, salesforce, pipedrive" },
      { value: "auditable", label: "every enrichment and routing decision logged" },
    ],
    relatedSlugs: ["ai-sales-agent", "hubspot-pipeline-sync", "salesforce-pipeline-sync"],
  },

  "loops-email-automation": {
    longDescription:
      "Lifecycle email flows that do not make you cry. Welcome, onboarding, trial-to-paid, dunning, and win-back are pre-built and wired to product events through a typed Loops client. Comes with a copy bank of real examples (not lorem), suppression and quiet-hours rules, and a small set of metrics so you can actually tell whether the flows are doing anything for retention or just generating opens.",
    features: [
      { icon: "Workflow", title: "Pre-built lifecycle flows", desc: "Welcome, onboarding, trial-to-paid, dunning, win-back, and re-engagement flows wired to product event triggers." },
      { icon: "Mail", title: "Typed Loops client", desc: "Autocomplete on audiences, contact properties, and event names so you stop typo-debugging at runtime." },
      { icon: "Palette", title: "Copy bank", desc: "Real examples and a 50+ subject-line library covering common B2B and B2C tones." },
      { icon: "ShieldCheck", title: "Suppression + quiet hours", desc: "Honors unsubscribes, marketing-vs-transactional split, and per-recipient quiet hours by timezone." },
      { icon: "LineChart", title: "Flow metrics", desc: "Track open, click, conversion, and downstream revenue per flow so you can prune what does not work." },
    ],
    integrations: [
      { name: "Loops", purpose: "Transactional and lifecycle email delivery, audiences, and events", required: true },
      { name: "Postgres", purpose: "Event log, suppression list, and per-flow attribution storage", required: true },
      { name: "Stripe", purpose: "Trigger trial-to-paid, dunning, and refund-aware flows from billing events" },
      { name: "Vercel Workflow", purpose: "Durable scheduling for delayed steps and time-based branches" },
    ],
    assets: [
      { label: "Flow library", detail: "Welcome, onboarding, trial-to-paid, dunning, win-back, and re-engagement flow definitions" },
      { label: "Typed Loops client", detail: "Wrapper with typed audiences, contact properties, and event names" },
      { label: "Copy bank", detail: "Subject-line library, body templates, and tone variants for B2B and B2C" },
      { label: "Suppression + quiet-hours rules", detail: "Unsubscribe handling, marketing/transactional split, and timezone-aware send windows" },
      { label: "Attribution dashboard", detail: "Open, click, conversion, and revenue impact per flow" },
    ],
    howItWorks: [
      { title: "Wire the events", desc: "Drop the typed Loops client into your app and emit signup, activation, plan, and payment events from the boundaries that already exist." },
      { title: "Turn flows on one at a time", desc: "Enable welcome and onboarding first, then trial-to-paid, then dunning — each with the included copy as a starting point." },
      { title: "Measure and prune", desc: "Use the attribution dashboard to keep the flows that move retention or revenue and retire the ones that just generate opens." },
    ],
    highlights: [
      { value: "6 flows", label: "welcome, onboarding, trial-to-paid, dunning, win-back, re-engagement" },
      { value: "50+ subject lines", label: "real examples, not lorem" },
      { value: "typed", label: "client with autocomplete on audiences and events" },
    ],
    relatedSlugs: ["resend-email-kit", "email-template-set", "stripe-billing-module"],
  },

  "mac-menubar-app": {
    longDescription:
      "SwiftUI menubar app template with login items and Sparkle updates. A polished starter for Mac apps with global hotkeys, login items, a settings panel, and Sparkle-based auto-update so your first shippable v1 feels like a native app, not a prototype.",
    features: [
      { icon: "Zap", title: "Global hotkeys", desc: "System-wide shortcuts with proper conflict handling." },
      { icon: "Rocket", title: "Sparkle auto-update", desc: "Code-signed updates with channel support." },
      { icon: "Layers", title: "Login items", desc: "Start-at-login the modern macOS way, no legacy APIs." },
    ],
    assets: [
      { label: "Menubar shell", detail: "Status item, menu content, popover transitions, and panel patterns" },
      { label: "Settings surface", detail: "Preferences, update channel controls, and startup behavior" },
      { label: "Login-item flow", detail: "Start-at-login setup, permission handling, and safe first-run behavior" },
      { label: "Sparkle integration", detail: "Mac-native update pipeline with release-channel support" },
    ],
    highlights: [
      { value: "native", label: "swiftui menubar-first mac app shell" },
      { value: "sparkle", label: "auto-update path already wired" },
      { value: "startup-ready", label: "login items and hotkeys included" },
    ],
    relatedSlugs: ["electron-starter", "tauri-desktop-starter", "domain-hunter-app"],
  },

  "marketing-site-pro": {
    longDescription:
      "A multi-page marketing site with blog, changelog, customer stories, careers, legal pages, and a contact flow with CRM hooks. Everything you need to look like a company that has been shipping for years — from day one. MDX-powered long-form content, structured data baked in, and a small set of conversion patterns so the site does more than look pretty.",
    features: [
      { icon: "Globe", title: "Full marketing site", desc: "Home, features, pricing, about, careers, customer stories, blog, changelog, and legal pages — all wired together." },
      { icon: "Workflow", title: "CRM contact flow", desc: "Contact form that creates a deal in your CRM (HubSpot, Salesforce, Pipedrive) with full attribution attached, not just an email." },
      { icon: "Palette", title: "MDX everything", desc: "Long-form content authored in MDX with components, syntax highlighting, and embedded media." },
      { icon: "LineChart", title: "SEO + structured data", desc: "Sitemap, OG images, JSON-LD for Article, Product, FAQ, and Breadcrumbs — wired so search engines actually pick it up." },
      { icon: "Sparkles", title: "Conversion patterns", desc: "CTA placement, FAQ structure, social-proof rails, and a contact-flow funnel calibrated to convert without feeling pushy." },
    ],
    integrations: [
      { name: "Next.js App Router", purpose: "MDX pages, ISR for blog and changelog, and OG image generation", required: true },
      { name: "Tailwind CSS", purpose: "Token-driven styling and brand re-skin", required: true },
      { name: "HubSpot", purpose: "Contact and deal creation from the contact flow" },
      { name: "Salesforce", purpose: "Account, contact, and lead creation via the Salesforce sync kit" },
      { name: "Resend", purpose: "Contact-form notifications and newsletter confirmations" },
    ],
    assets: [
      { label: "Pages", detail: "Home, features, pricing, about, careers, contact, customer stories, and legal templates" },
      { label: "Blog + changelog", detail: "MDX-powered with category and tag taxonomy, RSS, and ISR" },
      { label: "Customer stories", detail: "Case study template with logo, quote, result triad, and structured data" },
      { label: "Contact flow", detail: "Branded contact form with CRM creation, attribution payload, and success state" },
      { label: "SEO + OG kit", detail: "Sitemap, JSON-LD helpers, and per-page OG image generation" },
    ],
    howItWorks: [
      { title: "Drop in your brand", desc: "Replace logo, colors, and copy through the token layer and content config — no per-page edits." },
      { title: "Wire CRM and email", desc: "Connect HubSpot or Salesforce so the contact flow creates real records instead of just sending you an email." },
      { title: "Ship blog and changelog", desc: "Author MDX content and let ISR plus the SEO kit handle the rest — sitemap, OG, structured data already wired." },
    ],
    highlights: [
      { value: "9 page types", label: "home, features, pricing, careers, blog, changelog, stories, legal, contact" },
      { value: "CRM-wired", label: "contact flow creates deals, not just emails" },
      { value: "SEO-ready", label: "sitemap, og images, structured data" },
    ],
    relatedSlugs: ["landing-page-kit", "landing-blocks-pack", "seo-playbook"],
  },

  "saas-metrics-hub-app": {
    longDescription:
      "A metrics product for B2B SaaS teams that need subscription health, retention, and forecasting without building a reporting warehouse first. It is centered on revenue truth, cohort analysis, and executive reporting rather than generic analytics dashboards that stop at pageviews and events.",
    features: [
      { icon: "TrendingUp", title: "Revenue truth layer", desc: "Track MRR, ARR, expansion, contraction, churn, and plan mix from billing events and product data." },
      { icon: "UsersRound", title: "Cohorts + retention", desc: "Compare customer cohorts over time and surface gross and net retention without manual spreadsheet prep." },
      { icon: "Gauge", title: "Founder-facing dashboard", desc: "See board-level metrics, alerts, and trend shifts in a clean daily operating view." },
      { icon: "ChartNoAxesCombined", title: "Forecast scenarios", desc: "Model growth, churn, and cashflow assumptions with scenario snapshots you can actually share." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Subscription and revenue event ingestion", required: true },
      { name: "Better Auth", purpose: "Team access control and workspace security", required: true },
      { name: "SignalSplash", purpose: "Product usage and activation signal overlays" },
      { name: "Segment", purpose: "Optional product-event feed for deeper cohort definitions" },
    ],
    assets: [
      { label: "Executive dashboard", detail: "MRR, ARR, churn, growth deltas, and cash posture at a glance" },
      { label: "Cohort explorer", detail: "Logo retention, revenue retention, and cohort slicing across plans or segments" },
      { label: "Forecast workspace", detail: "Scenario builder for growth, churn, expansion, and runway assumptions" },
      { label: "Reporting exports", detail: "Board-ready summaries, investor snapshots, and shareable KPI packs" },
    ],
    howItWorks: [
      { title: "Connect revenue sources", desc: "Ingest Stripe first, then optionally layer in event or warehouse data where deeper segmentation matters." },
      { title: "Normalize the metrics", desc: "Turn raw billing activity into consistent subscription and retention definitions the whole team can trust." },
      { title: "Operate from one dashboard", desc: "Use the same product for weekly KPI reviews, board reporting, and forecast scenario checks." },
    ],
    highlights: [
      { value: "board-ready", label: "subscription reporting" },
      { value: "cohort-first", label: "retention analysis" },
      { value: "forecastable", label: "growth and churn scenarios" },
    ],
    relatedSlugs: ["signalsplash-kit", "analytics-wireup", "stripe-billing-module"],
  },

  "mentorship-platform": {
    longDescription:
      "Match mentors and mentees, schedule sessions, take payments. Profiles, matching, async messaging, scheduled video calls via Daily.co, and Stripe Connect payouts — the whole two-sided platform, ready for an engineering or coaching market.",
    features: [
      { icon: "Users", title: "Matching", desc: "Skill + timezone + goal match with overridable rules." },
      { icon: "Workflow", title: "Video calls", desc: "Daily.co-powered rooms with recording + transcripts." },
      { icon: "CreditCard", title: "Stripe Connect", desc: "Payouts to mentors with platform fee handling." },
    ],
    integrations: [
      { name: "Stripe Connect", purpose: "Two-sided payments + payouts", required: true },
      { name: "Daily.co", purpose: "Video rooms + recording" },
    ],
    assets: [
      { label: "Profile directory", detail: "Mentor specialties, availability, pricing, goals, and credibility signals" },
      { label: "Matching workspace", detail: "Requests, fit scoring, approval queue, and intro handoff flow" },
      { label: "Session experience", detail: "Scheduling, room launch, async prep, and post-session notes" },
      { label: "Payout console", detail: "Platform fees, mentor payouts, and settlement visibility" },
    ],
    highlights: [
      { value: "2-sided", label: "mentor and mentee marketplace" },
      { value: "connect", label: "platform fees and payouts included" },
      { value: "async + live", label: "messaging and scheduled sessions" },
    ],
    relatedSlugs: ["booking-template", "workshop-course-platform"],
  },

  "motion-primitives": {
    longDescription:
      "A set of ready-to-use transitions, stagger grids, and page-motion primitives. Entrance and exit animations, shared layout transitions between routes and lists, scroll-linked effects, and reduced-motion defaults so your interactions feel considered instead of jittery. Built so you stop reaching for one-off Framer Motion variants every time a card needs to enter.",
    features: [
      { icon: "Sparkles", title: "Entrance library", desc: "FadeIn, SlideIn, ScaleIn, and StaggerGrid primitives — typed, composable, and tuned for product UIs." },
      { icon: "Layers", title: "Shared layout", desc: "Auto-animate between route and list transitions with stable motion defaults across views." },
      { icon: "Shield", title: "Reduced-motion safe", desc: "Every primitive falls back to an opacity-only transition when the user prefers reduced motion." },
      { icon: "Zap", title: "Scroll-linked effects", desc: "Viewport-triggered reveals, parallax helpers, and progress-linked transforms with a sane API." },
      { icon: "Workflow", title: "Page transition kit", desc: "App Router page-transition patterns that work with Server Components and respect cache." },
    ],
    integrations: [
      { name: "Framer Motion", purpose: "Underlying animation engine and shared-layout system", required: true },
      { name: "Tailwind CSS", purpose: "Token integration for duration, easing, and stagger primitives" },
      { name: "Next.js App Router", purpose: "Page-transition patterns compatible with RSC and cache" },
    ],
    assets: [
      { label: "Primitive library", detail: "Entrance, exit, hover, and page-transition building blocks" },
      { label: "Scroll effects", detail: "Viewport-triggered motion, reveal helpers, and linked-progress patterns" },
      { label: "Shared-layout tools", detail: "List, detail, and route transitions with stable motion defaults" },
      { label: "Reduced-motion layer", detail: "Fallback strategy and accessibility-safe animation presets" },
    ],
    highlights: [
      { value: "composable", label: "drop-in motion building blocks" },
      { value: "shared-layout", label: "stateful transitions without one-off glue" },
      { value: "safe", label: "reduced-motion behavior already handled" },
    ],
    relatedSlugs: ["summoniq-ui-kit", "landing-blocks-pack", "dashboard-design-kit"],
  },

  "multi-tenant-b2b": {
    longDescription:
      "Orgs, roles, invites, and per-tenant scoping done right. Workspace switcher, RBAC, invitation flows, audit log, data isolation patterns, and middleware-enforced tenant scoping — the architecture you wish you had gotten right from day one rather than retrofitted under load. Includes the seat-based billing hooks, impersonation flow, and per-tenant settings model that B2B products end up needing.",
    features: [
      { icon: "Users", title: "Workspace switcher", desc: "Fast switching with org-scoped URLs and sessions and a sane default workspace policy." },
      { icon: "Shield", title: "Middleware-enforced isolation", desc: "Cross-tenant data leaks are impossible, not just unlikely — middleware and Prisma helpers enforce scoping at every boundary." },
      { icon: "Workflow", title: "Audit log", desc: "Every privileged action logged with actor, target, and a structured diff so support can reconstruct what happened." },
      { icon: "Mail", title: "Invites + onboarding", desc: "Magic-link invites with role assignment, scoped sign-up, and a clean first-run experience for new members." },
      { icon: "CreditCard", title: "Seat-based billing hooks", desc: "Member counts and seat changes propagated to Stripe with proration patterns that match how B2B actually buys." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Organizations, member roles, and impersonation", required: true },
      { name: "Prisma", purpose: "Scoped queries, row-level helpers, and tenant-aware migrations", required: true },
      { name: "Postgres", purpose: "Org, member, invite, and audit-log storage", required: true },
      { name: "Stripe", purpose: "Seat-based subscriptions and proration on member changes" },
      { name: "Resend", purpose: "Invite emails and member-change notifications" },
    ],
    assets: [
      { label: "Org + member model", detail: "Organization, membership, role, and invite schemas with scoped query helpers" },
      { label: "Workspace switcher", detail: "UI and URL conventions for switching orgs without losing context" },
      { label: "Middleware enforcement", detail: "Tenant-scoping middleware that blocks cross-org data access at the request layer" },
      { label: "Audit log", detail: "Append-only log of privileged actions with structured diffs and a query view" },
      { label: "Seat billing wiring", detail: "Stripe seat-based subscription and proration hooks for member changes" },
    ],
    howItWorks: [
      { title: "Add the org layer", desc: "Drop in the org and membership schemas alongside your existing user model and switch your route helpers to org-scoped variants." },
      { title: "Enforce tenant scoping", desc: "Use the middleware and Prisma helpers everywhere data is read, so cross-tenant access is structurally prevented rather than reviewed for." },
      { title: "Wire seats and audit", desc: "Connect seat counts to Stripe and turn on the audit log for privileged surfaces — both are runtime-cheap and operationally invaluable." },
    ],
    highlights: [
      { value: "structural", label: "tenant isolation enforced in middleware" },
      { value: "audit-ready", label: "every privileged action recorded" },
      { value: "seat-based", label: "stripe billing hooks for member changes" },
    ],
    relatedSlugs: ["auth-billing-boilerplate", "nextjs-saas-starter", "better-auth-setup"],
  },

  "nextjs-saas-starter": {
    longDescription:
      "Next.js SaaS Starter is the production codebase we wished existed when starting our last 5 client projects. Auth, billing, teams, role-based access, transactional email, and a polished marketing site — all wired up the way you'd actually ship to production. Skip the first sprint of every SaaS.",
    features: [
      { icon: "Fingerprint", title: "Email + passkey auth", desc: "Better Auth with passkeys, email verification, and password reset." },
      { icon: "CreditCard", title: "Stripe subscriptions", desc: "Tiered plans, proration, customer portal, dunning, and webhooks." },
      { icon: "Users", title: "Organizations + roles", desc: "Workspace switcher, invites, owner/admin/member, audit log." },
      { icon: "Server", title: "Server Actions", desc: "Typed Server Actions everywhere, with end-to-end zod validation." },
      { icon: "Mail", title: "Transactional email", desc: "React Email templates wired to Resend with a typed sender helper." },
      { icon: "Palette", title: "Polished UI", desc: "Marketing site, dashboard, settings, and a billing page — all on brand." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Subscriptions, customer portal, webhooks", required: true },
      { name: "Better Auth", purpose: "Email + passkey + organizations", required: true },
      { name: "Resend", purpose: "Transactional email via React Email", required: true },
      { name: "Neon Postgres", purpose: "Serverless Postgres with branching" },
      { name: "Vercel", purpose: "Deploy target with preview envs" },
      { name: "PostHog", purpose: "Optional product analytics adapter" },
    ],
    assets: [
      { label: "Marketing site", detail: "Landing, pricing, FAQ, contact, blog scaffold" },
      { label: "Auth flows", detail: "Sign in, sign up, passkey, password reset, verify email" },
      { label: "Billing", detail: "Plan picker, customer portal, webhook handler" },
      { label: "Org management", detail: "Workspace switcher, invites, member roles" },
      { label: "Email templates", detail: "Welcome, invite, password reset, receipt" },
    ],
    highlights: [
      { value: "1 day", label: "From clone to first paid checkout" },
      { value: "95+", label: "Lighthouse score on every page" },
      { value: "2 weeks", label: "Of plumbing work you skip" },
    ],
    codeSample: {
      lang: "typescript",
      filename: "app/api/billing/checkout/route.ts",
      code: `import { stripe, PLANS } from "@/lib/stripe";
import { auth } from "@/lib/auth/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { plan } = await req.json();
  const priceId = PLANS[plan]?.priceId;
  if (!priceId) return new Response("Invalid plan", { status: 400 });

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${req.headers.get("origin")}/billing?success=true\`,
    cancel_url: \`\${req.headers.get("origin")}/billing\`,
    metadata: { userId: session.user.id, plan },
  });

  return Response.json({ url: checkout.url });
}`,
    },
    relatedSlugs: ["auth-billing-boilerplate", "multi-tenant-b2b", "marketing-site-pro"],
  },

  "personal-finance-pwa": {
    longDescription:
      "Multi-currency budgeting, investments, goals, and offline-first sync. PWA-ready personal finance template with category budgets, recurring rules, investment tracking, and an IndexedDB layer that keeps working on the subway.",
    features: [
      { icon: "Database", title: "Offline-first", desc: "IndexedDB cache with conflict-free sync when you're back online." },
      { icon: "LineChart", title: "Investments", desc: "Positions, cost basis, returns — across brokerages." },
      { icon: "Workflow", title: "Recurring rules", desc: "Auto-categorize repeating transactions without pain." },
    ],
    assets: [
      { label: "Finance dashboard", detail: "Net worth, budget status, account balances, and upcoming obligations" },
      { label: "Transaction workspace", detail: "Categorization, recurring rules, search, and reconciliation flow" },
      { label: "Investment tracker", detail: "Holdings, returns, allocation, and account-level performance" },
      { label: "Offline sync layer", detail: "PWA shell, local cache, queued edits, and reconnect-safe reconciliation" },
    ],
    highlights: [
      { value: "offline-first", label: "pwa behavior with local persistence" },
      { value: "multi-currency", label: "budgets and accounts across currencies" },
      { value: "investments", label: "portfolio and transaction tracking together" },
    ],
    relatedSlugs: ["admin-dashboard", "booking-template"],
  },

  "pricing-playbook": {
    longDescription:
      "How to price templates, SaaS, and consultancy work. Frameworks, anchor strategies, copy templates for pricing pages, and FAQ patterns that make buyers commit. Includes 12 worked examples from real products.",
    features: [
      { icon: "Workflow", title: "Frameworks", desc: "Value-based, tiered, and usage pricing — with when to use each." },
      { icon: "Mail", title: "Page copy", desc: "Headlines, value stacks, and objection-handling FAQ patterns." },
      { icon: "Layers", title: "12 examples", desc: "Real products, real numbers, with what worked and what didn't." },
    ],
    assets: [
      { label: "Pricing frameworks", detail: "Decision guides for one-time, subscription, tiered, and usage-based offers" },
      { label: "Worked examples", detail: "Reference breakdowns showing how real products were packaged and priced" },
      { label: "Copy toolkit", detail: "Headline, value stack, plan-table, and FAQ language you can adapt directly" },
      { label: "Change strategy", detail: "How to reprice, grandfather, and communicate plan changes without chaos" },
    ],
    highlights: [
      { value: "12 examples", label: "real pricing breakdowns" },
      { value: "copy-ready", label: "pricing-page language and faq patterns" },
      { value: "multi-model", label: "saas, templates, and services covered" },
    ],
    relatedSlugs: ["indie-launch-playbook", "seo-playbook"],
  },

  "publishing-platform": {
    longDescription:
      "Long-form authoring + Stripe-monetized reading. Editor-grade authoring with TipTap, paid subscriptions, paywalled posts, comment threads, and a reading experience that respects the writer.",
    features: [
      { icon: "Palette", title: "TipTap editor", desc: "Rich-text editor with slash menu, embeds, and image handling." },
      { icon: "CreditCard", title: "Paid subscriptions", desc: "Monthly + yearly tiers, gift subs, annual discounts." },
      { icon: "Users", title: "Comments", desc: "Threaded, subscriber-only, with sensible defaults against spam." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Subscriptions + one-off tips", required: true },
      { name: "Resend", purpose: "Post-publish email delivery" },
    ],
    assets: [
      { label: "Writer studio", detail: "Draft management, structured post editor, issue scheduling, and publication settings" },
      { label: "Reader experience", detail: "Clean reading view, archive, collections, and subscriber-only content gates" },
      { label: "Subscription layer", detail: "Paid tiers, checkout, account management, and billing-aware access rules" },
      { label: "Comments + community", detail: "Threaded discussion, moderation controls, and subscriber engagement loops" },
    ],
    highlights: [
      { value: "paid", label: "subscriptions and one-off reader revenue" },
      { value: "long-form", label: "writer-first authoring and reading flow" },
      { value: "owned", label: "brand and subscriber relationship" },
    ],
    relatedSlugs: ["workshop-course-platform", "mentorship-platform"],
  },

  "realtime-collab-boilerplate": {
    longDescription:
      "Multiplayer cursors, presence, and live document state. WebSocket-based realtime with presence, ephemeral state, and a synced data store — wired to SummonFlow or any compatible provider so you can swap transport without rewriting the app.",
    features: [
      { icon: "Users", title: "Presence + cursors", desc: "See who's looking at what, in real time, with avatar chips." },
      { icon: "Database", title: "Synced state", desc: "CRDT-backed state store for collaborative documents." },
      { icon: "Plug", title: "Provider-agnostic", desc: "Abstracted transport — SummonFlow, Liveblocks, or your own." },
    ],
    integrations: [
      { name: "SummonFlow", purpose: "Realtime transport + channels", required: true },
    ],
    assets: [
      { label: "Collab surface", detail: "Shared canvas or document shell with live peers and interaction hooks" },
      { label: "Presence layer", detail: "Cursors, avatars, active selections, and online/offline participant state" },
      { label: "Synced store", detail: "Conflict-safe shared state with local optimism and remote reconciliation" },
      { label: "Transport adapter", detail: "Provider seam for swapping realtime backends without rebuilding the UI" },
    ],
    highlights: [
      { value: "multiplayer", label: "presence and shared state out of the box" },
      { value: "provider-agnostic", label: "transport abstraction already in place" },
      { value: "stateful", label: "not just cursors, actual synced data" },
    ],
    relatedSlugs: ["summonflow-realtime", "chat-agent-platform"],
  },

  "resend-email-kit": {
    longDescription:
      "A branded transactional and product email pipeline. Welcome, verify, reset, invite, receipt, weekly summary — all themeable React Email templates plus a typed sender helper, so adding a new email is three lines, not three files. Includes a local preview server, suppression handling, and the deliverability-friendly defaults (DKIM, SPF guidance, plain-text fallbacks) you would otherwise discover via spam folders.",
    features: [
      { icon: "Mail", title: "Typed sender", desc: "One sendEmail('welcome', { user }) call with fully typed props and compile-time safety on template names." },
      { icon: "Palette", title: "Theme tokens", desc: "Change brand color, logo, and footer once and have every template reflect the update." },
      { icon: "Workflow", title: "Dev preview server", desc: "Local preview server with seed data for every template, so you stop sending test emails to yourself." },
      { icon: "ShieldCheck", title: "Suppression + bounces", desc: "Honors unsubscribes and hard bounces with a local suppression list mirrored from Resend." },
      { icon: "FileText", title: "Plain-text + accessibility", desc: "Every template ships with a hand-tuned plain-text fallback and accessible color contrast out of the box." },
    ],
    integrations: [
      { name: "Resend", purpose: "Transactional email delivery and webhooks", required: true },
      { name: "React Email", purpose: "Template authoring, preview, and rendering", required: true },
      { name: "Postgres", purpose: "Suppression list, send log, and bounce tracking" },
      { name: "Vercel Workflow", purpose: "Durable retries for transient send failures" },
    ],
    assets: [
      { label: "Template library", detail: "Welcome, verify, reset, invite, receipt, weekly summary, and announcement templates" },
      { label: "Typed sender", detail: "sendEmail helper with typed template names and props plus a render-only mode for testing" },
      { label: "Theme tokens", detail: "Brand color, logo, footer, and typography tokens applied across every template" },
      { label: "Preview server", detail: "Local dev server with seed data and dark/light preview for every template" },
      { label: "Suppression + bounce kit", detail: "Suppression list mirror, bounce handler, and webhook wiring for Resend events" },
    ],
    howItWorks: [
      { title: "Drop in the kit", desc: "Add the typed sender, template library, and theme tokens to any Next.js or Node project." },
      { title: "Brand it once", desc: "Set your brand tokens in one place and watch every template pick them up — no per-template overrides." },
      { title: "Send with one line", desc: "Use sendEmail with typed props from anywhere in your app and let the kit handle suppression, retries, and bounces." },
    ],
    highlights: [
      { value: "7 templates", label: "welcome, verify, reset, invite, receipt, summary, announcement" },
      { value: "1 line", label: "to add a new email send" },
      { value: "deliverability-first", label: "plain-text, suppression, bounces" },
    ],
    relatedSlugs: ["email-template-set", "loops-email-automation"],
  },

  "seo-playbook": {
    longDescription:
      "A practical playbook for shipping hundreds of indexable pages without turning your codebase into a content farm. Covers the data model behind programmatic SEO, the page archetypes that earn rankings, the technical hygiene Google actually penalizes you for missing, and the sitemap and indexing pipeline that turns new content into crawled pages within hours instead of weeks. Ships as a written guide plus a working Next.js example repo you can lift patterns from.",
    features: [
      { icon: "Globe", title: "Programmatic SEO", desc: "Template-driven pages generated from a Postgres table with per-page metadata, canonical URLs, and structured data." },
      { icon: "Workflow", title: "Sitemap + IndexNow", desc: "Segmented sitemaps, automatic regeneration on content change, and IndexNow pings to Bing and Yandex on publish." },
      { icon: "Palette", title: "Content archetypes", desc: "Comparison, alternatives, listicle, location, and integration page templates with worked examples that match real search intent." },
      { icon: "LineChart", title: "Quality and dedup gates", desc: "Patterns for detecting thin pages, near-duplicate content, and orphaned URLs before they get indexed and pull down site authority." },
      { icon: "Shield", title: "Technical SEO checklist", desc: "Robots, canonicals, hreflang, breadcrumbs, structured data, and Core Web Vitals — with the actual code, not vague advice." },
    ],
    integrations: [
      { name: "Next.js App Router", purpose: "Statically generated programmatic pages with ISR for fresh content", required: true },
      { name: "Postgres", purpose: "Source-of-truth content table that drives generated pages", required: true },
      { name: "IndexNow", purpose: "Push new and updated URLs to Bing and Yandex on publish" },
      { name: "Google Search Console", purpose: "Indexing diagnostics, sitemap submission, and coverage monitoring" },
    ],
    assets: [
      { label: "Programmatic page generator", detail: "Next.js route, data loader, and metadata builder for one template-driven archetype" },
      { label: "Sitemap pipeline", detail: "Segmented sitemap generator, refresh triggers, and IndexNow client wiring" },
      { label: "Archetype reference set", detail: "Comparison, alternatives, listicle, integration, and location page templates with example content" },
      { label: "Quality gate scripts", detail: "Thin-page, duplicate-content, and orphan-URL detection runnable from CI" },
      { label: "Technical SEO checklist", detail: "Step-by-step audit covering canonicals, structured data, robots, and Core Web Vitals" },
    ],
    howItWorks: [
      { title: "Model your content surface", desc: "Decide the canonical entity (alternatives, integrations, locations) and shape the Postgres table that will drive every generated page." },
      { title: "Build one archetype well", desc: "Use the reference templates to ship a single page type with strong content patterns, structured data, and metadata before you scale." },
      { title: "Wire the indexing pipeline", desc: "Generate segmented sitemaps, ping IndexNow on publish, and monitor coverage so new pages get crawled instead of buried." },
    ],
    highlights: [
      { value: "5", label: "page archetypes with worked examples" },
      { value: "1", label: "working Next.js example repo" },
      { value: "0", label: "hand-rolled sitemap or indexing scripts" },
    ],
    relatedSlugs: ["marketing-site-pro", "indie-launch-playbook", "pricing-playbook"],
  },

  "signalsplash-kit": {
    longDescription:
      "Self-host the SummonIQ analytics stack on your own infra. API ingest service, dashboard, and SDK pre-configured. Per-app keys, retention controls, and privacy-first defaults so your analytics don't turn into a compliance project.",
    features: [
      { icon: "Server", title: "Self-hosted", desc: "Deploy to Vercel or your own infra in under 10 minutes." },
      { icon: "Shield", title: "Privacy-first", desc: "No cookies by default; IP hashing; configurable retention." },
      { icon: "LineChart", title: "Dashboard included", desc: "Funnels, retention, events — no third-party add-ons needed." },
    ],
    integrations: [
      { name: "Postgres", purpose: "Analytics event, session, and user storage", required: true },
      { name: "SignalSplash client SDK", purpose: "Typed event capture in your product surfaces", required: true },
      { name: "Vercel", purpose: "Fast default deploy target for dashboard + ingest API" },
    ],
    assets: [
      { label: "Ingest API", detail: "Event collection endpoint with per-app separation and web-vitals support" },
      { label: "Analytics dashboard", detail: "Overview, sessions, events, web vitals, and per-app breakdown views" },
      { label: "SDK package", detail: "Client setup for page views, custom events, and web vitals" },
      { label: "Privacy defaults", detail: "Retention controls, IP handling, and consent-friendly event patterns" },
    ],
    howItWorks: [
      { title: "Deploy the stack", desc: "Bring up the ingest API, dashboard, and database with one environment pass instead of composing separate tools." },
      { title: "Register your apps", desc: "Assign a clean app ID per product so traffic, sessions, and funnels stay isolated." },
      { title: "Wire the SDK", desc: "Point your frontend at the ingest endpoint and start sending page views, vitals, and custom events." },
    ],
    highlights: [
      { value: "10 min", label: "To first self-hosted ingest" },
      { value: "Per-app", label: "Scoped event streams and dashboards" },
      { value: "Privacy-first", label: "Sane defaults without third-party bloat" },
    ],
    relatedSlugs: ["analytics-wireup", "summonflow-realtime"],
  },

  "stripe-billing-module": {
    longDescription:
      "A drop-in Stripe billing module that handles the parts you usually only discover in production. Subscriptions and metered usage on the same customer, Checkout and Customer Portal wired correctly, an idempotent webhook handler with replay tooling, proration helpers with real tests, tax and invoice handling, and a small reconciliation surface so finance can answer 'why does the dashboard not match Stripe' without paging engineering.",
    features: [
      { icon: "CreditCard", title: "Subscriptions + metering", desc: "Fixed plans and usage-based metering combined on the same customer with one consistent state model." },
      { icon: "Workflow", title: "Idempotent webhooks", desc: "Retry-safe state machine with event-id deduplication and a replay tool for debugging missed or out-of-order events." },
      { icon: "Shield", title: "Proration helpers", desc: "Upgrade, downgrade, and seat-change math done right with unit tests for every common transition." },
      { icon: "Receipt", title: "Tax and invoicing", desc: "Stripe Tax wiring, invoice settings, and proper handling of trials, free plans, and zero-amount subscriptions." },
      { icon: "Database", title: "Reconciliation view", desc: "A small admin surface that compares your local subscription state against Stripe so drift is detected, not discovered." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Subscriptions, Checkout, Portal, Webhooks, Tax, and Invoices", required: true },
      { name: "Postgres", purpose: "Local subscription mirror, webhook event ledger, and reconciliation queries", required: true },
      { name: "Better Auth", purpose: "Customer-to-user mapping and seat-based subscriptions for organizations" },
      { name: "Vercel Workflow", purpose: "Durable retries for webhook side effects and reconciliation jobs" },
    ],
    assets: [
      { label: "Webhook handler", detail: "Idempotent inbound endpoint with signature verification, deduplication, and a retry-safe state machine" },
      { label: "Subscription state model", detail: "Local mirror of customers, subscriptions, items, and invoices with deterministic transitions" },
      { label: "Checkout + Portal wiring", detail: "Hosted Checkout sessions and Customer Portal entry points with success and cancel handling" },
      { label: "Proration test suite", detail: "Unit tests covering upgrade, downgrade, seat change, and trial-to-paid math" },
      { label: "Reconciliation tools", detail: "Admin view and CLI to compare local state against Stripe and surface drift" },
    ],
    howItWorks: [
      { title: "Drop in the webhook + state model", desc: "Point Stripe webhooks at the included handler and let the state machine keep your local subscription mirror in sync." },
      { title: "Wire Checkout and Portal", desc: "Use the included session helpers for hosted Checkout and Customer Portal so plan changes and self-serve flows work without custom UI." },
      { title: "Operate with confidence", desc: "Use the reconciliation tools and replay tooling to debug discrepancies and onboard finance without escalating to engineering." },
    ],
    highlights: [
      { value: "1 source of truth", label: "local mirror always reconciled with stripe" },
      { value: "idempotent", label: "webhook handler with replay tooling" },
      { value: "tested", label: "proration math with real unit coverage" },
    ],
    codeSample: {
      lang: "typescript",
      filename: "lib/billing/webhook.ts",
      code: `import { handleStripeEvent } from "stripe-billing-module";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const payload = await req.text();
  return handleStripeEvent({
    payload,
    signature: sig,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
    handlers: {
      async "customer.subscription.updated"(sub) {
        await db.subscription.upsert({ where: { id: sub.id }, create: sub, update: sub });
      },
    },
  });
}`,
    },
    relatedSlugs: ["auth-billing-boilerplate", "nextjs-saas-starter"],
  },

  "summonflow-realtime": {
    longDescription:
      "A drop-in realtime layer built on SummonFlow with the React hooks, server bindings, and operational patterns you would otherwise have to assemble yourself. Channels, presence, encrypted events, history replay, and reconnection handling are pre-wired so you can ship live cursors, chat, notifications, or collaborative state in days instead of redesigning your data layer around websockets.",
    features: [
      { icon: "Zap", title: "React hooks", desc: "useChannel, usePresence, useSubscribe, and useBroadcast with a minimal, predictable API surface." },
      { icon: "Shield", title: "Encrypted channels", desc: "Optional end-to-end encryption on any channel with a clean key-rotation pattern." },
      { icon: "Workflow", title: "Server bindings", desc: "Typed server SDK for publishing events, gating subscriptions, and reading channel state from your backend." },
      { icon: "RefreshCcw", title: "Reconnection + replay", desc: "Automatic resubscription, missed-message replay, and presence resync after a dropped connection." },
      { icon: "Layers", title: "Example app", desc: "Working chat and live-cursor example you can strip down to your own use case in an afternoon." },
    ],
    integrations: [
      { name: "SummonFlow", purpose: "Realtime channels, presence, history, and encrypted transport", required: true },
      { name: "Better Auth", purpose: "Authenticated subscription gating and per-user channel scoping" },
      { name: "Postgres", purpose: "Optional message persistence, channel metadata, and audit log" },
      { name: "Vercel", purpose: "Default deploy target for the example app and webhook surface" },
    ],
    assets: [
      { label: "React hooks package", detail: "useChannel, usePresence, useSubscribe, useBroadcast, and reconnection-aware patterns" },
      { label: "Server SDK", detail: "Typed publish, subscribe-gate, and channel-state helpers for your backend" },
      { label: "Encrypted channel kit", detail: "Optional end-to-end encryption pattern with key rotation and recovery" },
      { label: "Example chat + cursors app", detail: "Working multi-user chat and live-cursor example to crib from" },
      { label: "Operational guide", detail: "Reconnection, backpressure, presence resync, and channel-scaling patterns" },
    ],
    howItWorks: [
      { title: "Add the React hooks", desc: "Drop useChannel and usePresence into your components and start sending and receiving events with minimal ceremony." },
      { title: "Wire the server bindings", desc: "Use the typed server SDK to publish events from APIs, gate subscriptions by auth, and read channel state where you need it." },
      { title: "Scale into real workloads", desc: "Follow the operational guide for reconnection, backpressure, presence, and channel scaling once you push past the example app." },
    ],
    highlights: [
      { value: "5 hooks", label: "channel, presence, subscribe, broadcast, history" },
      { value: "encrypted", label: "optional end-to-end channel encryption" },
      { value: "1 example app", label: "chat plus live cursors to crib from" },
    ],
    relatedSlugs: ["realtime-collab-boilerplate", "chat-agent-platform", "signalsplash-kit"],
  },

  "summoniq-ui-kit": {
    longDescription:
      "The same UI system we use to ship SummonIQ. Brand-tokenized, dark-first, motion-friendly, and shadcn-compatible — without the usual class-order fights. Includes core primitives, marketing-page blocks (hero, features, pricing, FAQ, CTA, logo strip), motion defaults that respect prefers-reduced-motion, and a token system you can re-skin to your brand in an afternoon instead of forking the whole library.",
    features: [
      { icon: "Palette", title: "Tokens + theming", desc: "CSS variables for color, type, radius, spacing, and motion with drop-in dark and light themes and a clean re-skin path." },
      { icon: "Layers", title: "Marketing blocks", desc: "Hero, features, pricing, FAQ, CTA, logo strip, and testimonial blocks — responsive, animated, and ready to compose." },
      { icon: "Sparkles", title: "Motion defaults", desc: "Cohesive easing curves and durations that respect prefers-reduced-motion without per-component conditionals." },
      { icon: "Plug", title: "shadcn interop", desc: "Works alongside shadcn primitives without class-order conflicts so you can mix and match in the same project." },
      { icon: "Workflow", title: "Composable primitives", desc: "Buttons, inputs, dropdowns, dialogs, tooltips, and tabs designed to compose without prop sprawl." },
    ],
    integrations: [
      { name: "Tailwind CSS", purpose: "Token-driven utility layer and theme system", required: true },
      { name: "shadcn/ui", purpose: "Primitive interop without class-order conflicts" },
      { name: "Framer Motion", purpose: "Motion primitives with reduced-motion safety" },
      { name: "Next.js", purpose: "First-class App Router integration and server-component compatibility" },
    ],
    assets: [
      { label: "Token system", detail: "CSS variables for color, type, radius, spacing, and motion with dark and light defaults" },
      { label: "Primitive library", detail: "Button, input, select, dialog, dropdown, tooltip, tabs, and toast components" },
      { label: "Marketing blocks", detail: "Hero, features, pricing, FAQ, CTA, logo strip, and testimonial blocks" },
      { label: "Motion kit", detail: "Easing curves, duration tokens, and reduced-motion-aware animation helpers" },
      { label: "Theming guide", detail: "Re-skin walkthrough covering tokens, dark/light, and brand variant setup" },
    ],
    howItWorks: [
      { title: "Drop in the tokens", desc: "Add the CSS variable layer and Tailwind config so every primitive and block immediately picks up your brand." },
      { title: "Compose pages from blocks", desc: "Use the marketing blocks for hero, features, pricing, FAQ, and CTA sections without rebuilding the same layouts each time." },
      { title: "Re-skin without forking", desc: "Tweak tokens, swap dark and light defaults, or layer a brand variant on top — no fork, no class-order war with shadcn." },
    ],
    highlights: [
      { value: "dark-first", label: "tokens with first-class dark and light themes" },
      { value: "shadcn-compatible", label: "no class-order conflicts" },
      { value: "motion-aware", label: "respects prefers-reduced-motion by default" },
    ],
    relatedSlugs: ["landing-blocks-pack", "motion-primitives", "dashboard-design-kit"],
  },

  "tauri-desktop-starter": {
    longDescription:
      "A production-grade Tauri 2 starter so you do not waste a week on plumbing before writing your actual app. Multi-window management, deep links, auto-update with rollback, signed installers for macOS and Windows, tray menu, global hotkeys, typed IPC, and a tested Rust-to-JS bridge are wired together the way they actually fit. Built for indie and team apps that want to ship a real desktop product, not a prototype with a dock icon.",
    features: [
      { icon: "Layers", title: "Multi-window", desc: "Spawn, focus, route, and close windows by id from JavaScript with deep-link integration." },
      { icon: "Rocket", title: "Auto-update", desc: "Code-signed updates with channel support, rollback on failure, and notarization-aware release flow." },
      { icon: "Zap", title: "Tray + global hotkeys", desc: "Stay-in-tray pattern, cross-platform shortcuts, and conflict-aware hotkey registration." },
      { icon: "Shield", title: "Tested IPC bridge", desc: "Typed Rust-to-JS commands with vitest coverage so refactors do not silently break the bridge." },
      { icon: "Package", title: "Signed installers", desc: "macOS notarized .dmg and Windows signed .msi/.exe with reproducible CI builds." },
    ],
    integrations: [
      { name: "Tauri 2", purpose: "Cross-platform desktop runtime and bundler", required: true },
      { name: "Vite + React", purpose: "Frontend dev server and build pipeline", required: true },
      { name: "GitHub Actions", purpose: "CI signing, notarization, and release artifact pipeline" },
      { name: "Tauri Updater", purpose: "Code-signed update channel with rollback support" },
    ],
    assets: [
      { label: "App shell", detail: "Multi-window manager, deep-link handler, and routing scaffold" },
      { label: "IPC layer", detail: "Typed command surface between Rust and JS with vitest coverage" },
      { label: "Tray + hotkey kit", detail: "Stay-in-tray patterns, popover behavior, and global shortcut registration" },
      { label: "Auto-update pipeline", detail: "Updater wiring, signed manifests, and rollback-safe release flow" },
      { label: "CI release workflow", detail: "GitHub Actions for signing, notarization, and artifact publishing on macOS and Windows" },
    ],
    howItWorks: [
      { title: "Clone and run", desc: "Get a working multi-window Tauri 2 app running locally with the typed IPC bridge already in place." },
      { title: "Wire your domain", desc: "Add your features on top of the IPC layer, tray surface, and routing scaffold without re-solving plumbing problems." },
      { title: "Ship signed builds", desc: "Use the included CI workflow to produce notarized macOS and signed Windows installers and push auto-updates." },
    ],
    highlights: [
      { value: "2 platforms", label: "macOS notarized and Windows signed installers" },
      { value: "typed IPC", label: "Rust-to-JS bridge with vitest coverage" },
      { value: "auto-update", label: "code-signed channel with rollback" },
    ],
    relatedSlugs: ["electron-starter", "mac-menubar-app"],
  },

  "tech-lead-guide": {
    longDescription:
      "An operating manual for new engineering leads and managers stepping into the role formally for the first time. It is not advice in the abstract — it is the rituals, templates, and decision frameworks you can paste into your team's wiki on day one and reuse every cycle. Covers the first 30-60-90 days, weekly operating rhythm, 1:1s, ADRs and RFCs, planning under roadmap pressure, code review and quality, incidents and on-call health, stakeholder communication, hiring and performance, cross-team collaboration, and the metrics-and-delegation discipline that keeps the role sustainable.",
    features: [
      { icon: "Workflow", title: "Doc templates", desc: "RFC, ADR, post-mortem, performance review, planning, and decision-log templates each with a worked example." },
      { icon: "Users", title: "Rituals and scripts", desc: "1:1, standup, planning, retro, expectation-reset, and critical-feedback scripts with cadence guidance." },
      { icon: "Rocket", title: "30-60-90 day plan", desc: "Structured plan for your first three months: what to learn, what to document, what to change, and what to leave alone." },
      { icon: "ShieldCheck", title: "Decision frameworks", desc: "ADR vs RFC, buy vs build, tech-debt triage, scope-tightening, and rollout-and-reversibility patterns calibrated to blast radius." },
      { icon: "MessagesSquare", title: "Stakeholder playbook", desc: "Status update structure, executive-communication standard, and pushback-handling patterns that stop fires before they reach leadership." },
    ],
    assets: [
      { label: "30-60-90 day plan", detail: "Step-by-step orientation, trust-building, documentation, and operating-change sequence for the first three months" },
      { label: "1:1 template pack", detail: "Kickoff, recurring, growth, performance, expectation-reset, and unblock-focused 1:1 docs with usage notes" },
      { label: "Decision document set", detail: "ADR, RFC, trade-off memo, technical-direction, and decision-log templates with worked examples" },
      { label: "Planning pack", detail: "Sprint planning, quarterly planning, project review, and re-planning templates with scope-and-risk framing" },
      { label: "Incident and post-mortem pack", detail: "Severity definitions, in-incident update template, post-mortem doc, and follow-up tracking sheet" },
      { label: "Stakeholder communication kit", detail: "Weekly written update, executive summary, and partner status templates" },
    ],
    howItWorks: [
      { title: "Start with the first-90-days path", desc: "Use the structured plan to decide what to learn first, what to write down, and which rituals to introduce in days 30-60 instead of week one." },
      { title: "Drop the templates into your team tools", desc: "Move the MDX or Notion docs into your own workspace and adapt them to your org's language, systems, and cadence." },
      { title: "Reuse the rituals every cycle", desc: "Bring the same review, planning, decision, and 1:1 templates forward into recurring team operations instead of treating them as onboarding-only docs." },
    ],
    highlights: [
      { value: "11", label: "chapters covering the full lead operating system" },
      { value: "12+", label: "reusable templates for 1:1s, planning, and decisions" },
      { value: "2 formats", label: "MDX and Notion-friendly docs" },
    ],
    relatedSlugs: ["codebase-audit-agent", "tech-lead-toolkit-app", "pricing-playbook", "indie-launch-playbook"],
  },

  "tech-lead-toolkit-app": {
    longDescription:
      "An operating system for engineering leads who need planning, delivery, people support, and decision hygiene in one product. It is designed around the real work of leading a team: understanding capacity, tracking execution risk, running 1:1s, documenting decisions, and balancing technical quality against delivery pressure.",
    features: [
      { icon: "UsersRound", title: "Team operating view", desc: "See ownership, load, growth plans, and support risk across the team instead of scattered manager notes." },
      { icon: "CalendarRange", title: "Capacity + planning", desc: "Model availability, delivery commitments, and staffing pressure before plans become deadlines." },
      { icon: "NotebookPen", title: "1:1s + decision logs", desc: "Keep recurring conversations, growth notes, and architecture decisions in a system the lead can actually reuse." },
      { icon: "ShieldCheck", title: "Execution risk visibility", desc: "Track dependencies, delivery health, debt pressure, and follow-through from one leadership surface." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Leader, manager, and contributor access boundaries", required: true },
      { name: "Stripe", purpose: "Commercialization if the toolkit is sold as a SaaS product" },
      { name: "Pusher", purpose: "Live collaboration, note updates, and activity streams" },
      { name: "Vercel Blob", purpose: "Attachments, templates, and exported leadership artifacts" },
    ],
    assets: [
      { label: "Leadership dashboard", detail: "Capacity, team health, delivery risk, and active follow-up snapshot" },
      { label: "1:1 workspace", detail: "Templates, recurring agendas, action items, and growth-note history" },
      { label: "Planning surfaces", detail: "Roadmap confidence, staffing view, and decision tradeoff tracking" },
      { label: "Decision archive", detail: "Architecture notes, rationale, owners, and revisit prompts" },
    ],
    howItWorks: [
      { title: "Set up the leadership model", desc: "Define your team, ownership map, planning cadence, and the leadership surfaces you actually want to operate from." },
      { title: "Run weekly execution from one place", desc: "Use the toolkit to track load, decisions, risk, 1:1 follow-ups, and planning changes together." },
      { title: "Keep context over time", desc: "Build a reusable history of staffing decisions, coaching conversations, and delivery tradeoffs instead of restarting each week." },
    ],
    highlights: [
      { value: "4 surfaces", label: "team, planning, 1:1s, decisions" },
      { value: "lead-first", label: "built for real engineering leadership work" },
      { value: "contextful", label: "history instead of fragmented notes" },
    ],
    relatedSlugs: ["tech-lead-guide", "dashboard-design-kit", "agency-dashboard-app"],
  },

  "typeform-intake-flow": {
    longDescription:
      "Multi-step intake forms that route to the right place. Branching forms, conditional logic, file uploads, and routed creation in HubSpot, Pipedrive, Linear, or Slack — all via a single webhook you control.",
    features: [
      { icon: "Workflow", title: "Branching logic", desc: "Conditional questions that adapt to each answer." },
      { icon: "Database", title: "Routed creation", desc: "Create a deal, ticket, or Slack thread based on answers." },
      { icon: "Shield", title: "File uploads", desc: "S3-backed upload with virus scanning built in." },
    ],
    integrations: [
      { name: "Typeform", purpose: "Form delivery", required: true },
      { name: "HubSpot", purpose: "Contact + deal creation" },
      { name: "Slack", purpose: "Routed notifications" },
    ],
    assets: [
      { label: "Intake map", detail: "Branching question path, conditional sections, and answer-based route logic" },
      { label: "Webhook router", detail: "Single intake endpoint that fans results into the right downstream target" },
      { label: "CRM handoff log", detail: "Created records, delivery outcomes, and retry visibility for each submission" },
      { label: "Upload review flow", detail: "Attachment handling, validation, and operator review for submitted files" },
    ],
    highlights: [
      { value: "1 webhook", label: "for every intake destination" },
      { value: "branching", label: "logic without custom form infrastructure" },
      { value: "multi-destination", label: "crm, tickets, slack, or queues" },
    ],
    relatedSlugs: ["hubspot-pipeline-sync", "lead-enrichment-agent"],
  },

  "workflow-engine": {
    longDescription:
      "Durable flows for backoffice automations. Author n8n-style flows in code or UI — triggers, steps, retries, idempotency, secrets, and webhook callbacks. Built on Vercel Workflow so flows survive restarts, timeouts, and retries without hand-rolled queues.",
    features: [
      { icon: "Workflow", title: "Code + UI authoring", desc: "Write flows in TypeScript or compose them visually — same engine." },
      { icon: "Shield", title: "Durable", desc: "Retries, idempotency keys, and step-level compensation." },
      { icon: "Plug", title: "Pluggable steps", desc: "HTTP, DB, AI, email, Stripe — steps as composable building blocks." },
    ],
    integrations: [
      { name: "Vercel Workflow", purpose: "Durable execution engine", required: true },
    ],
    assets: [
      { label: "Flow builder", detail: "Trigger, step, branch, and retry structure for authored automations" },
      { label: "Run inspector", detail: "Per-step execution logs, status changes, payload snapshots, and retry history" },
      { label: "Secrets + connections", detail: "Reusable credentials, environment scoping, and step-level config" },
      { label: "Ops console", detail: "Queue health, replay actions, paused runs, and failure triage surfaces" },
    ],
    highlights: [
      { value: "durable", label: "execution that survives retries and timeouts" },
      { value: "composable", label: "steps for http, db, ai, email, stripe" },
      { value: "observable", label: "run logs and replay path included" },
    ],
    relatedSlugs: ["realtime-collab-boilerplate", "typeform-intake-flow"],
  },

  "workshop-course-platform": {
    longDescription:
      "Run cohort-based workshops or self-paced courses without stitching together five tools. Cohorts, lessons, video player, assignments with rubric review, drip schedules, certificates, discussion threads, and a Stripe checkout for one-time, subscription, or cohort-priced enrollment — the whole teach-and-get-paid loop in a single repo. Built so the moment you have a curriculum and a date, you can sell tickets the same day.",
    features: [
      { icon: "Users", title: "Cohorts + drip", desc: "Scheduled start dates, group spaces, and per-lesson drip releases tied to cohort start." },
      { icon: "Workflow", title: "Assignments + rubric", desc: "Submit and review flow with rubric scoring, peer review option, and instructor feedback." },
      { icon: "CreditCard", title: "Flexible pricing", desc: "One-time course, subscription, or cohort-priced enrollment with team-seat support." },
      { icon: "MessagesSquare", title: "Discussion threads", desc: "Per-lesson and per-cohort discussion threads with moderation tools and pinned replies." },
      { icon: "Award", title: "Certificates", desc: "Auto-issued completion certificates with a verifiable URL and PDF download." },
    ],
    integrations: [
      { name: "Mux", purpose: "Video hosting and adaptive streaming with secure playback", required: true },
      { name: "Stripe", purpose: "Course sales, subscriptions, cohort pricing, and team-seat checkouts", required: true },
      { name: "Better Auth", purpose: "Student and instructor identity with role boundaries", required: true },
      { name: "Resend", purpose: "Cohort reminders, drip notifications, and certificate emails" },
    ],
    assets: [
      { label: "Curriculum builder", detail: "Cohort and self-paced course structure with modules, lessons, and drip rules" },
      { label: "Video player", detail: "Mux-backed player with progress tracking, captions, and resume" },
      { label: "Assignment workspace", detail: "Submit, review, rubric, and feedback flow with optional peer review" },
      { label: "Discussion threads", detail: "Per-lesson and per-cohort discussion with moderation and pins" },
      { label: "Certificates + checkout", detail: "Auto-issued certificates and Stripe-backed enrollment for individuals and teams" },
    ],
    howItWorks: [
      { title: "Author the curriculum", desc: "Build modules, lessons, and assignments once and offer them as a self-paced course or as a scheduled cohort." },
      { title: "Open enrollment", desc: "Use the Stripe checkout for one-time, subscription, or cohort pricing — including team-seat purchases." },
      { title: "Run the cohort", desc: "Drip lessons by start date, monitor assignment completion, and issue certificates without separate tools." },
    ],
    highlights: [
      { value: "self-paced + cohort", label: "two delivery models from one curriculum" },
      { value: "rubric-graded", label: "assignments with structured review" },
      { value: "certificates", label: "auto-issued with verifiable urls" },
    ],
    relatedSlugs: ["publishing-platform", "mentorship-platform"],
  },

  "electrobun-starter": {
    longDescription:
      "An Electrobun-based desktop starter for teams who want Electron-style ergonomics without Chromium bloat. Multi-window, native menus, typed IPC, OAuth helpers, auto-update, and signed installers for macOS and Windows — all running on Bun's TypeScript runtime so cold starts are fast and the bundle is small.",
    features: [
      { icon: "Layers", title: "Multi-window", desc: "Spawn, focus, route, and close windows by id from TypeScript with deep-link integration." },
      { icon: "Zap", title: "Bun-native runtime", desc: "Bun's TypeScript runtime out of the box — no transpile step, fast startup, and small bundles." },
      { icon: "Rocket", title: "Auto-update", desc: "Code-signed updates with channel support and rollback on failed verification." },
      { icon: "Shield", title: "Typed IPC", desc: "Type-safe message bus between main and renderer with vitest coverage so refactors do not silently break the bridge." },
      { icon: "Package", title: "Signed installers", desc: "macOS notarized .dmg and Windows signed .msi/.exe with reproducible CI builds." },
    ],
    integrations: [
      { name: "Electrobun", purpose: "Desktop runtime, packager, and updater", required: true },
      { name: "Bun", purpose: "TypeScript runtime, bundler, and test runner", required: true },
      { name: "GitHub Actions", purpose: "Signing, notarization, and release artifact pipeline" },
      { name: "Sparkle", purpose: "Optional macOS update channel for compatibility with existing release infra" },
    ],
    assets: [
      { label: "App shell", detail: "Multi-window manager, menu bar wiring, and routing scaffold" },
      { label: "Typed IPC layer", detail: "Type-safe message bus between main and renderer with vitest coverage" },
      { label: "Auto-update pipeline", detail: "Updater wiring, signed manifests, and rollback-safe release flow" },
      { label: "OAuth helper kit", detail: "PKCE flow, secure token storage, and refresh handling for desktop OAuth" },
      { label: "CI release workflow", detail: "GitHub Actions for signing, notarization, and artifact publishing on macOS and Windows" },
    ],
    howItWorks: [
      { title: "Clone and run", desc: "Get a working multi-window Electrobun app running locally on Bun with the typed IPC bridge already in place." },
      { title: "Wire your domain", desc: "Add features on top of the IPC layer, OAuth helper, and routing scaffold without re-solving plumbing problems." },
      { title: "Ship signed builds", desc: "Use the included CI workflow to produce notarized macOS and signed Windows installers and push auto-updates." },
    ],
    highlights: [
      { value: "Bun-native", label: "TypeScript runtime with no transpile step" },
      { value: "2 platforms", label: "macOS notarized and Windows signed installers" },
      { value: "typed IPC", label: "main-to-renderer bridge with vitest coverage" },
    ],
    relatedSlugs: ["electron-starter", "tauri-desktop-starter", "mac-menubar-app"],
  },

  "salesforce-pipeline-sync": {
    longDescription:
      "A drop-in Salesforce sync layer that mirrors your product state into accounts, contacts, and opportunities — and pulls sales-side updates back without spreadsheets, Zaps, or 2 AM debugging sessions. Idempotent webhook processing, batch backfill that respects API limits, per-field conflict rules with a debuggable change log, and a small ops surface so finance and sales can self-serve answers like 'why did this opportunity stage flip back?'",
    features: [
      { icon: "Workflow", title: "Two-way sync", desc: "Writes and reads both directions with per-field conflict rules and a clear winner-picking strategy you can audit." },
      { icon: "Database", title: "Batch backfill", desc: "Seed Salesforce from your existing users and accounts with rate-limit aware batching, resumable runs, and dry-run mode." },
      { icon: "Shield", title: "Idempotent webhooks", desc: "Retry-safe inbound handler with event deduplication and a state machine that converges to the same outcome." },
      { icon: "Activity", title: "Activity timeline", desc: "Push trial events, plan changes, and feature usage into Salesforce activities so reps see product context inside the CRM." },
      { icon: "RefreshCcw", title: "Conflict resolution log", desc: "Every overridden field is recorded with the source, value, and reason so disputes between sales and product can be resolved with data." },
    ],
    integrations: [
      { name: "Salesforce", purpose: "Accounts, contacts, leads, opportunities, and activities", required: true },
      { name: "Postgres", purpose: "Local mirror, sync ledger, and conflict-resolution log", required: true },
      { name: "Vercel Workflow", purpose: "Durable backfill jobs and retried sync steps" },
      { name: "Slack", purpose: "Optional alerts on sync failures, conflict spikes, or backfill completion" },
    ],
    assets: [
      { label: "Field mapping config", detail: "Typed mapping between product entities and Salesforce account, contact, lead, and opportunity fields" },
      { label: "Webhook handler", detail: "Idempotent inbound handler with signature verification, deduplication, and replay tooling" },
      { label: "Backfill runner", detail: "Resumable batch sync with rate-limit pacing, dry-run mode, and per-batch reporting" },
      { label: "Conflict ledger", detail: "Per-field change log with source, prior value, new value, and resolution reason" },
      { label: "Operations dashboard", detail: "Sync health, queue depth, error rate, and recent conflict overview" },
    ],
    howItWorks: [
      { title: "Map your fields", desc: "Use the typed mapping config to declare which product entities map to which Salesforce objects and how each field is owned." },
      { title: "Backfill before you go live", desc: "Run the batch backfill in dry-run, review the diff, then promote to a real sync without rate-limit drama." },
      { title: "Operate with the conflict log", desc: "Inbound and outbound changes flow through the idempotent handler with a debuggable conflict log so support and sales can self-serve answers." },
    ],
    highlights: [
      { value: "2-way", label: "sync with per-field conflict resolution" },
      { value: "idempotent", label: "webhook handler with replay tooling" },
      { value: "auditable", label: "conflict ledger for every overridden field" },
    ],
    relatedSlugs: ["hubspot-pipeline-sync", "pipedrive-pipeline-sync", "ai-sales-agent"],
  },

  "pipedrive-pipeline-sync": {
    longDescription:
      "Two-way sync between your app and Pipedrive deals. Mirror users to people, plans to deals, and product activity to notes and timeline events. Idempotent webhook processing, batch backfill that respects API limits, per-field conflict rules with a debuggable change log, and a small ops surface so reps and product can self-serve answers when the deal status looks wrong.",
    features: [
      { icon: "Workflow", title: "Two-way sync", desc: "Writes and reads both directions with per-field conflict rules and a clear winner-picking strategy you can audit." },
      { icon: "Database", title: "Batch backfill", desc: "Seed Pipedrive from your existing users and orgs with rate-limit aware batching, resumable runs, and dry-run mode." },
      { icon: "Shield", title: "Idempotent webhooks", desc: "Retry-safe inbound handler with event deduplication and a state machine that converges to the same outcome." },
      { icon: "Activity", title: "Activity timeline", desc: "Push trial events, plan changes, and feature usage into Pipedrive notes and timeline events so reps see product context." },
      { icon: "RefreshCcw", title: "Conflict resolution log", desc: "Every overridden field is recorded with the source, value, and reason so deal-state disputes can be resolved with data." },
    ],
    integrations: [
      { name: "Pipedrive", purpose: "People, organizations, deals, and activities", required: true },
      { name: "Postgres", purpose: "Local mirror, sync ledger, and conflict-resolution log", required: true },
      { name: "Vercel Workflow", purpose: "Durable backfill jobs and retried sync steps" },
      { name: "Slack", purpose: "Optional alerts on sync failures, conflict spikes, or backfill completion" },
    ],
    assets: [
      { label: "Field mapping config", detail: "Typed mapping between product entities and Pipedrive person, org, deal, and activity fields" },
      { label: "Webhook handler", detail: "Idempotent inbound handler with signature verification, deduplication, and replay tooling" },
      { label: "Backfill runner", detail: "Resumable batch sync with rate-limit pacing, dry-run mode, and per-batch reporting" },
      { label: "Conflict ledger", detail: "Per-field change log with source, prior value, new value, and resolution reason" },
      { label: "Operations dashboard", detail: "Sync health, queue depth, error rate, and recent conflict overview" },
    ],
    howItWorks: [
      { title: "Map your fields", desc: "Declare which product entities map to which Pipedrive objects and how each field is owned." },
      { title: "Backfill before you go live", desc: "Dry-run the batch sync, review the diff, then promote to a real sync without rate-limit drama." },
      { title: "Operate with the conflict log", desc: "Inbound and outbound changes flow through the idempotent handler with a debuggable conflict log." },
    ],
    highlights: [
      { value: "2-way", label: "sync with per-field conflict resolution" },
      { value: "idempotent", label: "webhook handler with replay tooling" },
      { value: "auditable", label: "conflict ledger for every overridden field" },
    ],
    relatedSlugs: ["hubspot-pipeline-sync", "salesforce-pipeline-sync", "ai-sales-agent"],
  },

  "intercom-sync": {
    longDescription:
      "A drop-in Intercom sync kit for product teams who want CRM-quality customer data without leaving Intercom as the support and messaging surface. Pushes users, companies, plans, and product events into Intercom; receives conversation events back; ships a typed client, an idempotent webhook handler with deduplication, suppression rules, and patterns for triggering in-app messages and tours from your own app state.",
    features: [
      { icon: "Workflow", title: "User + company sync", desc: "Mirror users, companies, plans, and traits into Intercom with typed contact and company shape." },
      { icon: "Mail", title: "Event + message triggers", desc: "Send product events that trigger in-app messages and tours; receive conversation events for support routing." },
      { icon: "Shield", title: "Idempotent webhooks", desc: "Retry-safe inbound handler with event deduplication and a clear state machine." },
      { icon: "ShieldCheck", title: "Suppression + consent", desc: "Honors unsubscribes and marketing-versus-transactional split with timezone-aware send windows." },
      { icon: "LineChart", title: "Conversation reporting", desc: "Pipe Intercom conversation outcomes back into your data warehouse for first-touch and resolution analytics." },
    ],
    integrations: [
      { name: "Intercom", purpose: "Contacts, companies, conversations, events, and in-app messages", required: true },
      { name: "Postgres", purpose: "Event ledger, suppression list, and per-message attribution storage", required: true },
      { name: "Vercel Workflow", purpose: "Durable retries and time-based message-trigger branches" },
    ],
    assets: [
      { label: "Typed Intercom client", detail: "Wrapper with typed contacts, companies, events, and message-trigger surfaces" },
      { label: "Webhook handler", detail: "Idempotent inbound endpoint with signature verification and deduplication" },
      { label: "Event + message library", detail: "Common product event mappings with example in-app message and tour triggers" },
      { label: "Suppression + consent rules", detail: "Unsubscribe handling and marketing/transactional split" },
      { label: "Conversation reporting view", detail: "Outcome and resolution metrics that pipe back into your warehouse" },
    ],
    howItWorks: [
      { title: "Wire the client", desc: "Drop the typed client into your app and emit user, company, and product events from existing boundaries." },
      { title: "Trigger messages from product state", desc: "Use event mappings to fire in-app messages and tours without rebuilding the trigger logic in Intercom alone." },
      { title: "Close the loop", desc: "Receive conversation events back into your warehouse to attribute support to product surfaces and plans." },
    ],
    highlights: [
      { value: "typed", label: "client with autocomplete on contacts and events" },
      { value: "idempotent", label: "webhook handler with deduplication" },
      { value: "two-way", label: "events out, conversations in" },
    ],
    relatedSlugs: ["loops-email-automation", "zendesk-sync", "hubspot-pipeline-sync"],
  },

  "zendesk-sync": {
    longDescription:
      "A Zendesk sync kit for product teams that need real ticket context: who the user is, what plan they are on, what they were doing when it broke, and how urgent it is. Two-way sync of users, organizations, and tickets; create tickets from product errors with full context attached; route by tier; and wire SLA-aware automations into your own queues.",
    features: [
      { icon: "Workflow", title: "User + ticket sync", desc: "Mirror users, organizations, and tickets two-ways with per-field conflict rules." },
      { icon: "AlertTriangle", title: "Auto ticket creation", desc: "Create Zendesk tickets from product errors with full plan, user, and recent-action context attached." },
      { icon: "Shield", title: "Idempotent webhooks", desc: "Retry-safe inbound handler with event deduplication and a clear state machine." },
      { icon: "Layers", title: "Tier-aware routing", desc: "Route inbound tickets by plan, account value, or SLA target without rebuilding the rules in Zendesk alone." },
      { icon: "Activity", title: "SLA hooks", desc: "Receive SLA-breach and first-response events so your own systems can react before customers escalate." },
    ],
    integrations: [
      { name: "Zendesk", purpose: "Users, organizations, tickets, and SLA events", required: true },
      { name: "Postgres", purpose: "Local mirror, sync ledger, and routing-rule storage", required: true },
      { name: "Vercel Workflow", purpose: "Durable retries for webhook side effects and routing jobs" },
    ],
    assets: [
      { label: "Field mapping config", detail: "Typed mapping between product entities and Zendesk users, organizations, and tickets" },
      { label: "Webhook handler", detail: "Idempotent inbound handler with signature verification, deduplication, and replay tooling" },
      { label: "Auto-ticket creator", detail: "Helper for opening Zendesk tickets from product errors with plan, user, and recent-action context" },
      { label: "Routing engine", detail: "Tier and SLA-aware routing rules wired to inbound webhooks" },
      { label: "Operations dashboard", detail: "Sync health, queue depth, error rate, and SLA breach summary" },
    ],
    howItWorks: [
      { title: "Map your fields", desc: "Declare which product entities map to which Zendesk objects and how each field is owned." },
      { title: "Open tickets with context", desc: "Use the auto-ticket creator from product errors so support sees plan, user, and recent-action context immediately." },
      { title: "React to SLA events", desc: "Wire SLA-breach and first-response webhooks into your own systems so escalations are detected from the product side too." },
    ],
    highlights: [
      { value: "context-first", label: "tickets opened with plan and recent-action data" },
      { value: "tier-aware", label: "routing by plan, value, and SLA" },
      { value: "idempotent", label: "webhook handler with replay tooling" },
    ],
    relatedSlugs: ["intercom-sync", "hubspot-pipeline-sync", "salesforce-pipeline-sync"],
  },

  "notion-database-sync": {
    longDescription:
      "Treat a Notion database as a typed read/write surface from your app. Two-way sync between Notion databases and your Postgres tables, with typed properties, schema validation, conflict resolution, and a webhook listener for Notion changes. Useful for ops dashboards, content pipelines, lightweight CMS surfaces, and admin tools that you want non-engineers to edit in Notion.",
    features: [
      { icon: "Database", title: "Typed properties", desc: "Generate TypeScript types from Notion database schemas so reads and writes are autocompleted and validated." },
      { icon: "Workflow", title: "Two-way sync", desc: "Mirror Notion databases into Postgres and write back without re-implementing rate limiting and pagination." },
      { icon: "Shield", title: "Schema-aware diffs", desc: "Detect schema drift in Notion before it silently breaks your app and surface what changed." },
      { icon: "RefreshCcw", title: "Webhook listener", desc: "Receive change events from Notion (or poll cleanly when webhooks are not available) and converge state without thrash." },
      { icon: "Layers", title: "Common patterns", desc: "Recipes for content pipelines, ops dashboards, and lightweight CMS surfaces backed by Notion." },
    ],
    integrations: [
      { name: "Notion API", purpose: "Database read, write, and change-event surface", required: true },
      { name: "Postgres", purpose: "Local mirror, schema snapshots, and conflict ledger", required: true },
      { name: "Vercel Workflow", purpose: "Durable polling and write-back retries" },
    ],
    assets: [
      { label: "Typed Notion client", detail: "Generated TypeScript types from database schemas with autocompleted reads and writes" },
      { label: "Sync engine", detail: "Two-way mirror between Notion and Postgres with rate-limit pacing and pagination handling" },
      { label: "Schema watcher", detail: "Detects Notion schema drift and surfaces a diff before it breaks downstream consumers" },
      { label: "Webhook + poll listener", detail: "Change-event listener with poll fallback for environments without webhook access" },
      { label: "Pattern recipes", detail: "Worked examples for content pipelines, ops dashboards, and lightweight CMS surfaces" },
    ],
    howItWorks: [
      { title: "Generate types", desc: "Point the client at a Notion database and get TypeScript types you can reuse across the app." },
      { title: "Mirror into Postgres", desc: "Use the sync engine to keep a local copy in Postgres, with rate-limit pacing and pagination already handled." },
      { title: "Write back safely", desc: "Use the typed write surface and schema watcher so non-engineer edits in Notion do not silently break your app." },
    ],
    highlights: [
      { value: "typed", label: "TypeScript types generated from notion schemas" },
      { value: "two-way", label: "read and write with conflict resolution" },
      { value: "drift-aware", label: "schema watcher catches breaking edits" },
    ],
    relatedSlugs: ["airtable-sync", "knowledge-base-app", "publishing-platform"],
  },

  "airtable-sync": {
    longDescription:
      "A typed read/write Airtable sync kit so you stop writing the same rate-limit, pagination, and webhook glue every time a team picks Airtable as the operations surface. Mirror bases into Postgres, write back changes safely, watch schema drift, and operate the sync from a small dashboard instead of debugging cron jobs.",
    features: [
      { icon: "Database", title: "Typed bases", desc: "Generate TypeScript types from Airtable bases so reads and writes are autocompleted and validated." },
      { icon: "Workflow", title: "Two-way sync", desc: "Mirror Airtable bases into Postgres and write back without re-implementing rate limiting and pagination." },
      { icon: "Shield", title: "Schema-aware diffs", desc: "Detect Airtable field changes before they silently break consumers and surface what changed." },
      { icon: "RefreshCcw", title: "Change webhooks", desc: "Receive Airtable change events and converge state without unnecessary writes." },
      { icon: "Activity", title: "Operations dashboard", desc: "Sync health, queue depth, error rate, and schema-drift summary in one place." },
    ],
    integrations: [
      { name: "Airtable", purpose: "Base read, write, and change-event surface", required: true },
      { name: "Postgres", purpose: "Local mirror, schema snapshots, and sync ledger", required: true },
      { name: "Vercel Workflow", purpose: "Durable polling and write-back retries" },
    ],
    assets: [
      { label: "Typed Airtable client", detail: "Generated TypeScript types from base schemas with autocompleted reads and writes" },
      { label: "Sync engine", detail: "Two-way mirror between Airtable and Postgres with rate-limit pacing and pagination handling" },
      { label: "Schema watcher", detail: "Detects Airtable field and table drift and surfaces a diff before it breaks downstream consumers" },
      { label: "Webhook listener", detail: "Change-event listener with poll fallback and converge-without-thrash logic" },
      { label: "Operations dashboard", detail: "Sync health, queue depth, error rate, and schema-drift summary" },
    ],
    howItWorks: [
      { title: "Generate types", desc: "Point the client at an Airtable base and get TypeScript types you can reuse across the app." },
      { title: "Mirror into Postgres", desc: "Use the sync engine to keep a local copy in Postgres with rate-limit pacing and pagination already handled." },
      { title: "Write back safely", desc: "Use the typed write surface and schema watcher so ops edits in Airtable do not silently break your app." },
    ],
    highlights: [
      { value: "typed", label: "TypeScript types generated from airtable schemas" },
      { value: "two-way", label: "read and write with conflict resolution" },
      { value: "drift-aware", label: "schema watcher catches breaking edits" },
    ],
    relatedSlugs: ["notion-database-sync", "data-table-kit", "knowledge-base-app"],
  },

  "slack-app-starter": {
    longDescription:
      "A production-grade Slack app starter that handles the parts you usually only learn by failing in production. OAuth install flow with workspace scoping, signature verification, slash commands, Block Kit cards, modals, action handlers, and per-workspace state — all on the Vercel Chat SDK so the same handler can later route to Discord, Teams, or web without rewriting business logic.",
    features: [
      { icon: "Workflow", title: "OAuth + install flow", desc: "Workspace install, scope upgrades, and uninstall handling with per-workspace token storage." },
      { icon: "Shield", title: "Signature verification", desc: "Slack request signing checked correctly with replay protection and timestamp tolerance." },
      { icon: "Layers", title: "Block Kit + modals", desc: "Slash commands, ephemeral and channel responses, modals, and action handlers wired with typed payloads." },
      { icon: "Database", title: "Per-workspace state", desc: "Tokens, settings, and conversation state scoped per Slack workspace with safe migrations." },
      { icon: "Plug", title: "Cross-channel ready", desc: "Built on the Vercel Chat SDK so the same handler can later route to Discord, Teams, or web." },
    ],
    integrations: [
      { name: "Slack API", purpose: "OAuth, events, slash commands, Block Kit, modals, and interactivity", required: true },
      { name: "Vercel Chat SDK", purpose: "Shared chat runtime so the same handler can run on other channels", required: true },
      { name: "Postgres", purpose: "Per-workspace token, settings, and conversation-state storage", required: true },
      { name: "Vercel Workflow", purpose: "Durable retries for webhook side effects and long-running actions" },
    ],
    assets: [
      { label: "OAuth install flow", detail: "Workspace install, scope upgrade, and uninstall handlers with per-workspace token storage" },
      { label: "Signed event handler", detail: "Slack signature verification with replay protection and timestamp tolerance" },
      { label: "Block Kit kit", detail: "Slash command, modal, and action handler patterns with typed payloads" },
      { label: "Per-workspace state model", detail: "Tokens, settings, and conversation state scoped per workspace with safe migrations" },
      { label: "Deployment recipes", detail: "Vercel deployment, manifest setup, and Slack app registration walkthroughs" },
    ],
    howItWorks: [
      { title: "Install into a workspace", desc: "Use the OAuth flow to install the app, store the workspace token, and request the right scopes from day one." },
      { title: "Build commands and modals", desc: "Use the Block Kit kit to add slash commands, modals, and action handlers with typed payloads instead of stringly-typed JSON." },
      { title: "Add other channels later", desc: "Because it runs on the Vercel Chat SDK, the same handler can ship on Discord, Teams, or web with the appropriate adapter." },
    ],
    highlights: [
      { value: "OAuth-ready", label: "workspace install with token storage" },
      { value: "signed", label: "request verification with replay protection" },
      { value: "cross-channel", label: "share handler with discord, teams, web later" },
    ],
    relatedSlugs: ["chat-agent-platform", "ai-chat-boilerplate", "ai-sales-agent"],
  },

  "floating-browser-frames-app": {
    longDescription:
      "A native macOS utility that creates always-on-top minimal browser windows so you can keep a YouTube video, music player, Slack channel, reference doc, or live dashboard pinned over your work — with full WebAuthn, Google sign-in, and YouTube playback support that pop-out windows from Chrome do not give you. Built for power users who need real browser context (cookies, sessions, extensions-equivalent capability) in a window that gets out of the way.",
    features: [
      { icon: "Layers", title: "Always-on-top frames", desc: "Spawn minimal, frameless browser windows that float over any app and snap to corners." },
      { icon: "Shield", title: "Real browser context", desc: "Full WebAuthn, OAuth, and session support — sign into Google, Slack, or your dashboard like a normal browser." },
      { icon: "Zap", title: "Keyboard control", desc: "Show, hide, focus, resize, and switch frames from configurable global hotkeys." },
      { icon: "Workflow", title: "Per-frame profile", desc: "Each frame can run with its own session and cookies so you can pin work and personal accounts side by side." },
      { icon: "Sparkles", title: "Snap + transparency", desc: "Snap to screen corners, set per-frame opacity, and toggle click-through for ambient overlays." },
    ],
    integrations: [
      { name: "PyQt + WebEngine", purpose: "Native macOS shell with a real Chromium-based engine", required: true },
      { name: "PyInstaller", purpose: "Single-file signed macOS distribution", required: true },
    ],
    assets: [
      { label: "Frame manager", detail: "Spawn, focus, snap, and close frames with per-frame size, position, and opacity" },
      { label: "Profile system", detail: "Per-frame session and cookie isolation with named profiles" },
      { label: "Hotkey kit", detail: "Configurable global shortcuts for show, hide, focus, and switch" },
      { label: "Auth-ready browser", detail: "WebAuthn, OAuth, and YouTube playback that pop-out windows do not support" },
      { label: "Signed installer", detail: "macOS notarized .dmg with a clean first-run permission prompt" },
    ],
    howItWorks: [
      { title: "Install and grant permissions", desc: "Install the signed app and grant the screen and accessibility permissions needed for floating frames." },
      { title: "Pin what you actually need", desc: "Open frames for the dashboards, players, or chat surfaces you reference all day and snap them where they belong." },
      { title: "Drive everything from the keyboard", desc: "Use global hotkeys to summon, hide, or focus frames so they do not become another window to wrangle." },
    ],
    highlights: [
      { value: "real browser", label: "webauthn, oauth, youtube playback" },
      { value: "always-on-top", label: "snap, opacity, click-through" },
      { value: "per-frame profiles", label: "isolated sessions and cookies" },
    ],
    relatedSlugs: ["mac-menubar-app", "spaces-manager-mac-app", "screenshot-organizer-mac-app"],
  },

  "services-manager-mac-app": {
    longDescription:
      "A native macOS power-user utility for browsing, controlling, and auditing launchd services. One-click toggle, per-service performance and resource tracking, privacy auditing for what is talking to the network, startup-impact analysis, and snapshot-and-rollback so you can disable noisy daemons without breaking your system. The tool you wish came with macOS for understanding what is actually running on your machine.",
    features: [
      { icon: "Layers", title: "launchd browser", desc: "Browse every launch agent and daemon with metadata, owner, and current status in one searchable view." },
      { icon: "Zap", title: "One-click toggle", desc: "Enable, disable, load, and unload services without remembering launchctl flags." },
      { icon: "Activity", title: "Per-service metrics", desc: "CPU, memory, and network resource usage attributed per service so you can spot the noisy neighbor." },
      { icon: "Shield", title: "Privacy audit", desc: "See which services are reaching out to the network and to which hosts." },
      { icon: "RefreshCcw", title: "Snapshot + rollback", desc: "Take a snapshot of your service config before changes and roll back if something stops working." },
    ],
    integrations: [
      { name: "launchd", purpose: "Native macOS service manager interface", required: true },
      { name: "PyQt", purpose: "Native macOS UI shell", required: true },
      { name: "PyInstaller", purpose: "Single-file signed macOS distribution", required: true },
    ],
    assets: [
      { label: "Service browser", detail: "Searchable list of launch agents and daemons with status, owner, and load/unload controls" },
      { label: "Metrics panel", detail: "Per-service CPU, memory, and network attribution with historical view" },
      { label: "Privacy audit", detail: "Outbound connection summary per service with host and port detail" },
      { label: "Startup analyzer", detail: "Boot-time impact ranking with recommended toggles and explanation" },
      { label: "Snapshot + rollback", detail: "Capture and restore launchd state with diff view of pending changes" },
    ],
    howItWorks: [
      { title: "Audit what is running", desc: "Open the service browser and scan everything launchd is keeping alive — most users discover services they did not install." },
      { title: "Snapshot, then change", desc: "Take a snapshot before disabling anything so you can roll back the moment something behaves oddly." },
      { title: "Watch the resource impact", desc: "Use the per-service metrics and privacy audit to keep an eye on noisy services after changes." },
    ],
    highlights: [
      { value: "launchd-native", label: "real macOS service control" },
      { value: "per-service metrics", label: "cpu, memory, network attribution" },
      { value: "snapshot + rollback", label: "safe to disable noisy services" },
    ],
    relatedSlugs: ["spaces-manager-mac-app", "screenshot-organizer-mac-app", "mac-menubar-app"],
  },

  "spaces-manager-mac-app": {
    longDescription:
      "A native macOS utility that finally makes Spaces (virtual desktops) usable: name and color-code each Space, switch with keyboard shortcuts you actually choose, persist per-Space app and window layouts, pin apps to specific Spaces, and live in the menu bar. For people who use multiple Spaces every day and have given up trying to remember which one had the email window.",
    features: [
      { icon: "Layers", title: "Named + colored Spaces", desc: "Give every Space a name, icon, and color so you stop counting Spaces from the left to find the right one." },
      { icon: "Zap", title: "Keyboard switching", desc: "Bind shortcuts to specific Spaces by name so switching is direct instead of swiping through every Space in between." },
      { icon: "Workflow", title: "Per-Space layouts", desc: "Persist app and window layouts per Space and restore them after a reboot or display change." },
      { icon: "AppWindow", title: "App pinning", desc: "Pin specific apps to specific Spaces so they always open where they belong." },
      { icon: "Monitor", title: "Menu-bar presence", desc: "See and switch active Space from the menu bar with a glance." },
    ],
    integrations: [
      { name: "macOS Spaces API", purpose: "Native virtual-desktop integration via Swift bridge", required: true },
      { name: "Electron + TypeScript", purpose: "Cross-Mac UI shell with native bridge", required: true },
      { name: "Swift bridge", purpose: "Privileged native calls for Space control and window management", required: true },
    ],
    assets: [
      { label: "Spaces dashboard", detail: "Named, colored, and re-orderable Spaces with quick switch and edit" },
      { label: "Keyboard layer", detail: "Direct-to-Space shortcuts and switch-by-name overlay" },
      { label: "Layout engine", detail: "Per-Space app and window layout persistence with restore-on-display-change" },
      { label: "App pinning", detail: "Pin and route specific apps to specific Spaces on launch" },
      { label: "Menu-bar widget", detail: "Active-Space indicator with quick-switch menu" },
    ],
    howItWorks: [
      { title: "Name your Spaces", desc: "Open the dashboard and give each Space a name, icon, and color so they stop being interchangeable." },
      { title: "Bind keyboard shortcuts", desc: "Assign direct shortcuts so you switch by name instead of swiping through every Space." },
      { title: "Persist your layouts", desc: "Capture per-Space layouts so a reboot or external display change does not scramble your setup." },
    ],
    highlights: [
      { value: "named", label: "spaces with color and icon" },
      { value: "direct shortcuts", label: "switch by name, not by index" },
      { value: "layout persistence", label: "windows survive reboots and displays" },
    ],
    relatedSlugs: ["services-manager-mac-app", "mac-menubar-app", "floating-browser-frames-app"],
  },

  "screenshot-organizer-mac-app": {
    longDescription:
      "A native macOS screenshot and recording organizer that beats the default desktop dump. Rule-based auto-sort by app, window title, or content, OCR search across every screenshot, adaptive light/dark theme, and an optional web dashboard for sharing and annotation with a team. For people whose desktop is currently 200 shots named Screen Shot 2025-04-23 at 11.42.13 PM.",
    features: [
      { icon: "Layers", title: "Rule-based auto-sort", desc: "Route screenshots and recordings into folders by source app, window title, or detected content." },
      { icon: "Sparkles", title: "OCR search", desc: "Find any screenshot by the text inside it — across the entire library, with thumbnail preview." },
      { icon: "Palette", title: "Adaptive theme", desc: "Light and dark themes that follow the system and respect reduced-motion preferences." },
      { icon: "MessagesSquare", title: "Annotate + share", desc: "Annotate screenshots and share via a hosted link without leaving the organizer." },
      { icon: "Workflow", title: "Optional web dashboard", desc: "Sync to a team dashboard for shared libraries, comments, and search across teammates." },
    ],
    integrations: [
      { name: "Electron + TypeScript", purpose: "Cross-Mac UI shell with a Swift bridge", required: true },
      { name: "Swift bridge", purpose: "Native screenshot and recording capture hooks", required: true },
      { name: "Next.js 16", purpose: "Optional web dashboard for team sharing" },
      { name: "Tailwind v4", purpose: "Adaptive light and dark theming" },
    ],
    assets: [
      { label: "Capture watcher", detail: "Native hook into macOS screenshot and recording capture with metadata" },
      { label: "Sort engine", detail: "Rule-based auto-sort by source app, window title, and detected content" },
      { label: "OCR search", detail: "Full-text search across every screenshot's content with thumbnail preview" },
      { label: "Annotate + share", detail: "Inline annotations and hosted-link sharing without leaving the app" },
      { label: "Team dashboard", detail: "Optional web dashboard for shared libraries, comments, and team search" },
    ],
    howItWorks: [
      { title: "Set your sort rules", desc: "Define rules by source app, window title, or content so new captures land in the right folder automatically." },
      { title: "Search by what is inside", desc: "Use OCR search to find a screenshot by the text it contains, not by the timestamp in its filename." },
      { title: "Share or sync as needed", desc: "Annotate and share a link, or sync to the optional team dashboard for shared review." },
    ],
    highlights: [
      { value: "OCR search", label: "find shots by their content" },
      { value: "rule-based sort", label: "auto-route by app, title, content" },
      { value: "team-ready", label: "optional web dashboard for sharing" },
    ],
    relatedSlugs: ["mac-menubar-app", "spaces-manager-mac-app", "services-manager-mac-app"],
  },

  "note-taking-app": {
    longDescription:
      "A complete personal knowledge management product. Markdown editor with backlinks and bidirectional links, graph view of your knowledge, tags, full-text search, daily notes, quick capture, and offline-first storage backed by IndexedDB with optional cloud sync. Self-host for personal use or rebrand and sell — the whole Obsidian-shaped surface in one repo without the plugin fragility.",
    features: [
      { icon: "FileText", title: "Markdown editor", desc: "TipTap-powered markdown editor with code blocks, callouts, embeds, and keyboard-first navigation." },
      { icon: "Layers", title: "Backlinks + graph", desc: "Bidirectional links between notes and a graph view that surfaces clusters and orphans." },
      { icon: "Zap", title: "Full-text search", desc: "Instant full-text search across your library with operators for tag, link, and date." },
      { icon: "Sparkles", title: "Daily notes + quick capture", desc: "Daily-note template and a global quick-capture surface for ideas that should not require opening the app." },
      { icon: "Database", title: "Offline-first", desc: "IndexedDB-backed storage so the app works without network, with optional cloud sync via Postgres + Vercel Blob." },
    ],
    integrations: [
      { name: "TipTap", purpose: "Rich markdown editor with extensions", required: true },
      { name: "Better Auth", purpose: "User identity for cloud sync and sharing", required: true },
      { name: "Postgres", purpose: "Optional cloud backend for sync and sharing" },
      { name: "Vercel Blob", purpose: "Attachment storage for images and files" },
      { name: "IndexedDB", purpose: "Offline-first local storage" },
    ],
    assets: [
      { label: "Editor surface", detail: "TipTap-based markdown editor with code blocks, callouts, embeds, and keyboard navigation" },
      { label: "Backlink + graph engine", detail: "Bidirectional link parsing and graph rendering with cluster and orphan detection" },
      { label: "Search index", detail: "Full-text search with tag, link, and date operators across the local and synced library" },
      { label: "Quick capture + daily notes", detail: "Global quick-capture surface and daily-note templating with seed prompts" },
      { label: "Sync layer", detail: "Optional Postgres-backed sync with conflict resolution and Vercel Blob attachments" },
    ],
    howItWorks: [
      { title: "Open and write", desc: "Start writing notes in markdown — backlinks, tags, and graph view light up automatically as you go." },
      { title: "Make connections", desc: "Use bidirectional links to connect ideas and lean on the graph view to surface clusters and orphans." },
      { title: "Sync if you want", desc: "Run fully offline or turn on cloud sync to share libraries across devices and (optionally) teammates." },
    ],
    highlights: [
      { value: "offline-first", label: "indexeddb with optional cloud sync" },
      { value: "graph + backlinks", label: "second-brain workflow built in" },
      { value: "self-host or sell", label: "rebrand-ready single repo" },
    ],
    relatedSlugs: ["knowledge-base-app", "publishing-platform", "tech-lead-toolkit-app"],
  },

  "ai-image-studio-app": {
    longDescription:
      "A complete AI image generation product, not a starter kit. Prompt composer with style presets and shareable prompts, credits and Stripe billing, gallery with public and private collections, multi-provider routing across OpenAI, Replicate, Stability, and Black Forest Labs through the Vercel AI Gateway, and the moderation and storage patterns you would otherwise have to assemble. Designed so a founder can rebrand the config and start charging users the same week.",
    features: [
      { icon: "Sparkles", title: "Prompt composer", desc: "Structured prompt composer with style presets, negative prompts, aspect ratios, and shareable prompt links." },
      { icon: "Workflow", title: "Multi-provider routing", desc: "Route generations across OpenAI, Replicate, Stability, and Black Forest Labs through the AI Gateway with fallbacks." },
      { icon: "CreditCard", title: "Credits + Stripe", desc: "Credits packs (one-time) plus monthly subscription tiers with metered usage and per-model cost tracking." },
      { icon: "Layers", title: "Gallery + sharing", desc: "Personal gallery with public and private collections, shareable image pages, and remix flows." },
      { icon: "Shield", title: "Moderation + storage", desc: "Image moderation hooks, per-user storage quotas, and Vercel Blob delivery with cache-aware URLs." },
    ],
    integrations: [
      { name: "AI SDK v6", purpose: "Image generation, streaming progress, and structured output", required: true },
      { name: "AI Gateway", purpose: "Multi-provider routing with fallbacks and cost tracking", required: true },
      { name: "Better Auth", purpose: "User identity, social sign-in, and quota gating", required: true },
      { name: "Stripe", purpose: "Credits packs and monthly subscriptions with metered usage", required: true },
      { name: "Vercel Blob", purpose: "Generated image storage and signed URL delivery", required: true },
      { name: "Postgres", purpose: "Prompt history, gallery, credits ledger, and moderation log" },
    ],
    assets: [
      { label: "Prompt composer", detail: "Structured composer with style presets, negative prompts, aspect ratios, and shareable links" },
      { label: "Multi-provider router", detail: "Provider selection, fallbacks, and per-model cost and quality controls" },
      { label: "Credits + billing", detail: "Stripe credits packs, subscription tiers, and metered usage with portal access" },
      { label: "Gallery + sharing", detail: "Public/private collections, shareable image pages, and remix flows" },
      { label: "Moderation + storage", detail: "Image moderation hooks and Vercel Blob storage with cache-aware delivery" },
    ],
    howItWorks: [
      { title: "Brand it once", desc: "Set your brand tokens, providers, and pricing tiers in one config file." },
      { title: "Open generation", desc: "Users compose prompts, pick providers, and generate against your credits and subscription model." },
      { title: "Operate confidently", desc: "Use the moderation hooks, credits ledger, and quota controls to run a real product instead of a demo." },
    ],
    highlights: [
      { value: "4 providers", label: "openai, replicate, stability, black forest labs" },
      { value: "credits + subs", label: "stripe billing wired both ways" },
      { value: "moderation-ready", label: "hooks for image-content review" },
    ],
    relatedSlugs: ["ai-chat-boilerplate", "chat-agent-platform", "summoniq-ui-kit"],
  },

  "forum-community-app": {
    longDescription:
      "A complete forum platform shaped like the things people actually use. Sub-communities, posts (text/link/image), threaded comments, voting, moderation tools, user karma, and a personalized feed across the subs you have joined. Built so you can run a real community on your own brand and infrastructure rather than living inside someone else's algorithm.",
    features: [
      { icon: "Users", title: "Sub-communities", desc: "Create, moderate, and theme sub-communities with their own rules, posting types, and member roles." },
      { icon: "MessagesSquare", title: "Threaded comments", desc: "Deeply threaded comments with collapse, sort, and a responsive mobile reading experience." },
      { icon: "Activity", title: "Voting + karma", desc: "Up and down voting with user karma surfaces and a configurable rate-limit on new accounts." },
      { icon: "Shield", title: "Moderation tools", desc: "Mod queue, removal reasons, user notes, ban tools, and auto-mod rules per community." },
      { icon: "Layers", title: "Personalized feed", desc: "Cross-community feed across the subs you have joined, with sort modes that do not feel like an algorithm." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "User identity, sessions, and per-sub role boundaries", required: true },
      { name: "Postgres", purpose: "Posts, comments, votes, karma, mod actions, and audit log", required: true },
      { name: "SummonFlow", purpose: "Real-time updates for new posts, comments, and votes" },
      { name: "Vercel Blob", purpose: "Image post storage and avatar delivery" },
      { name: "Stripe", purpose: "Optional paid memberships or sub-community premium tiers" },
    ],
    assets: [
      { label: "Sub-community engine", detail: "Create, theme, and moderate communities with custom rules and posting types" },
      { label: "Posting + comment system", detail: "Text, link, and image posts plus threaded comments with collapse and sort" },
      { label: "Voting + karma", detail: "Up/down voting, user karma surfaces, and rate-limit controls for new accounts" },
      { label: "Moderation tools", detail: "Mod queue, removal reasons, user notes, ban tools, and auto-mod rules" },
      { label: "Personalized feed", detail: "Cross-community feed with sort modes that respect what users actually joined" },
    ],
    howItWorks: [
      { title: "Brand and configure", desc: "Set tokens, default sub-community rules, and posting types in a single config pass." },
      { title: "Open posting and moderation", desc: "Users create sub-communities, post, comment, and vote — mods get a queue and the tools to actually run things." },
      { title: "Grow with confidence", desc: "Use the moderation tools, karma controls, and optional paid memberships to keep quality up as the community grows." },
    ],
    highlights: [
      { value: "sub-communities", label: "their own rules, themes, and roles" },
      { value: "moderation-ready", label: "queue, notes, bans, and auto-mod" },
      { value: "personalized feed", label: "across what you actually joined" },
    ],
    relatedSlugs: ["community-platform-app", "publishing-platform", "knowledge-base-app"],
  },

  "discord-app-starter": {
    longDescription:
      "A production-grade Discord app starter that handles the parts you usually only learn by failing in production. OAuth install with workspace scoping, signature verification, slash commands, components, embeds, modals, action handlers, and per-guild state — all on the Vercel Chat SDK so the same handler can later run on Slack, Teams, or web without rewriting business logic.",
    features: [
      { icon: "Workflow", title: "OAuth + install flow", desc: "Guild install, scope upgrades, and uninstall handling with per-guild token storage." },
      { icon: "Shield", title: "Signature verification", desc: "Discord interaction signing checked correctly with replay protection and timestamp tolerance." },
      { icon: "Layers", title: "Components + embeds", desc: "Slash commands, components, embeds, modals, and action handlers with typed payloads." },
      { icon: "Database", title: "Per-guild state", desc: "Tokens, settings, and conversation state scoped per Discord guild with safe migrations." },
      { icon: "Plug", title: "Cross-channel ready", desc: "Built on the Vercel Chat SDK so the same handler can later route to Slack, Teams, or web." },
    ],
    integrations: [
      { name: "Discord API", purpose: "OAuth, interactions, slash commands, components, embeds, and modals", required: true },
      { name: "Vercel Chat SDK", purpose: "Shared chat runtime so the same handler can run on other channels", required: true },
      { name: "Postgres", purpose: "Per-guild token, settings, and conversation-state storage", required: true },
      { name: "Vercel Workflow", purpose: "Durable retries for webhook side effects and long-running actions" },
    ],
    assets: [
      { label: "OAuth install flow", detail: "Guild install, scope upgrade, and uninstall handlers with per-guild token storage" },
      { label: "Signed event handler", detail: "Discord signature verification with replay protection and timestamp tolerance" },
      { label: "Components + embeds kit", detail: "Slash command, component, embed, modal, and action handler patterns with typed payloads" },
      { label: "Per-guild state model", detail: "Tokens, settings, and conversation state scoped per guild with safe migrations" },
      { label: "Deployment recipes", detail: "Vercel deployment, manifest setup, and Discord app registration walkthroughs" },
    ],
    howItWorks: [
      { title: "Install into a guild", desc: "Use the OAuth flow to install the app, store the guild token, and request the right scopes from day one." },
      { title: "Build commands and components", desc: "Use the components and embeds kit to add slash commands, modals, and action handlers with typed payloads." },
      { title: "Add other channels later", desc: "Because it runs on the Vercel Chat SDK, the same handler can ship on Slack, Teams, or web with the appropriate adapter." },
    ],
    highlights: [
      { value: "OAuth-ready", label: "guild install with token storage" },
      { value: "signed", label: "interaction verification with replay protection" },
      { value: "cross-channel", label: "share handler with slack, teams, web later" },
    ],
    relatedSlugs: ["slack-app-starter", "microsoft-teams-app-starter", "chat-agent-platform"],
  },

  "microsoft-teams-app-starter": {
    longDescription:
      "A production-grade Microsoft Teams app starter that handles the parts you usually only learn by reading old MSDN posts. App manifest, SSO, Adaptive Cards, conversation bots, tabs, message extensions, and per-tenant state — all on the Vercel Chat SDK so the same handler can run on Slack, Discord, or web without rewriting business logic.",
    features: [
      { icon: "Workflow", title: "Manifest + install", desc: "Teams app manifest, scope configuration, install handler, and per-tenant token storage." },
      { icon: "Shield", title: "SSO", desc: "Single sign-on with token exchange and silent auth so users do not get prompted twice." },
      { icon: "Layers", title: "Adaptive Cards", desc: "Cards, modals, tabs, and message extensions with typed payloads and refresh patterns." },
      { icon: "Database", title: "Per-tenant state", desc: "Tokens, settings, and conversation state scoped per tenant with safe migrations." },
      { icon: "Plug", title: "Cross-channel ready", desc: "Built on the Vercel Chat SDK so the same handler can later route to Slack, Discord, or web." },
    ],
    integrations: [
      { name: "Microsoft Teams API", purpose: "Bot Framework, Adaptive Cards, tabs, and message extensions", required: true },
      { name: "Vercel Chat SDK", purpose: "Shared chat runtime so the same handler can run on other channels", required: true },
      { name: "Postgres", purpose: "Per-tenant token, settings, and conversation-state storage", required: true },
      { name: "Microsoft Graph", purpose: "Optional Graph API access for richer integrations" },
    ],
    assets: [
      { label: "Teams manifest + install", detail: "App manifest, scope configuration, and install handlers with per-tenant token storage" },
      { label: "SSO flow", detail: "Token exchange, silent auth, and consent prompts with safe fallback" },
      { label: "Adaptive Cards kit", detail: "Cards, modals, tabs, message extensions, and refresh patterns with typed payloads" },
      { label: "Per-tenant state model", detail: "Tokens, settings, and conversation state scoped per tenant with safe migrations" },
      { label: "Deployment recipes", detail: "Vercel deployment, Bot Framework registration, and Teams admin walkthroughs" },
    ],
    howItWorks: [
      { title: "Register and install", desc: "Use the manifest and install flow to get the app into a tenant with the right scopes from day one." },
      { title: "Wire SSO and cards", desc: "Use the SSO and Adaptive Cards kits to build interactive surfaces without re-implementing token exchange." },
      { title: "Add other channels later", desc: "Because it runs on the Vercel Chat SDK, the same handler can ship on Slack, Discord, or web with the appropriate adapter." },
    ],
    highlights: [
      { value: "SSO-ready", label: "token exchange and silent auth" },
      { value: "adaptive cards", label: "tabs, modals, message extensions" },
      { value: "cross-channel", label: "share handler with slack, discord, web later" },
    ],
    relatedSlugs: ["slack-app-starter", "discord-app-starter", "chat-agent-platform"],
  },

  "linear-issue-sync": {
    longDescription:
      "A drop-in Linear sync layer that mirrors product errors, customer feedback, and feature requests into Linear; receives issue updates back to your dashboard. Idempotent webhook handler, batch backfill, conflict resolution, a typed Linear client so issue creation is one autocompleted call, and patterns for routing issues to the right team and cycle automatically.",
    features: [
      { icon: "Workflow", title: "Two-way sync", desc: "Mirror product issues to Linear and receive status, assignment, and comment updates back." },
      { icon: "AlertTriangle", title: "Auto issue creation", desc: "Open Linear issues from product errors, support tickets, or feedback with full context attached." },
      { icon: "Shield", title: "Idempotent webhooks", desc: "Retry-safe inbound handler with event deduplication and a state machine that converges to the same outcome." },
      { icon: "Layers", title: "Team + cycle routing", desc: "Route incoming issues to the right team, project, and cycle automatically based on tags or source." },
      { icon: "Database", title: "Typed Linear client", desc: "TypeScript client with autocompleted teams, labels, projects, and states." },
    ],
    integrations: [
      { name: "Linear API", purpose: "Issues, projects, cycles, teams, and webhooks", required: true },
      { name: "Postgres", purpose: "Local mirror, sync ledger, and routing-rule storage", required: true },
      { name: "Vercel Workflow", purpose: "Durable retries for webhook side effects" },
    ],
    assets: [
      { label: "Typed Linear client", detail: "TypeScript wrapper with autocompleted teams, labels, projects, states, and create helpers" },
      { label: "Webhook handler", detail: "Idempotent inbound handler with signature verification and deduplication" },
      { label: "Auto issue creator", detail: "Helpers for opening Linear issues from product errors, tickets, and feedback with context" },
      { label: "Routing engine", detail: "Tag and source-based routing to the right team, project, and cycle" },
      { label: "Operations dashboard", detail: "Sync health, queue depth, error rate, and recent issue activity" },
    ],
    howItWorks: [
      { title: "Connect Linear", desc: "Set the Linear API token and configure team and project mappings in one config pass." },
      { title: "Open issues with context", desc: "Use the auto-issue creator from errors, tickets, or feedback so engineers see customer context immediately." },
      { title: "Route automatically", desc: "Use the routing engine to send incoming issues to the right team, project, and cycle without manual triage." },
    ],
    highlights: [
      { value: "two-way", label: "issues out, updates back" },
      { value: "auto-routed", label: "to team, project, and cycle" },
      { value: "typed client", label: "autocompleted teams and labels" },
    ],
    relatedSlugs: ["zendesk-sync", "intercom-sync", "typeform-intake-flow"],
  },

  "mailchimp-sync": {
    longDescription:
      "A Mailchimp sync kit for product teams that need real audience and event data flowing between their app and their marketing automation. Push users, plans, and product events to Mailchimp audiences and tags; receive bounce, unsubscribe, and engagement events back. Includes a typed client, suppression handling, double-opt-in patterns, and the operational defaults that keep deliverability healthy.",
    features: [
      { icon: "Workflow", title: "Audience + tag sync", desc: "Two-way sync of users to audiences and segments with tag-based mapping for plans, lifecycle, and behavior." },
      { icon: "Mail", title: "Event triggers", desc: "Send product events that trigger Mailchimp automations and customer journeys." },
      { icon: "Shield", title: "Idempotent webhooks", desc: "Receive bounce, unsubscribe, complaint, and engagement events with retry-safe deduplication." },
      { icon: "ShieldCheck", title: "Double opt-in", desc: "Patterns for compliant double-opt-in flows and consent capture that the bigger marketing tools require." },
      { icon: "Database", title: "Typed Mailchimp client", desc: "TypeScript client with autocompleted audiences, tags, merge fields, and event names." },
    ],
    integrations: [
      { name: "Mailchimp API", purpose: "Audiences, tags, merge fields, events, and webhooks", required: true },
      { name: "Postgres", purpose: "Local mirror, suppression list, and event ledger", required: true },
      { name: "Vercel Workflow", purpose: "Durable retries for transient sync failures" },
    ],
    assets: [
      { label: "Typed Mailchimp client", detail: "Wrapper with autocompleted audiences, tags, merge fields, and events" },
      { label: "Audience sync engine", detail: "Two-way sync of users to audiences and segments with tag mapping" },
      { label: "Event + automation triggers", detail: "Helpers for sending product events that trigger Mailchimp customer journeys" },
      { label: "Double-opt-in flow", detail: "Compliant consent capture and confirmation pattern" },
      { label: "Webhook handler", detail: "Idempotent inbound endpoint for bounce, unsubscribe, and engagement events" },
    ],
    howItWorks: [
      { title: "Map your audiences", desc: "Declare which app entities map to which Mailchimp audiences and tags via the typed mapping config." },
      { title: "Send events that trigger automations", desc: "Use the typed event helpers to fire product events that drive Mailchimp customer journeys." },
      { title: "Close the loop", desc: "Receive bounce, unsubscribe, and engagement events back into your suppression list and analytics." },
    ],
    highlights: [
      { value: "two-way", label: "audiences out, engagement back" },
      { value: "typed client", label: "audiences, tags, events autocompleted" },
      { value: "compliant", label: "double-opt-in and suppression handling" },
    ],
    relatedSlugs: ["loops-email-automation", "resend-email-kit", "intercom-sync"],
  },

  "google-workspace-sync": {
    longDescription:
      "A complete Google Workspace integration kit. OAuth install with incremental scope upgrades, Gmail send and watch, Drive read/write with shared-drive support, Calendar read/write with availability querying, and refresh-token handling that does not silently expire users. Built so adding 'sign in with Google and let us read your calendar' takes an afternoon, not two weeks of reading Google API docs.",
    features: [
      { icon: "Workflow", title: "OAuth + scope upgrades", desc: "Install flow with incremental scope upgrades so users grant only what they need at first and add more later." },
      { icon: "Mail", title: "Gmail send + watch", desc: "Send mail as a user, watch a mailbox for new messages, and parse with safe defaults." },
      { icon: "Layers", title: "Drive read + write", desc: "Read and write files in personal and shared drives with permission management." },
      { icon: "CalendarDays", title: "Calendar + availability", desc: "Read and write calendar events and query availability for booking flows." },
      { icon: "RefreshCcw", title: "Refresh-token handling", desc: "Refresh-token rotation, expiry detection, and re-consent prompts so users do not silently lose access." },
    ],
    integrations: [
      { name: "Google APIs", purpose: "OAuth, Gmail, Drive, Calendar, and People", required: true },
      { name: "Postgres", purpose: "Token storage, scope state, and refresh history", required: true },
      { name: "Better Auth", purpose: "User identity, session, and account linking" },
      { name: "Vercel Workflow", purpose: "Durable retries for token refresh and long-running sync jobs" },
    ],
    assets: [
      { label: "OAuth install flow", detail: "Install handler with incremental scope upgrades and per-user token storage" },
      { label: "Gmail kit", detail: "Send-as helpers, mailbox watch, and message parsing with safe defaults" },
      { label: "Drive kit", detail: "Read, write, list, and permission helpers for personal and shared drives" },
      { label: "Calendar kit", detail: "Event read/write and availability-querying helpers for booking flows" },
      { label: "Refresh handler", detail: "Token rotation, expiry detection, and re-consent prompt patterns" },
    ],
    howItWorks: [
      { title: "Install with minimal scopes", desc: "Use the install flow to grant the smallest set of scopes needed for first use." },
      { title: "Add capabilities incrementally", desc: "Use scope-upgrade helpers to ask for Drive or Calendar later, only when users actually need them." },
      { title: "Operate without silent expiry", desc: "Use the refresh handler so tokens stay valid and users get a clear re-consent prompt when something expires." },
    ],
    highlights: [
      { value: "3 services", label: "gmail, drive, calendar" },
      { value: "incremental scopes", label: "ask for what you need, when you need it" },
      { value: "no silent expiry", label: "refresh handling with re-consent prompts" },
    ],
    relatedSlugs: ["better-auth-setup", "mac-menubar-app", "salesforce-pipeline-sync"],
  },

  "form-design-kit": {
    longDescription:
      "A comprehensive form kit so the next form you build is composition, not from scratch. Single-input, multi-step, file upload, async validation, server-action submission with optimistic state, and accessible error handling. Token-driven so it picks up your brand, headless when you need full control, and opinionated when you do not.",
    features: [
      { icon: "Layers", title: "Inputs + composites", desc: "Text, number, password, email, search, date, time, select, combobox, multiselect, switch, radio, checkbox, slider, and file." },
      { icon: "Workflow", title: "Multi-step forms", desc: "Step orchestration with progress, conditional branching, and state preservation across navigation." },
      { icon: "ShieldCheck", title: "Zod validation", desc: "Compile-time-safe schemas for every form with runtime validation, async checks, and field-level errors." },
      { icon: "Sparkles", title: "Async submit states", desc: "Optimistic state, server-action submission, and inline error rendering without ad-hoc loading flags." },
      { icon: "FileText", title: "Accessible by default", desc: "Labels, descriptions, error messages, and focus management calibrated to WCAG without per-component fiddling." },
    ],
    integrations: [
      { name: "Tailwind CSS", purpose: "Token-driven styling and dark/light theming", required: true },
      { name: "Zod", purpose: "Schema definition and runtime validation", required: true },
      { name: "React Hook Form", purpose: "Form state management with low re-render cost" },
      { name: "Next.js Server Actions", purpose: "Submission via server actions with optimistic state" },
    ],
    assets: [
      { label: "Input library", detail: "Text, number, password, email, search, date, time, select, combobox, multiselect, switch, radio, checkbox, slider, file" },
      { label: "Multi-step orchestrator", detail: "Step manager with progress, conditional branching, and state preservation" },
      { label: "Validation kit", detail: "Zod schemas with field-level errors, async validation, and form-level error rendering" },
      { label: "Submission patterns", detail: "Server-action and fetch submission with optimistic state and error recovery" },
      { label: "Accessibility helpers", detail: "Label, description, and error patterns calibrated to WCAG defaults" },
    ],
    howItWorks: [
      { title: "Define the schema", desc: "Write a Zod schema for the form and let the kit handle types, validation, and error rendering." },
      { title: "Compose inputs and steps", desc: "Build the form by composing input primitives and (optionally) wrapping in a multi-step orchestrator." },
      { title: "Submit with optimistic state", desc: "Use the server-action submission helpers to get optimistic state and inline error rendering with no extra glue." },
    ],
    highlights: [
      { value: "16 inputs", label: "from text to file with sane defaults" },
      { value: "multi-step ready", label: "orchestrator with conditional branching" },
      { value: "WCAG-default", label: "accessible without per-component fiddling" },
    ],
    relatedSlugs: ["dashboard-design-kit", "summoniq-ui-kit", "data-table-kit"],
  },

  "chart-visualization-kit": {
    longDescription:
      "A production-ready chart and visualization kit calibrated for SaaS dashboards. Line, bar, area, scatter, sparkline, KPI tile, funnel, and cohort heatmap components with token-driven theming, accessible defaults, and responsive sizing so charts read well at every breakpoint. Built so the next dashboard you build is data, not chart-styling labor.",
    features: [
      { icon: "LineChart", title: "Core chart types", desc: "Line, bar, area, scatter, sparkline, KPI tile, funnel, and cohort heatmap with consistent legends and tooltips." },
      { icon: "Palette", title: "Token-driven theming", desc: "Color, type, grid, and motion tokens so every chart picks up your brand without per-chart overrides." },
      { icon: "Workflow", title: "Responsive defaults", desc: "Charts resize cleanly across breakpoints with sensible label rotation, legend collapse, and density rules." },
      { icon: "ShieldCheck", title: "Accessible defaults", desc: "Color-blind-safe palettes, ARIA descriptions, and keyboard navigation for tooltips and series toggles." },
      { icon: "Layers", title: "Composable", desc: "Use as drop-in components or compose primitives (axis, grid, series, tooltip) for custom views." },
    ],
    integrations: [
      { name: "Recharts", purpose: "Underlying chart engine with composable primitives", required: true },
      { name: "Tailwind CSS", purpose: "Token-driven theming and responsive layout", required: true },
      { name: "TypeScript", purpose: "Typed chart props and series shapes" },
    ],
    assets: [
      { label: "Core chart components", detail: "Line, bar, area, scatter, sparkline, KPI tile, funnel, and cohort heatmap" },
      { label: "Theming system", detail: "Color, type, grid, motion, and palette tokens with dark and light defaults" },
      { label: "Responsive presets", detail: "Density rules, label rotation, and legend collapse for mobile through desktop" },
      { label: "Accessibility layer", detail: "Color-blind-safe palettes, ARIA descriptions, and keyboard navigation" },
      { label: "Composition primitives", detail: "Axis, grid, series, tooltip, and legend primitives for custom views" },
    ],
    howItWorks: [
      { title: "Drop in a chart", desc: "Use a chart component with your data shape and get a themed, responsive, accessible chart out of the box." },
      { title: "Re-skin via tokens", desc: "Tweak the chart token layer once to re-skin every chart in your app without per-chart overrides." },
      { title: "Compose for custom views", desc: "Use the composition primitives when you need a chart shape that does not exist as a preset." },
    ],
    highlights: [
      { value: "8 chart types", label: "line, bar, area, scatter, sparkline, kpi, funnel, cohort" },
      { value: "color-blind safe", label: "default palettes that work for everyone" },
      { value: "responsive", label: "density rules across every breakpoint" },
    ],
    relatedSlugs: ["dashboard-design-kit", "data-table-kit", "saas-metrics-hub-app"],
  },

  "onboarding-tour-kit": {
    longDescription:
      "Build product tours, anchored tooltips, and onboarding checklists without forcing a heavyweight tour library on your bundle. Step orchestration, persistence per user, conditional gating, and accessibility-first focus management — designed so the next onboarding you ship feels like part of the product, not a popup overlay.",
    features: [
      { icon: "Sparkles", title: "Anchored tooltips", desc: "Position tooltips against any element with collision detection, scroll-following, and exit affordances." },
      { icon: "Workflow", title: "Multi-step tours", desc: "Step orchestration with progress, conditional branching, and resume on return." },
      { icon: "Layers", title: "Onboarding checklists", desc: "Persistent progress checklists with completion detection from real product events." },
      { icon: "ShieldCheck", title: "Focus management", desc: "Accessibility-first focus trapping, keyboard navigation, and screen-reader announcements." },
      { icon: "Database", title: "Per-user persistence", desc: "Track tour and checklist progress per user across sessions and devices." },
    ],
    integrations: [
      { name: "Tailwind CSS", purpose: "Token-driven styling and dark/light theming", required: true },
      { name: "Framer Motion", purpose: "Entrance, exit, and focus animations with reduced-motion safety" },
      { name: "Postgres", purpose: "Per-user tour and checklist progress storage" },
    ],
    assets: [
      { label: "Anchored tooltip system", detail: "Position, collision detection, scroll-following, and exit affordances" },
      { label: "Tour orchestrator", detail: "Step manager with progress, conditional branching, and resume-on-return" },
      { label: "Checklist component", detail: "Persistent progress with completion detection from product events" },
      { label: "Focus management", detail: "Trap, restore, and announce patterns with keyboard and screen-reader support" },
      { label: "Persistence layer", detail: "Per-user tour and checklist progress with cross-device sync" },
    ],
    howItWorks: [
      { title: "Define the tour", desc: "Declare steps with anchor selectors, copy, and conditional gating." },
      { title: "Trigger from product events", desc: "Start tours, advance steps, and complete checklist items in response to actual product activity." },
      { title: "Persist progress", desc: "Use the persistence layer so users do not see the same tour twice or restart from zero." },
    ],
    highlights: [
      { value: "tour + checklist", label: "two patterns from one kit" },
      { value: "accessibility-first", label: "focus trap, keyboard, screen reader" },
      { value: "persistent", label: "per-user progress across devices" },
    ],
    relatedSlugs: ["dashboard-design-kit", "summoniq-ui-kit", "empty-state-kit"],
  },

  "empty-state-kit": {
    longDescription:
      "Stop reinventing empty states for every list, table, and dashboard. A library of empty, error, loading, and permission-denied state components with illustration slots, primary/secondary actions, and brand-token theming. Designed so empty surfaces feel intentional and inviting instead of broken.",
    features: [
      { icon: "Layers", title: "State coverage", desc: "Empty, error, loading, partial-load, and permission-denied states with consistent shape." },
      { icon: "Palette", title: "Illustration slots", desc: "Drop-in slots for SVG, Lottie, or static illustrations with sensible default sizing." },
      { icon: "Workflow", title: "Primary + secondary actions", desc: "Action affordances with consistent placement, hierarchy, and keyboard support." },
      { icon: "Sparkles", title: "Token theming", desc: "Brand-token-driven so every state matches your product without per-page overrides." },
      { icon: "ShieldCheck", title: "Accessible by default", desc: "ARIA live regions for state changes and proper heading hierarchy in every state." },
    ],
    integrations: [
      { name: "Tailwind CSS", purpose: "Token-driven styling and dark/light theming", required: true },
      { name: "Framer Motion", purpose: "Subtle entrance and state-change animations with reduced-motion safety" },
      { name: "TypeScript", purpose: "Typed state component props and action handlers" },
    ],
    assets: [
      { label: "Empty states", detail: "List, table, dashboard, search-no-results, and onboarding-empty variants" },
      { label: "Error states", detail: "Network, 4xx, 5xx, and operation-failed variants with retry affordances" },
      { label: "Loading states", detail: "Skeleton, shimmer, and progress-indicator variants for lists, tables, and dashboards" },
      { label: "Permission-denied states", detail: "Auth-required, role-restricted, and quota-exceeded variants with upgrade affordances" },
      { label: "Illustration slot kit", detail: "Drop-in slots for SVG, Lottie, or static illustrations with sensible defaults" },
    ],
    howItWorks: [
      { title: "Pick your state", desc: "Use the empty, error, loading, or permission-denied component that matches the surface." },
      { title: "Plug in copy and action", desc: "Provide title, description, and a primary action — the kit handles layout, motion, and accessibility." },
      { title: "Brand it once", desc: "Set illustration slots and tokens once and let every state inherit your brand." },
    ],
    highlights: [
      { value: "5 state types", label: "empty, error, loading, partial, permission" },
      { value: "branded", label: "token-driven across every variant" },
      { value: "accessible", label: "live regions and heading hierarchy" },
    ],
    relatedSlugs: ["onboarding-tour-kit", "dashboard-design-kit", "summoniq-ui-kit"],
  },

  "crm-pipeline-app": {
    longDescription:
      "A complete CRM product for small sales teams that need a working pipeline without paying per-seat to one of the big platforms. Pipelines, deals, contacts, accounts, activities, email tracking, task management, and a clean reporting view — wired with Better Auth, Stripe billing, Resend, and Sentry. Designed so a founder can rebrand the config and start charging users the same week.",
    features: [
      { icon: "Layers", title: "Pipelines + deals", desc: "Multi-stage pipelines with kanban and table views, deal scoring, and stage-change automation." },
      { icon: "Users", title: "Contacts + accounts", desc: "Person and company records with relationship mapping, custom fields, and deduplication." },
      { icon: "Activity", title: "Activity timeline", desc: "Calls, meetings, notes, and emails on every record with assignment and follow-up tracking." },
      { icon: "Mail", title: "Email tracking", desc: "Open and click tracking with privacy-conscious defaults and per-thread aggregation." },
      { icon: "LineChart", title: "Reporting", desc: "Pipeline value, conversion, win rate, and rep performance with cohort and timeframe filters." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Sales-team identity, role boundaries, and impersonation", required: true },
      { name: "Stripe", purpose: "Subscription billing for the CRM itself", required: true },
      { name: "Resend", purpose: "Transactional email and tracked outbound", required: true },
      { name: "Sentry", purpose: "Operational monitoring across staff surfaces" },
      { name: "Vercel Blob", purpose: "Attachments on contacts, deals, and activities" },
    ],
    assets: [
      { label: "Pipeline workspace", detail: "Multi-stage pipelines with kanban and table views, deal scoring, and stage automation" },
      { label: "Contact + account records", detail: "Person and company records with relationships, custom fields, and deduplication" },
      { label: "Activity timeline", detail: "Calls, meetings, notes, and emails on every record with assignment and follow-up" },
      { label: "Email tracking", detail: "Open and click tracking with privacy-conscious defaults and per-thread aggregation" },
      { label: "Reporting dashboard", detail: "Pipeline value, conversion, win rate, and rep performance with filters" },
    ],
    howItWorks: [
      { title: "Configure your pipelines", desc: "Define stages, custom fields, and automation rules that match your sales motion." },
      { title: "Run sales in one workspace", desc: "Track deals, log activities, and send tracked outbound without leaving the CRM." },
      { title: "Charge for it", desc: "Enable Stripe billing and start selling the CRM under your own brand." },
    ],
    highlights: [
      { value: "5 surfaces", label: "pipelines, contacts, activities, email, reports" },
      { value: "rebrand-ready", label: "tokens and config drive every brand string" },
      { value: "small-team-first", label: "no per-seat tax for getting started" },
    ],
    relatedSlugs: ["agency-dashboard-app", "hubspot-pipeline-sync", "salesforce-pipeline-sync"],
  },

  "helpdesk-saas-app": {
    longDescription:
      "A complete helpdesk product, Zendesk-shaped and white-label. Tickets with SLA, macros and templates, internal notes, agent collision detection, customer portal, and a knowledge-base surface. Better Auth with customer + agent role split, Stripe billing, Pusher real-time, Resend, and Sentry. Designed so support teams can switch off the per-agent pricing of the big platforms without losing capability.",
    features: [
      { icon: "Layers", title: "Tickets + SLA", desc: "Ticket lifecycle with status, priority, SLA tracking, and breach alerts." },
      { icon: "Workflow", title: "Macros + templates", desc: "Reusable replies and bulk-action macros so agents stop typing the same response." },
      { icon: "Users", title: "Agent collision + assignment", desc: "Collision detection so two agents do not reply to the same ticket and round-robin assignment with skill matching." },
      { icon: "MessagesSquare", title: "Customer portal", desc: "Branded portal where customers see tickets, knowledge base, and announcements." },
      { icon: "FileText", title: "Knowledge base", desc: "MDX-powered KB with categories, search, and ticket-deflection prompts." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Customer and agent identity with role boundaries and impersonation", required: true },
      { name: "Stripe", purpose: "Subscription billing for the helpdesk itself", required: true },
      { name: "Pusher", purpose: "Real-time ticket updates and agent presence", required: true },
      { name: "Resend", purpose: "Ticket notifications, customer replies, and KB announcements" },
      { name: "Sentry", purpose: "Operational monitoring across agent and customer surfaces" },
    ],
    assets: [
      { label: "Ticket workspace", detail: "Lifecycle, status, priority, SLA tracking, and breach alerts" },
      { label: "Macros + templates", detail: "Reusable replies, bulk-action macros, and skill-aware suggestions" },
      { label: "Agent tools", detail: "Collision detection, round-robin assignment, internal notes, and a small mod queue" },
      { label: "Customer portal", detail: "Branded portal with ticket history, knowledge base, and announcement feed" },
      { label: "Knowledge base", detail: "MDX-powered KB with categories, search, and ticket-deflection prompts" },
    ],
    howItWorks: [
      { title: "Set your service model", desc: "Configure SLA tiers, ticket categories, macros, and skill routing for your support team." },
      { title: "Run support from one workspace", desc: "Agents handle tickets, write KB articles, and run macros from a single product surface." },
      { title: "Charge customers", desc: "Enable Stripe billing and sell the helpdesk under your own brand." },
    ],
    highlights: [
      { value: "5 surfaces", label: "tickets, macros, agents, portal, kb" },
      { value: "real-time", label: "ticket updates and agent presence" },
      { value: "customer + agent split", label: "role-aware authentication" },
    ],
    relatedSlugs: ["zendesk-sync", "intercom-sync", "agency-dashboard-app"],
  },

  "changelog-saas-app": {
    longDescription:
      "A complete changelog product for SaaS teams that want to publish updates without rolling their own pipeline. Multi-product channels, MDX entries, subscriptions (email + RSS), in-app feed widget, reaction tracking, and a public-facing site. Better Auth, Stripe billing, Resend, and Sentry — built so the moment a feature ships, the announcement is one PR away.",
    features: [
      { icon: "Layers", title: "Multi-product channels", desc: "Separate changelog channels per product with their own subscribers, themes, and slugs." },
      { icon: "FileText", title: "MDX entries", desc: "Rich changelog entries with images, code blocks, reactions, and category tagging." },
      { icon: "Mail", title: "Subscriptions", desc: "Email and RSS subscriptions with double-opt-in and per-channel preferences." },
      { icon: "Sparkles", title: "In-app feed widget", desc: "Embeddable widget for showing recent updates inside your product surface." },
      { icon: "Activity", title: "Reaction + reading metrics", desc: "Reaction counts and reading metrics per entry so you see which updates landed." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Author identity and per-channel role boundaries", required: true },
      { name: "Stripe", purpose: "Subscription billing for paid changelog tiers (optional)" },
      { name: "Resend", purpose: "Email subscription delivery and digest sends", required: true },
      { name: "Sentry", purpose: "Operational monitoring" },
    ],
    assets: [
      { label: "Multi-product channels", detail: "Separate changelog channels with their own subscribers, themes, and slugs" },
      { label: "MDX entry editor", detail: "Rich entry editor with images, code blocks, categories, and scheduling" },
      { label: "Subscription engine", detail: "Email and RSS subscriptions with double-opt-in and per-channel preferences" },
      { label: "In-app feed widget", detail: "Embeddable widget for surfacing recent updates inside your product" },
      { label: "Reaction + metrics", detail: "Reaction counts and reading metrics per entry with public and private views" },
    ],
    howItWorks: [
      { title: "Set up channels", desc: "Create channels per product or audience with their own subscribers and theme." },
      { title: "Publish from MDX", desc: "Write entries in MDX, schedule, and publish — email and RSS go out automatically." },
      { title: "Embed the widget", desc: "Drop the in-app feed widget into your product so users see updates without leaving." },
    ],
    highlights: [
      { value: "multi-product", label: "channels with their own subscribers" },
      { value: "email + RSS + widget", label: "every distribution channel covered" },
      { value: "metrics-aware", label: "reactions and reading metrics built in" },
    ],
    relatedSlugs: ["publishing-platform", "knowledge-base-app", "marketing-site-pro"],
  },

  "waitlist-saas-app": {
    longDescription:
      "A complete waitlist platform for indie founders and large launches alike. Position-based ranking, referral bumps that move people up the list, email confirmation, custom-branded waitlist pages, and a small admin dashboard. Optional paid skip-the-line via Stripe. Built so you do not have to fork together a Tally form, a Google Sheet, and a Mailchimp list to run a waitlist.",
    features: [
      { icon: "Layers", title: "Position-based waitlist", desc: "Single global or per-product waitlists with public position display and queue management." },
      { icon: "Sparkles", title: "Referral bumps", desc: "Per-user referral codes that move signups up the list when their friends join." },
      { icon: "Mail", title: "Email confirmation", desc: "Double-opt-in with branded confirmation, position-update emails, and launch notification." },
      { icon: "Palette", title: "Branded pages", desc: "Custom-branded waitlist pages with token theming and configurable copy slots." },
      { icon: "CreditCard", title: "Optional paid skip", desc: "Stripe-backed skip-the-line tier with priority queue placement." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Admin identity for managing the waitlist", required: true },
      { name: "Stripe", purpose: "Optional paid skip-the-line tier" },
      { name: "Resend", purpose: "Confirmation, position-update, and launch emails", required: true },
    ],
    assets: [
      { label: "Waitlist page", detail: "Branded public page with position display, referral code, and signup form" },
      { label: "Referral engine", detail: "Per-user codes, attribution tracking, and position-bump rules" },
      { label: "Email layer", detail: "Confirmation, position-update, milestone, and launch templates" },
      { label: "Admin dashboard", detail: "Queue management, manual reordering, segment export, and waitlist stats" },
      { label: "Optional paid skip", detail: "Stripe-backed priority placement tier" },
    ],
    howItWorks: [
      { title: "Brand the page", desc: "Set tokens, copy, and reward structure for your waitlist in one config pass." },
      { title: "Open signups", desc: "Direct traffic to the branded page and let users see their position and refer friends." },
      { title: "Launch with the right people", desc: "Use the admin dashboard to invite the front of the queue when you are ready to open access." },
    ],
    highlights: [
      { value: "referral-bumped", label: "position moves with friend signups" },
      { value: "branded", label: "tokens drive every visible string" },
      { value: "paid skip optional", label: "stripe-backed priority tier" },
    ],
    relatedSlugs: ["marketing-site-pro", "landing-page-kit", "loops-email-automation"],
  },

  "survey-saas-app": {
    longDescription:
      "A complete survey product covering NPS, CSAT, custom multi-step surveys with conditional branching, response analytics, segmentation, webhooks, and a clean public response surface. Better Auth, Stripe billing, Resend. Built so product, support, and CX teams can run real surveys without paying per-response to the big platforms.",
    features: [
      { icon: "Layers", title: "Survey types", desc: "NPS, CSAT, CES, and custom multi-step surveys with conditional branching and skip logic." },
      { icon: "Workflow", title: "Distribution", desc: "Email, in-app embed, link, and webhook-triggered distribution with segmentation." },
      { icon: "LineChart", title: "Response analytics", desc: "Aggregate scores, trend lines, segmentation, and verbatim sentiment across responses." },
      { icon: "Mail", title: "Email integration", desc: "Send surveys via Resend with per-segment templates and follow-up cadences." },
      { icon: "Plug", title: "Webhook outputs", desc: "Forward responses to your CRM, data warehouse, or messaging platform via signed webhooks." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Admin and respondent identity", required: true },
      { name: "Stripe", purpose: "Subscription billing for the survey product itself", required: true },
      { name: "Resend", purpose: "Survey email distribution and follow-ups", required: true },
    ],
    assets: [
      { label: "Survey builder", detail: "Drag-drop builder with NPS, CSAT, CES, and custom multi-step surveys" },
      { label: "Branching engine", detail: "Conditional branching and skip logic with preview and validation" },
      { label: "Distribution kit", detail: "Email, in-app embed, link, and webhook-triggered distribution with segmentation" },
      { label: "Analytics dashboard", detail: "Aggregate scores, trend lines, segmentation, and verbatim sentiment" },
      { label: "Webhook outputs", detail: "Signed webhooks to forward responses to CRM, warehouse, or messaging" },
    ],
    howItWorks: [
      { title: "Build your survey", desc: "Drag-drop the questions you need with branching logic and validation in the preview." },
      { title: "Distribute and segment", desc: "Send via email, embed in-app, share a link, or trigger from product events with segmentation." },
      { title: "Act on the responses", desc: "Use analytics for trend reporting and forward responses to downstream systems via signed webhooks." },
    ],
    highlights: [
      { value: "4 survey types", label: "nps, csat, ces, custom" },
      { value: "branching + skip", label: "real conditional logic" },
      { value: "webhook outputs", label: "responses flow to your stack" },
    ],
    relatedSlugs: ["typeform-intake-flow", "loops-email-automation", "saas-metrics-hub-app"],
  },
};

async function main() {
  const slugs = Object.keys(CONTENT);
  console.log(`Seeding content for ${slugs.length} products...\n`);

  let seeded = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const c = CONTENT[slug];
    const product = await db.product.findFirst({ where: { slug } });
    if (!product) {
      console.log(`  ⨯ ${slug} (not in bizfoo, skipping)`);
      skipped++;
      continue;
    }

    await db.product.update({
      where: { id: product.id },
      data: {
        longDescription: c.longDescription,
        relatedSlugs: c.relatedSlugs ?? [],
        codeSampleLang: c.codeSample?.lang ?? null,
        codeSampleFile: c.codeSample?.filename ?? null,
        codeSampleCode: c.codeSample?.code ?? null,
      },
    });

    await Promise.all([
      db.productFeature.deleteMany({ where: { productId: product.id } }),
      db.productIntegration.deleteMany({ where: { productId: product.id } }),
      db.productAsset.deleteMany({ where: { productId: product.id } }),
      db.productHowStep.deleteMany({ where: { productId: product.id } }),
      db.productFaq.deleteMany({ where: { productId: product.id } }),
      db.productHighlightStat.deleteMany({ where: { productId: product.id } }),
    ]);

    if (c.features?.length) {
      await db.productFeature.createMany({
        data: c.features.map((f, i) => ({
          productId: product.id,
          icon: f.icon ?? null,
          title: f.title,
          desc: f.desc,
          position: i,
        })),
      });
    }
    if (c.integrations?.length) {
      await db.productIntegration.createMany({
        data: c.integrations.map((it, i) => ({
          productId: product.id,
          name: it.name,
          purpose: it.purpose,
          required: it.required ?? false,
          position: i,
        })),
      });
    }
    if (c.assets?.length) {
      await db.productAsset.createMany({
        data: c.assets.map((a, i) => ({
          productId: product.id,
          label: a.label,
          detail: a.detail,
          position: i,
        })),
      });
    }
    const steps = c.howItWorks ?? DEFAULT_HOW;
    await db.productHowStep.createMany({
      data: steps.map((s, i) => ({
        productId: product.id,
        title: s.title,
        desc: s.desc,
        position: i,
      })),
    });
    const faqs = c.faqs ?? DEFAULT_FAQS;
    await db.productFaq.createMany({
      data: faqs.map((q, i) => ({
        productId: product.id,
        question: q.q,
        answer: q.a,
        position: i,
      })),
    });
    if (c.highlights?.length) {
      await db.productHighlightStat.createMany({
        data: c.highlights.map((s, i) => ({
          productId: product.id,
          value: s.value,
          label: s.label,
          position: i,
        })),
      });
    }

    // ─── Sync build plan + spec milestone ──────────────────────────
    // Anything that has a content block in this file is at minimum
    // "spec'd": longDescription + features + assets + howItWorks +
    // highlights are the artifacts that complete the "Lock the spec"
    // milestone. Mark it done and bump the plan to SPEC if it was IDEA.
    const fullySpecd =
      (c.features?.length ?? 0) >= 5 &&
      (c.assets?.length ?? 0) >= 4 &&
      (c.highlights?.length ?? 0) >= 3 &&
      (c.howItWorks?.length ?? 0) >= 3;

    if (fullySpecd) {
      let plan = await db.buildPlan.findUnique({
        where: { productId: product.id },
        include: { milestones: { orderBy: { position: "asc" } } },
      });
      if (!plan) {
        plan = await db.buildPlan.create({
          data: {
            productId: product.id,
            stage: "SPEC",
            milestones: {
              create: SPEC_MILESTONES.map((m, i) => ({
                title: m.title,
                description: m.description,
                estimateHours: m.estimateHours,
                position: i,
                status: i === 0 ? "DONE" : "TODO",
                doneAt: i === 0 ? new Date() : null,
              })),
            },
          },
          include: { milestones: { orderBy: { position: "asc" } } },
        });
      } else {
        const lockSpec = plan.milestones.find((m) => m.position === 0);
        if (lockSpec && lockSpec.status !== "DONE") {
          await db.milestone.update({
            where: { id: lockSpec.id },
            data: { status: "DONE", doneAt: new Date() },
          });
        }
        if (plan.stage === "IDEA") {
          await db.buildPlan.update({
            where: { id: plan.id },
            data: { stage: "SPEC" },
          });
        }
      }
    }

    console.log(`  ✓ ${slug}`);
    seeded++;
  }

  console.log(`\nDone. Seeded ${seeded}, skipped ${skipped}.`);
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
