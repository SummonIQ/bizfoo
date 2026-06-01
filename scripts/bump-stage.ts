import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });
const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  }),
});

async function main() {
  const slug = process.argv[2];
  const stage = process.argv[3] as any;
  if (!slug || !stage) {
    console.error("usage: bump-stage <slug> <stage>");
    process.exit(1);
  }
  const p = await db.product.findFirst({ where: { slug } });
  if (!p) { console.error("not found"); process.exit(1); }
  await db.buildPlan.upsert({
    where: { productId: p.id },
    update: { stage },
    create: { productId: p.id, stage },
  });
  console.log(`✓ ${slug} → stage=${stage}`);
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
