import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { Client } from "pg";

loadEnv({ path: ".env.local" });

const sql = `
CREATE TABLE IF NOT EXISTS "ProductDependency" (
  "id"          TEXT PRIMARY KEY,
  "productId"   TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "purpose"     TEXT,
  "version"     TEXT,
  "category"    TEXT,
  "required"    BOOLEAN NOT NULL DEFAULT TRUE,
  "homepageUrl" TEXT,
  "position"    INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductDependency_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProductDependency_productId_idx" ON "ProductDependency"("productId");
`;

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  console.log("✓ ProductDependency schema applied");
  await client.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
