// Adds Product.repoUrl + Product.demoUrl. Applied via pg for consistency
// with the other schema scripts.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { Client } from "pg";

loadEnv({ path: ".env.local" });

const sql = `
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "repoUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "demoUrl" TEXT;
`;

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  console.log("✓ repoUrl/demoUrl columns applied");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
