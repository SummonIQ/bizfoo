// Returns all orders + grants for a given email on a given storefront.
// Requires the storefront's public key (buyer-list is considered semi-
// sensitive — anon reads not allowed). Meant for the consuming storefront
// (e.g. summoniq) to render a "My purchases" page for the signed-in user.

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

  const storefront = await getStorefrontByPublicKey(req);
  if (!storefront || storefront.slug !== slug) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers },
    );
  }

  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { error: "email query param required" },
      { status: 400, headers },
    );
  }

  const orders = await db.order.findMany({
    where: { storefrontId: storefront.id, email: email.toLowerCase() },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { slug: true, name: true, tagline: true, category: true },
          },
        },
      },
      grants: {
        include: {
          deliverable: {
            include: {
              product: { select: { slug: true, name: true } },
              delivery: { select: { method: true, externalUrl: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(
    {
      purchases: orders.map((o) => ({
        orderId: o.id,
        status: o.status,
        createdAt: o.createdAt,
        total: o.amountTotal,
        currency: o.currency,
        items: o.items.map((it) => ({
          productSlug: it.product.slug,
          productName: it.product.name,
          tagline: it.product.tagline,
          category: it.product.category,
          quantity: it.quantity,
          amount: it.amount,
        })),
        grants: o.grants.map((g) => ({
          token: g.token,
          status: g.status,
          method: g.deliverable.delivery?.method ?? null,
          productSlug: g.deliverable.product.slug,
          productName: g.deliverable.product.name,
          deliverableTitle: g.deliverable.title,
          deliverableSlug: g.deliverable.slug,
          url:
            g.deliverable.delivery?.method === "EXTERNAL_LINK"
              ? g.deliverable.delivery.externalUrl
              : null,
          expiresAt: g.expiresAt,
          redeemedAt: g.redeemedAt,
        })),
      })),
    },
    { headers },
  );
}
