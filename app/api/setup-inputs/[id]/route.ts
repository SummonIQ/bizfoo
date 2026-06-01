import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const INPUT_TYPES = [
  "TEXT",
  "SECRET",
  "URL",
  "EMAIL",
  "COLOR",
  "BOOLEAN",
  "CHOICE",
  "FILE",
  "INTEGRATION",
] as const;

const patchSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9_.-]+$/)
    .optional(),
  label: z.string().min(1).max(140).optional(),
  description: z.string().max(2000).optional().nullable(),
  inputType: z.enum(INPUT_TYPES).optional(),
  placeholder: z.string().max(200).optional().nullable(),
  helpUrl: z.string().url().optional().nullable(),
  required: z.boolean().optional(),
  validation: z.string().max(500).optional().nullable(),
  choices: z.array(z.string()).optional(),
  position: z.number().int().min(0).optional(),
});

async function loadOwned(id: string) {
  const auth = await ensureOrganizationContext();
  if (!auth) return null;
  return db.setupInput.findFirst({
    where: {
      id,
      setupStep: {
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
  await db.setupInput.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const owned = await loadOwned(id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.setupInput.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
