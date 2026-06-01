import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  estimateHours: z.number().int().min(0).optional().nullable(),
  status: z.enum(["TODO", "DOING", "DONE", "BLOCKED"]).optional(),
  parentId: z.string().optional().nullable(),
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
    include: { buildPlan: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const plan =
    product.buildPlan ??
    (await db.buildPlan.create({ data: { productId: id, stage: "IDEA" } }));

  // If parentId given, validate it belongs to this plan and use its scope for
  // position; otherwise position among the top-level milestones.
  let parentId: string | null = null;
  if (parsed.data.parentId) {
    const parent = await db.milestone.findFirst({
      where: { id: parsed.data.parentId, buildPlanId: plan.id },
    });
    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 400 });
    }
    parentId = parent.id;
  }

  const last = await db.milestone.findFirst({
    where: { buildPlanId: plan.id, parentId },
    orderBy: { position: "desc" },
  });

  const created = await db.milestone.create({
    data: {
      buildPlanId: plan.id,
      parentId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      estimateHours: parsed.data.estimateHours ?? null,
      status: parsed.data.status ?? "TODO",
      position: (last?.position ?? -1) + 1,
    },
  });

  return NextResponse.json({ id: created.id });
}
