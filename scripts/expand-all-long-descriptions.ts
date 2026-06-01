// Writes full multi-paragraph + bulleted longDescriptions for the ~42
// products still showing single-paragraph copy. Covers templates,
// boilerplates, AI agents, design systems, desktop, guides, and integrations.

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

const COPY: Record<string, string> = {
  // ── Templates ────────────────────────────────────────────────────────
  "booking-template": `A Cal.com-shaped booking platform you can rebrand and ship over a weekend. Multi-host, multi-event-type, paid or free, calendar-synced on both sides.

## What's in the box

- **Event type builder** supporting solo, group (N attendees, hit the cap and it rolls over), round-robin across hosts, and collective (all hosts must attend)
- **Availability rules** — per-host working hours, breaks, buffer time before/after, date overrides, holidays, and a preview so you can see your effective availability for the next 30 days
- **Two-way calendar sync** with Google and Outlook — incoming events block availability, new bookings write back with full event details
- **Stripe-paid bookings** with optional deposits for no-show protection, full refunds on cancellation within a configurable window, and per-event-type pricing
- **Public booking page** with timezone auto-detection, mobile-friendly slot picker, brand token customization, and custom booking questions per event type
- **Host dashboard** for rescheduling, cancellations, attendee management, and a complete booking history with exports

## Why this vs rolling your own

Booking apps look simple until you hit edge cases: DST, timezone mismatches, the attendee who books in the past, the Google Calendar sync that silently breaks because your refresh token expired. This template has all of that handled.

## Known limits

- No Apple Calendar sync yet (CalDAV is planned)
- No workflow automations baseline (email 1h before, SMS reminders) — a ready add-on spot`,

  "elderly-care-coordinator": `A care plan + caregiver scheduling app for families and small home-care agencies (<50 clients). Comprehensive enough to actually run on, clinical-grade where it matters, without the $200/seat price of enterprise tools you don't need.

## What's in the box

- **Medication management** — dosage, schedule, missed-dose alerts to caregivers and family, history logging with reason codes for skipped doses
- **Appointments with reminders** (email + SMS), attachments (labs, referrals), and a shared family calendar view
- **Vitals tracking** (BP, HR, weight, glucose, O2) with trendlines and configurable out-of-range alerts
- **Caregiver shift management** — shift board, swap requests with approval, handoff notes, timesheet export
- **HIPAA-aware patterns** throughout — encryption at rest, access audit log, minimum-necessary access via caregiver / family / admin roles, session timeout appropriate for clinical use
- **Read-only family access** with granular share controls — share vitals but not meds, or the reverse

## Why this vs rolling your own

The existing market splits into $200/month clinical tools (built for 50+ beds) and consumer apps (with no roles, no audit, no real scheduling). This fills the gap: serious enough to run on, priced for independent operators.

## Known limits

- Not a clinical record system — no ICD codes, no lab integration, no eMAR for facilities
- US-centric by default; medication databases can be swapped for regional equivalents`,

  "job-board-template": `A niche job board you can launch over a weekend, already wired with paid listings, candidate alerts, and strong SEO.

## What's in the box

- **Stripe-paid listing flow** with tiered pricing (basic / featured / pinned) and one-time + subscription options for hiring volume
- **Employer dashboard** for posting, editing, renewing, and archiving — with draft state + preview
- **Candidate side** — save searches, email alerts with a weekly digest matching saved preferences, application flow (redirect to employer ATS or collect in-platform)
- **Public board** with filters (role, stack, location, salary band, remote-friendly), facets, and SEO-grade structured data so postings actually rank
- **Full Resend setup** for alerts and transactional email
- **Seed data** for testing + an admin screen for moderation

## Why this vs rolling your own

A job board is a real two-sided marketplace even when niche — pricing logic, alerts, SEO, moderation all matter from day one. This covers the whole loop so you can focus on the niche (remote-only, specific stack, specific industry).

## Known limits

- USD pricing by default (easy to localize)
- No ATS integration baseline (redirect is the default) — can be added per board`,

  "landing-page-kit": `An animated, conversion-tuned marketing site template for SaaS and indie products. The whole marketing shell, ready to rebrand.

## What's in the box

- **Hero** (animated text + gradient bg), features grid, pricing (3-tier with monthly/yearly toggle), 3 case-study layouts, FAQ, final CTA block
- **3 color presets** (violet, emerald, amber) — swap in seconds, or replace with your own brand tokens
- **Copywriting templates** for each section with real examples adapted from products that actually converted, not lorem
- **Scroll-linked motion** with a reduced-motion fallback — feels alive without sacrificing accessibility
- **Lighthouse score above 95** on every route out of the box (tested)
- **SEO baseline** — structured data for product, sitemap, Open Graph images, canonical URLs

## Why this vs rolling your own

Marketing sites are where founders lose the most time per line of user-facing value. This kit compresses it: your job is copy + visuals; the kit handles structure, motion, performance, and SEO defaults.

## Known limits

- No blog / changelog / customer stories (those live in marketing-site-pro)
- No CMS integration baseline — content lives in MDX by default`,

  "marketing-site-pro": `A multi-page marketing site template with the content infrastructure most products grow into anyway.

## What's in the box

- **Pages**: home, features, pricing, about, careers, contact, customer stories — all responsive and dark-first
- **Blog with MDX**, categories, tags, author profiles, estimated read time, and RSS
- **Changelog** with per-post emoji categorization, automatic semver labeling, and RSS
- **Customer stories** template with logo / quote / metric result triad
- **Legal** — terms, privacy, DPA, cookie policy scaffolds (real lawyer consult still required)
- **Contact form** that creates a deal in your CRM (HubSpot or Pipedrive) with UTM parameters preserved, not just another "hi@" email
- **SEO primitives** — per-page structured data, sitemap with lastmod, Open Graph images generated per post, canonical URLs
- **3 brand presets** + a token file for your own

## Why this vs rolling your own

Most founders' marketing sites plateau at a nice home page and then get stuck: "we need a changelog", "we need customer stories", "we need a blog" — each adds a multi-week detour. This has all of those ready.

## Known limits

- MDX-driven (great for devs writing content, less great for a pure-marketing team — see marketing-site-pro-cms for the Sanity variant, planned)`,

  "mentorship-platform": `Match mentors and mentees, schedule sessions, take payments. Profiles, matching, async messaging, scheduled video, Stripe Connect payouts — the whole loop.

## What's in the box

- **Mentor profiles** (bio, skills, hourly rate, availability, testimonials) with verification badge workflow
- **Mentee profiles** with goals, budget, preferred meeting frequency
- **Matching** — filterable mentor directory by skill + timezone + price + availability, plus an opt-in matchmaker that suggests mentors weekly
- **Scheduled video** via Daily.co — room created per session, recording optional, transcript emailed after
- **Async messaging** between sessions (scoped per mentorship pair) with file attachments
- **Stripe Connect** onboarding for mentors, platform-fee handling (configurable %), and net-30 payouts
- **Review flow** after each session with a rating + testimonial
- **Admin dashboard** for moderation and dispute resolution

## Why this vs rolling your own

Two-sided marketplaces have dozens of small-but-critical decisions (who cancels, who refunds, payout timing, dispute flow) that take months to figure out. This template has sane defaults for each, tuned for engineering mentorship / coaching.

## Known limits

- Daily.co is the default video provider — Twilio Video or Zoom are adapter-sized ports
- Assumes one-on-one mentorship — group cohorts are a different product (see workshop-course-platform)`,

  "personal-finance-pwa": `A personal finance PWA for people who want budgeting without surrendering their bank credentials.

## What's in the box

- **Multi-currency budget categories** with monthly rollover, per-category limits, visual progress bars
- **Recurring transaction rules** that auto-categorize patterns you've already labeled — the app learns your habits without a classifier
- **Goals** with target amounts and projected completion based on current savings rate
- **Investment tracking** — positions across brokerages, cost basis, returns, and a portfolio view with allocation breakdown
- **Offline-first via IndexedDB** with a conflict-free sync layer when you're back online
- **PWA installability** with home-screen icon, offline capability, and push notifications for budget alerts
- **CSV import** from Mint, YNAB, and raw bank exports; manual entry as fallback
- **Inspired by budgetbloom**

## Why this vs rolling your own

Consumer finance apps either want your Plaid credentials (a privacy tradeoff many refuse) or charge recurring for basic budgeting. This is self-hosted, privacy-preserving, and full-featured — a good fit for indie finance nerds who want to own their data.

## Known limits

- No bank-API integrations by default (feature for some buyers, limit for others)
- Investment prices require a market data API key (Alpha Vantage, IEX — free tiers are adequate)`,

  "publishing-platform": `A Substack-shaped publishing platform for writers who want to own the stack.

## What's in the box

- **TipTap-based rich-text editor** with slash menu, embeds (YouTube, Twitter, CodePen), image handling with S3 uploads, collaborative cursors for co-authoring
- **Paid subscriptions** (monthly + annual) with gift subs, grandfathered pricing, configurable free-preview paywall per post
- **Threaded subscriber-only comments** with spam protection and moderation queue
- **Reading experience** tuned for long-form: line length, hyphenation, dark mode, reader view, bookmark, highlight, share-with-commentary
- **Email send-on-publish** to your subscriber list via Resend, with per-post open/click tracking
- **Subscriber export** any time — no lock-in

## Why this vs rolling your own

Substack works, but it's Substack's platform. If your brand matters or you want to own the subscriber list unambiguously, self-hosting is the answer — and this is the kit that gets you there without 3 months of custom work.

## Known limits

- No podcast / audio features baseline
- Single-publication per install (no multi-publication network layer)`,

  "workshop-course-platform": `Run cohort-based workshops or self-paced courses on a platform you own.

## What's in the box

- **Cohort model** — scheduled start + end dates, enrollment windows, drip lesson releases on a per-cohort schedule
- **Self-paced model** alongside cohorts for evergreen content
- **Mux-powered video player** with adaptive streaming, configurable playback speeds, subtitle support
- **Assignment submissions** with rubric-based review, inline commenting, resubmit-with-feedback loop
- **Group discussion space** per cohort (scoped comments on lessons, a general channel, office-hours Q&A)
- **Stripe checkout** — one-time course, subscription to full library, cohort-priced enrollment
- **Student dashboard** with progress tracking, certificate generation, lesson bookmarks
- **Instructor dashboard** — enrollment, revenue, engagement metrics, assignment review queue

## Why this vs rolling your own

The market (Podia, Circle, Maven, Teachable) has great features but is a platform you rent. This is the same feature set, self-hosted — your data, branding, margins.

## Known limits

- No live-streaming baseline (Mux is VOD-focused; live would be a separate integration)
- Email is on Resend by default`,

  // ── Boilerplates ─────────────────────────────────────────────────────
  "auth-billing-boilerplate": `The auth + subscription billing stack you always end up writing on day one of a Next.js app, done correctly once. Drop into any Next.js 16 App Router project — auth and billing pieces are independent so you can adopt either without the other.

## What's in the box

- **Better Auth** with email/password, passkey WebAuthn, social (Google + GitHub), email verification, password reset, typed session accessor you call from any RSC
- **Organizations** with roles (owner / admin / member), magic-link invitations with expiration, impersonation with audit logging, workspace switcher
- **Stripe subscriptions** — Checkout-hosted and portal-hosted, per-seat billing helpers, proration math with tests, retry-safe webhook handler with idempotent state machine (replays are safe)
- **Email flows** via Resend + React Email — welcome, verify, reset, invite, receipt — all themeable from one tokens file
- **Integration tests** on both the webhook signing path and the auth session layer

## Why this vs rolling your own

The pieces look simple but getting them composed correctly is where days evaporate. Webhook idempotency is subtle — you need to check the Stripe event ID, not the subscription state, because states can reorder in replay. This boilerplate has all of that solved and annotated.

## Known limits

- Opinionated on Prisma + Postgres; other ORMs would be a port
- Team billing with seat syncing from org membership is a common extension, not baseline`,

  "ai-chat-boilerplate": `A multi-model chat UI that doesn't lock you into one provider. Built on AI SDK v6 through the Vercel AI Gateway.

## What's in the box

- **Model router** with per-conversation override and a configurable fallback chain (try Claude, fall back to GPT-4, fall back to Gemini)
- **Tool calling** with typed \`defineTool()\` helpers, schema validation on inputs + outputs, streamed intermediate tool states
- **Structured output helper** — give it a zod schema, get back a validated object with automatic retry-on-mismatch
- **Per-user conversation history** with auto-generated titles, pinned conversations, archive, full-text search over message content
- **MCP-ready tool registry** — point it at any Model Context Protocol server and its tools become available
- **Polished chat UI** — streaming tokens, tool-call cards, regenerate, copy-to-clipboard, thread branching, per-message feedback

## Why this vs rolling your own

Every team that builds "a chat feature" learns the same lessons: streaming cancellation is harder than it looks, tool-call UI state machines are finicky, history retrieval needs cursor pagination, model lock-in costs you negotiating power. This boilerplate front-runs all of that.

## Known limits

- Not a hosted service — you run the app
- Vectors/RAG are not included (intentionally — lots of opinions there, this kit stays neutral)`,

  "multi-tenant-b2b": `The organizations + roles + invites layer that most B2B SaaS products reinvent badly.

## What's in the box

- **Workspace model** with org-scoped URLs (\`/app/[orgSlug]/...\`), org-scoped sessions, workspace switcher component
- **RBAC** with owner / admin / member baseline, plus a pattern for defining custom roles with per-permission matrix
- **Invitation flows** — magic-link email invites with configurable expiration, accept/decline UI, automatic seat accounting
- **Audit log** for every privileged action (role changes, invites, member removals, billing changes, impersonation) with actor / target / diff / timestamp / IP
- **Middleware-enforced tenant scoping** — any query that forgets to include the org scope is a compile error (via Prisma query helpers that require it)
- **Impersonation for support** — admins can impersonate a user in a customer's org, with an always-visible banner and an audit entry per session
- **Test suite** that verifies scoping invariants

## Why this vs rolling your own

Cross-tenant data leaks are one of the worst classes of bugs because they're silent until catastrophic. This kit is designed so the compiler catches them, not your incident response.

## Known limits

- Prisma-specific scoping helpers; other ORMs would need the equivalents written
- Billing-aware seat counting composes with the Stripe billing module, not baseline here`,

  "realtime-collab-boilerplate": `The realtime layer for apps with multiplayer cursors, live presence, and synced document state.

## What's in the box

- **Presence state** with automatic cleanup on disconnect, scoped by room, with metadata (name, color, avatar URL)
- **Ephemeral data** (cursors, selections, typing indicators) kept separate from persistent data — no leaking into your DB
- **CRDT-backed synced data store** for collaborative documents (Yjs under the hood, opinionated API so you don't touch Yjs directly unless you want to)
- **Transport abstraction** — ships with SummonFlow; swap in Liveblocks, your own WebSocket server, or a Cloudflare Durable Objects adapter without rewriting the app
- **Conflict-free text editing primitives**, list primitives, map primitives — all typed
- **Working collaborative todo-list example** you can strip down to your actual use case

## Why this vs rolling your own

Realtime sync is full of subtle failure modes — reconnection storms, state divergence after a network blip, presence cleanup on crashed clients. This boilerplate has those solved.

## Known limits

- Yjs is the CRDT (Automerge would be a port)
- WebRTC peer-to-peer is not the default (WebSocket server-relayed is more reliable for most apps)`,

  "workflow-engine": `Durable backoffice automations authored in code or UI — not a hand-rolled queue pretending to be a workflow.

## What's in the box

- **Triggers** — HTTP webhook, scheduled (cron), event-driven (on DB change or emitted event)
- **Steps as composable primitives** — HTTP request, DB read/write, AI call, send email, Stripe action, GitHub action
- **Retry policies** per step, idempotency keys, step-level compensation for rollback, secret injection
- **Built on Vercel Workflow** so flows survive restarts, timeouts, retries without you building the queue
- **Visual editor** that compiles to TypeScript — no dual source of truth, the code is the truth
- **Observability** — per-run timeline, failure reasons, retry history, ability to resume from a specific step

## Why this vs rolling your own

"Eventually consistent" is fine until your billing reconciliation fails silently for 3 days. This engine makes "survive anything" the default, because step-level retries + compensation are what you'd build yourself anyway — just without the durability.

## Known limits

- Postgres for persistent state (swappable)
- Not a general-purpose ETL tool (that's a different problem shape)`,

  // ── AI agents ────────────────────────────────────────────────────────
  "ai-sales-agent": `An outbound + inbound sales agent that actually closes loops with your CRM. Voice-capable via Twilio, writes call summaries straight into your CRM, qualifies leads, books meetings without the prospect dancing through a form.

## What's in the box

- **Voice + chat** — runs over Twilio voice and embedded web chat with the same playbook
- **Meeting booking** — checks rep availability and books on the spot
- **CRM sync** — writes enriched leads and call summaries to HubSpot or Pipedrive
- **Local eval harness** — regression-test every prompt change before deploying
- **Configurable qualification rubric** — define your ICP and MQL criteria as a JSON schema

## Why this vs rolling your own

Stitching Twilio + an LLM + a CRM sounds like a weekend. The long tail kills you: turn-taking on voice is hard, hallucinated meeting times erode trust, and getting a rep's calendar without double-booking takes real work. This kit has those solved.

## Known limits

- Requires a Twilio account + number in the country you're selling to
- You supply the playbook — this ships as a scaffold, not a finished agent`,

  "chat-agent-platform": `One agent codebase, every channel. Built on the Vercel Chat SDK with adapters for Slack, Discord, web, Telegram, Microsoft Teams, GitHub, and Linear.

## What's in the box

- **Adapters for 7 channels** — each translates threads, modals, cards, streaming, interactive components into the channel's native primitives
- **A single handler signature** — your code doesn't care which channel a message came from; you return a Message + optional Card + optional Modal trigger
- **Per-thread persistent state** and memory, keyed by composite channel + thread ID
- **Streaming** where the channel supports it (Slack streams, GitHub issues append), graceful degrade where it doesn't
- **Webhook setup scripts** for each channel so you're not clicking through seven dashboards

## Why this vs rolling your own

Supporting every channel one-by-one is a 6-month roadmap nobody on your team is excited about. This platform front-runs the adapter layer so engineering focus stays on what the agent does, not where it runs.

## Known limits

- Not every feature exists on every channel (e.g. Telegram has no real modals — those render as inline replies). The SDK surfaces this per capability so your handler can branch if needed.`,

  "codebase-audit-agent": `A deterministic codebase scanner with explainable findings. Walks the AST, surfaces issues \`tsc\` and ESLint miss, outputs reports that read like they came from a thoughtful human reviewer.

## What's in the box

- **Dead-code detection** across the project graph (not just per-file), catching re-exports that nothing imports and components rendered only by themselves in \`__tests__\`
- **Type-hole detection** — spots \`as any\`, implicit \`any\` in function params, tsc-hidden unsoundness from \`// @ts-ignore\`
- **Security smells** — taint tracking from HTTP request into sinks (DB queries, HTML, \`eval\`), auth-boundary violations, secret-leak patterns in logs
- **Architecture drift** — forbidden cross-layer imports, circular dependencies, layer-call-direction violations you define in a config
- **MDX report output** you can publish to an internal wiki, plus PR-ready diffs for the safe auto-fixes

## Why this vs rolling your own

LLMs doing code review tend to be either too vague ("consider refactoring") or hallucinate problems that aren't real. This tool does the boring deterministic parts in AST + graph analysis and only uses the LLM to write the explanation prose — so every claim is anchored to a real symbol.

## Known limits

- TypeScript/JavaScript only (Rust and Python planned)
- Not a replacement for Snyk / Semgrep; complementary`,

  "job-search-agent": `A personal AI that handles the grinding parts of a job search. Crawling, ranking, drafting, prepping.

## What's in the box

- **Multi-source crawler** with Playwright — LinkedIn, Hacker News "Who's Hiring", AngelList, configurable company career pages, with dedup
- **Fit scoring** with explainable breakdown — skills match, seniority band, location/remote fit, compensation range match
- **Tailored cover letters** and resume tweaks in your voice, with per-company tone toggle (formal / direct / warm)
- **Mock interview runner** — behavioral, system design, role-specific technical rounds, with feedback
- **Application tracker** with status workflow (applied → phone screen → on-site → offer / rejected / ghosted) and automatic follow-up reminders
- **Resume + cover letter version history** so you can see what worked
- **Inspired by gimme-job**

## Why this vs rolling your own

Job search is 5 hours of triage for 1 hour of actual conversation. This inverts that ratio.

## Known limits

- Crawlers can break when a source changes its DOM — updates are maintained, always some lag
- Not a replacement for networking`,

  "lead-enrichment-agent": `Inbound leads, fully enriched, scored, and routed — before your reps see them.

## What's in the box

- **Webhook-triggered enrichment pipeline** — company firmographics (industry, size, funding), tech stack, recent signals (hiring, funding round, product launches)
- **Persona match** against your ICP definition (editable JSON, not a black box) — returns a match tier with reasoning
- **Fit + intent scoring** — fit is firmographic, intent is behavioral (pricing page visits, signup, docs time-on-page). Combined score with explainable subscores
- **Round-robin routing** by territory, language, capacity, or custom rule — or routing into a nurture sequence if fit is weak
- **HubSpot / Pipedrive / Customer.io / Clearbit** integrations out of the box; config-file-driven

## Why this vs rolling your own

The top of the funnel drowns reps in manual triage — low follow-up quality or missed leads. Automating it well takes care: firmographic lookups, scoring that's explainable, routing that respects fairness. This kit has all of that.

## Known limits

- Enrichment data requires a paid provider key (Clearbit / Apollo / similar)
- Not a CRM itself — plugs into yours`,

  // ── Design systems ──────────────────────────────────────────────────
  "dashboard-design-kit": `Figma + code design system for SaaS dashboards — dark-first, tokenized end-to-end, documented with the decisions behind each choice.

## What's in the box

- **Full primitive library** — button, input, select, checkbox, radio, switch, dialog, drawer, dropdown menu, tabs, toast, tooltip, popover, skeleton — every one with 3–5 variants and every state documented
- **Dashboard patterns beyond primitives** — sidebar (collapsible, pinnable), top nav, ⌘K command palette, data table, empty state, filter chips, bulk-action toolbar
- **Variables for color, radius, spacing, typography, shadow, motion** — identical in Figma and the React library
- **Documentation site** (MDX) with when-to-use-this guidance, accessibility notes, motion specs, anti-patterns
- **Figma library** with components, variants, auto-layout, light/dark branches

## Why this vs rolling your own

Design systems are long-tail effort: it's not the button, it's the 47 decisions about the button (hover lift, focus ring, disabled cursor, loading spinner position, icon gap) that eat weeks. This kit has those made and explained, and because it's forkable you're adopting decisions, not a dependency.

## Known limits

- Not a component library on npm — you copy/paste into your repo (the shadcn approach)
- Opinionated on Tailwind v4; Tailwind v3 requires a small port`,

  "data-table-kit": `The table component that doesn't buckle at 100k rows. Built on TanStack Table v8 with the virtualization, exports, and server-driven state that production tables actually need.

## What's in the box

- **Row virtualization** via TanStack Virtual — smooth at 100k+ rows on a mid-range laptop
- **Column resizing** with persistence to localStorage, column reordering via drag, show/hide menu
- **Server-driven pagination + sort + filter state** that serializes cleanly to URL and API — deep-linkable, sharable, back-button-friendly
- **Sticky bulk-action toolbar** with shift-click range selection and "select all across pages" with a visible count
- **CSV and Excel export** (via SheetJS) with respect for the current filters
- **Typed \`createColumns<T>()\` helper** — column definitions infer from your data model

## Why this vs rolling your own

A real table needs all of: virtualization, URL-sync state, typed columns. Most "table components" give you one or two. This gives you all three, plus the little QoL things (sticky header under sticky page header, focus-visible on row, keyboard nav) that are annoying to add later.

## Known limits

- No pivot/aggregation rows (different product)
- No tree/expand rows baseline; can be added with ~50 lines using TanStack Table's expansion model`,

  "iconography-pack": `200 hand-drawn product icons in two weights. Pixel-snapped at 16 / 20 / 24px with a tree-shakable React bundle.

## What's in the box

- **200 icons** covering common SaaS vocabulary: actions, status, navigation, data, commerce, social, file types, communication, weather/location
- **Two weights** — regular (default) and bold (for primary actions or emphasis states). Consistent optical weight so mixing them looks intentional
- **Pixel-snapped at 16, 20, and 24px** — icons are hand-tuned at each size, not auto-scaled
- **SVG source files** plus a React component library; a CLI tree-shakes to a bundle with only the icons you import (~400 bytes per icon)
- **Figma library** with components, variants, auto-layout, and design tokens

## Why this vs rolling your own

Lucide and Heroicons are fine; they're the same icons everyone uses. If that's a problem (your brand wants visual distinction, your designer needs a pack the internet doesn't already have), this is the alternative — tuned for product UI specifically.

## Known limits

- 200 icons covers the common 80% — you may need to draw niche ones yourself
- MIT-friendly inside your own products; redistributing the source (as a pack, published package, Figma community file) is not permitted`,

  "landing-blocks-pack": `60 production-ready marketing page blocks. Compose any marketing page without opening Figma.

## What's in the box

- **12 hero variants** — split (text + image/video), centered, animated text, gradient bg, video bg, testimonial-lead, product-lead
- **10 feature grid variants** — icon grid, alternating left/right, bento, tabbed, step-through, comparison table, timeline
- **8 pricing variants** — tiered, monthly/yearly toggle, comparison table, usage slider, enterprise callout, single-product, annual-discount
- **Full FAQ, CTA, testimonial, logo wall, stats strip, footer sets**
- **Brand-tokenized** — one variable change recolors the entire set
- **Motion-friendly** with subtle entrance animations respecting \`prefers-reduced-motion\`
- **Dark + light variants**, fully responsive, a11y-checked
- **Drop-in** for Next.js or Astro

## Why this vs rolling your own

Landing pages are high-value, low-leverage work — every product needs one, but only you know what yours should say. This frees you from building the containers.

## Known limits

- Tailwind v4 + Framer Motion; other styling stacks are a port
- Example copy is representative; you supply the real copy`,

  "motion-primitives": `A curated set of transitions, stagger grids, and page-motion utilities so interactions feel considered instead of jittery.

## What's in the box

- **Entrance primitives** — \`<FadeIn>\`, \`<SlideIn>\`, \`<ScaleIn>\`, \`<StaggerGrid>\`, \`<StaggerList>\` — typed, composable, sane defaults
- **Layout transitions** — shared-layout between route changes, FLIP animations for list reordering, shared-element transitions for master-detail
- **Scroll-linked effects** — parallax with proper viewport gating, reveal-on-scroll that works with SSR, sticky-header shrink on scroll
- **Hover primitives** with spring physics (tilt, lift, glow) tuned for sensible default feel
- **Reduced-motion fallbacks** — every primitive degrades to opacity-only when \`prefers-reduced-motion: reduce\` — accessibility as default

## Why this vs rolling your own

Getting motion right is full of small decisions — easing curves, duration scales, when to stagger and by how much. This pack has those decided and unified.

## Known limits

- Framer Motion is the runtime
- Not an animation library for "wow" marketing effects — this is product UI motion`,

  "summoniq-ui-kit": `The same UI primitives we ship SummonIQ on. Brand-tokenized, dark-first, motion-friendly, shadcn-compatible.

## What's in the box

- **Primitive layer** — button, input, select, checkbox, radio, switch, dialog, drawer, tabs, toast, tooltip, popover — shadcn-compatible API
- **Marketing blocks** — hero, features, pricing, FAQ, CTA, testimonial wall, logo wall, stats strip, footer
- **Motion defaults** that feel considered instead of janky
- **Tokens** for color, radius, spacing, typography, shadow, motion — all CSS variables, dark/light and brand recolor are one-line changes
- **Coexists with your existing shadcn** — class order doesn't fight

## Why this vs rolling your own

You could grab shadcn and build the marketing blocks yourself. This gives you a day's head start plus the motion and tokens already unified — and because it's forkable, there's no dependency to keep in sync.

## Known limits

- Tailwind v4 required (v3 port is possible, not baseline)`,

  "email-template-set": `A set of branded React Email templates for the flows every product needs: welcome, verify, reset, invite, receipt, usage alert.

## What's in the box

- **Six themeable templates** — welcome, verify email, password reset, organization invite, receipt, usage alert
- **Single tokens file** (brand color, typography, logo URL, footer copy) that recolors + rebrands the whole set in under a minute
- **Provider-agnostic sender** — one typed \`sendEmail('welcome', { user })\` works with Resend, SES, Postmark, or Loops through swappable adapters
- **Dev preview server** that hot-reloads as you edit
- **Tested against Litmus** for consistent rendering across Gmail, Outlook, Apple Mail, iOS

## Why this vs rolling your own

Email rendering is a world of quirks (Outlook ignoring modern CSS, Gmail clipping at 102KB, dark-mode color inversion). Building six templates that render correctly across 10 major clients is a week of work. These ship tested and themeable.

## Known limits

- React Email is the rendering layer — if you're on MJML you'd need to port
- Not marketing/newsletter templates (different product)`,

  // ── Desktop ──────────────────────────────────────────────────────────
  "domain-hunter-app": `A desktop companion for anyone who names products for a living. Parallelized lookups, native drop alerts, and WHOIS history — a tool built for the workflow, not a web form in an Electron wrapper.

## What's in the box

- **Live availability across 400+ TLDs** simultaneously with a rate-limiter respecting per-registrar limits
- **Watch list** with native OS notifications the instant a watched domain drops. Snoozing, grouping, per-domain note field
- **WHOIS history** via a paid data provider adapter — see past registrants, registration date, sunset events
- **Bulk import from CSV** for brainstorm lists, plus a "generate variations" helper that suffixes/prefixes common tokens (try, get, go)
- **Search history** with filters — quickly find that "available last week" domain you forgot to register
- **Cross-platform** — mac + Windows + Linux builds, auto-update, dark mode

## Why this vs rolling your own

Registrar search boxes are slow, rate-limited, and have no persistence or alerting. This app is what you build when you're tired of refreshing a tab.

## Known limits

- WHOIS history requires a paid third-party API key (RDAP is included free but has less history)
- Not a registrar — deep-links to Namecheap / Cloudflare / Porkbun to complete purchase`,

  "electron-starter": `Modern Electron with Vite, TypeScript, auto-update, and crash reporting — so your first shippable v1 feels like a native app.

## What's in the box

- **ESM-first main process** (no CommonJS weirdness) with context-isolated preload
- **Fully typed IPC surface** — define channels once, get autocomplete in both main and renderer; the compiler catches mismatched arguments
- **Multi-window spawn/focus/close** by ID from renderer code, with proper macOS menu behavior (Cmd+W closes, Cmd+Q quits, Cmd+H hides)
- **OAuth helpers** for desktop auth flows using an ephemeral localhost callback (the right way, not custom protocol handlers)
- **Signed + notarized builds** for macOS and signed builds for Windows via a GitHub Actions pipeline you drop certs into
- **Sentry wired** for crash reports from both main and renderer processes
- **Auto-update via electron-updater** with rollback support if the new version fails to boot

## Why this vs rolling your own

Electron's docs get you to "it runs on my machine". What you need is the stack of 15 things that take a polished app across the threshold (IPC typing, notarization, auto-update rollback, crash reports, menu conventions).

## Known limits

- Electron bundle size is real — if you're under 20MB expected, consider Tauri instead
- No prebuilt Sparkle-on-Windows (electron-updater covers both platforms)`,

  "mac-menubar-app": `A SwiftUI menubar app starter that makes your first shippable v1 feel native.

## What's in the box

- **Menubar scene** using \`MenuBarExtra\` with the \`.window\` style (modern popover that behaves well with mission control + full-screen apps)
- **Global hotkey support** — register shortcuts across the system, handle conflicts, allow per-app override
- **Login items** using the modern \`ServiceManagement\` APIs (not \`LSSharedFileList\` which was deprecated in macOS 13)
- **Settings scene** using the native \`Settings\` style (tabs with icons, matches macOS system preferences)
- **Sparkle auto-update** with EdDSA signing and support for staging / beta / stable channels
- **Crash report collection** wired to Sentry
- **Minimal-but-complete menubar UI** you can strip down to your app's use case

## Why this vs rolling your own

Every individual piece has a confusing API or a deprecation story (login items especially). This kit has each done the modern way, with notes on the gotchas. Targets macOS 14+.

## Known limits

- Menubar only — if you need a Dock app, start from Xcode's SwiftUI template
- SwiftUI-only (AppKit interop is possible but not default)`,

  "tauri-desktop-starter": `A production-grade Tauri 2 starter so you don't burn a week on plumbing.

## What's in the box

- **Multi-window spawn/focus/close** by ID from JavaScript, with proper window-state restoration
- **Deep links** via the OS URL scheme, handled in both main and renderer
- **Auto-update** via the Tauri updater with code-signed releases and automatic rollback on failed boot
- **Tray menu** with global hotkeys (cross-platform via the global-shortcut plugin)
- **Fully typed Rust ↔ JS IPC bridge** with vitest coverage on the JS side and a Rust unit test harness
- **GitHub Actions pipeline** that signs + notarizes for macOS and signs for Windows
- **React 19 + Vite** on the webview side, Tauri 2 under the hood

## Why this vs rolling your own

Tauri's docs are solid but the integration work (notarization, updater config, IPC typing, cross-platform signing CI) is a multi-week discovery tax.

## Known limits

- Tauri 2 is evolving quickly — this pins versions and updates monthly
- Linux AppImage is a bonus format; not fully signed like mac/win`,

  // ── Guides ───────────────────────────────────────────────────────────
  "indie-launch-playbook": `Ship a paid product in 14 days. A practical, day-by-day operational plan with a single focused deliverable per day.

## What's in the box

- **14 daily plans**, each with one deliverable and a "done means" checklist so you know when to stop and move on
- **Copy templates** — landing page hero + features + pricing, launch tweet thread, ProductHunt launch comment, welcome email, onboarding drip (3 emails)
- **Vetted launch list** — ProductHunt, IndieHackers, Hacker News Show HN, relevant subreddits, newsletter editors who accept indie submissions, and what to send each
- **Pricing worksheet** — three pricing models with examples, when each fits, a decision tree for your product
- **Three real post-mortems** from indie makers who ran the playbook — what they did, what worked, what broke
- **Delivered as MDX** (rendered at a private URL for you) + a Notion template to duplicate

## Why this vs rolling your own

Most launch advice is vague strategy ("find your audience", "build in public"). This is the logistics — the stuff you'd spend 30 hours Googling to assemble on your own.

## Known limits

- Not a course — no videos, no community
- Best for software / digital products; physical product launches share some but not all of this`,

  "pricing-playbook": `A practical pricing playbook for template shops, SaaS products, and consultancy work. Not theory — patterns and examples you read once and refer back to every time.

## What's in the box

- **Pricing model chapters** — value-based, tiered, usage-based, per-seat, credits, hybrid — with tradeoffs, ideal-fit signals, failure modes
- **Anchor strategies** that move conversion — good-better-best psychology, decoy pricing, annual discount framing, when to show a price vs "contact us"
- **Copy templates** — pricing page headlines, value-stack bullets, FAQ patterns for objections
- **12 worked examples** from real products (with revenue numbers where founders shared them) — SaaS, templates, courses, consultancy
- **Discount strategy** — when it works, when it destroys your anchor, one-time vs recurring math
- **Delivered as MDX** + downloadable PDF

## Why this vs rolling your own

Pricing is high-leverage and most founders treat it as an afterthought. This compresses 18 months of trial-and-error into a single read.

## Known limits

- B2B SaaS / digital products focus — consumer apps and physical goods share some patterns but not all`,

  "seo-playbook": `A programmatic-SEO + content engine playbook for SaaS, with a working Next.js example repo.

## What's in the box

- **Programmatic SEO chapter** — how to ship hundreds of indexable pages from a Postgres table (template-driven generation, canonical URL rules, internal-link graph, thin-content avoidance)
- **Sitemap + IndexNow automation** so Google and Bing actually find your new pages within minutes
- **Page archetype patterns** with when-to-use each — comparison ("X vs Y"), how-to, integration ("Product + Tool"), alternative-to, location-modified
- **Content velocity playbook** — how to ship 100 pages without them all being trash
- **Working Next.js example repo** with a ~500-page programmatic section, dynamic OG images, live Lighthouse scores
- **Delivered as MDX** + private example repo access

## Why this vs rolling your own

SEO is full of guides that are either vague ("write good content") or outdated (keyword density). This is current, concrete, and shows a working example you can reverse-engineer.

## Known limits

- Focused on English-language, US-centric search
- Not a link-building guide (different skill set)`,

  "tech-lead-guide": `Doc templates and team rituals for newly-promoted engineering leads who don't want to invent the basics from scratch.

## What's in the box

- **Doc templates with worked examples** — RFC (with 3 real examples across different decision types), ADR, post-mortem (blameless, structured), performance review (quarterly + annual), quarterly planning, skip-level, 1:1 agenda
- **Meeting scripts with timing cues** — weekly 1:1, daily standup, quarterly planning, sprint retrospective, quarterly skip-level
- **90-day plan** for your first three months as a new lead — week-by-week actions, what to watch for, what to avoid
- **Calibration rubric** for engineer levels (IC1 → Staff) adapted from common industry scales
- **Delivered as MDX** (rendered at a private URL) + Notion templates

## Why this vs rolling your own

Most new leads inherit a vacuum of documentation and spend months reinventing templates. This compresses that to hours — you paste in templates, customize to your team's voice, and spend your actual brain on the people.

## Known limits

- Pragmatic, not aspirational — opinionated toward shipping-oriented teams`,

  // ── Integrations ─────────────────────────────────────────────────────
  "analytics-wireup": `Sane analytics in an afternoon, without turning your codebase into a tracking pixel factory.

## What's in the box

- **Typed event SDK** — autocomplete event names and properties; misspell \`upgrade_click\` as \`upgrad_click\` and your build fails
- **Tier-aware funnel definitions** — product / marketing / lifecycle funnels live side by side in a single config
- **UTM persistence** — first-touch and last-touch attribution preserved through session → signup → Stripe → CRM
- **Minimal consent banner** with category toggles (necessary / analytics / marketing), server-side event gating so Europe-region requests don't leak until consent
- **Pre-configured** for PostHog + Google Analytics 4 + optional Segment pass-through

## Why this vs rolling your own

Analytics always starts simple and metastasizes: some events typed, others magic strings, UTMs dropped between Stripe and HubSpot, privacy banner a hack that blocks everything or nothing. This kit is the opposite.

## Known limits

- Not a replacement for having an analyst — gives you clean data, not decisions
- Server-side events use \`fetch\` — works on Node + edge, review if you're on a custom runtime`,

  "better-auth-setup": `An opinionated Better Auth configuration that saves you a week of reading docs and debugging session cookies.

## What's in the box

- **Every method** — email/password, social (Google + GitHub + Apple), passkey WebAuthn, 2FA with backup codes, magic link
- **Organizations + impersonation** — role-gated impersonation for support, with an audit trail
- **App Router helpers** — requireSession(), ensureOrg(), typed session in every RSC
- **Resend adapter** pre-wired to React Email templates for every auth-triggered email (welcome, verify, reset, invite)
- **Test suite** against Better Auth's test harness so upgrades don't silently break

## Why this vs rolling your own

Better Auth is great, but "following the docs" produces an auth config you're afraid to touch six months later. This kit is the result of running Better Auth in production across a half-dozen projects — every real-world paper-cut has its fix encoded.

## Known limits

- Tuned for Postgres — SQLite + MySQL work but schema migrations differ
- Doesn't include SSO / SAML (separate add-on)`,

  "hubspot-pipeline-sync": `Two-way sync between your app and HubSpot deals that survives the real world — rate limits, webhook replays, field conflicts.

## What's in the box

- **Mirror users → contacts**, plans → deals, churn → lifecycle stage transitions, with per-field conflict rules (last-write-wins, app-wins, hubspot-wins)
- **Idempotent webhook handler** using HubSpot's change version numbers so replays are always safe
- **Batch backfill tool** for seeding HubSpot from your existing user base without rate-limit pain
- **Observability layer** — every sync decision logs the source, target, chosen-direction, and conflict reason
- **Schema drift detection** — if HubSpot admins rename a property, sync fails loud with a migration suggestion

## Why this vs rolling your own

Two-way CRM sync sounds like a REST call in each direction. It's not — it's conflict resolution, webhook idempotency, rate-limit compliance, schema migration. This kit has all of those solved and logged.

## Known limits

- HubSpot only (Pipedrive and Salesforce sell separately)
- Requires HubSpot Starter or higher for webhook access`,

  "loops-email-automation": `Five lifecycle email flows pre-built and wired to event triggers.

## What's in the box

- **Welcome flow** — triggered on signup, 3 emails over the first week (welcome, first-win, social proof)
- **Onboarding flow** — triggered on org creation, 5 emails timed to onboarding milestones
- **Trial-to-paid flow** — triggered on trial start, 4 emails countdown-style
- **Dunning flow** — triggered on failed payment, 3 emails + grace period
- **Win-back flow** — triggered on downgrade/cancel, 2 emails at 30 and 90 days
- **Typed Loops client** with autocomplete for audience properties, contact fields, event names
- **Copy bank** — 50+ subject lines and bodies from flows that converted, categorized by funnel stage
- **Dev-preview mode** so you iterate without sending to your list

## Why this vs rolling your own

Lifecycle email is always on the "we should set that up" list and never at the top. This removes the setup cost so you start at "tuning copy" instead of "designing the flow from scratch".

## Known limits

- Loops-specific; other ESPs would be a port
- Ships with example product context — copy needs your product's specifics filled in`,

  "resend-email-kit": `A branded transactional + product email pipeline you can wire up in an afternoon.

## What's in the box

- **Six themeable React Email templates** — welcome, verify, reset, invite, receipt, weekly summary
- **Typed sender helper** — \`sendEmail('welcome', { user })\` — autocompletes template name and required props
- **Dev preview server** with hot reload as you edit; view all templates in a gallery or focus on one
- **Litmus-tested** for consistent rendering across Gmail, Outlook, Apple Mail, iOS
- **Provider-agnostic adapter** so swapping Resend for SES or Postmark is a config change
- **Bounce and complaint handling** wired to update the user's email status

## Why this vs rolling your own

Transactional email is a long tail: template consistency, dark-mode handling, bounce processing, preview text, Outlook quirks. This kit has those sorted so you customize only copy and brand.

## Known limits

- Marketing-style email campaigns are out of scope (that's loops-email-automation)`,

  "signalsplash-kit": `Self-host the SummonIQ analytics stack on your own infra — so your usage data doesn't live with a third party.

## What's in the box

- **Ingest API service** — a Fluid Compute-ready Next.js API that handles batched events, deduplication, enrichment
- **Analytics dashboard** — funnels, retention cohorts, event explorer, user sessions — covers the 80% of use cases that otherwise send you to PostHog or Mixpanel
- **Client SDK** (web + React Native + Node server) pre-configured with retry behavior
- **Privacy-first defaults** — no cookies required (session ID in localStorage), IP hashing, configurable retention (30 days to forever), GDPR-friendly data export + delete
- **Per-app API keys** with scoped permissions, rate limiting per key, key-rotation workflow
- **Deploys to Vercel + Neon** in under 10 minutes with the included \`vercel.ts\` config

## Why this vs rolling your own

Self-hosting analytics sounds like a multi-month project. This collapses it to an afternoon — complete privacy-sane stack without signing with a vendor.

## Known limits

- Not a session-replay tool (different storage shape)
- Query performance on Neon is good for <100M events; above that you want ClickHouse (documented migration path)`,

  "stripe-billing-module": `The Stripe integration layer every SaaS team ends up writing badly at 2am. This is the one written carefully.

## What's in the box

- **Drop-in Checkout** — one-time, subscription, and metered usage modes, with seat-based helpers and configurable trial periods
- **Customer portal** hosting with whatever features you enable (cancel, switch plan, update card, download invoices)
- **Proration math helpers** with unit tests for upgrade, downgrade, mid-cycle plan change, quantity change
- **Retry-safe webhook handler** with idempotent state machine and a replay tool for re-processing failed events
- **Typed subscription model** that wraps Stripe's stringly-typed statuses
- **localstack-style mock mode** so integration tests don't hit Stripe test mode (faster, more deterministic)

## Why this vs rolling your own

Stripe's API is well-designed but the integration layer is where you get hurt: webhook replays doubling subscription counts, proration off-by-cents, portal config drifting out of sync.

## Known limits

- Payments only — tax handling (Stripe Tax) is a separate composition
- USD / EUR / GBP tested; other currencies work but haven't been run in production here`,

  "summonflow-realtime": `Drop-in bindings for SummonFlow realtime channels in a Next.js app.

## What's in the box

- **Pre-configured client + server setup** — connect by adding your SummonFlow app ID
- **React hooks** — \`useChannel(name)\`, \`usePresence(room)\`, \`useSubscribe(event, handler)\` — that's basically the whole API surface
- **Encrypted channels** for sensitive realtime data (E2E), configured per channel
- **Automatic reconnect** with exponential backoff, presence cleanup on disconnect
- **Working example chat app** with presence + typing indicators you can crib from
- **Pairs with realtime-collab-boilerplate** if you need CRDT-backed document sync

## Why this vs rolling your own

SummonFlow's SDK is fine; this kit is the integration layer — the opinionated hooks and reconnect handling you'd otherwise write per project.

## Known limits

- SummonFlow-specific; other realtime providers would need their own kit`,

  "typeform-intake-flow": `Multi-step intake forms with branching logic that route somewhere useful.

## What's in the box

- **Branching forms** with conditional question visibility based on prior answers
- **File uploads** with S3-backed storage and a virus scanner in the pipeline
- **Routed creation** — submissions create the right record in HubSpot (contact + deal), Pipedrive (lead), Linear (issue), or Slack (DM to on-call) based on answers
- **Single configurable webhook handler** so routing rules live in one file, not distributed across services
- **Spam protection** — Typeform's hidden-field honeypot + server-side rate limiting + optional Turnstile challenge
- **Prefill links** for known contacts (click a link in an email, form opens with your email already filled)
- **Hidden fields** carry UTM + referrer context through to the downstream record

## Why this vs rolling your own

Typeform is great at the form part; the integration layer on your side is where the real work is. This kit handles it so your forms do what you want (create the right thing in the right tool) without a Zapier tax.

## Known limits

- Typeform-specific; Tally or native form replacement is a separate kit`,
};

async function main() {
  const products = await db.product.findMany({ where: { active: true }, select: { id: true, slug: true } });

  let updated = 0;
  let missing = 0;
  for (const p of products) {
    const copy = COPY[p.slug];
    if (!copy) continue;
    await db.product.update({ where: { id: p.id }, data: { longDescription: copy } });
    updated++;
    console.log(`  ✓ ${p.slug}`);
  }

  // Flag products whose longDescription is still short
  const short = await db.product.findMany({ where: { active: true }, select: { slug: true, longDescription: true } });
  const stillShort = short.filter((p) => (p.longDescription?.length ?? 0) < 1000);
  console.log(`\n${updated} expanded. ${stillShort.length} still short:`);
  for (const p of stillShort) console.log(`  - ${p.slug} (${p.longDescription?.length ?? 0} chars)`);

  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
