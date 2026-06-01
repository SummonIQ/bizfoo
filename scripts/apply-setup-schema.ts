// Applies the new Milestone.parentId + SetupStep + SetupInput schema bits
// directly via pg, bypassing the Prisma migration engine (which is currently
// failing on Neon TLS handshake from this machine).

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { Client } from "pg";

loadEnv({ path: ".env.local" });

const sql = `
-- Milestone subtasks
ALTER TABLE "Milestone" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
DO $$ BEGIN
  ALTER TABLE "Milestone"
    ADD CONSTRAINT "Milestone_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "Milestone_parentId_idx" ON "Milestone"("parentId");

-- SetupInputType enum
DO $$ BEGIN
  CREATE TYPE "SetupInputType" AS ENUM ('TEXT','SECRET','URL','EMAIL','COLOR','BOOLEAN','CHOICE','FILE','INTEGRATION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SetupStep
CREATE TABLE IF NOT EXISTS "SetupStep" (
  "id"          TEXT PRIMARY KEY,
  "productId"   TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "category"    TEXT,
  "position"    INTEGER NOT NULL DEFAULT 0,
  "required"    BOOLEAN NOT NULL DEFAULT TRUE,
  "helpUrl"     TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SetupStep_productId_fkey" FOREIGN KEY ("productId")
    REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "SetupStep_productId_idx" ON "SetupStep"("productId");

-- SetupInput
CREATE TABLE IF NOT EXISTS "SetupInput" (
  "id"          TEXT PRIMARY KEY,
  "setupStepId" TEXT NOT NULL,
  "key"         TEXT NOT NULL,
  "label"       TEXT NOT NULL,
  "description" TEXT,
  "inputType"   "SetupInputType" NOT NULL DEFAULT 'TEXT',
  "placeholder" TEXT,
  "helpUrl"     TEXT,
  "required"    BOOLEAN NOT NULL DEFAULT TRUE,
  "validation"  TEXT,
  "choices"     TEXT[] NOT NULL DEFAULT '{}',
  "position"    INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SetupInput_setupStepId_fkey" FOREIGN KEY ("setupStepId")
    REFERENCES "SetupStep"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "SetupInput_setupStepId_idx" ON "SetupInput"("setupStepId");
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
  console.log("✓ schema applied");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
