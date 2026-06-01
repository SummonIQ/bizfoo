// PATCH product basics (name, tagline, description, longDescription, stack,
// category, badge, repoUrl, demoUrl, codeSample fields).

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const schema = z.object({
  name: z.string().min(1).max(160).optional(),
  tagline: z.string().max(400).optional().nullable(),
  description: z.string().max(4000).optional().nullable(),
  longDescription: z.string().max(20000).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  badge: z.string().max(40).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  stack: z.array(z.string()).optional(),
  relatedSlugs: z.array(z.string()).optional(),
  repoUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  codeSampleLang: z.string().max(40).optional().nullable(),
  codeSampleFile: z.string().max(200).optional().nullable(),
  codeSampleCode: z.string().max(20000).optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(
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

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  await db.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
