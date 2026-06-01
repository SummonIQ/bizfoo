// Runs scaffold-product-repo.ts against every product whose carrier is
// nextjs-app-base. Skips native-desktop products + iconography-pack.
// Idempotent: products that already have a repoUrl are skipped.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import { db } from "../lib/db/client";

loadEnv({ path: ".env.local" });

// Products that need a different carrier — skip until we build their bases.
const SKIP = new Set([
  "tauri-desktop-starter",
  "electron-starter",
  "mac-menubar-app",
  "domain-hunter-app",
  "iconography-pack",
]);

async function main() {
  const products = await db.product.findMany({
    select: { slug: true, repoUrl: true, active: true },
    orderBy: { slug: "asc" },
  });

  const todo = products.filter(
    (p) => p.active && !p.repoUrl && !SKIP.has(p.slug),
  );
  console.log(
    `${todo.length} products to scaffold (${products.length} total, ${SKIP.size} skipped by carrier).\n`,
  );

  for (const p of todo) {
    console.log(`━━━ ${p.slug} ━━━`);
    try {
      execSync(`npx tsx scripts/scaffold-product-repo.ts ${p.slug}`, {
        stdio: "inherit",
      });
    } catch (err) {
      console.error(`✗ ${p.slug} failed — continuing`);
    }
    console.log();
  }

  console.log("All done.");
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
