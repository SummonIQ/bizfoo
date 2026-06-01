import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  tagline: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(40).optional().nullable(),
  badge: z.string().max(40).optional().nullable(),
  stack: z.array(z.string()).default([]),
  priceAmount: z.number().int().min(0),
  priceInterval: z.enum(["ONE_TIME", "MONTH", "YEAR"]).default("ONE_TIME"),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureOrganizationContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const storefront = await db.storefront.findFirst({
    where: { id, organizationId: auth.organization.id },
  });
  if (!storefront) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await db.product.findUnique({
    where: { storefrontId_slug: { storefrontId: id, slug: parsed.data.slug } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Slug already taken in this storefront" },
      { status: 409 },
    );
  }

  const product = await db.product.create({
    data: {
      storefrontId: id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline ?? null,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      badge: parsed.data.badge ?? null,
      stack: parsed.data.stack,
      prices: {
        create: {
          amount: parsed.data.priceAmount * 100,
          currency: storefront.currency,
          interval: parsed.data.priceInterval,
        },
      },
    },
  });

  return NextResponse.json({ id: product.id });
}
