import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { syncGuideProductArtifacts } from "@/lib/guide-documents";
import { ensureOrganizationContext } from "@/lib/organization";
import { guideSchema } from "@/lib/product-guides";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureOrganizationContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const product = await db.product.findFirst({
    where: { id, storefront: { organizationId: auth.organization.id } },
    select: { id: true, metadata: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = guideSchema.safeParse(
    (await req.json().catch(() => null))?.guide,
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid guide", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const currentMetadata =
    product.metadata && typeof product.metadata === "object" && !Array.isArray(product.metadata)
      ? product.metadata
      : {};

  await db.product.update({
    where: { id },
    data: {
      metadata: {
        ...currentMetadata,
        guide: parsed.data,
      },
    },
  });

  await syncGuideProductArtifacts({
    productId: id,
    guide: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
