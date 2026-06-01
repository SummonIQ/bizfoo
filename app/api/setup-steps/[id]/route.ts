import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const patchSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(4000).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  required: z.boolean().optional(),
  helpUrl: z.string().url().optional().nullable(),
  position: z.number().int().min(0).optional(),
});

async function loadOwned(id: string) {
  const auth = await ensureOrganizationContext();
  if (!auth) return null;
  return db.setupStep.findFirst({
    where: {
      id,
      product: { storefront: { organizationId: auth.organization.id } },
    },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const owned = await loadOwned(id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  await db.setupStep.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const owned = await loadOwned(id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.setupStep.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
