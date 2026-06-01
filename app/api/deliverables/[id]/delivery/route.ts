import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const upsertSchema = z.object({
  method: z.enum(["EMAIL_LINK", "GITHUB_INVITE", "DIRECT_DOWNLOAD", "EXTERNAL_LINK"]),
  assetUrl: z.string().url().optional().nullable(),
  ttlMinutes: z.number().int().min(0).max(7 * 24 * 60).optional(),
  maxRedeems: z.number().int().min(0).optional().nullable(),
  repoOwner: z.string().max(80).optional().nullable(),
  repoName: z.string().max(120).optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  emailSubject: z.string().max(200).optional().nullable(),
  emailBody: z.string().max(4000).optional().nullable(),
});

async function loadOwned(id: string) {
  const auth = await ensureOrganizationContext();
  if (!auth) return null;
  return db.deliverable.findFirst({
    where: {
      id,
      product: { storefront: { organizationId: auth.organization.id } },
    },
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const owned = await loadOwned(id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = upsertSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = {
    method: parsed.data.method,
    assetUrl: parsed.data.assetUrl ?? null,
    ttlMinutes: parsed.data.ttlMinutes ?? 1440,
    maxRedeems: parsed.data.maxRedeems ?? null,
    repoOwner: parsed.data.repoOwner ?? null,
    repoName: parsed.data.repoName ?? null,
    externalUrl: parsed.data.externalUrl ?? null,
    emailSubject: parsed.data.emailSubject ?? null,
    emailBody: parsed.data.emailBody ?? null,
  };

  const config = await db.deliveryConfig.upsert({
    where: { deliverableId: id },
    create: { deliverableId: id, ...data },
    update: data,
  });

  return NextResponse.json({ id: config.id });
}
