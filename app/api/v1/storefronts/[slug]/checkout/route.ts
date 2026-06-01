import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { getStripe } from "@/lib/stripe";
import { corsHeaders, getStorefrontByPublicKey } from "@/lib/api-auth";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        priceId: z.string(),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .min(1),
  email: z.string().email().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const headers = corsHeaders();

  const storefront = await db.storefront.findUnique({ where: { slug } });
  if (!storefront || !storefront.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  // Public key required for checkout creation.
  const matched = await getStorefrontByPublicKey(req);
  if (!matched || matched.id !== storefront.id) {
    return NextResponse.json(
      { error: "Invalid public key" },
      { status: 401, headers },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400, headers },
    );
  }

  const prices = await db.price.findMany({
    where: {
      id: { in: parsed.data.items.map((i) => i.priceId) },
      product: { storefrontId: storefront.id, active: true },
      active: true,
    },
    include: { product: true },
  });

  if (prices.length !== parsed.data.items.length) {
    return NextResponse.json(
      { error: "One or more prices not found" },
      { status: 400, headers },
    );
  }

  const missingStripe = prices.find((p) => !p.stripePriceId);
  if (missingStripe) {
    return NextResponse.json(
      { error: `Price ${missingStripe.id} is not synced to Stripe yet` },
      { status: 400, headers },
    );
  }

  const stripe = getStripe();
  const successUrl =
    parsed.data.successUrl ?? storefront.successUrl ?? `${req.nextUrl.origin}/checkout/success`;
  const cancelUrl =
    parsed.data.cancelUrl ?? storefront.cancelUrl ?? `${req.nextUrl.origin}/checkout/cancel`;

  const allOneTime = prices.every((p) => p.interval === "ONE_TIME");
  const mode: "payment" | "subscription" = allOneTime ? "payment" : "subscription";

  const order = await db.order.create({
    data: {
      storefrontId: storefront.id,
      email: parsed.data.email ?? "",
      status: "PENDING",
      currency: storefront.currency,
      items: {
        create: parsed.data.items.map((item, idx) => {
          const price = prices.find((p) => p.id === item.priceId)!;
          return {
            productId: price.productId,
            priceId: price.id,
            quantity: item.quantity,
            amount: price.amount * item.quantity,
          };
        }),
      },
    },
  });

  // Let storefronts template the order id into their success URL with
  // either {ORDER_ID} or BIZFOO_ORDER_ID. Stripe also supports
  // {CHECKOUT_SESSION_ID} natively which we leave intact.
  const resolvedSuccessUrl = successUrl
    .replace("{ORDER_ID}", order.id)
    .replace("BIZFOO_ORDER_ID", order.id);

  const session = await stripe.checkout.sessions.create({
    mode,
    customer_email: parsed.data.email,
    metadata: {
      kind: "storefront_order",
      storefrontId: storefront.id,
      orderId: order.id,
    },
    line_items: parsed.data.items.map((item) => {
      const price = prices.find((p) => p.id === item.priceId)!;
      return { price: price.stripePriceId!, quantity: item.quantity };
    }),
    success_url: resolvedSuccessUrl,
    cancel_url: cancelUrl,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return NextResponse.json(
    { url: session.url, sessionId: session.id, orderId: order.id },
    { headers },
  );
}
