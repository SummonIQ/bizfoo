import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  estimateHours: z.number().int().min(0).optional().nullable(),
  status: z.enum(["TODO", "DOING", "DONE", "BLOCKED"]).optional(),
});

async function loadOwned(id: string) {
  const auth = await ensureOrganizationContext();
  if (!auth) return null;
  return db.milestone.findFirst({
    where: {
      id,
      buildPlan: {
        product: { storefront: { organizationId: auth.organization.id } },
      },
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

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "DONE" && owned.status !== "DONE") {
    data.doneAt = new Date();
  }
  if (parsed.data.status && parsed.data.status !== "DONE") {
    data.doneAt = null;
  }

  await db.milestone.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const owned = await loadOwned(id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.milestone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
