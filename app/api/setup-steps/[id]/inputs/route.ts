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

const createSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9_.-]+$/, "letters, numbers, _ . -"),
  label: z.string().min(1).max(140),
  description: z.string().max(2000).optional().nullable(),
  inputType: z.enum(INPUT_TYPES).default("TEXT"),
  placeholder: z.string().max(200).optional().nullable(),
  helpUrl: z.string().url().optional().nullable(),
  required: z.boolean().optional(),
  validation: z.string().max(500).optional().nullable(),
  choices: z.array(z.string()).default([]),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureOrganizationContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const step = await db.setupStep.findFirst({
    where: {
      id,
      product: { storefront: { organizationId: auth.organization.id } },
    },
  });
  if (!step) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const last = await db.setupInput.findFirst({
    where: { setupStepId: id },
    orderBy: { position: "desc" },
  });

  const created = await db.setupInput.create({
    data: {
      setupStepId: id,
      key: parsed.data.key,
      label: parsed.data.label,
      description: parsed.data.description ?? null,
      inputType: parsed.data.inputType,
      placeholder: parsed.data.placeholder ?? null,
      helpUrl: parsed.data.helpUrl ?? null,
      required: parsed.data.required ?? true,
      validation: parsed.data.validation ?? null,
      choices: parsed.data.choices,
      position: (last?.position ?? -1) + 1,
    },
  });
  return NextResponse.json({ id: created.id });
}
