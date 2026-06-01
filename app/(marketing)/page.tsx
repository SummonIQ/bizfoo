import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Code2,
  CreditCard,
  Globe,
  Layers,
  Plug,
  Receipt,
  Shield,
  Sparkles,
  Webhook,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCanvas } from "@/components/marketing/hero-canvas";
import { FloatingCards } from "@/components/marketing/floating-cards";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <CodeExample />
      <Stats />
      <Testimonials />
      <PricingTeaser />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/5">
      <div className="bf-grid absolute inset-0 opacity-60" />
      <HeroCanvas />
      <FloatingCards />

      <div
        className="pointer-events-none absolute -inset-32 -z-10 bf-shimmer"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 30% 30%, rgba(168,240,21,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 75% 70%, rgba(56,189,248,0.10), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[640px] max-w-6xl flex-col items-center justify-center px-6 py-28 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
          <Sparkles className="size-3.5 text-brand-300" />
          <span>Live: storefront API + Stripe sync + checkout</span>
        </div>

        <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold tracking-tight text-white md:text-7xl">
          Sell anything,{" "}
          <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
            from any site,
          </span>{" "}
          by tonight.
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg text-white/70 md:text-xl">
          bizfoo gives you a typed catalog API, one-click Stripe sync, and a
          checkout flow that works on Next.js, Astro, Remix, or plain HTML.
          Manage everything in one dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/sign-up">
            <Button size="lg">
              Start free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              See pricing
            </Button>
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="size-3.5 text-brand-300" />
            Stripe-powered checkout
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe className="size-3.5 text-brand-300" />
            Custom domains
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="size-3.5 text-brand-300" />
            Edge-fast catalog API
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Boxes className="size-3.5 text-brand-300" />
            Multi-storefront
          </span>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="border-b border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center text-xs font-medium uppercase tracking-widest text-white/40">
          Powering storefronts for
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-base font-semibold text-white/40">
          <span>SummonIQ</span>
          <span>SummonFlow</span>
          <span>Cleo&apos;s Club</span>
          <span>Mac Rabbit</span>
          <span>WinMan</span>
          <span>MacZen</span>
          <span>Gimme Job</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Layers, title: "Multi-storefront workspaces", desc: "One workspace, many catalogs. Different brands, currencies, and APIs." },
    { icon: CreditCard, title: "One-click Stripe sync", desc: "Products and prices created in Stripe automatically. Webhooks handled." },
    { icon: Plug, title: "Drop-in client SDK", desc: "Render the catalog and create checkout sessions from any frontend." },
    { icon: Receipt, title: "Orders & customers", desc: "Every paid order tracked, with the customer record to match." },
    { icon: BarChart3, title: "Analytics built in", desc: "Funnels, page views, web vitals via SignalSplash — all on by default." },
    { icon: Webhook, title: "Webhooks & API access", desc: "Wire bizfoo into your CRM, fulfillment, or email automation." },
  ];

  return (
    <section id="features" className="border-b border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-brand-300">Features</div>
          <h2 className="mt-3 text-balance text-3xl font-bold text-white md:text-4xl">
            The boring backend for selling things online.
          </h2>
          <p className="mt-3 text-white/70">
            All the pieces you would build yourself — manage in a dashboard, ship with one API call.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group relative flex flex-col gap-3 bg-zinc-950 p-6 transition-colors hover:bg-white/[0.02]">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/20">
                  <Icon className="size-5" />
                </div>
                <div className="font-semibold text-white">{f.title}</div>
                <p className="text-sm text-white/60">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Create a storefront", desc: "Name it, slug it, get a public + secret API key pair instantly." },
    { n: "02", title: "Add products & prices", desc: "One-time, monthly, or yearly billing. Sync to Stripe in one click." },
    { n: "03", title: "Render anywhere", desc: "Drop the bizfoo SDK on any marketing site, app, or custom storefront." },
  ];

  return (
    <section className="relative border-b border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-brand-300">How it works</div>
          <h2 className="mt-3 text-balance text-3xl font-bold text-white md:text-4xl">Three steps from blank to live.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="font-mono text-xs text-brand-300">{s.n}</div>
              <div className="mt-4 text-lg font-semibold text-white">{s.title}</div>
              <p className="mt-2 text-sm text-white/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeExample() {
  return (
    <section className="border-b border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-brand-300">SDK</div>
            <h2 className="mt-3 text-balance text-3xl font-bold text-white md:text-4xl">One small client. Any frontend.</h2>
            <p className="mt-3 text-white/70">
              The bizfoo client SDK reads your live catalog and creates Stripe Checkout sessions. Works in Next.js, Remix, Astro, plain React, edge functions, and Node.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-white/80">
              <li className="flex items-start gap-2"><Code2 className="mt-0.5 size-4 text-brand-300" />Typed responses for products + prices</li>
              <li className="flex items-start gap-2"><Code2 className="mt-0.5 size-4 text-brand-300" />Cache-friendly catalog endpoint</li>
              <li className="flex items-start gap-2"><Code2 className="mt-0.5 size-4 text-brand-300" />Public-key auth (no secrets in browsers)</li>
            </ul>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 p-1 shadow-[0_0_60px_-20px_rgba(168,240,21,0.4)]">
            <div className="flex items-center gap-1.5 px-4 py-2 text-xs text-white/40">
              <span className="size-2 rounded-full bg-rose-400/40" />
              <span className="size-2 rounded-full bg-amber-400/40" />
              <span className="size-2 rounded-full bg-emerald-400/40" />
              <span className="ml-3 font-mono">checkout.ts</span>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-5 text-xs leading-6 text-white/85">
{`import { createBizfooClient } from "@summoniq/bizfoo-client-sdk";

const bizfoo = createBizfooClient({
  storefront: "summoniq",
  publicKey: process.env.NEXT_PUBLIC_BIZFOO_KEY!,
});

const { products } = await bizfoo.listProducts();

const { url } = await bizfoo.createCheckout({
  items: [{ priceId: products[0].prices[0].id }],
  email: "buyer@example.com",
});

window.location.href = url;`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "< 60s", label: "From sign-up to first product" },
    { value: "0%", label: "We take 0% of your revenue" },
    { value: "18+", label: "Stripe events handled out of the box" },
    { value: "Edge", label: "Catalog API served from the edge" },
  ];
  return (
    <section className="border-b border-white/5 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-3xl font-bold text-brand-300">{s.value}</div>
              <div className="mt-1 text-sm text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { quote: "We had a paid checkout live the same afternoon we deployed bizfoo. The SDK is the cleanest part of our marketing site.", author: "Steven", role: "Founder, SummonIQ" },
    { quote: "I stopped writing checkout code. bizfoo is what I wished Stripe gave me out of the box.", author: "Indie maker", role: "shipping templates on the side" },
    { quote: "Multiple storefronts on one Stripe account, with proper API keys per brand. No more spaghetti.", author: "Studio lead", role: "running 3 product brands" },
  ];
  return (
    <section className="border-b border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-brand-300">What people are saying</div>
          <h2 className="mt-3 text-balance text-3xl font-bold text-white md:text-4xl">Loved by indie makers and small teams.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <figure key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <blockquote className="text-sm leading-relaxed text-white/85">&ldquo;{q.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 text-sm">
                <div className="font-semibold text-white">{q.author}</div>
                <div className="text-xs text-white/50">{q.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="border-b border-white/5 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">Free to get going. Pay when you scale.</h2>
        <p className="mt-3 text-white/70">Starter is free forever for one storefront. Growth and Scale unlock custom domains, multiple storefronts, and team seats.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/pricing">
            <Button size="lg">
              See full pricing
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bf-shimmer" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(168,240,21,0.18), transparent 70%)" }} />
      <div className="bf-grid absolute inset-0 -z-10 opacity-30" />
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-balance text-4xl font-bold text-white md:text-5xl">Stand up your storefront tonight.</h2>
        <p className="mt-4 text-white/70">Free forever for one storefront. No credit card to start.</p>
        <div className="mt-10 flex justify-center">
          <Link href="/sign-up">
            <Button size="lg">
              Create my account
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
