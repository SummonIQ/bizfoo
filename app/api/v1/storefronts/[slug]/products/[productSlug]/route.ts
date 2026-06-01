import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { corsHeaders } from "@/lib/api-auth";
import { getProductGuide, toPublicProductGuide } from "@/lib/product-guides";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string; productSlug: string }> },
) {
  const { slug, productSlug } = await context.params;
  const headers = corsHeaders();

  const storefront = await db.storefront.findUnique({ where: { slug } });
  if (!storefront || !storefront.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  const product = await db.product.findUnique({
    where: { storefrontId_slug: { storefrontId: storefront.id, slug: productSlug } },
    include: {
      prices: { where: { active: true } },
      buildPlan: { select: { stage: true } },
      setupSteps: {
        orderBy: { position: "asc" },
        include: { inputs: { orderBy: { position: "asc" } } },
      },
      features: { orderBy: { position: "asc" } },
      integrations: { orderBy: { position: "asc" } },
      assets: { orderBy: { position: "asc" } },
      howItWorks: { orderBy: { position: "asc" } },
      faqs: { orderBy: { position: "asc" } },
      highlights: { orderBy: { position: "asc" } },
      dependencies: { orderBy: { position: "asc" } },
    },
  });

  if (!product || !product.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  const guide = getProductGuide(product);
  const isGuide = Boolean(guide);

  return NextResponse.json(
    {
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        longDescription: product.longDescription,
        category: product.category,
        badge: product.badge,
        imageUrl: product.imageUrl,
        metadata: product.metadata,
        serviceConfig:
          product.metadata && typeof product.metadata === "object" && "serviceConfig" in product.metadata
            ? (product.metadata as { serviceConfig?: unknown }).serviceConfig
            : null,
        stack: product.stack,
        relatedSlugs: product.relatedSlugs,
        demoUrl: product.demoUrl,
        stage: product.buildPlan?.stage ?? "IDEA",
        prices: product.prices,
        codeSample:
          product.codeSampleCode
            ? {
                lang: product.codeSampleLang ?? "typescript",
                filename: product.codeSampleFile ?? undefined,
                code: product.codeSampleCode,
              }
            : null,
        features: product.features.map((f) => ({
          icon: f.icon,
          title: f.title,
          desc: f.desc,
        })),
        integrations: product.integrations.map((i) => ({
          name: i.name,
          purpose: i.purpose,
          required: i.required,
        })),
        assets: product.assets.map((a) => ({ label: a.label, detail: a.detail })),
        howItWorks: product.howItWorks.map((s) => ({ title: s.title, desc: s.desc })),
        faqs: product.faqs.map((q) => ({ q: q.question, a: q.answer })),
        highlights: product.highlights.map((s) => ({ value: s.value, label: s.label })),
        dependencies: isGuide
          ? []
          : product.dependencies.map((d) => ({
              name: d.name,
              purpose: d.purpose,
              version: d.version,
              category: d.category,
              required: d.required,
              homepageUrl: d.homepageUrl,
            })),
        setupSteps: isGuide
          ? []
          : product.setupSteps.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              category: s.category,
              required: s.required,
              helpUrl: s.helpUrl,
              inputs: s.inputs.map((inp) => ({
                id: inp.id,
                key: inp.key,
                label: inp.label,
                description: inp.description,
                inputType: inp.inputType,
                placeholder: inp.placeholder,
                helpUrl: inp.helpUrl,
                required: inp.required,
                choices: inp.choices,
              })),
            })),
        guide: guide ? toPublicProductGuide(guide) : null,
      },
    },
    { headers },
  );
}
