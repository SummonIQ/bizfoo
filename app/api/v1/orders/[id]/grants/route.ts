import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { corsHeaders, getStorefrontByPublicKey } from "@/lib/api-auth";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const headers = corsHeaders();

  // Public-key auth — must match the storefront the order belongs to.
  const storefront = await getStorefrontByPublicKey(req);
  if (!storefront) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const order = await db.order.findFirst({
    where: { id, storefrontId: storefront.id },
    include: {
      grants: {
        include: {
          deliverable: {
            include: {
              product: { select: { name: true, slug: true } },
              delivery: true,
            },
          },
        },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  return NextResponse.json(
    {
      orderId: order.id,
      email: order.email,
      status: order.status,
      grants: order.grants.map((g) => ({
        token: g.token,
        status: g.status,
        method: g.deliverable.delivery?.method ?? "EXTERNAL_LINK",
        product: g.deliverable.product,
        deliverable: { title: g.deliverable.title, type: g.deliverable.type },
        expiresAt: g.expiresAt?.toISOString() ?? null,
      })),
    },
    { headers },
  );
}
