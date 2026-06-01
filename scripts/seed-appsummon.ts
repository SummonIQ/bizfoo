// Idempotently seeds the AppSummon storefront, bundled apps, à la carte
// product prices, and service configuration metadata used by appsummon.com.
//
// Usage:
//   bun run seed:appsummon
//
// Optional:
//   SEED_SYNC_STRIPE=true bun run seed:appsummon

import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { syncProductToStripe } from "../lib/storefront";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

type SeedApp = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  badge?: string;
  accent: string;
  platforms: string[];
  stack: string[];
  amount: number;
  interval: "MONTH" | "YEAR" | "ONE_TIME";
};

const apps: SeedApp[] = [
  {
    slug: "appsummon-bundle",
    name: "AppSummon Bundle",
    tagline: "One subscription for the full SummonIQ app constellation.",
    description:
      "Access Margin, Maczen, Winzen, Snoopi, and future included apps under one subscription.",
    category: "bundle",
    badge: "Featured",
    accent: "#d8a84e",
    platforms: ["Web", "macOS", "Windows"],
    stack: ["Subscription", "All apps", "Account access"],
    amount: 5900,
    interval: "MONTH",
  },
  {
    slug: "margin",
    name: "Margin",
    tagline: "Write, design, and publish books from one workspace.",
    description:
      "AI drafting, long-form writing, cover design, exports, and publishing workflows for independent authors.",
    category: "creative",
    badge: "Featured",
    accent: "#d8a84e",
    platforms: ["macOS", "Web"],
    stack: ["AI writing", "Book design", "Publishing"],
    amount: 1200,
    interval: "MONTH",
  },
  {
    slug: "maczen",
    name: "Maczen",
    tagline: "A calmer command center for Mac productivity.",
    description:
      "Utilities, automations, and native workflows that help Mac users move through work with less friction.",
    category: "focus",
    badge: "Featured",
    accent: "#7dd3fc",
    platforms: ["macOS"],
    stack: ["Productivity", "Native tools", "Automation"],
    amount: 800,
    interval: "MONTH",
  },
  {
    slug: "winzen",
    name: "Winzen",
    tagline: "Windows productivity tools with less noise.",
    description:
      "A tuned desktop experience for organizing apps, shortcuts, windows, and recurring workflows on Windows.",
    category: "focus",
    badge: "Featured",
    accent: "#60a5fa",
    platforms: ["Windows"],
    stack: ["Windows", "Shortcuts", "Workflow"],
    amount: 800,
    interval: "MONTH",
  },
  {
    slug: "snoopi",
    name: "Snoopi",
    tagline: "Capture, organize, and investigate visual context.",
    description:
      "A research and capture workspace for screenshots, notes, sources, and trails of evidence.",
    category: "ops",
    badge: "Featured",
    accent: "#f472b6",
    platforms: ["Desktop", "Mobile"],
    stack: ["Research", "Capture", "Knowledge"],
    amount: 1000,
    interval: "MONTH",
  },
  {
    slug: "managed-app-setup",
    name: "Managed App Setup",
    tagline: "Concierge setup for teams adopting the AppSummon suite.",
    description:
      "A service package for onboarding, migration, Stripe configuration, analytics setup, and workflow design.",
    category: "service",
    accent: "#a78bfa",
    platforms: ["Service"],
    stack: ["Onboarding", "Migration", "Configuration"],
    amount: 49900,
    interval: "ONE_TIME",
  },
];

async function main() {
  const owner = await db.user.upsert({
    create: {
      email: "admin@appsummon.com",
      emailVerified: true,
      firstName: "AppSummon",
      lastName: "Admin",
      name: "AppSummon Admin",
      updatedAt: new Date(),
    },
    update: {},
    where: { email: "admin@appsummon.com" },
  });

  const organization = await db.organization.upsert({
    create: {
      name: "AppSummon",
      slug: "appsummon",
      members: {
        create: {
          role: "owner",
          userId: owner.id,
        },
      },
    },
    update: { name: "AppSummon" },
    where: { slug: "appsummon" },
  });

  const storefront = await db.storefront.upsert({
    create: {
      active: true,
      cancelUrl: "https://appsummon.com/apps?checkout=cancelled",
      currency: "usd",
      description:
        "The commerce and content source for appsummon.com app, bundle, and service offerings.",
      name: "AppSummon Store",
      organizationId: organization.id,
      slug: "appsummon",
      successUrl: "https://appsummon.com/account?checkout=success&BIZFOO_ORDER_ID",
    },
    update: {
      active: true,
      cancelUrl: "https://appsummon.com/apps?checkout=cancelled",
      description:
        "The commerce and content source for appsummon.com app, bundle, and service offerings.",
      name: "AppSummon Store",
      successUrl: "https://appsummon.com/account?checkout=success&BIZFOO_ORDER_ID",
    },
    where: { slug: "appsummon" },
  });

  for (const app of apps) {
    const product = await db.product.upsert({
      create: {
        active: true,
        badge: app.badge,
        category: app.category,
        description: app.description,
        metadata: {
          accent: app.accent,
          serviceConfig: {
            accent: app.accent,
            entitlementKey: app.slug,
            includedInBundle: app.category !== "service",
            kind: app.category === "bundle" ? "bundle" : app.category === "service" ? "service" : "app",
            platforms: app.platforms,
            serviceLevel: app.category === "service" ? "concierge" : "self_serve",
          },
        },
        name: app.name,
        slug: app.slug,
        stack: app.stack,
        storefrontId: storefront.id,
        tagline: app.tagline,
      },
      update: {
        active: true,
        badge: app.badge,
        category: app.category,
        description: app.description,
        metadata: {
          accent: app.accent,
          serviceConfig: {
            accent: app.accent,
            entitlementKey: app.slug,
            includedInBundle: app.category !== "service",
            kind: app.category === "bundle" ? "bundle" : app.category === "service" ? "service" : "app",
            platforms: app.platforms,
            serviceLevel: app.category === "service" ? "concierge" : "self_serve",
          },
        },
        name: app.name,
        stack: app.stack,
        tagline: app.tagline,
      },
      where: {
        storefrontId_slug: {
          slug: app.slug,
          storefrontId: storefront.id,
        },
      },
    });

    await db.price.upsert({
      create: {
        active: true,
        amount: app.amount,
        currency: "usd",
        id: `${product.id}:${app.interval}`,
        interval: app.interval,
        nickname: app.category === "bundle" ? "All-access subscription" : app.category === "service" ? "Service package" : "À la carte",
        productId: product.id,
      },
      update: {
        active: true,
        amount: app.amount,
        interval: app.interval,
        nickname: app.category === "bundle" ? "All-access subscription" : app.category === "service" ? "Service package" : "À la carte",
      },
      where: {
        id: `${product.id}:${app.interval}`,
      },
    }).catch(async () => {
      const existing = await db.price.findFirst({
        where: { interval: app.interval, productId: product.id },
      });
      if (existing) {
        await db.price.update({
          data: { active: true, amount: app.amount },
          where: { id: existing.id },
        });
      } else {
        await db.price.create({
          data: {
            active: true,
            amount: app.amount,
            currency: "usd",
            interval: app.interval,
            nickname: app.category === "bundle" ? "All-access subscription" : app.category === "service" ? "Service package" : "À la carte",
            productId: product.id,
          },
        });
      }
    });

    if (process.env.SEED_SYNC_STRIPE === "true") {
      await syncProductToStripe(product.id);
    }
  }

  console.log(`Seeded AppSummon storefront: ${storefront.slug}`);
  console.log(`Public key: ${storefront.publicKey}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
