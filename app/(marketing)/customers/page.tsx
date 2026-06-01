import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Customers" };

const stories = [
  {
    id: "summoniq",
    brand: "SummonIQ",
    headline: "Stood up a 18-product storefront in one afternoon.",
    body: "Replaced a hand-rolled checkout with the bizfoo SDK. The catalog, product detail pages, and Stripe Checkout all run from one public key. Stripe sync is one click per product.",
    metric: { value: "<1 day", label: "Time to first paid checkout" },
    quote: "I expected to spend a week wiring this up. It was an afternoon.",
    person: "Steven, Founder",
    href: "https://summoniq.com/store",
  },
  {
    id: "templates",
    brand: "An indie maker selling templates",
    headline: "Sells 4 templates from a single Astro site.",
    body: "One bizfoo storefront feeds an Astro blog/marketing site via the SDK. Adding a new template is: create in dashboard → click sync → render.",
    metric: { value: "4", label: "Live templates" },
    quote: "I literally don't write checkout code anymore.",
    person: "Indie maker",
    href: "#",
  },
  {
    id: "saas",
    brand: "A two-person SaaS",
    headline: "Three pricing tiers + an add-on, all in one dashboard.",
    body: "Subscription tiers for the main app + a one-time add-on for an LTD bundle. bizfoo handles the catalog, Stripe handles the money, the team focuses on the product.",
    metric: { value: "3 tiers", label: "Live in production" },
    quote: "Pricing changes used to take a sprint. Now it's a 2-minute edit.",
    person: "Co-founder, B2B SaaS",
    href: "#",
  },
  {
    id: "consultancies",
    brand: "A small consultancy",
    headline: "Productized service offerings as paid SKUs.",
    body: "Discovery sprints, fixed-scope MVPs, and audit packages all sold as one-time products. Clients pay through Stripe Checkout, the team gets a Slack notification per order.",
    metric: { value: "6 SKUs", label: "Productized offerings" },
    quote: "Turned our 'contact us' page into a 'buy now' page.",
    person: "Studio lead",
    href: "#",
  },
];

export default function CustomersPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/5 py-20">
        <div className="bf-grid absolute inset-0 opacity-30" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-white md:text-6xl">
            Real teams,{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              real revenue.
            </span>
          </h1>
          <p className="mt-5 text-balance text-lg text-white/70">
            How indie makers, small SaaS, and consultancies are using bizfoo to
            sell.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
          {stories.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="grid gap-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 lg:grid-cols-[1.4fr_1fr]"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                  {s.brand}
                </div>
                <h2 className="mt-2 text-balance text-2xl font-bold text-white md:text-3xl">
                  {s.headline}
                </h2>
                <p className="mt-4 text-white/70">{s.body}</p>
                {s.href && s.href !== "#" ? (
                  <Link
                    href={s.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
                  >
                    Visit storefront
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                ) : null}
              </div>
              <div className="flex flex-col justify-between gap-6 rounded-xl border border-white/10 bg-zinc-950 p-6">
                <div>
                  <Quote className="size-5 text-brand-300" />
                  <p className="mt-3 text-sm leading-relaxed text-white/85">
                    &ldquo;{s.quote}&rdquo;
                  </p>
                  <div className="mt-3 text-xs text-white/50">{s.person}</div>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <div className="font-mono text-2xl font-bold text-brand-300">
                    {s.metric.value}
                  </div>
                  <div className="text-xs text-white/50">{s.metric.label}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">
            Run a store on bizfoo? We&apos;d love to feature you.
          </h2>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/contact">
              <Button size="lg">Tell us your story</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
