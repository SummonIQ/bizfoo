// PATCH / DELETE for a single content item. `type` comes via query string.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

type ContentType =
  | "feature"
  | "integration"
  | "asset"
  | "how-step"
  | "faq"
  | "highlight"
  | "dependency";

const TABLES = new Set<ContentType>([
  "feature",
  "integration",
  "asset",
  "how-step",
  "faq",
  "highlight",
  "dependency",
]);

function delegate(type: ContentType) {
  switch (type) {
    case "feature": return db.productFeature;
    case "integration": return db.productIntegration;
    case "asset": return db.productAsset;
    case "how-step": return db.productHowStep;
    case "faq": return db.productFaq;
    case "highlight": return db.productHighlightStat;
    case "dependency": return db.productDependency;
  }
}

async function ensureOwnedProduct(productId: string) {
  const auth = await ensureOrganizationContext();
  if (!auth) return null;
  return db.product.findFirst({
    where: { id: productId, storefront: { organizationId: auth.organization.id } },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id: productId, itemId } = await context.params;
  const type = req.nextUrl.searchParams.get("type") as ContentType | null;
  if (!type || !TABLES.has(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const product = await ensureOwnedProduct(productId);
  if (!product) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json().catch(() => null);
  if (!data || typeof data !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // We accept arbitrary partial updates here — Prisma will reject unknown
  // fields. Schema validation already happened server-side on create.
  const table = delegate(type) as any;
  await table.update({ where: { id: itemId }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id: productId, itemId } = await context.params;
  const type = req.nextUrl.searchParams.get("type") as ContentType | null;
  if (!type || !TABLES.has(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const product = await ensureOwnedProduct(productId);
  if (!product) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const table = delegate(type) as any;
  await table.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
