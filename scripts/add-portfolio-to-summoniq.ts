// Adds the "Modern Portfolio" product to the SummonIQ storefront.
// Idempotent — running it twice updates the existing row.
//
// Usage: bun run scripts/add-portfolio-to-summoniq.ts

import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

const SUMMONIQ_STOREFRONT_SLUG = "summoniq";
const PRODUCT_SLUG = "modern-portfolio-app";

async function main() {
  const storefront = await db.storefront.findUnique({
    where: { slug: SUMMONIQ_STOREFRONT_SLUG },
  });
  if (!storefront) throw new Error("SummonIQ storefront not found");

  const data = {
    name: "Modern Portfolio",
    tagline: "A polished, brandable portfolio site with a built-in admin panel.",
    description:
      "A modern, professional portfolio website with a no-code admin panel. Add, edit, and remove projects without touching code.",
    longDescription: `## What you get

A complete personal-portfolio kit:

- **Public site** — animated 3D-feel hero, About, Skills, filterable Projects, Project detail, Contact form.
- **Admin panel** at \`/admin\` with secure login, rich-text editor (PlateJS), image uploads, and full CRUD for projects, skills, social links, and site copy.
- **Light & dark mode**, fully responsive.
- **SEO-ready** — sitemap, robots, OpenGraph metadata.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · Better Auth · PlateJS · Postgres (Neon).

## Setup

A one-command \`bash setup.sh\` walks non-developers through everything: tooling check, database URL, admin credentials, install, schema push, and seed. Then \`bash deploy.sh\` handles GitHub + Vercel under your own accounts.`,
    category: "Apps",
    badge: "new",
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "Prisma",
      "Postgres",
      "Better Auth",
      "PlateJS",
    ],
    demoUrl: "https://portfolio.summoniq.com",
    repoUrl: null,
    active: true,
  } as const;

  const existing = await db.product.findUnique({
    where: {
      storefrontId_slug: {
        storefrontId: storefront.id,
        slug: PRODUCT_SLUG,
      },
    },
  });

  let productId: string;
  if (existing) {
    await db.product.update({ where: { id: existing.id }, data });
    productId = existing.id;
    console.log(`▸ Updated existing product (${existing.id})`);
  } else {
    const created = await db.product.create({
      data: {
        ...data,
        slug: PRODUCT_SLUG,
        storefrontId: storefront.id,
      },
    });
    productId = created.id;
    console.log(`▸ Created product (${created.id})`);
  }

  // Price (one-time $0 — store isn't released yet, just make it visible)
  const existingPrice = await db.price.findFirst({ where: { productId } });
  if (!existingPrice) {
    await db.price.create({
      data: {
        productId,
        amount: 0,
        currency: storefront.currency,
        interval: "ONE_TIME",
      },
    });
    console.log("  ✓ Created $0 price");
  } else {
    console.log("  • Price exists — left as-is");
  }

  // BuildPlan — keep at IDEA so it's NOT sale-ready by default (won't show
  // on a live summoniq.com store). LOCAL_STAGE_OVERRIDES in summoniq's
  // store client makes it visible locally.
  const existingPlan = await db.buildPlan.findUnique({
    where: { productId },
  });
  if (!existingPlan) {
    await db.buildPlan.create({
      data: {
        productId,
        stage: "IDEA",
        problem: "Anyone wanting a polished, easy-to-edit personal portfolio.",
        audience: "Designers, developers, freelancers.",
        outcome:
          "Live portfolio site with a CMS-style admin in under 10 minutes.",
        scope:
          "Public site + admin panel + setup wizard + Vercel deploy helper.",
      },
    });
    console.log("  ✓ Created BuildPlan (stage = IDEA)");
  } else {
    console.log(`  • BuildPlan exists (stage = ${existingPlan.stage})`);
  }

  console.log(`\n✓ "Modern Portfolio" is in storefront "${storefront.slug}".`);
  console.log(
    `  Slug: ${PRODUCT_SLUG} — visible locally on summoniq via LOCAL_STAGE_OVERRIDE.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
