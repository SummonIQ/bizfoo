import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { corsHeaders, getStorefrontByPublicKey } from "@/lib/api-auth";
import { getProductGuide } from "@/lib/product-guides";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string; productSlug: string }> },
) {
  const { slug, productSlug } = await context.params;
  const headers = corsHeaders();

  const storefront = await getStorefrontByPublicKey(req);
  if (!storefront || storefront.slug !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email query param required" }, { status: 400, headers });
  }

  const product = await db.product.findUnique({
    where: { storefrontId_slug: { storefrontId: storefront.id, slug: productSlug } },
    select: {
      id: true,
      slug: true,
      active: true,
      metadata: true,
    },
  });

  if (!product || !product.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  const purchase = await db.order.findFirst({
    where: {
      storefrontId: storefront.id,
      email,
      status: "PAID",
      items: { some: { productId: product.id } },
    },
    select: { id: true },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  const guide = getProductGuide(product);
  if (!guide) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  const deliverables = await db.deliverable.findMany({
    where: {
      productId: product.id,
      status: "READY",
      access: "BUYERS_ONLY",
      delivery: { method: "DIRECT_DOWNLOAD" },
    },
    orderBy: { position: "asc" },
    include: { delivery: true },
  });

  return NextResponse.json(
    {
      guide,
      downloads: deliverables
        .filter((d) => d.delivery?.assetUrl)
        .map((d) => ({
          slug: d.slug,
          title: d.title,
          url: d.delivery!.assetUrl,
          // Derive a content hint from the slug so the UI can pick the right icon.
          format: d.slug.includes("epub") ? "epub" : d.slug.includes("pdf") ? "pdf" : "file",
        })),
    },
    { headers },
  );
}
