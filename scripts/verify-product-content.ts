// Quick read-only sanity check: prints counts of features, integrations,
// assets, how-steps, faqs, highlights, plus presence of longDescription
// and codeSample for every product in every storefront.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { db } from "../lib/db/client";

loadEnv({ path: ".env.local" });

async function main() {
  const products = await db.product.findMany({
    include: {
      _count: {
        select: {
          features: true,
          integrations: true,
          assets: true,
          howItWorks: true,
          faqs: true,
          highlights: true,
        },
      },
    },
    orderBy: { slug: "asc" },
  });

  for (const p of products) {
    const flags = [
      p.longDescription ? "L" : "·",
      p.codeSampleCode ? "C" : "·",
      p.relatedSlugs.length ? "R" : "·",
    ].join("");
    const counts = `f=${p._count.features} i=${p._count.integrations} a=${p._count.assets} s=${p._count.howItWorks} q=${p._count.faqs} h=${p._count.highlights}`;
    console.log(`${flags}  ${p.slug.padEnd(30)} ${counts}`);
  }

  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
