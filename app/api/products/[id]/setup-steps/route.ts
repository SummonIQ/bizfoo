import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const createSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  required: z.boolean().optional(),
  helpUrl: z.string().url().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureOrganizationContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const product = await db.product.findFirst({
    where: { id, storefront: { organizationId: auth.organization.id } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const last = await db.setupStep.findFirst({
    where: { productId: id },
    orderBy: { position: "desc" },
  });

  const created = await db.setupStep.create({
    data: {
      productId: id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      required: parsed.data.required ?? true,
      helpUrl: parsed.data.helpUrl ?? null,
      position: (last?.position ?? -1) + 1,
    },
  });
  return NextResponse.json({ id: created.id });
}
