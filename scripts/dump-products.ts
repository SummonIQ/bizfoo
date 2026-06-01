// One-shot read: dump product slug, name, tagline, description, category,
// stack as JSON so we can author content for every product in one pass.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { db } from "../lib/db/client";

loadEnv({ path: ".env.local" });

async function main() {
  const products = await db.product.findMany({
    select: {
      slug: true,
      name: true,
      tagline: true,
      description: true,
      category: true,
      stack: true,
    },
    orderBy: { slug: "asc" },
  });
  console.log(JSON.stringify(products, null, 2));
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
