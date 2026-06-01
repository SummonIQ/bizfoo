/**
 * Adds chapter waypoints to the tech-lead-guide and overemployed-guide
 * products by parsing H2 headings out of each chapter body and picking
 * the first ~4 substantive ones. Idempotent: existing waypoints are
 * preserved as-is.
 *
 * Run with: bun scripts/add-guide-waypoints.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { guideSchema, type ProductGuide } from "@/lib/product-guides";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});
const db = new PrismaClient({ adapter });

const TARGET_SLUGS = ["tech-lead-guide", "overemployed-guide"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isVignette(heading: string): boolean {
  return (
    /^(?:[A-Z][a-z]+,? \d|\d{1,2}:\d{2})/.test(heading) ||
    /^(?:Day \d|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/.test(
      heading,
    )
  );
}

function deriveWaypoints(body: string): Array<{ id: string; label: string }> {
  const h2s: string[] = [];
  for (const line of body.split("\n")) {
    if (line.startsWith("## ")) h2s.push(line.slice(3).trim());
  }
  return h2s
    .filter((h) => !isVignette(h))
    .slice(0, 4)
    .map((label) => ({ id: slugify(label), label }));
}

async function main() {
  let touched = 0;
  for (const slug of TARGET_SLUGS) {
    const products = await db.product.findMany({
      where: { slug },
      select: { id: true, slug: true, metadata: true, storefrontId: true },
    });

    if (products.length === 0) {
      console.log(`[skip] no product with slug=${slug}`);
      continue;
    }

    for (const product of products) {
      const metadata = (product.metadata ?? {}) as Record<string, unknown>;
      const parsed = guideSchema.safeParse(metadata.guide);
      if (!parsed.success) {
        console.log(`[skip] ${slug} (${product.id}) — no valid guide metadata`);
        continue;
      }

      const guide: ProductGuide = parsed.data;
      let changed = false;
      const nextChapters = guide.chapters.map((chapter) => {
        if (chapter.waypoints && chapter.waypoints.length > 0) return chapter;
        const waypoints = deriveWaypoints(chapter.body);
        if (waypoints.length === 0) return chapter;
        changed = true;
        return { ...chapter, waypoints };
      });

      if (!changed) {
        console.log(`[noop] ${slug} (${product.id}) — already has waypoints`);
        continue;
      }

      const nextGuide: ProductGuide = { ...guide, chapters: nextChapters };
      const nextMetadata = { ...metadata, guide: nextGuide };

      await db.product.update({
        where: { id: product.id },
        data: { metadata: nextMetadata },
      });

      touched += 1;
      console.log(
        `[ok]   ${slug} (${product.id}) — added waypoints to ${nextChapters.filter((c) => c.waypoints?.length).length} chapters`,
      );
    }
  }

  console.log(`\nDone. Updated ${touched} product(s).`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
