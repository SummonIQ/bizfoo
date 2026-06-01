import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { corsHeaders, getStorefrontByPublicKey } from "@/lib/api-auth";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const headers = corsHeaders();

  const storefront = await db.storefront.findUnique({ where: { slug } });
  if (!storefront || !storefront.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  // Public reads are allowed without a key, but if a key is sent it must match.
  const auth = req.headers.get("authorization");
  if (auth) {
    const matched = await getStorefrontByPublicKey(req);
    if (!matched || matched.id !== storefront.id) {
      return NextResponse.json(
        { error: "Invalid key for storefront" },
        { status: 401, headers },
      );
    }
  }

  const products = await db.product.findMany({
    where: { storefrontId: storefront.id, active: true },
    include: {
      prices: { where: { active: true } },
      buildPlan: { select: { stage: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    {
      storefront: {
        id: storefront.id,
        slug: storefront.slug,
        name: storefront.name,
        description: storefront.description,
        currency: storefront.currency,
      },
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        category: p.category,
        badge: p.badge,
        imageUrl: p.imageUrl,
        metadata: p.metadata,
        serviceConfig:
          p.metadata && typeof p.metadata === "object" && "serviceConfig" in p.metadata
            ? (p.metadata as { serviceConfig?: unknown }).serviceConfig
            : null,
        stack: p.stack,
        // Build stage (IDEA → RELEASED) — driven by bizfoo's BuildPlan. The
        // consuming storefront can decide whether/how to surface it.
        stage: p.buildPlan?.stage ?? "IDEA",
        prices: p.prices.map((price) => ({
          id: price.id,
          amount: price.amount,
          currency: price.currency,
          interval: price.interval,
          intervalCount: price.intervalCount,
          nickname: price.nickname,
          stripePriceId: price.stripePriceId,
        })),
      })),
    },
    { headers },
  );
}
