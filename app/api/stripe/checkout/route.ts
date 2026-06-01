import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLATFORM_PLANS } from "@/lib/stripe";
import { ensureOrganizationContext } from "@/lib/organization";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const context = await ensureOrganizationContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  const planConfig =
    plan === "growth"
      ? PLATFORM_PLANS.GROWTH
      : plan === "scale"
        ? PLATFORM_PLANS.SCALE
        : null;

  if (!planConfig || !("priceId" in planConfig) || !planConfig.priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: context.user.email,
    metadata: {
      kind: "platform_subscription",
      plan: planConfig.id,
      userId: context.user.id,
      organizationId: context.organization.id,
    },
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${req.nextUrl.origin}/dashboard/billing?success=true`,
    cancel_url: `${req.nextUrl.origin}/dashboard/billing?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
