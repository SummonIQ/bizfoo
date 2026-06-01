// Seeds post-purchase SetupStep + SetupInput rows for every product.
// Strategy: each product's existing `integrations` list tells us which
// external services it needs wiring to. We compose common building blocks
// (env, auth, stripe, resend, postgres, github, etc.) based on what's
// required, plus a baseline "Environment" step for all products.
//
// Idempotent: drops existing SetupStep rows for the product and re-inserts.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { db } from "../lib/db/client";

loadEnv({ path: ".env.local" });

type Input = {
  key: string;
  label: string;
  description?: string;
  inputType?:
    | "TEXT"
    | "SECRET"
    | "URL"
    | "EMAIL"
    | "COLOR"
    | "BOOLEAN"
    | "CHOICE"
    | "FILE"
    | "INTEGRATION";
  placeholder?: string;
  helpUrl?: string;
  required?: boolean;
  choices?: string[];
};

type Step = {
  title: string;
  description?: string;
  category?: string;
  helpUrl?: string;
  required?: boolean;
  inputs: Input[];
};

// ─── Reusable step blocks keyed by integration slug ───────────────────

const BLOCKS: Record<string, Step> = {
  environment: {
    title: "Environment",
    description: "Core configuration every product needs.",
    category: "Core",
    required: true,
    inputs: [
      {
        key: "NEXT_PUBLIC_APP_URL",
        label: "Public app URL",
        description: "The URL your deployed app is served from (no trailing slash).",
        inputType: "URL",
        placeholder: "https://yourdomain.com",
        required: true,
      },
    ],
  },
  postgres: {
    title: "Postgres database",
    description: "Connection string for your Postgres database. Neon, Supabase, or any compatible Postgres.",
    category: "Data",
    helpUrl: "https://neon.tech/docs/connect/connect-from-any-app",
    required: true,
    inputs: [
      {
        key: "DATABASE_URL",
        label: "Pooled connection string",
        inputType: "SECRET",
        placeholder: "postgres://user:pass@host/db?sslmode=require",
        required: true,
      },
      {
        key: "DATABASE_URL_UNPOOLED",
        label: "Direct connection string",
        description: "Used for migrations. Only required on some providers (e.g. Neon).",
        inputType: "SECRET",
        placeholder: "postgres://user:pass@host.internal/db?sslmode=require",
        required: false,
      },
    ],
  },
  "better-auth": {
    title: "Better Auth",
    description: "Session signing + email flows for Better Auth.",
    category: "Auth",
    helpUrl: "https://www.better-auth.com/docs/installation",
    required: true,
    inputs: [
      {
        key: "BETTER_AUTH_SECRET",
        label: "Session secret",
        description: "32+ byte random string. Generate with `openssl rand -hex 32`.",
        inputType: "SECRET",
        required: true,
      },
      {
        key: "BETTER_AUTH_URL",
        label: "Auth base URL",
        description: "Should match NEXT_PUBLIC_APP_URL in production.",
        inputType: "URL",
        placeholder: "https://yourdomain.com",
        required: true,
      },
    ],
  },
  stripe: {
    title: "Stripe",
    description: "Billing + checkout.",
    category: "Billing",
    helpUrl: "https://stripe.com/docs/keys",
    required: true,
    inputs: [
      {
        key: "STRIPE_SECRET_KEY",
        label: "Secret key",
        inputType: "SECRET",
        placeholder: "sk_live_...",
        required: true,
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        label: "Webhook signing secret",
        description: "Stripe Dashboard → Developers → Webhooks → endpoint → signing secret.",
        inputType: "SECRET",
        placeholder: "whsec_...",
        required: true,
      },
      {
        key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        label: "Publishable key",
        inputType: "TEXT",
        placeholder: "pk_live_...",
        required: true,
      },
    ],
  },
  "stripe-connect": {
    title: "Stripe Connect",
    description: "Two-sided marketplace payouts.",
    category: "Billing",
    helpUrl: "https://stripe.com/docs/connect",
    required: true,
    inputs: [
      {
        key: "STRIPE_SECRET_KEY",
        label: "Platform secret key",
        inputType: "SECRET",
        placeholder: "sk_live_...",
        required: true,
      },
      {
        key: "STRIPE_CONNECT_CLIENT_ID",
        label: "Connect client ID",
        inputType: "TEXT",
        placeholder: "ca_...",
        required: true,
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        label: "Webhook signing secret",
        inputType: "SECRET",
        placeholder: "whsec_...",
        required: true,
      },
    ],
  },
  resend: {
    title: "Resend",
    description: "Transactional email.",
    category: "Email",
    helpUrl: "https://resend.com/docs",
    required: true,
    inputs: [
      {
        key: "RESEND_API_KEY",
        label: "API key",
        inputType: "SECRET",
        placeholder: "re_...",
        required: true,
      },
      {
        key: "RESEND_FROM_EMAIL",
        label: "From address",
        description: "Must be a verified domain in your Resend account.",
        inputType: "EMAIL",
        placeholder: "Product <noreply@yourdomain.com>",
        required: true,
      },
    ],
  },
  loops: {
    title: "Loops",
    description: "Lifecycle email.",
    category: "Email",
    helpUrl: "https://loops.so/docs/api-reference",
    required: true,
    inputs: [
      {
        key: "LOOPS_API_KEY",
        label: "API key",
        inputType: "SECRET",
        placeholder: "loops_...",
        required: true,
      },
    ],
  },
  "react-email": {
    title: "React Email",
    description: "No config needed — templates build with the rest of the app. This step is a no-op confirmation.",
    category: "Email",
    required: false,
    inputs: [],
  },
  "ai-gateway": {
    title: "Vercel AI Gateway",
    description: "Unified endpoint for every LLM provider.",
    category: "AI",
    helpUrl: "https://vercel.com/docs/ai-gateway",
    required: true,
    inputs: [
      {
        key: "AI_GATEWAY_API_KEY",
        label: "API key",
        inputType: "SECRET",
        placeholder: "ai_gw_...",
        required: true,
      },
    ],
  },
  "ai-sdk": {
    title: "AI SDK provider",
    description: "Direct provider key as a fallback when Gateway isn't used.",
    category: "AI",
    required: false,
    inputs: [
      {
        key: "ANTHROPIC_API_KEY",
        label: "Anthropic API key",
        inputType: "SECRET",
        placeholder: "sk-ant-...",
        required: false,
      },
      {
        key: "OPENAI_API_KEY",
        label: "OpenAI API key",
        inputType: "SECRET",
        placeholder: "sk-...",
        required: false,
      },
    ],
  },
  "chat-sdk": {
    title: "Chat SDK channels",
    description: "Credentials for each channel adapter you want to enable. All optional — wire only what you use.",
    category: "Channels",
    helpUrl: "https://chat-sdk.dev/docs",
    required: false,
    inputs: [
      { key: "SLACK_BOT_TOKEN", label: "Slack bot token", inputType: "SECRET", placeholder: "xoxb-...", required: false },
      { key: "DISCORD_TOKEN", label: "Discord bot token", inputType: "SECRET", required: false },
      { key: "TELEGRAM_BOT_TOKEN", label: "Telegram bot token", inputType: "SECRET", required: false },
    ],
  },
  github: {
    title: "GitHub",
    description: "A personal access token (or GitHub App) for server-side GitHub calls.",
    category: "Integrations",
    helpUrl: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
    required: true,
    inputs: [
      {
        key: "GITHUB_TOKEN",
        label: "Personal access token",
        description: "Needs `repo` scope for private repos.",
        inputType: "SECRET",
        placeholder: "ghp_...",
        required: true,
      },
    ],
  },
  hubspot: {
    title: "HubSpot",
    description: "CRM sync credentials.",
    category: "Integrations",
    helpUrl: "https://developers.hubspot.com/docs/api/private-apps",
    required: true,
    inputs: [
      {
        key: "HUBSPOT_ACCESS_TOKEN",
        label: "Private app access token",
        inputType: "SECRET",
        placeholder: "pat-...",
        required: true,
      },
    ],
  },
  clearbit: {
    title: "Clearbit",
    description: "Firmographic enrichment.",
    category: "Integrations",
    required: false,
    inputs: [
      {
        key: "CLEARBIT_API_KEY",
        label: "API key",
        inputType: "SECRET",
        required: false,
      },
    ],
  },
  typeform: {
    title: "Typeform",
    description: "Form delivery + webhook secrets.",
    category: "Integrations",
    helpUrl: "https://www.typeform.com/developers/webhooks",
    required: true,
    inputs: [
      {
        key: "TYPEFORM_API_TOKEN",
        label: "Personal access token",
        inputType: "SECRET",
        required: true,
      },
      {
        key: "TYPEFORM_WEBHOOK_SECRET",
        label: "Webhook signing secret",
        inputType: "SECRET",
        required: true,
      },
    ],
  },
  slack: {
    title: "Slack",
    description: "Bot + signing secret for routing notifications.",
    category: "Channels",
    required: false,
    inputs: [
      { key: "SLACK_BOT_TOKEN", label: "Bot user OAuth token", inputType: "SECRET", placeholder: "xoxb-...", required: false },
      { key: "SLACK_SIGNING_SECRET", label: "Signing secret", inputType: "SECRET", required: false },
    ],
  },
  twilio: {
    title: "Twilio",
    description: "Voice + SMS credentials.",
    category: "Integrations",
    required: true,
    inputs: [
      { key: "TWILIO_ACCOUNT_SID", label: "Account SID", inputType: "SECRET", required: true },
      { key: "TWILIO_AUTH_TOKEN", label: "Auth token", inputType: "SECRET", required: true },
      { key: "TWILIO_PHONE_NUMBER", label: "Phone number (E.164)", inputType: "TEXT", placeholder: "+14155551234", required: true },
    ],
  },
  "google-calendar": {
    title: "Google Calendar",
    description: "OAuth credentials for calendar sync.",
    category: "Integrations",
    helpUrl: "https://developers.google.com/identity/protocols/oauth2",
    required: false,
    inputs: [
      { key: "GOOGLE_CLIENT_ID", label: "OAuth client ID", inputType: "SECRET", required: false },
      { key: "GOOGLE_CLIENT_SECRET", label: "OAuth client secret", inputType: "SECRET", required: false },
    ],
  },
  "outlook-calendar": {
    title: "Microsoft Outlook Calendar",
    description: "Microsoft Graph credentials for calendar sync.",
    category: "Integrations",
    required: false,
    inputs: [
      { key: "MS_CLIENT_ID", label: "App client ID", inputType: "SECRET", required: false },
      { key: "MS_CLIENT_SECRET", label: "App client secret", inputType: "SECRET", required: false },
      { key: "MS_TENANT_ID", label: "Tenant ID", inputType: "TEXT", required: false },
    ],
  },
  "daily-co": {
    title: "Daily.co",
    description: "Video room hosting.",
    category: "Integrations",
    helpUrl: "https://docs.daily.co/reference",
    required: true,
    inputs: [
      { key: "DAILY_API_KEY", label: "API key", inputType: "SECRET", required: true },
    ],
  },
  mux: {
    title: "Mux",
    description: "Video hosting + adaptive streaming.",
    category: "Integrations",
    helpUrl: "https://docs.mux.com",
    required: true,
    inputs: [
      { key: "MUX_TOKEN_ID", label: "Token ID", inputType: "SECRET", required: true },
      { key: "MUX_TOKEN_SECRET", label: "Token secret", inputType: "SECRET", required: true },
    ],
  },
  posthog: {
    title: "PostHog",
    description: "Product analytics.",
    category: "Analytics",
    helpUrl: "https://posthog.com/docs/getting-started/install",
    required: false,
    inputs: [
      { key: "NEXT_PUBLIC_POSTHOG_KEY", label: "Project API key", inputType: "TEXT", required: false },
      { key: "NEXT_PUBLIC_POSTHOG_HOST", label: "API host", inputType: "URL", placeholder: "https://us.i.posthog.com", required: false },
    ],
  },
  "ga4": {
    title: "Google Analytics 4",
    description: "Marketing analytics measurement ID.",
    category: "Analytics",
    required: false,
    inputs: [
      { key: "NEXT_PUBLIC_GA4_ID", label: "Measurement ID", inputType: "TEXT", placeholder: "G-XXXXXXXXXX", required: false },
    ],
  },
  segment: {
    title: "Segment",
    description: "Analytics pass-through.",
    category: "Analytics",
    required: false,
    inputs: [
      { key: "SEGMENT_WRITE_KEY", label: "Write key", inputType: "SECRET", required: false },
    ],
  },
  signalsplash: {
    title: "SignalSplash",
    description: "Self-hosted SummonIQ analytics.",
    category: "Analytics",
    required: true,
    inputs: [
      { key: "SIGNALSPLASH_API_KEY", label: "Per-app API key", inputType: "SECRET", required: true },
      { key: "SIGNALSPLASH_INGEST_URL", label: "Ingest URL", inputType: "URL", required: true },
    ],
  },
  summonflow: {
    title: "SummonFlow",
    description: "Realtime channels + presence.",
    category: "Realtime",
    required: true,
    inputs: [
      { key: "SUMMONFLOW_APP_ID", label: "App ID", inputType: "TEXT", required: true },
      { key: "SUMMONFLOW_API_KEY", label: "Server key", inputType: "SECRET", required: true },
      { key: "NEXT_PUBLIC_SUMMONFLOW_PUBLIC_KEY", label: "Client key", inputType: "TEXT", required: true },
    ],
  },
  "vercel-workflow": {
    title: "Vercel Workflow",
    description: "Durable workflow execution.",
    category: "Infra",
    required: true,
    inputs: [
      { key: "VERCEL_WORKFLOW_TOKEN", label: "Workflow token", inputType: "SECRET", required: true },
    ],
  },
  "signing-mac": {
    title: "macOS code signing + notarization",
    description: "Certificates and notarization credentials for shipping signed installers.",
    category: "Release",
    helpUrl: "https://developer.apple.com/documentation/xcode/notarizing-macos-software-before-distribution",
    required: true,
    inputs: [
      { key: "APPLE_ID", label: "Apple ID email", inputType: "EMAIL", required: true },
      { key: "APPLE_ID_PASSWORD", label: "App-specific password", inputType: "SECRET", required: true },
      { key: "APPLE_TEAM_ID", label: "Team ID", inputType: "TEXT", required: true },
      { key: "APPLE_DEVELOPER_ID_CERT", label: "Developer ID cert (base64 p12)", inputType: "SECRET", required: true },
    ],
  },
  "signing-windows": {
    title: "Windows code signing",
    description: "Certificate for signing Windows installers.",
    category: "Release",
    required: false,
    inputs: [
      { key: "WINDOWS_CERT_BASE64", label: "Cert (base64 pfx)", inputType: "SECRET", required: false },
      { key: "WINDOWS_CERT_PASSWORD", label: "Cert password", inputType: "SECRET", required: false },
    ],
  },
  sparkle: {
    title: "Sparkle auto-update",
    description: "Feed URL + signing key for Sparkle updates.",
    category: "Release",
    helpUrl: "https://sparkle-project.org",
    required: false,
    inputs: [
      { key: "SPARKLE_FEED_URL", label: "Feed URL", inputType: "URL", required: false },
      { key: "SPARKLE_EDDSA_KEY", label: "EdDSA private key", inputType: "SECRET", required: false },
    ],
  },
  branding: {
    title: "Branding",
    description: "Swap in your brand colors, name, and logo.",
    category: "Branding",
    required: false,
    inputs: [
      { key: "BRAND_NAME", label: "Brand name", inputType: "TEXT", placeholder: "Your product", required: false },
      { key: "BRAND_PRIMARY_COLOR", label: "Primary color", inputType: "COLOR", required: false },
    ],
  },
};

// ─── Per-product step composition ─────────────────────────────────────

type Bundle = string[];
const BUNDLES: Record<string, Bundle> = {
  "admin-dashboard": ["environment", "postgres", "better-auth", "branding"],
  "ai-chat-boilerplate": ["environment", "postgres", "ai-gateway", "ai-sdk", "better-auth"],
  "ai-sales-agent": ["environment", "postgres", "ai-gateway", "twilio", "hubspot"],
  "analytics-wireup": ["environment", "posthog", "ga4", "segment"],
  "auth-billing-boilerplate": ["environment", "postgres", "better-auth", "stripe", "resend"],
  "better-auth-setup": ["environment", "postgres", "better-auth", "resend"],
  "booking-template": ["environment", "postgres", "better-auth", "stripe", "google-calendar", "outlook-calendar", "resend"],
  "chat-agent-platform": ["environment", "postgres", "ai-gateway", "chat-sdk"],
  "codebase-audit-agent": ["environment", "ai-gateway", "github"],
  "dashboard-design-kit": ["environment", "branding"],
  "data-table-kit": ["environment"],
  "domain-hunter-app": ["environment", "signing-mac", "signing-windows"],
  "elderly-care-coordinator": ["environment", "postgres", "better-auth", "resend"],
  "electron-starter": ["environment", "signing-mac", "signing-windows"],
  "email-template-set": ["environment", "resend", "react-email", "branding"],
  "hubspot-pipeline-sync": ["environment", "postgres", "hubspot"],
  "iconography-pack": ["environment", "branding"],
  "indie-launch-playbook": ["environment"],
  "job-board-template": ["environment", "postgres", "better-auth", "stripe", "resend"],
  "job-search-agent": ["environment", "postgres", "ai-gateway"],
  "landing-blocks-pack": ["environment", "branding"],
  "landing-page-kit": ["environment", "branding"],
  "lead-enrichment-agent": ["environment", "postgres", "ai-gateway", "hubspot", "clearbit"],
  "loops-email-automation": ["environment", "postgres", "loops"],
  "mac-menubar-app": ["environment", "signing-mac", "sparkle"],
  "marketing-site-pro": ["environment", "postgres", "hubspot", "resend", "branding"],
  "mentorship-platform": ["environment", "postgres", "better-auth", "stripe-connect", "daily-co", "resend"],
  "motion-primitives": ["environment"],
  "multi-tenant-b2b": ["environment", "postgres", "better-auth", "stripe", "resend"],
  "nextjs-saas-starter": ["environment", "postgres", "better-auth", "stripe", "resend", "posthog"],
  "personal-finance-pwa": ["environment", "postgres", "better-auth"],
  "pricing-playbook": ["environment"],
  "publishing-platform": ["environment", "postgres", "better-auth", "stripe", "resend"],
  "realtime-collab-boilerplate": ["environment", "postgres", "summonflow", "better-auth"],
  "resend-email-kit": ["environment", "resend", "react-email", "branding"],
  "seo-playbook": ["environment"],
  "signalsplash-kit": ["environment", "postgres", "signalsplash"],
  "stripe-billing-module": ["environment", "postgres", "stripe"],
  "summonflow-realtime": ["environment", "summonflow"],
  "summoniq-ui-kit": ["environment", "branding"],
  "tauri-desktop-starter": ["environment", "signing-mac", "signing-windows"],
  "typeform-intake-flow": ["environment", "typeform", "hubspot", "slack"],
  "workflow-engine": ["environment", "postgres", "vercel-workflow"],
  "workshop-course-platform": ["environment", "postgres", "better-auth", "stripe", "mux", "resend"],
};

async function main() {
  const products = await db.product.findMany({
    select: { id: true, slug: true },
    where: { active: true },
  });

  let totalSteps = 0;
  let totalInputs = 0;

  for (const product of products) {
    const bundle = BUNDLES[product.slug];
    if (!bundle) {
      console.log(`  ⨯ ${product.slug} (no bundle defined, skipping)`);
      continue;
    }

    // Wipe existing.
    await db.setupStep.deleteMany({ where: { productId: product.id } });

    for (let i = 0; i < bundle.length; i++) {
      const key = bundle[i];
      const block = BLOCKS[key];
      if (!block) {
        console.log(`  ⨯ ${product.slug}: unknown block "${key}"`);
        continue;
      }
      const step = await db.setupStep.create({
        data: {
          productId: product.id,
          title: block.title,
          description: block.description ?? null,
          category: block.category ?? null,
          position: i,
          required: block.required ?? true,
          helpUrl: block.helpUrl ?? null,
        },
      });
      totalSteps++;
      if (block.inputs.length) {
        await db.setupInput.createMany({
          data: block.inputs.map((inp, j) => ({
            setupStepId: step.id,
            key: inp.key,
            label: inp.label,
            description: inp.description ?? null,
            inputType: inp.inputType ?? "TEXT",
            placeholder: inp.placeholder ?? null,
            helpUrl: inp.helpUrl ?? null,
            required: inp.required ?? true,
            choices: inp.choices ?? [],
            position: j,
          })),
        });
        totalInputs += block.inputs.length;
      }
    }

    console.log(`  ✓ ${product.slug}`);
  }

  console.log(`\nDone. ${totalSteps} steps, ${totalInputs} inputs across ${products.length} products.`);
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
