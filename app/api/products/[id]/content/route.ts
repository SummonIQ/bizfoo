// Unified content-list create endpoint. Handles all product content types
// (feature / integration / asset / how-step / faq / highlight / dependency)
// via a `type` discriminator so the dashboard editor can use one fetch().

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";

const BASE = z.object({
  type: z.enum([
    "feature",
    "integration",
    "asset",
    "how-step",
    "faq",
    "highlight",
    "dependency",
  ]),
});

// Per-type field schemas. Kept permissive (nullable strings) because the
// editor sends empty strings for unset optional fields.
const SCHEMAS = {
  feature: z.object({
    icon: z.string().max(40).optional().nullable(),
    title: z.string().min(1).max(160),
    desc: z.string().min(1).max(600),
  }),
  integration: z.object({
    name: z.string().min(1).max(80),
    purpose: z.string().min(1).max(400),
    required: z.boolean().optional(),
  }),
  asset: z.object({
    label: z.string().min(1).max(120),
    detail: z.string().min(1).max(400),
  }),
  "how-step": z.object({
    title: z.string().min(1).max(120),
    desc: z.string().min(1).max(400),
  }),
  faq: z.object({
    question: z.string().min(1).max(400),
    answer: z.string().min(1).max(4000),
  }),
  highlight: z.object({
    value: z.string().min(1).max(80),
    label: z.string().min(1).max(160),
  }),
  dependency: z.object({
    name: z.string().min(1).max(80),
    purpose: z.string().max(400).optional().nullable(),
    version: z.string().max(60).optional().nullable(),
    category: z.enum(["framework", "runtime", "library", "service", "tooling", "other"]).optional().nullable(),
    required: z.boolean().optional(),
    homepageUrl: z.string().url().optional().nullable(),
  }),
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureOrganizationContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: productId } = await context.params;
  const product = await db.product.findFirst({
    where: { id: productId, storefront: { organizationId: auth.organization.id } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const baseParse = BASE.safeParse(body);
  if (!baseParse.success) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const { type } = baseParse.data;
  const schema = SCHEMAS[type];
  const dataParse = schema.safeParse(body.data);
  if (!dataParse.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: dataParse.error.issues },
      { status: 400 },
    );
  }
  const data = dataParse.data as any;

  // Resolve the next position by counting existing rows of the same type.
  let position = 0;
  let created: unknown;
  switch (type) {
    case "feature": {
      const last = await db.productFeature.findFirst({ where: { productId }, orderBy: { position: "desc" } });
      position = (last?.position ?? -1) + 1;
      created = await db.productFeature.create({
        data: { productId, icon: data.icon ?? null, title: data.title, desc: data.desc, position },
      });
      break;
    }
    case "integration": {
      const last = await db.productIntegration.findFirst({ where: { productId }, orderBy: { position: "desc" } });
      position = (last?.position ?? -1) + 1;
      created = await db.productIntegration.create({
        data: { productId, name: data.name, purpose: data.purpose, required: data.required ?? false, position },
      });
      break;
    }
    case "asset": {
      const last = await db.productAsset.findFirst({ where: { productId }, orderBy: { position: "desc" } });
      position = (last?.position ?? -1) + 1;
      created = await db.productAsset.create({
        data: { productId, label: data.label, detail: data.detail, position },
      });
      break;
    }
    case "how-step": {
      const last = await db.productHowStep.findFirst({ where: { productId }, orderBy: { position: "desc" } });
      position = (last?.position ?? -1) + 1;
      created = await db.productHowStep.create({
        data: { productId, title: data.title, desc: data.desc, position },
      });
      break;
    }
    case "faq": {
      const last = await db.productFaq.findFirst({ where: { productId }, orderBy: { position: "desc" } });
      position = (last?.position ?? -1) + 1;
      created = await db.productFaq.create({
        data: { productId, question: data.question, answer: data.answer, position },
      });
      break;
    }
    case "highlight": {
      const last = await db.productHighlightStat.findFirst({ where: { productId }, orderBy: { position: "desc" } });
      position = (last?.position ?? -1) + 1;
      created = await db.productHighlightStat.create({
        data: { productId, value: data.value, label: data.label, position },
      });
      break;
    }
    case "dependency": {
      const last = await db.productDependency.findFirst({ where: { productId }, orderBy: { position: "desc" } });
      position = (last?.position ?? -1) + 1;
      created = await db.productDependency.create({
        data: {
          productId,
          name: data.name,
          purpose: data.purpose ?? null,
          version: data.version ?? null,
          category: data.category ?? null,
          required: data.required ?? true,
          homepageUrl: data.homepageUrl ?? null,
          position,
        },
      });
      break;
    }
  }

  return NextResponse.json({ item: created });
}
