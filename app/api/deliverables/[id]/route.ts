import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  type: z.enum(["REPO", "FILE", "DOC", "VIDEO", "LINK"]).optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "READY", "ARCHIVED"]).optional(),
  access: z.enum(["PUBLIC", "BUYERS_ONLY", "ADMIN_ONLY"]).optional(),
  url: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  versionTag: z.string().max(40).optional().nullable(),
});

async function loadOwned(id: string) {
  const auth = await ensureOrganizationContext();
  if (!auth) return null;
  const deliverable = await db.deliverable.findFirst({
    where: {
      id,
      product: { storefront: { organizationId: auth.organization.id } },
    },
  });
  return deliverable;
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

  await db.deliverable.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const owned = await loadOwned(id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.deliverable.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
