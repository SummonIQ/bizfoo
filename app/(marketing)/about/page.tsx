import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/5 py-20">
        <div className="bf-grid absolute inset-0 opacity-30" />
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-white md:text-6xl">
            We make selling things online{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              boring
            </span>
            .
          </h1>
          <p className="mt-6 text-lg text-white/70">
            Most product-and-checkout setups for small teams are either bloated
            (full ecommerce platforms with carts, shipping, inventory, taxes)
            or DIY-with-Stripe (cobbled webhooks, ad-hoc product configs,
            spaghetti). bizfoo is the in-between: a clean catalog API and
            checkout, no commerce baggage.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-brand-300">
              Why we built it
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">
              We needed it ourselves.
            </h2>
            <p className="mt-3 text-white/70">
              We were running multiple product brands on top of one Stripe
              account and rewriting the same product cards, checkout buttons,
              and webhook handlers for each. bizfoo started as our own internal
              tool and turned into a product.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-brand-300">
              What we believe
            </div>
            <ul className="mt-3 flex flex-col gap-3 text-white/80">
              <li>You should never write a Stripe webhook by hand again.</li>
              <li>Your storefront should live wherever your marketing site lives.</li>
              <li>You should own your customer relationships.</li>
              <li>We should never take a cut of your revenue.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">
            Built by indie makers, for indie makers.
          </h2>
          <p className="mt-3 text-white/70">
            We&apos;re a small team that ships fast. If you have ideas, we want
            to hear them.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/contact">
              <Button size="lg">Get in touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
