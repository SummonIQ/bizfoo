import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";

function getPeriodFromSub(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    start: item ? new Date(item.current_period_start * 1000) : new Date(),
    end: item ? new Date(item.current_period_end * 1000) : new Date(),
  };
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const kind = session.metadata?.kind;

      if (kind === "platform_subscription") {
        const userId = session.metadata?.userId;
        const organizationId = session.metadata?.organizationId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        if (!userId || !organizationId || !customerId || !subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const period = getPeriodFromSub(sub);

        await db.subscription.upsert({
          where: { organizationId },
          create: {
            organizationId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            plan: session.metadata?.plan ?? "growth",
            status: sub.status,
            priceId: sub.items.data[0]?.price.id ?? null,
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            plan: session.metadata?.plan ?? "growth",
            status: sub.status,
            priceId: sub.items.data[0]?.price.id ?? null,
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
          },
        });
        break;
      }

      // Tenant storefront order
      if (kind === "storefront_order") {
        const orderId = session.metadata?.orderId;
        if (!orderId) break;
        const updated = await db.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            stripePaymentIntentId: (session.payment_intent as string) ?? null,
            amountTotal: session.amount_total ?? 0,
            email: session.customer_details?.email ?? undefined,
          },
        });
        // Issue delivery grants for every deliverable on every product in the
        // order. Failure is logged but doesn't fail the webhook (Stripe will
        // retry; this also gives manual-fixup escape hatch in the dashboard).
        try {
          const { issueGrantsForOrder } = await import("@/lib/grants");
          await issueGrantsForOrder(updated.id);
        } catch (err) {
          console.error("issueGrantsForOrder failed", err);
        }
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await db.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existing) break;
      const period = getPeriodFromSub(sub);
      await db.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "canceled", plan: "starter" },
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      await db.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: { status: "past_due" },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
