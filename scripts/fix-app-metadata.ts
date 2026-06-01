// Corrects inaccurate stacks/titles/longDescriptions for the 8 full-app
// products, drops "Full App" / "Full Mac App" suffixes from names, and
// re-seeds ProductDependency for the ones whose stacks changed.

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

type Fix = {
  slug: string;
  name: string;
  stack: string[];
  longDescription?: string;
};

const FIXES: Fix[] = [
  {
    slug: "ai-chat-app",
    name: "AI Chat",
    stack: ["Next.js 16", "AI SDK v6", "AI Gateway", "Better Auth", "Stripe", "Postgres", "Vercel Blob"],
  },
  {
    slug: "finance-pwa-app",
    name: "Personal Finance App",
    stack: ["Next.js 16", "React 19", "Prisma 7", "Better Auth", "PWA", "IndexedDB", "Tailwind v4"],
  },
  {
    slug: "job-hunt-agent-app",
    name: "AI Job Hunt",
    stack: ["Next.js 16", "AI SDK v6", "Playwright", "Better Auth", "Stripe", "Prisma", "Resend"],
  },
  {
    slug: "scraping-workspace-app",
    name: "Scraping Workspace",
    stack: ["Next.js 16", "Playwright", "Better Auth", "Stripe", "Prisma", "Vercel Workflow"],
  },

  // ── The desktop apps whose stacks I had wrong ────────────────────────
  {
    slug: "screenshot-organizer-mac-app",
    name: "Screenshot Organizer",
    // maczen: Electron + Next.js web dashboard + a Swift macOS-bridge
    // helper module for OS-level capture / OCR features.
    stack: ["Electron", "Next.js 16", "TypeScript", "Tailwind v4", "Swift (macOS bridge)"],
    longDescription: `A complete Mac-native screenshot + screen recording organizer with adaptive theming. For productivity buyers, Mac power users, or anyone drowning in \`~/Desktop/Screenshot 2026-04-...\`

## What's in the box

- **Native capture** — hotkey-triggered screenshots + recordings with smart file naming based on active app + window title
- **Auto-organize** into project folders based on rules you define (app name, URL keyword, file size)
- **Full-text OCR search** — find that screenshot with "dashboard" text in it even if the filename is generic
- **Adaptive theme** — matches macOS system light/dark mode automatically
- **iCloud + Dropbox + S3 sync** — backup originals, keep a searchable local index
- **Annotations** — crop, arrow, text, blur, redact, with single-keystroke exports
- **Web dashboard** (Next.js) for team sharing with signed URLs, expiration, view tracking
- **Stripe subscription** for cloud sync + dashboard features

## Architecture

- **Desktop app**: Electron shell + React/TypeScript renderer
- **macOS bridge**: a small Swift Package.swift module invoked by Electron for OS-level capture, OCR (Apple Vision framework), and adaptive-theme detection
- **Web dashboard**: Next.js 16 app with Better Auth + Stripe

## Why this vs rolling your own

Screenshot tools feel solved until you hit edge cases — OCR that works on UI (not just documents), multi-monitor capture, adaptive theming, and a sharing layer that's actually secure. This app has those handled.

## Known limits

- Desktop app is Mac-only (Electron binary, but the Swift bridge pins it)
- OCR uses Apple Vision framework (native accuracy, macOS-only)`,
  },
  {
    slug: "meeting-assistant-mac-app",
    name: "AI Meeting Assistant",
    // snoopi: both Electron AND Tauri desktop builds coexist (A/B), plus
    // React Native for potential mobile, whisper.cpp for local transcription,
    // and a Next.js marketing + admin web surface.
    stack: ["Electron", "Tauri", "React", "TypeScript", "whisper.cpp", "Next.js 16", "AI SDK v6"],
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

## Architecture

- **Desktop app**: ships with **both an Electron build and a Tauri build** — pick whichever you want to ship; the shared React/TypeScript renderer works with either shell
- **Transcription**: whisper.cpp compiled as a local binary, invoked from the desktop shell
- **Web marketing + admin**: Next.js 16 + Better Auth + Stripe

## Why this vs rolling your own

The integration of OS-level audio capture + whisper + speaker diarization + calendar API + summary UI is a 3-month project. This ships it, with the flexibility to ship as Electron (familiar tooling) or Tauri (smaller binary).

## Known limits

- macOS only for the desktop app (web-based fallback included)
- whisper.cpp uses local CPU — Apple Silicon handles it smoothly`,
  },
  {
    slug: "services-manager-mac-app",
    name: "macOS Service Manager",
    // mac-rabbit: Python/PyQt desktop app, NOT Swift. Uses native Mac
    // shortcuts / scripts as glue.
    stack: ["Python", "PyQt", "launchd", "PyInstaller"],
    longDescription: `A desktop power-user utility for managing the dozens of background services, launch agents, and daemons that accumulate on any Mac over time. Built in Python/PyQt for a fast-to-iterate codebase that anyone comfortable with Python can extend.

## What's in the box

- **launchd browser** — every active agent / daemon, grouped by system / user / third-party, with full plist inspection
- **One-click toggle** — disable, enable, or permanently remove any service, with a confirm-and-rollback flow
- **Performance view** — live CPU + RAM + network per service, with a 24h trend
- **Privacy audit** — flag services that phone home or run on every boot without your install
- **Startup optimization** — one-click "fast boot" that disables non-essential launchd items on login
- **Snapshot + rollback** — before making changes, snapshot state; restore if something breaks
- **Desktop shortcut installer** and a \`launch_app.command\` for convenient local runs

## Architecture

- **Framework**: PyQt (desktop UI)
- **Bundler**: PyInstaller for signed, distributable .app bundles
- **OS plumbing**: shells out to \`launchctl\` for service operations

## Why this vs rolling your own

Getting launchd right requires knowing the difference between \`LaunchAgents\` / \`LaunchDaemons\` / \`SystemAgents\`, the privileged vs non-privileged operations, and how to restart things without breaking the system. This app has those rules encoded.

## Known limits

- macOS 13+ only
- Some privileged operations require admin password (Apple requirement)
- Python-based; if you want a Swift-native rewrite, the logic translates cleanly`,
  },
  {
    slug: "spaces-manager-mac-app",
    name: "macOS Spaces Manager",
    // winzen: Electron-based (Electrobun variant) + a Swift macOS bridge
    // module for Spaces / window APIs, plus a Next.js marketing site.
    stack: ["Electron", "TypeScript", "Swift (macOS bridge)", "Next.js 16"],
    longDescription: `A desktop power-user utility for organizing and switching between Spaces (macOS virtual desktops). Built as an Electron shell with a Swift bridge for the low-level Spaces / window APIs that Electron can't touch directly.

## What's in the box

- **Named + labeled Spaces** — assign colors and names so "Space 3" becomes "Design" at a glance
- **Keyboard switching** — global hotkeys for jump-to-space, cycle, and named jumps
- **Per-Space layouts** — remember window positions per Space, restore on switch
- **Menu-bar app** with the current Space, quick switcher, and a peek mode
- **App-to-Space pinning** — Slack always on Space 4, regardless of where it opens
- **Marketing website** (Next.js) bundled for rebranding and shipping
- **Auto-update** with code-signed + notarized releases

## Architecture

- **Desktop app**: Electron shell + TypeScript renderer
- **macOS bridge**: Swift module invoked via IPC for Spaces + window-management APIs (Mission Control, private frameworks)
- **Marketing site**: separate Next.js 16 project in the repo

## Why this vs rolling your own

macOS Spaces/Mission Control APIs are underdocumented and partially private. This app has them figured out — window positioning, space labeling, hotkey conflict resolution — with the Swift bridge code that shells out from Electron cleanly.

## Known limits

- macOS 14+ only
- Requires Accessibility permission for window management`,
  },
];

// Reuse the resolver + library from mega-update.
type DepDef = { name: string; purpose?: string; version?: string; category?: string; required?: boolean; homepageUrl?: string };

const DEP_LIBRARY: Record<string, DepDef> = {
  "next.js": { name: "Next.js", purpose: "React framework (App Router)", category: "framework", homepageUrl: "https://nextjs.org" },
  "next.js 16": { name: "Next.js 16", purpose: "React framework (App Router)", category: "framework", homepageUrl: "https://nextjs.org" },
  "react": { name: "React", purpose: "UI library", category: "framework", homepageUrl: "https://react.dev" },
  "react 19": { name: "React 19", purpose: "UI library", category: "framework", homepageUrl: "https://react.dev" },
  "typescript": { name: "TypeScript", purpose: "Type-safe JavaScript", category: "tooling", homepageUrl: "https://www.typescriptlang.org" },
  "prisma": { name: "Prisma", purpose: "Postgres ORM", category: "library", homepageUrl: "https://www.prisma.io" },
  "prisma 7": { name: "Prisma 7", purpose: "Postgres ORM + migrations", category: "library", homepageUrl: "https://www.prisma.io" },
  "postgres": { name: "Postgres", purpose: "Primary database", category: "service", homepageUrl: "https://www.postgresql.org" },
  "better auth": { name: "Better Auth", purpose: "Authentication", category: "library", homepageUrl: "https://www.better-auth.com" },
  "stripe": { name: "Stripe", purpose: "Payments + billing", category: "service", homepageUrl: "https://stripe.com" },
  "resend": { name: "Resend", purpose: "Transactional email", category: "service", homepageUrl: "https://resend.com" },
  "tailwind v4": { name: "Tailwind CSS v4", purpose: "Styling", category: "library", homepageUrl: "https://tailwindcss.com" },
  "ai sdk v6": { name: "AI SDK v6", purpose: "LLM streaming + tools", category: "library", homepageUrl: "https://sdk.vercel.ai" },
  "ai gateway": { name: "Vercel AI Gateway", purpose: "Unified LLM provider endpoint", category: "service", homepageUrl: "https://vercel.com/ai-gateway" },
  "vercel blob": { name: "Vercel Blob", purpose: "Object storage", category: "service", homepageUrl: "https://vercel.com/docs/storage/vercel-blob" },
  "vercel workflow": { name: "Vercel Workflow", purpose: "Durable workflow execution", category: "service", homepageUrl: "https://vercel.com/workflow" },
  "playwright": { name: "Playwright", purpose: "Headless browser automation", category: "library", homepageUrl: "https://playwright.dev" },
  "pwa": { name: "PWA (service worker)", purpose: "Installable + offline web app", category: "runtime" },
  "indexeddb": { name: "IndexedDB", purpose: "Offline client storage", category: "runtime" },
  "electron": { name: "Electron", purpose: "Desktop app runtime", category: "runtime", homepageUrl: "https://www.electronjs.org" },
  "tauri": { name: "Tauri", purpose: "Desktop app runtime (Rust + webview)", category: "runtime", homepageUrl: "https://tauri.app" },
  "python": { name: "Python", purpose: "Application language", category: "runtime", homepageUrl: "https://python.org" },
  "pyqt": { name: "PyQt", purpose: "Desktop UI framework", category: "framework", homepageUrl: "https://www.riverbankcomputing.com/software/pyqt" },
  "pyinstaller": { name: "PyInstaller", purpose: "Packaging Python apps as bundles", category: "tooling", homepageUrl: "https://pyinstaller.org" },
  "launchd": { name: "launchd", purpose: "macOS service management (target OS)", category: "runtime" },
  "swift (macos bridge)": { name: "Swift (macOS bridge)", purpose: "Native module invoked from the desktop shell for OS-level APIs", category: "library", homepageUrl: "https://www.swift.org" },
  "whisper.cpp": { name: "whisper.cpp", purpose: "Local on-device speech-to-text", category: "library", homepageUrl: "https://github.com/ggerganov/whisper.cpp" },
};

function resolveDep(raw: string): DepDef | null {
  const key = raw.trim().toLowerCase();
  if (DEP_LIBRARY[key]) return DEP_LIBRARY[key];
  for (const [k, v] of Object.entries(DEP_LIBRARY)) {
    if (key.startsWith(k) || key.includes(k)) return v;
  }
  return { name: raw, category: "library" };
}

async function main() {
  for (const f of FIXES) {
    const p = await db.product.findFirst({
      where: { slug: f.slug },
      include: { integrations: { orderBy: { position: "asc" } } },
    });
    if (!p) { console.log(`  ⨯ ${f.slug} not found`); continue; }

    await db.product.update({
      where: { id: p.id },
      data: {
        name: f.name,
        stack: f.stack,
        ...(f.longDescription ? { longDescription: f.longDescription } : {}),
      },
    });
    await db.deliverable.updateMany({
      where: { productId: p.id, type: "REPO" },
      data: { title: `${f.name} repo` },
    });

    // Re-seed dependencies from the new stack + existing integrations.
    await db.productDependency.deleteMany({ where: { productId: p.id } });
    const deps: DepDef[] = [];
    const seen = new Set<string>();
    for (const s of f.stack) {
      const d = resolveDep(s);
      if (d && !seen.has(d.name)) { deps.push(d); seen.add(d.name); }
    }
    for (const it of p.integrations) {
      const d = resolveDep(it.name);
      if (d && !seen.has(d.name)) {
        deps.push({ ...d, purpose: it.purpose ?? d.purpose, required: it.required });
        seen.add(d.name);
      } else if (!d && !seen.has(it.name)) {
        deps.push({ name: it.name, purpose: it.purpose, category: "service", required: it.required });
        seen.add(it.name);
      }
    }
    if (deps.length) {
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
    }

    console.log(`  ✓ ${f.slug} → "${f.name}" (${deps.length} deps)`);
  }

  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
