import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  CreditCard,
  FileText,
  Globe,
  KeyRound,
  Layers,
  Plug,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Features" };

const groups = [
  {
    title: "Catalog management",
    icon: Layers,
    items: [
      { title: "Multi-storefront workspaces", desc: "Run different brands and currencies side by side." },
      { title: "Products, prices, badges", desc: "One-time, monthly, yearly. Mark new / popular / updated." },
      { title: "Stack tags + categories", desc: "Filter and group products in your own UI." },
      { title: "Per-storefront API keys", desc: "Public + secret pair, rotateable, scoped." },
    ],
  },
  {
    title: "Stripe integration",
    icon: CreditCard,
    items: [
      { title: "One-click sync", desc: "Products and prices created in Stripe automatically." },
      { title: "Hosted Checkout", desc: "PCI-safe, mobile-ready, Apple/Google Pay built in." },
      { title: "Webhook ingestion", desc: "Idempotent handler for the events that matter." },
      { title: "Bring your own account", desc: "Use your own Stripe account — no platform skim." },
    ],
  },
  {
    title: "Developer experience",
    icon: Plug,
    items: [
      { title: "Typed client SDK", desc: "@summoniq/bizfoo-client-sdk — list products, create checkout, that's it." },
      { title: "Edge-cached catalog", desc: "Public catalog endpoint cacheable at the edge." },
      { title: "Framework-agnostic", desc: "Next.js, Remix, Astro, plain React, Node, Bun." },
      { title: "Predictable schema", desc: "Stable JSON shapes versioned under /api/v1." },
    ],
  },
  {
    title: "Operations",
    icon: BarChart3,
    items: [
      { title: "Orders & customers", desc: "Every paid order tracked with the customer record." },
      { title: "Built-in analytics", desc: "Funnels, page views, web vitals via SignalSplash." },
      { title: "Audit trails", desc: "See who changed what — products, prices, settings." },
      { title: "Custom domains", desc: "Bring storefront.yourdomain.com straight to bizfoo." },
    ],
  },
];

const callouts = [
  { icon: ShieldCheck, title: "PCI-compliant by default", desc: "Card data never touches our servers — Stripe Checkout handles it end to end." },
  { icon: Zap, title: "Fast where it counts", desc: "Catalog reads are ISR-cached at the edge; checkout is ~50ms warm." },
  { icon: Globe, title: "Sell globally", desc: "Multi-currency support; Stripe handles tax + 3DS for you." },
];

export default function FeaturesPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/5 py-20">
        <div className="bf-grid absolute inset-0 opacity-30" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
            <Sparkles className="size-3.5 text-brand-300" />
            Everything in the box
          </div>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight text-white md:text-6xl">
            Features built for{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              shipping
            </span>
          </h1>
          <p className="mt-5 text-balance text-lg text-white/70">
            The boring backend for selling things online — from your first
            template to your hundredth subscription tier.
          </p>
        </div>
      </section>

      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-3 md:grid-cols-3">
            {callouts.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <Icon className="size-5 text-brand-300" />
                  <div className="mt-3 font-semibold text-white">{c.title}</div>
                  <p className="mt-1 text-sm text-white/60">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6">
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title}>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{g.title}</h2>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {g.items.map((it) => (
                    <div
                      key={it.title}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                    >
                      <div className="font-semibold text-white">{it.title}</div>
                      <p className="mt-1 text-sm text-white/60">{it.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">
            Try it free for 14 days.
          </h2>
          <p className="mt-3 text-white/70">
            No credit card. Cancel anytime. Bring your own Stripe.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg">
                Start free
                <ArrowUpRight className="size-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                See pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
