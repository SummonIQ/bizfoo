import Stripe from "stripe";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  });
}

// bizfoo's own SaaS plans (the platform billing).
export const PLATFORM_PLANS = {
  STARTER: {
    id: "starter",
    name: "Starter",
    price: 0,
    description: "1 storefront, 25 products, bizfoo branding, community support.",
    features: [
      "1 storefront",
      "Up to 25 products",
      "Stripe Checkout",
      "Public catalog API",
      "Standard analytics",
    ],
  },
  GROWTH: {
    id: "growth",
    name: "Growth",
    price: 39,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    description: "Up to 5 storefronts, unlimited products, custom domains.",
    features: [
      "5 storefronts",
      "Unlimited products",
      "Custom domains",
      "Coupon codes & discounts",
      "Webhooks & API access",
      "Email + analytics integrations",
    ],
  },
  SCALE: {
    id: "scale",
    name: "Scale",
    price: 149,
    priceId: process.env.STRIPE_SCALE_PRICE_ID,
    description: "Unlimited storefronts, team seats, priority support.",
    features: [
      "Unlimited storefronts",
      "Team seats & roles",
      "Advanced analytics & cohorts",
      "Audit log",
      "Priority support",
      "SSO (on request)",
    ],
  },
} as const;
