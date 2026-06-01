import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  type: z.enum(["REPO", "FILE", "DOC", "VIDEO", "LINK"]).default("REPO"),
  status: z
    .enum(["DRAFT", "IN_PROGRESS", "READY", "ARCHIVED"])
    .default("DRAFT"),
  access: z
    .enum(["PUBLIC", "BUYERS_ONLY", "ADMIN_ONLY"])
    .default("BUYERS_ONLY"),
  url: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  versionTag: z.string().max(40).optional().nullable(),
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
  const product = await db.product.findFirst({
    where: { id, storefront: { organizationId: auth.organization.id } },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await db.deliverable.findUnique({
    where: { productId_slug: { productId: id, slug: parsed.data.slug } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Slug already used for this product" },
      { status: 409 },
    );
  }

  const last = await db.deliverable.findFirst({
    where: { productId: id },
    orderBy: { position: "desc" },
  });

  const created = await db.deliverable.create({
    data: {
      productId: id,
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: parsed.data.type,
      status: parsed.data.status,
      access: parsed.data.access,
      url: parsed.data.url ?? null,
      notes: parsed.data.notes ?? null,
      versionTag: parsed.data.versionTag ?? null,
      position: (last?.position ?? -1) + 1,
    },
  });

  return NextResponse.json({ id: created.id });
}
