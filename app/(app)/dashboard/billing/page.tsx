"use client";

import { useState } from "react";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";
import { Check } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackAndFlush } from "@/lib/analytics/client";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    desc: "Get a storefront live for free.",
    features: [
      "1 storefront",
      "Up to 25 products",
      "Stripe Checkout",
      "Public catalog API",
      "Standard analytics",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 39,
    highlight: true,
    desc: "For teams selling consistently.",
    features: [
      "5 storefronts",
      "Unlimited products",
      "Custom domains",
      "Coupon codes & discounts",
      "Webhooks & API access",
      "Email + analytics integrations",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: 149,
    desc: "Multi-brand and multi-team.",
    features: [
      "Unlimited storefronts",
      "Team seats & roles",
      "Advanced analytics & cohorts",
      "Audit log",
      "Priority support",
      "SSO (on request)",
    ],
  },
];

export default function BillingPage() {
  const { track } = useAnalytics();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  async function startCheckout(plan: string) {
    setBusyPlan(plan);
    track("billing_checkout_started", { plan });
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setBusyPlan(null);
    if (!res.ok) {
      track("billing_checkout_failed", {
        plan,
        status: res.status,
        reason: "api_error",
      });
      return;
    }
    const { url } = await res.json();
    if (url) {
      await trackAndFlush(track, "billing_checkout_redirected", { plan });
      window.location.href = url;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the plan that matches your scale. Change or cancel anytime.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={tier.highlight ? "border-brand-400/50 ring-2 ring-brand-400/30" : ""}
          >
            <CardHeader className="flex-col items-start gap-2">
              <div className="flex w-full items-center justify-between">
                <CardTitle>{tier.name}</CardTitle>
                {tier.highlight ? <Badge tone="brand">Most popular</Badge> : null}
              </div>
              <div className="text-sm text-muted-foreground">{tier.desc}</div>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div>
                <span className="text-3xl font-semibold text-foreground">
                  ${tier.price}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">/ month</span>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-foreground/80">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-brand-600 dark:text-brand-300" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                disabled={tier.price === 0 || busyPlan !== null}
                variant={tier.highlight ? "primary" : "outline"}
                onClick={() => startCheckout(tier.id)}
              >
                {tier.price === 0
                  ? "Current plan"
                  : busyPlan === tier.id
                    ? "Loading..."
                    : `Upgrade to ${tier.name}`}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
