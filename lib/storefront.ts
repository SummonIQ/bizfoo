import { db } from "@/lib/db/client";
import { getStripe } from "@/lib/stripe";

export async function syncProductToStripe(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { prices: true, storefront: true },
  });
  if (!product) throw new Error("Product not found");

  const stripe = getStripe();

  let stripeProductId = product.stripeProductId;
  if (!stripeProductId) {
    const created = await stripe.products.create({
      name: product.name,
      description: product.description ?? undefined,
      active: product.active,
      metadata: {
        bizfoo_product_id: product.id,
        bizfoo_storefront_id: product.storefrontId,
      },
    });
    stripeProductId = created.id;
    await db.product.update({
      where: { id: product.id },
      data: { stripeProductId },
    });
  } else {
    await stripe.products.update(stripeProductId, {
      name: product.name,
      description: product.description ?? undefined,
      active: product.active,
    });
  }

  for (const price of product.prices) {
    if (price.stripePriceId) continue;
    const stripePrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: price.amount,
      currency: price.currency,
      nickname: price.nickname ?? undefined,
      recurring:
        price.interval === "ONE_TIME"
          ? undefined
          : {
              interval:
                price.interval === "MONTH" ? "month" : "year",
              interval_count: price.intervalCount,
            },
      metadata: { bizfoo_price_id: price.id },
    });
    await db.price.update({
      where: { id: price.id },
      data: { stripePriceId: stripePrice.id },
    });
  }
}

export function generatePublicKey(prefix = "bf_pk") {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function generateSecretKey(prefix = "bf_sk") {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}
