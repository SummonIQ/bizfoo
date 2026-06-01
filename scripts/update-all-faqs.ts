// Replace every product's FAQ list with the updated default set —
// new delivery-focused answers, real 1-on-1 implementation offer,
// honest "coming soon" only on free things.

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

const FAQ = [
  {
    q: "How do I get access after I buy?",
    a: "Your purchase lands in **Account → My purchases** in the top-right menu. From there you'll get one of: a private GitHub collaborator invite for repo-based products, a signed download link for direct downloads, or a pointer to the external resource. Most products use the GitHub invite — you enter your GitHub username on the access page and accept the invite from your notifications.",
  },
  {
    q: "Can I use it in client work?",
    a: "Yes — your license is unlimited for projects you build (yours or your clients'). Just don't redistribute the source (no reselling, republishing, or forking the repo public).",
  },
  {
    q: "Lifetime updates — how does that work?",
    a: "You keep access to the private repo forever. When we ship improvements (framework upgrades, security patches, new features) you'll see them as commits; pull them in when you're ready. *Coming soon: email notifications when major updates land.*",
  },
  {
    q: "What if I get stuck setting it up?",
    a: "Every product ships with a Setup checklist on the access page covering every env var and service key it needs. If you're still stuck, email [support@summoniq.com](mailto:support@summoniq.com) with your order id. *Coming soon: video walkthroughs and a community Discord.*",
  },
  {
    q: "Is there implementation help available?",
    a: "Yes — we offer paid 1-on-1 implementation sessions for teams who want the product adapted to their stack, branded, or extended with custom features. [Book a call](/contact) and we'll scope it with you.",
  },
  {
    q: "Refund policy?",
    a: "If it doesn't fit your project, email us within 14 days and we'll make it right.",
  },
];

async function main() {
  const products = await db.product.findMany({ where: { active: true }, select: { id: true, slug: true } });
  for (const p of products) {
    await db.productFaq.deleteMany({ where: { productId: p.id } });
    await db.productFaq.createMany({
      data: FAQ.map((q, i) => ({
        productId: p.id,
        question: q.q,
        answer: q.a,
        position: i,
      })),
    });
  }
  console.log(`✓ updated FAQs on ${products.length} products`);
  await db.$disconnect();
}

main().catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
