// Seeds 10 new "high-demand" apps with full content + setup steps.
// Uses Prisma with the pg adapter directly (matches lib/db/client.ts) so
// the script doesn't trip the server-only guard.

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
  features: Array<{ icon?: string; title: string; desc: string }>;
  integrations?: Array<{ name: string; purpose: string; required?: boolean }>;
  assets?: Array<{ label: string; detail: string }>;
  highlights?: Array<{ value: string; label: string }>;
  howItWorks?: Array<{ title: string; desc: string }>;
  faqs?: Array<{ q: string; a: string }>;
  setupBundles: string[]; // keys into the SETUP_BLOCKS map at bottom
};

const APPS: App[] = [
  {
    slug: "ai-chat-app",
    name: "AI Chat — Full Product",
    tagline: "A polished ChatGPT-style chat product with credits, billing, and your branding.",
    description:
      "A complete AI chat application — not a boilerplate. Multi-model routing, system prompts, conversation history, credits + Stripe billing, sharable conversations, and a brand config. Deploy, change a logo, charge users.",
    longDescription: `A complete AI chat product, not a starter kit. Designed for founders who want to ship a ChatGPT-style app under their own brand without spending three months on plumbing.

## What's in the box

- **Multi-model chat** — Claude, GPT-4, Gemini, Grok via Vercel AI Gateway, with per-conversation model override and configurable fallback chains
- **Custom system prompts** ("Personas") — users create + save prompt presets, share them publicly, fork others'
- **Conversation history** with full-text search, folders, pin/archive, and shareable read-only links
- **Credits + billing** — Stripe-powered credits packs (one-time) plus monthly subscription tiers; metered usage tracking per model with cost-per-token math
- **Image attachments + vision** for models that support it
- **Voice input** (browser MIC) and **TTS playback** of responses
- **Branding config** — logo, colors, app name, default greeting all in one tokens file
- **Admin panel** — user management, usage analytics, credits adjustment, content moderation queue

## Why this vs rolling your own

You can build a chat UI in a weekend. What takes months is the surrounding product: billing that doesn't double-charge on retries, credits that reconcile correctly across model providers with different pricing, content moderation that doesn't ban the wrong users, and an admin panel for when things go wrong. This is all of that, polished, deployed.

## Known limits

- Vector store / RAG is wireable but not pre-configured (different products want different shapes)
- No mobile native apps — web + PWA only`,
    badge: "popular",
    stack: ["Next.js 16", "AI SDK v6", "AI Gateway", "Better Auth", "Stripe", "Postgres", "Vercel Blob"],
    amount: 119900,
    features: [
      { icon: "Workflow", title: "Multi-model routing", desc: "Claude, GPT-4, Gemini, Grok with per-conversation override and fallback chains." },
      { icon: "Wand2", title: "Personas + system prompts", desc: "Save, share, fork prompt presets. Built-in persona marketplace." },
      { icon: "CreditCard", title: "Credits + subscriptions", desc: "Stripe-powered credit packs plus monthly tiers, with per-model cost tracking." },
      { icon: "Layers", title: "Sharable conversations", desc: "Public read-only links with continue-the-conversation forking." },
      { icon: "Mail", title: "Voice + vision", desc: "Browser mic input, TTS playback, image attachments where models support it." },
      { icon: "Shield", title: "Admin panel", desc: "User management, usage analytics, moderation queue, credits adjustment." },
    ],
    integrations: [
      { name: "Vercel AI Gateway", purpose: "Single endpoint for every model provider", required: true },
      { name: "Stripe", purpose: "Credits + subscriptions billing", required: true },
      { name: "Better Auth", purpose: "Email + passkey + OAuth", required: true },
      { name: "Vercel Blob", purpose: "Image upload storage" },
    ],
    assets: [
      { label: "Chat surface", detail: "Streaming UI, message actions, regenerate, edit, copy, share" },
      { label: "Persona library", detail: "Browse, search, fork, publish system prompts" },
      { label: "Billing pages", detail: "Plan picker, credits store, customer portal, invoices" },
      { label: "Admin", detail: "Users, usage, moderation, credits ops" },
    ],
    highlights: [
      { value: "4 models", label: "Routed through one Gateway endpoint" },
      { value: "1 day", label: "From clone to first paying user" },
      { value: "$0/mo", label: "Idle infra cost on Vercel hobby" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "ai-gateway", "vercel-blob", "branding"],
  },
  {
    slug: "social-feed-app",
    name: "Social Feed Platform",
    tagline: "X / Twitter-shaped social network — posts, follows, feed, likes, notifications.",
    description:
      "A complete social media app: post composer, follow graph, ranked timeline, likes, replies, reposts, real-time notifications, and DMs. Stripe-paid premium tiers. Brand it, ship it.",
    longDescription: `A complete X/Twitter-shaped social platform — posts, follows, feed, replies, notifications, DMs. The kind of niche social network founders keep wanting to build for a specific community.

## What's in the box

- **Post composer** with image / video / link previews, character limit, threading
- **Timeline** — ranked algorithmic feed plus a chronological "following" tab
- **Follow graph** with mutual-follow indicators, follow suggestions based on connections
- **Engagement** — likes, replies, reposts (quote + reblog), bookmarks
- **Real-time notifications** for follows / replies / likes / mentions via SummonFlow
- **DMs** — one-to-one and small group, encrypted in-transit
- **Profiles** — bio, header image, pinned posts, follower/following counts, verified badge support
- **Premium tiers** — Stripe-paid badges, longer posts, exclusive features
- **Moderation tools** — report flow, mute/block, admin queue, bulk actions
- **Search** — users, posts, hashtags with autosuggest

## Why this vs rolling your own

The hard parts of a social app aren't visible: ranking algorithms that don't degrade with scale, notification delivery that doesn't melt under fan-out, abuse-prevention that doesn't ban innocents. This kit has reasonable defaults for all of them.

## Known limits

- No federation (ActivityPub is a separate add-on, not baseline)
- No video transcoding pipeline; videos under 60s only by default`,
    badge: "popular",
    stack: ["Next.js 16", "Better Auth", "Stripe", "SummonFlow", "Postgres", "Vercel Blob"],
    amount: 149900,
    features: [
      { icon: "Users", title: "Follow graph + suggestions", desc: "Mutual follows, follower/following counts, suggestions from your network." },
      { icon: "Workflow", title: "Ranked + chronological feeds", desc: "Algorithmic 'For you' tab and 'Following' chronological tab." },
      { icon: "Zap", title: "Real-time notifications", desc: "Follows, replies, likes, mentions delivered via SummonFlow." },
      { icon: "Mail", title: "DMs", desc: "One-to-one and small group, encrypted in-transit." },
      { icon: "CreditCard", title: "Premium tiers", desc: "Stripe-paid badges, longer posts, exclusive engagement features." },
      { icon: "Shield", title: "Moderation tools", desc: "Report flow, mute/block, admin queue with bulk actions." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Auth + verified accounts", required: true },
      { name: "Stripe", purpose: "Premium tier subscriptions", required: true },
      { name: "SummonFlow", purpose: "Real-time presence + notifications" },
      { name: "Vercel Blob", purpose: "Image + video storage", required: true },
    ],
    assets: [
      { label: "Feed surface", detail: "Composer, ranked feed, infinite scroll, mute, report" },
      { label: "Profile pages", detail: "Bio, header, pinned, posts/replies/media tabs" },
      { label: "Notifications + DMs", detail: "Real-time bell, conversation threads, presence" },
      { label: "Moderation admin", detail: "Report queue, user management, audit log" },
    ],
    highlights: [
      { value: "Real-time", label: "Notifications + DMs via SummonFlow" },
      { value: "Ranked feed", label: "Algorithm-served 'For you' tab" },
      { value: "Premium-ready", label: "Stripe billing baked in" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "summonflow", "vercel-blob", "branding"],
  },
  {
    slug: "marketplace-app",
    name: "Two-Sided Marketplace",
    tagline: "Airbnb-shaped marketplace — listings, search, booking, Stripe Connect payouts, reviews.",
    description:
      "A complete two-sided marketplace platform. Sellers create listings; buyers search, book, and pay; the platform takes its fee and pays out via Stripe Connect. Reviews, messaging, and a host dashboard included.",
    longDescription: `A complete two-sided marketplace — the kind of app founders keep paying $50k+ to have built. Listings, search, booking, payments with platform-fee split, reviews, messaging, host dashboard.

## What's in the box

- **Listing creation flow** — multi-step form with image upload, pricing rules (per-night / per-hour / fixed), availability calendar, location with map preview
- **Search + filters** — full-text search with facets (location, price band, ratings, availability dates, custom attributes per category)
- **Map view** with cluster markers and search-as-you-pan
- **Booking flow** — date picker, guest count, instant-book vs request-to-book, payment with Stripe Checkout
- **Stripe Connect** payouts to sellers with platform fee (configurable %), automatic 1099 generation
- **Messaging** between buyers and sellers (scoped per booking inquiry)
- **Reviews + ratings** — two-sided (buyer reviews seller, seller reviews buyer), required after a stay
- **Host dashboard** — listings management, calendar, payout history, analytics
- **Admin** — moderation, dispute resolution, payout management

## Why this vs rolling your own

The integration of Stripe Connect + booking calendars + reviews + messaging takes 3-6 months of careful work. Each individual piece is simple; getting them composed correctly with proper edge-case handling (what happens if a guest cancels mid-stay? if a host's payout fails? if a review is flagged?) is the actual product.

## Known limits

- Listing categories are configurable but the schema assumes "place to book" — pivoting to digital goods or services requires schema work
- Single-currency at launch (multi-currency is a v0.2 add-on)`,
    badge: "popular",
    stack: ["Next.js 16", "Better Auth", "Stripe Connect", "Postgres", "Mapbox", "Vercel Blob", "Resend"],
    amount: 199900,
    features: [
      { icon: "Layers", title: "Listing flow", desc: "Multi-step listing creation with images, pricing, availability, map." },
      { icon: "Workflow", title: "Search + map view", desc: "Filters, facets, search-as-you-pan map, instant results." },
      { icon: "CreditCard", title: "Stripe Connect payouts", desc: "Platform fee split with automatic seller payouts." },
      { icon: "Users", title: "Two-sided reviews", desc: "Buyer and seller review each other after a transaction." },
      { icon: "Mail", title: "Messaging", desc: "Scoped per inquiry/booking; never leaks user emails." },
      { icon: "Shield", title: "Dispute resolution", desc: "Admin escalation flow with payout hold." },
    ],
    integrations: [
      { name: "Stripe Connect", purpose: "Two-sided payments + payouts", required: true },
      { name: "Mapbox", purpose: "Maps + geocoding", required: true },
      { name: "Better Auth", purpose: "Auth for hosts + buyers", required: true },
      { name: "Resend", purpose: "Booking confirmations + reminders", required: true },
    ],
    assets: [
      { label: "Public marketplace", detail: "Browse, search, filter, map, listing detail, booking" },
      { label: "Host portal", detail: "Listings, calendar, bookings, payouts, analytics" },
      { label: "Buyer account", detail: "Trips, messages, reviews, payment methods" },
      { label: "Admin", detail: "Moderation, disputes, payouts, fees" },
    ],
    highlights: [
      { value: "2 sides", label: "Buyer + seller portals included" },
      { value: "Stripe Connect", label: "Real payouts from day one" },
      { value: "$50k+", label: "Equivalent custom build cost" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe-connect", "resend", "mapbox", "vercel-blob"],
  },
  {
    slug: "ecommerce-app",
    name: "E-commerce Store",
    tagline: "Shopify-lite — products, variants, cart, checkout, orders, customer accounts, admin.",
    description:
      "A complete online store you own. Products with variants, inventory, cart, Stripe checkout, order management, customer accounts, and an admin dashboard. No platform fees, no lock-in.",
    longDescription: `A complete e-commerce platform you own end-to-end. Built for sellers who don't want Shopify's percentage tax or lock-in, and don't need the full WooCommerce kitchen sink.

## What's in the box

- **Products** with variants (size, color, etc.), inventory tracking with low-stock alerts, SKUs, multiple images, variant-level pricing
- **Collections** — manual + auto-collections (rule-based)
- **Cart** with persistent storage, quantity adjustments, abandoned-cart recovery emails
- **Checkout** via Stripe with address collection, tax (Stripe Tax integration), discount codes, gift cards
- **Customer accounts** — order history, saved addresses, wish lists, reorder
- **Order management** — status workflow (paid → fulfilled → delivered), partial refunds, store credit
- **Shipping** — flat rate, weight-based, free-over-X, real-time rates via Shippo
- **Admin dashboard** — products, orders, customers, analytics (revenue, top products, conversion)
- **Marketing** — discount codes, automated abandoned-cart emails, post-purchase upsells
- **Multi-currency display** with auto-detection (charges in store base currency)

## Why this vs rolling your own

E-commerce has a thousand small decisions (do you allow guest checkout? how do you handle taxes? what's your refund flow?). This kit has reasonable defaults for all of them and they compose into a working store.

## Known limits

- Single-store per install (multi-store / multi-tenant is a separate composition)
- No POS / in-person sales`,
    badge: "popular",
    stack: ["Next.js 16", "Better Auth", "Stripe", "Stripe Tax", "Postgres", "Vercel Blob", "Resend"],
    amount: 169900,
    features: [
      { icon: "Layers", title: "Products + variants", desc: "Sizes, colors, SKUs, inventory tracking, low-stock alerts." },
      { icon: "ShoppingCart", title: "Cart + checkout", desc: "Persistent cart, Stripe Checkout, abandoned cart recovery." },
      { icon: "CreditCard", title: "Discounts + gift cards", desc: "Codes, automatic, gift cards with balance tracking." },
      { icon: "Workflow", title: "Order workflow", desc: "Status, fulfillment, partial refunds, store credit." },
      { icon: "Mail", title: "Marketing emails", desc: "Welcome, abandoned cart, post-purchase, win-back." },
      { icon: "LineChart", title: "Analytics", desc: "Revenue, top products, conversion funnel, customer LTV." },
    ],
    integrations: [
      { name: "Stripe", purpose: "Checkout + payments + refunds", required: true },
      { name: "Stripe Tax", purpose: "Sales tax calculation" },
      { name: "Resend", purpose: "Transactional + marketing email", required: true },
      { name: "Shippo", purpose: "Real-time shipping rates" },
    ],
    assets: [
      { label: "Storefront", detail: "Home, product, collection, search, cart, checkout" },
      { label: "Customer account", detail: "Orders, addresses, wishlist, reorder" },
      { label: "Admin", detail: "Products, inventory, orders, customers, analytics" },
      { label: "Marketing", detail: "Discounts, gift cards, abandoned cart flow" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "resend", "vercel-blob", "branding"],
  },
  {
    slug: "project-mgmt-app",
    name: "Project Management App",
    tagline: "Trello/Linear-style boards — projects, tasks, kanban, assignees, comments, real-time.",
    description:
      "A team project management app: boards, lists, cards, drag-drop, assignees, due dates, comments, attachments, real-time sync. Pre-built for SaaS teams.",
    longDescription: `A complete team project management app — the visual kanban + linear-issue-tracker hybrid that most teams end up cobbling together from Notion + Linear + Slack threads.

## What's in the box

- **Workspaces** with org-scoped projects, members, and permissions
- **Kanban boards** — multiple boards per project, customizable columns, swim lanes, WIP limits
- **List view** alongside kanban — same data, different lens
- **Cards** with title, description (markdown), assignees, due dates, labels, sub-tasks, attachments, comments
- **Drag-drop** with optimistic updates and real-time sync across collaborators (SummonFlow)
- **Real-time presence** — see who's looking at the same board / card right now
- **Activity log** per card and per project, plus @mentions with notifications
- **Filters + saved views** — by assignee, label, due date, custom fields
- **GitHub / GitLab integration** — link cards to PRs, auto-close on merge
- **Time tracking** (optional) on cards with reports

## Why this vs rolling your own

Real-time multi-user editing in a kanban without weird UI flicker is much harder than it looks — race conditions, optimistic UI rollback, presence cleanup. This kit has those nailed.

## Known limits

- Not a full project management suite (no Gantt charts, resource leveling, dependencies-deep) — Trello/Linear shape, not MS Project
- Single-org members; cross-org guest collaboration is a v0.2 add-on`,
    stack: ["Next.js 16", "Better Auth", "Stripe", "SummonFlow", "Postgres", "Vercel Blob"],
    amount: 139900,
    features: [
      { icon: "Layers", title: "Boards + lists", desc: "Multiple boards per project, kanban or list view, custom columns." },
      { icon: "Users", title: "Real-time multiplayer", desc: "Presence, cursor positions, optimistic drag-drop with conflict resolution." },
      { icon: "Workflow", title: "Cards with everything", desc: "Description, assignees, due dates, labels, sub-tasks, attachments, comments." },
      { icon: "Plug", title: "GitHub integration", desc: "Link cards to PRs, auto-close on merge, status sync." },
      { icon: "LineChart", title: "Filters + reports", desc: "Saved views, burndown charts, velocity tracking." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Auth + organizations", required: true },
      { name: "SummonFlow", purpose: "Real-time presence + sync", required: true },
      { name: "Stripe", purpose: "Per-seat billing" },
      { name: "GitHub", purpose: "PR linking + status sync" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "summonflow", "github", "branding"],
  },
  {
    slug: "note-taking-app",
    name: "Second Brain Notes App",
    tagline: "Obsidian-style — markdown notes with backlinks, graph view, tags, full-text search.",
    description:
      "A complete personal knowledge management app: markdown editor, backlinks, graph view, tags, full-text search, daily notes, quick capture. Self-host or sell.",
    longDescription: `A complete personal knowledge management app in the Obsidian / Roam mold. For founders building a "second brain" product, or teams who want their own internal Obsidian-like wiki without the Obsidian Sync subscription.

## What's in the box

- **Markdown editor** with live preview, slash menu, code blocks with syntax highlighting, inline math
- **Backlinks** — every \`[[link]]\` is bidirectional, with an "unlinked mentions" view that surfaces implicit references
- **Graph view** — interactive force-directed graph of your notes; click to navigate
- **Tags** with hierarchy (\`#project/work/q1\`) and tag pages that aggregate
- **Full-text search** with fuzzy matching, snippet highlighting, filters
- **Daily notes** with templates and review prompts
- **Quick capture** — global hotkey to drop a note from anywhere
- **Sync + offline** — local-first via IndexedDB, syncs to your Postgres on reconnect
- **Public publishing** — selectively publish notes as a public garden
- **Plugins** — pluggable block extensions and slash commands

## Why this vs rolling your own

The hard part isn't the editor (TipTap or Plate handle that). It's the graph data structures, the bidirectional link maintenance, the search-with-context, and the offline-first sync that keeps two devices consistent. This kit has those.

## Known limits

- Not Obsidian-plugin-compatible (different runtime)
- Markdown-first; rich-text WYSIWYG is a degraded path`,
    stack: ["Next.js 16", "TipTap", "Better Auth", "Postgres", "IndexedDB", "Vercel Blob"],
    amount: 109900,
    features: [
      { icon: "Layers", title: "Markdown + slash menu", desc: "Live preview, code blocks, math, embeds." },
      { icon: "Workflow", title: "Bidirectional backlinks", desc: "Every link is two-way, with unlinked mentions surfacing implicit refs." },
      { icon: "Sparkles", title: "Graph view", desc: "Interactive force-directed graph; navigate by clicking." },
      { icon: "Database", title: "Local-first sync", desc: "IndexedDB on the client, Postgres on the server, conflict-free merge." },
      { icon: "Globe", title: "Public publishing", desc: "Selectively publish notes as a public garden with custom domain." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Personal accounts + sharing", required: true },
      { name: "Vercel Blob", purpose: "Attachment storage" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "vercel-blob", "branding"],
  },
  {
    slug: "ai-image-studio-app",
    name: "AI Image Studio",
    tagline: "Midjourney-style image generation — text-to-image, credits, gallery, multi-provider.",
    description:
      "A complete AI image generation product: prompt composer, credits + Stripe billing, gallery, sharing, multi-provider routing across OpenAI/Replicate/Stability/Black Forest Labs.",
    longDescription: `A complete AI image generation app — the kind of wrapper that monetizes fast because the underlying model providers don't ship a consumer UI. Routes across multiple providers so you're not locked into one's pricing or capabilities.

## What's in the box

- **Prompt composer** with style presets, negative prompts, aspect ratio, seed control
- **Multi-provider routing** — OpenAI (GPT-Image), Replicate, Stability AI, Black Forest Labs (FLUX); per-prompt or per-user model preferences
- **Credits + billing** — Stripe-paid credits packs and subscription tiers, per-model cost tracking
- **Gallery** — your generations + community feed; favorite, share, remix (use as starting prompt)
- **Image-to-image** and **inpainting** for supported providers
- **Variations + upscale** built into the result UI
- **Public profile pages** for users with their best work
- **Admin** — usage analytics, content moderation queue, refund tools

## Why this vs rolling your own

You'd have to wire each provider's API differently, build a credits system that reconciles different per-image costs across models, handle moderation (Stability and OpenAI have different filters), and design a sharing/gallery layer. This is all of that done.

## Known limits

- Provider keys are yours to bring (we don't host them)
- Video generation is a separate product (different cost model)`,
    badge: "new",
    stack: ["Next.js 16", "AI SDK v6", "AI Gateway", "Better Auth", "Stripe", "Postgres", "Vercel Blob"],
    amount: 109900,
    features: [
      { icon: "Wand2", title: "Multi-provider routing", desc: "OpenAI, Replicate, Stability, FLUX — pick per prompt or set defaults." },
      { icon: "Layers", title: "Style presets + negative prompts", desc: "Curated styles, aspect ratios, seed control, history." },
      { icon: "CreditCard", title: "Credits + subscriptions", desc: "Stripe credits packs and recurring tiers with per-model cost math." },
      { icon: "Users", title: "Gallery + remix", desc: "Personal + community gallery, favorite, share, remix prompts." },
      { icon: "Shield", title: "Moderation built in", desc: "Per-provider filters, admin queue for borderline content." },
    ],
    integrations: [
      { name: "Vercel AI Gateway", purpose: "Provider routing + observability", required: true },
      { name: "Stripe", purpose: "Credits + subscriptions", required: true },
      { name: "Better Auth", purpose: "User accounts + share links", required: true },
      { name: "Vercel Blob", purpose: "Generated image storage", required: true },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "ai-gateway", "vercel-blob", "branding"],
  },
  {
    slug: "forum-community-app",
    name: "Forum Community App",
    tagline: "Reddit-shaped — sub-communities, threaded comments, voting, moderation tools.",
    description:
      "A complete forum platform: sub-communities, posts (text/link/image), threaded comments, voting, mod tools, user karma, and a feed across all subs you've joined.",
    longDescription: `A complete Reddit-shaped community platform. Built for niche communities that want their own home — not another Discord server, not a bolt-on Disqus widget.

## What's in the box

- **Sub-communities** ("spaces") — anyone can create, set rules, appoint mods
- **Posts** — text, link, image; with title, body (markdown), tags, flair
- **Threaded comments** with infinite nesting, collapse, real-time replies
- **Voting** with weighted scoring (time decay) for ranking
- **Multi-feed** — your "home" merges all spaces you've joined; "all" shows the whole instance
- **User karma** + post history + achievements (configurable)
- **Moderation tools** — remove, warn, ban, shadowban, content filters, reports queue
- **Notifications** — replies, mentions, mod actions, real-time
- **Search** across posts and comments with sub-community filter
- **Premium memberships** (optional) — gold-status badges, ad-free, exclusive sub-communities

## Why this vs rolling your own

Forum software is full of UX traps: comment threading that gets confusing past 4 levels, ranking algorithms that get gamed, mod tools that take months to build because moderators always ask for one more action. This kit has battle-tested defaults.

## Known limits

- Single-instance (no federation)
- No image-board / 4chan-style anonymous mode`,
    stack: ["Next.js 16", "Better Auth", "Stripe", "SummonFlow", "Postgres", "Vercel Blob"],
    amount: 119900,
    features: [
      { icon: "Users", title: "Sub-communities", desc: "Self-serve creation with rules, mods, custom flair." },
      { icon: "Workflow", title: "Threaded comments", desc: "Infinite nesting with collapse, real-time replies." },
      { icon: "Sparkles", title: "Voting + ranking", desc: "Time-decayed weighted scoring, sortable feeds." },
      { icon: "Shield", title: "Moderation tools", desc: "Remove, warn, ban, shadowban, filters, reports queue." },
      { icon: "CreditCard", title: "Premium tiers", desc: "Optional Stripe-paid memberships with badges + perks." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "User accounts + verified mods", required: true },
      { name: "SummonFlow", purpose: "Real-time comments + notifications" },
      { name: "Stripe", purpose: "Optional premium memberships" },
      { name: "Vercel Blob", purpose: "Image post storage" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "summonflow", "vercel-blob", "branding"],
  },
  {
    slug: "video-call-app",
    name: "Video Meeting App",
    tagline: "Zoom-shaped — rooms, multi-participant, recording, screen share, waiting room.",
    description:
      "A complete video conferencing app built on LiveKit: scheduled and instant rooms, up to 50 participants, screen share, recording, waiting room, breakout rooms, chat.",
    longDescription: `A complete video meeting platform built on LiveKit (the open-source WebRTC infrastructure). For founders building niche video products — telehealth, tutoring, virtual events, internal tools — without paying Zoom-tier licensing.

## What's in the box

- **Scheduled + instant rooms** with shareable join links and per-room PINs
- **Up to 50 participants** per room (LiveKit handles the SFU layer)
- **Screen share** with audio capture
- **Recording** to Vercel Blob with post-call download links emailed
- **Waiting room** with host approval, plus knock-to-join
- **Breakout rooms** with host-controlled assignment
- **Chat** in-meeting (and persisted to the room's history)
- **Calendar integration** — Google + Outlook for scheduled meetings
- **Stripe billing** — per-host monthly tiers with usage caps
- **Admin** — usage analytics, recording management, user limits

## Why this vs rolling your own

LiveKit is solid but it's infrastructure, not a product. You'd build the room scheduling, recording orchestration, calendar integrations, and billing yourself. This kit has all of that.

## Known limits

- Self-hosted LiveKit Cloud is recommended (or run your own SFU on Hetzner)
- Mobile native apps are wrappers around the web client, not native LiveKit SDKs (yet)`,
    stack: ["Next.js 16", "LiveKit", "Better Auth", "Stripe", "Postgres", "Vercel Blob", "Resend"],
    amount: 159900,
    features: [
      { icon: "Users", title: "Multi-participant rooms", desc: "Up to 50 per room via LiveKit SFU; presence + speaker indicators." },
      { icon: "Layers", title: "Recording + transcripts", desc: "Server-side recording to Blob with optional Whisper transcription." },
      { icon: "Workflow", title: "Waiting room + breakouts", desc: "Host approval, knock-to-join, host-managed breakout assignments." },
      { icon: "Plug", title: "Calendar integration", desc: "Google + Outlook scheduling with reminder emails." },
      { icon: "CreditCard", title: "Per-host billing", desc: "Stripe-tiered plans with usage caps + overage." },
    ],
    integrations: [
      { name: "LiveKit", purpose: "WebRTC SFU + recording", required: true },
      { name: "Better Auth", purpose: "Host + participant accounts", required: true },
      { name: "Stripe", purpose: "Host plan billing", required: true },
      { name: "Resend", purpose: "Invitation + reminder emails", required: true },
      { name: "Google Calendar", purpose: "Scheduled meeting invites" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "resend", "livekit", "google-calendar"],
  },
  {
    slug: "helpdesk-app",
    name: "Helpdesk + Support App",
    tagline: "Intercom-shaped — tickets, conversations, knowledge base, AI suggestions, SLAs.",
    description:
      "A complete customer support platform: ticket inbox, conversation threading across channels, knowledge base, AI-suggested replies, SLA tracking, team assignments.",
    longDescription: `A complete customer support platform — the kind of thing teams keep rebuilding because Intercom and Zendesk got expensive. Tickets, conversations, knowledge base, AI suggestions, team workflows.

## What's in the box

- **Multi-channel inbox** — tickets from email, chat widget, web form, and API
- **Conversation threading** — reply via the agent UI or directly from the agent's email; everything lands in the right thread
- **AI-suggested replies** — pulls from your knowledge base + conversation history; agent edits and sends
- **Knowledge base** — public articles with search, version history, AI-powered "suggested article" widget on chat
- **SLA tracking** — first-response and resolution targets per priority; alerts on miss
- **Team assignments + queues** — round-robin, by team, by tag, with workload balancing
- **Macros** — saved replies with variables, scheduled sends
- **Customer portal** — view ticket history, reopen, rate
- **Reporting** — first-response time, resolution time, CSAT, agent leaderboard
- **Slack + Linear integrations** — escalate a ticket to engineering with a click

## Why this vs rolling your own

The hard parts of helpdesk software are the integration glue — making sure replies-via-email don't double-thread, that SLA timers pause correctly when waiting on the customer, that AI suggestions don't hallucinate the wrong product version. This is all of that.

## Known limits

- Voice / phone support is not in baseline (Twilio integration is a wireable add-on)
- Email reply-by-email currently routes through a postmark-style inbound parser`,
    badge: "new",
    stack: ["Next.js 16", "Better Auth", "Stripe", "AI Gateway", "Postgres", "Resend", "Vercel Blob"],
    amount: 149900,
    features: [
      { icon: "Mail", title: "Multi-channel inbox", desc: "Email, chat widget, web form, API — all into one threaded inbox." },
      { icon: "Wand2", title: "AI-suggested replies", desc: "Drafts from your knowledge base + history; agent reviews + sends." },
      { icon: "Layers", title: "Knowledge base", desc: "Public articles with search, AI suggested-article widget on chat." },
      { icon: "Workflow", title: "SLA tracking", desc: "First-response and resolution targets with miss alerts." },
      { icon: "Users", title: "Team workflows", desc: "Queues, round-robin, workload balancing, macros, scheduled sends." },
      { icon: "Plug", title: "Engineering escalation", desc: "Slack + Linear integrations to escalate to dev." },
    ],
    integrations: [
      { name: "Better Auth", purpose: "Agent + customer accounts", required: true },
      { name: "Resend", purpose: "Outbound email", required: true },
      { name: "AI Gateway", purpose: "Reply suggestions" },
      { name: "Stripe", purpose: "Per-seat billing" },
      { name: "Slack", purpose: "Escalation" },
    ],
    setupBundles: ["environment", "postgres", "better-auth", "stripe", "resend", "ai-gateway", "slack"],
  },
];

// Setup bundle blocks (mirrors the seed-setup-steps.ts blocks).
const SETUP_BLOCKS: Record<string, { title: string; description?: string; category?: string; required?: boolean; helpUrl?: string; inputs: Array<{ key: string; label: string; description?: string; inputType?: string; placeholder?: string; helpUrl?: string; required?: boolean; choices?: string[] }> }> = {
  environment: {
    title: "Environment", description: "Core configuration every product needs.", category: "Core", required: true,
    inputs: [{ key: "NEXT_PUBLIC_APP_URL", label: "Public app URL", inputType: "URL", placeholder: "https://yourdomain.com", required: true }],
  },
  postgres: {
    title: "Postgres database", category: "Data", helpUrl: "https://neon.tech/docs/connect/connect-from-any-app", required: true,
    inputs: [
      { key: "DATABASE_URL", label: "Pooled connection string", inputType: "SECRET", placeholder: "postgres://...", required: true },
      { key: "DATABASE_URL_UNPOOLED", label: "Direct connection string", inputType: "SECRET", required: false },
    ],
  },
  "better-auth": {
    title: "Better Auth", category: "Auth", required: true,
    inputs: [
      { key: "BETTER_AUTH_SECRET", label: "Session secret", inputType: "SECRET", required: true },
      { key: "BETTER_AUTH_URL", label: "Auth base URL", inputType: "URL", placeholder: "https://yourdomain.com", required: true },
    ],
  },
  stripe: {
    title: "Stripe", category: "Billing", required: true,
    inputs: [
      { key: "STRIPE_SECRET_KEY", label: "Secret key", inputType: "SECRET", placeholder: "sk_live_...", required: true },
      { key: "STRIPE_WEBHOOK_SECRET", label: "Webhook signing secret", inputType: "SECRET", placeholder: "whsec_...", required: true },
      { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Publishable key", placeholder: "pk_live_...", required: true },
    ],
  },
  "stripe-connect": {
    title: "Stripe Connect", category: "Billing", required: true,
    inputs: [
      { key: "STRIPE_SECRET_KEY", label: "Platform secret key", inputType: "SECRET", required: true },
      { key: "STRIPE_CONNECT_CLIENT_ID", label: "Connect client ID", required: true },
      { key: "STRIPE_WEBHOOK_SECRET", label: "Webhook signing secret", inputType: "SECRET", required: true },
    ],
  },
  resend: {
    title: "Resend", category: "Email", required: true,
    inputs: [
      { key: "RESEND_API_KEY", label: "API key", inputType: "SECRET", placeholder: "re_...", required: true },
      { key: "RESEND_FROM_EMAIL", label: "From address", inputType: "EMAIL", required: true },
    ],
  },
  "ai-gateway": {
    title: "Vercel AI Gateway", category: "AI", required: true,
    inputs: [{ key: "AI_GATEWAY_API_KEY", label: "API key", inputType: "SECRET", required: true }],
  },
  summonflow: {
    title: "SummonFlow", category: "Realtime", required: true,
    inputs: [
      { key: "SUMMONFLOW_APP_ID", label: "App ID", required: true },
      { key: "SUMMONFLOW_API_KEY", label: "Server key", inputType: "SECRET", required: true },
      { key: "NEXT_PUBLIC_SUMMONFLOW_PUBLIC_KEY", label: "Client key", required: true },
    ],
  },
  "vercel-blob": {
    title: "Vercel Blob", category: "Storage", required: true,
    inputs: [{ key: "BLOB_READ_WRITE_TOKEN", label: "Read/write token", inputType: "SECRET", required: true }],
  },
  branding: {
    title: "Branding", category: "Branding", required: false,
    inputs: [
      { key: "BRAND_NAME", label: "Brand name", placeholder: "Your product", required: false },
      { key: "BRAND_PRIMARY_COLOR", label: "Primary color", inputType: "COLOR", required: false },
    ],
  },
  github: {
    title: "GitHub", category: "Integrations", required: true,
    inputs: [{ key: "GITHUB_TOKEN", label: "Personal access token", inputType: "SECRET", placeholder: "ghp_...", required: true }],
  },
  mapbox: {
    title: "Mapbox", category: "Maps", required: true,
    inputs: [
      { key: "NEXT_PUBLIC_MAPBOX_TOKEN", label: "Public token", placeholder: "pk.eyJ...", required: true },
      { key: "MAPBOX_SECRET_TOKEN", label: "Secret token (geocoding)", inputType: "SECRET", required: false },
    ],
  },
  livekit: {
    title: "LiveKit", category: "Video", required: true,
    inputs: [
      { key: "LIVEKIT_API_KEY", label: "API key", inputType: "SECRET", required: true },
      { key: "LIVEKIT_API_SECRET", label: "API secret", inputType: "SECRET", required: true },
      { key: "NEXT_PUBLIC_LIVEKIT_URL", label: "WebSocket URL", inputType: "URL", required: true },
    ],
  },
  "google-calendar": {
    title: "Google Calendar", category: "Integrations", required: false,
    inputs: [
      { key: "GOOGLE_CLIENT_ID", label: "OAuth client ID", inputType: "SECRET", required: false },
      { key: "GOOGLE_CLIENT_SECRET", label: "OAuth client secret", inputType: "SECRET", required: false },
    ],
  },
  slack: {
    title: "Slack", category: "Channels", required: false,
    inputs: [
      { key: "SLACK_BOT_TOKEN", label: "Bot token", inputType: "SECRET", required: false },
      { key: "SLACK_SIGNING_SECRET", label: "Signing secret", inputType: "SECRET", required: false },
    ],
  },
};

const DEFAULT_HOW = [
  { title: "Buy + clone", desc: "Get an invite to a private GitHub repo with the source." },
  { title: "Configure", desc: "Fill the Setup checklist below — env vars, service keys, brand tokens." },
  { title: "Deploy", desc: "Vercel-ready. Push to main, you're live." },
];

const DEFAULT_FAQS = [
  { q: "How do I get the source code?", a: "Right after checkout you get an invite to a private GitHub repo." },
  { q: "Can I use it for client work?", a: "Yes — unlimited use in projects you build (yours or your clients'). Don't redistribute the source." },
  { q: "What does 'lifetime updates' mean?", a: "Every framework upgrade and feature improvement we ship goes to you for free, forever." },
  { q: "Refund policy?", a: "If it doesn't fit your project, email us within 14 days and we'll make it right." },
];

async function main() {
  const storefront = await db.storefront.findUnique({ where: { slug: "summoniq" } });
  if (!storefront) { console.error("storefront 'summoniq' not found"); process.exit(1); }

  for (const app of APPS) {
    let product = await db.product.findFirst({ where: { storefrontId: storefront.id, slug: app.slug } });
    if (product) {
      await db.product.update({
        where: { id: product.id },
        data: {
          name: app.name, tagline: app.tagline, description: app.description, longDescription: app.longDescription,
          category: "apps", badge: app.badge ?? null, stack: app.stack, active: true,
        },
      });
      console.log(`  ↻ updated ${app.slug}`);
    } else {
      product = await db.product.create({
        data: {
          storefrontId: storefront.id, slug: app.slug, name: app.name, tagline: app.tagline,
          description: app.description, longDescription: app.longDescription, category: "apps",
          badge: app.badge ?? null, stack: app.stack, active: true,
          prices: { create: [{ amount: app.amount, currency: "usd", interval: "ONE_TIME", intervalCount: 1, active: true }] },
        },
      });
      console.log(`  + created ${app.slug}`);
    }

    // Wipe + re-seed child content tables.
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
      await db.productFeature.createMany({
        data: app.features.map((f, i) => ({ productId: product.id, icon: f.icon ?? null, title: f.title, desc: f.desc, position: i })),
      });
    }
    if (app.integrations?.length) {
      await db.productIntegration.createMany({
        data: app.integrations.map((it, i) => ({ productId: product.id, name: it.name, purpose: it.purpose, required: it.required ?? false, position: i })),
      });
    }
    if (app.assets?.length) {
      await db.productAsset.createMany({
        data: app.assets.map((a, i) => ({ productId: product.id, label: a.label, detail: a.detail, position: i })),
      });
    }
    const steps = app.howItWorks ?? DEFAULT_HOW;
    await db.productHowStep.createMany({
      data: steps.map((s, i) => ({ productId: product.id, title: s.title, desc: s.desc, position: i })),
    });
    const faqs = app.faqs ?? DEFAULT_FAQS;
    await db.productFaq.createMany({
      data: faqs.map((q, i) => ({ productId: product.id, question: q.q, answer: q.a, position: i })),
    });
    if (app.highlights?.length) {
      await db.productHighlightStat.createMany({
        data: app.highlights.map((h, i) => ({ productId: product.id, value: h.value, label: h.label, position: i })),
      });
    }

    // Setup steps from bundles
    for (let i = 0; i < app.setupBundles.length; i++) {
      const key = app.setupBundles[i];
      const block = SETUP_BLOCKS[key];
      if (!block) { console.log(`    ⨯ unknown setup block "${key}"`); continue; }
      const step = await db.setupStep.create({
        data: {
          productId: product.id, title: block.title, description: block.description ?? null,
          category: block.category ?? null, position: i, required: block.required ?? true, helpUrl: block.helpUrl ?? null,
        },
      });
      if (block.inputs.length) {
        await db.setupInput.createMany({
          data: block.inputs.map((inp, j) => ({
            setupStepId: step.id, key: inp.key, label: inp.label, description: inp.description ?? null,
            inputType: (inp.inputType ?? "TEXT") as any,
            placeholder: inp.placeholder ?? null, helpUrl: inp.helpUrl ?? null,
            required: inp.required ?? true, choices: inp.choices ?? [], position: j,
          })),
        });
      }
    }
  }

  console.log(`\nDone. ${APPS.length} apps seeded with content + setup steps.`);
  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
