import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const STAGES = [
  "IDEA",
  "SPEC",
  "SCAFFOLDED",
  "IN_DEV",
  "ALPHA",
  "BETA",
  "RELEASED",
] as const;

const upsertSchema = z.object({
  stage: z.enum(STAGES).optional(),
  problem: z.string().max(2000).optional().nullable(),
  audience: z.string().max(2000).optional().nullable(),
  outcome: z.string().max(2000).optional().nullable(),
  scope: z.string().max(4000).optional().nullable(),
  outOfScope: z.string().max(2000).optional().nullable(),
  techNotes: z.string().max(4000).optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
});

async function loadOwnedProduct(productId: string) {
  const auth = await ensureOrganizationContext();
  if (!auth) return null;
  return db.product.findFirst({
    where: { id: productId, storefront: { organizationId: auth.organization.id } },
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product = await loadOwnedProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = upsertSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = {
    stage: parsed.data.stage ?? undefined,
    problem: parsed.data.problem ?? null,
    audience: parsed.data.audience ?? null,
    outcome: parsed.data.outcome ?? null,
    scope: parsed.data.scope ?? null,
    outOfScope: parsed.data.outOfScope ?? null,
    techNotes: parsed.data.techNotes ?? null,
    repoUrl: parsed.data.repoUrl ?? null,
  };

  const plan = await db.buildPlan.upsert({
    where: { productId: id },
    create: { productId: id, ...data, stage: parsed.data.stage ?? "IDEA" },
    update: data,
  });

  return NextResponse.json({ id: plan.id });
}
