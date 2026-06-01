// Adds the storefront-content tables (ProductFeature/Integration/Asset/
// HowStep/Faq/HighlightStat) plus the new Product columns (longDescription,
// relatedSlugs, codeSample*). Applied directly via pg, same pattern as the
// setup-step schema script.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { Client } from "pg";

loadEnv({ path: ".env.local" });

const sql = `
-- Product additive columns
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "longDescription" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "relatedSlugs"   TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "codeSampleLang" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "codeSampleFile" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "codeSampleCode" TEXT;

-- ProductFeature
CREATE TABLE IF NOT EXISTS "ProductFeature" (
  "id"        TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "icon"      TEXT,
  "title"     TEXT NOT NULL,
  "desc"      TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductFeature_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProductFeature_productId_idx" ON "ProductFeature"("productId");

-- ProductIntegration
CREATE TABLE IF NOT EXISTS "ProductIntegration" (
  "id"        TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "purpose"   TEXT NOT NULL,
  "required"  BOOLEAN NOT NULL DEFAULT FALSE,
  "position"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductIntegration_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProductIntegration_productId_idx" ON "ProductIntegration"("productId");

-- ProductAsset
CREATE TABLE IF NOT EXISTS "ProductAsset" (
  "id"        TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "label"     TEXT NOT NULL,
  "detail"    TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductAsset_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProductAsset_productId_idx" ON "ProductAsset"("productId");

-- ProductHowStep
CREATE TABLE IF NOT EXISTS "ProductHowStep" (
  "id"        TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "desc"      TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductHowStep_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProductHowStep_productId_idx" ON "ProductHowStep"("productId");

-- ProductFaq
CREATE TABLE IF NOT EXISTS "ProductFaq" (
  "id"        TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "question"  TEXT NOT NULL,
  "answer"    TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductFaq_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProductFaq_productId_idx" ON "ProductFaq"("productId");

-- ProductHighlightStat
CREATE TABLE IF NOT EXISTS "ProductHighlightStat" (
  "id"        TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "value"     TEXT NOT NULL,
  "label"     TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductHighlightStat_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ProductHighlightStat_productId_idx" ON "ProductHighlightStat"("productId");
`;

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  console.log("✓ storefront content schema applied");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
