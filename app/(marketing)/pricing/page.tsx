import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pricing" };

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
    cta: "Start free",
    href: "/sign-up",
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
    cta: "Start 14-day trial",
    href: "/sign-up?plan=growth",
  },
  {
    id: "scale",
    name: "Scale",
    price: 149,
    desc: "Multi-brand, multi-team operations.",
    features: [
      "Unlimited storefronts",
      "Team seats & roles",
      "Advanced analytics & cohorts",
      "Audit log",
      "Priority support",
      "SSO (on request)",
    ],
    cta: "Start 14-day trial",
    href: "/sign-up?plan=scale",
  },
];

const faq = [
  { q: "Do you take a cut of my sales?", a: "No. bizfoo charges a flat monthly fee. Stripe takes its standard processing fee directly." },
  { q: "Can I use my own Stripe account?", a: "Yes. Connect your Stripe account in settings; products and checkouts are created in your account." },
  { q: "Can I run multiple storefronts on one workspace?", a: "Growth plan supports up to 5; Scale is unlimited. Each has its own slug, keys, and catalog." },
  { q: "Is there a free trial for paid plans?", a: "Yes — 14 days, no card required. Cancel anytime." },
];

export default function PricingPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/5 py-20">
        <div className="bf-grid absolute inset-0 opacity-30" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <Sparkles className="size-3.5 text-brand-300" />
            Free forever for one storefront
          </div>
          <h1 className="mt-5 text-balance text-5xl font-bold tracking-tight text-white md:text-6xl">
            Pricing built for shipping.
          </h1>
          <p className="mt-4 text-white/70">
            Start free. Upgrade when you outgrow it. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={
                t.highlight
                  ? "relative rounded-2xl border border-brand-400/40 bg-gradient-to-b from-brand-400/[0.06] to-transparent p-6 shadow-[0_0_60px_-20px_rgba(168,240,21,0.5)]"
                  : "rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              }
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-white">{t.name}</div>
                {t.highlight ? (
                  <span className="rounded-full bg-brand-400/15 px-2.5 py-0.5 text-xs font-semibold text-brand-300 ring-1 ring-brand-400/30">
                    Most popular
                  </span>
                ) : null}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">${t.price}</span>
                <span className="ml-1 text-sm text-white/50">/ month</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{t.desc}</p>
              <Link href={t.href}>
                <Button
                  className="mt-6 w-full"
                  variant={t.highlight ? "primary" : "outline"}
                >
                  {t.cta}
                </Button>
              </Link>
              <ul className="mt-6 flex flex-col gap-2 text-sm text-white/80">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-brand-300" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-white">FAQ</h2>
          <dl className="mt-6 flex flex-col gap-6">
            {faq.map((q) => (
              <div
                key={q.q}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <dt className="font-semibold text-white">{q.q}</dt>
                <dd className="mt-2 text-sm text-white/65">{q.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
