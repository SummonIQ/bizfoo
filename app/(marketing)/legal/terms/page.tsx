export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Terms of service</h1>
      <p className="mt-2 text-sm text-white/50">Last updated April 2026.</p>

      <div className="mt-8 flex flex-col gap-6 text-white/75">
        <p>
          By using bizfoo you agree to use the service in good faith and in
          compliance with applicable law. We&apos;ll provide the service with
          best-effort uptime and clear, working APIs.
        </p>

        <h2 className="text-xl font-semibold text-white">Your account</h2>
        <p>
          You&apos;re responsible for keeping your credentials safe and for
          everything that happens under your account. Each storefront has a
          public + secret key — don&apos;t leak the secret key.
        </p>

        <h2 className="text-xl font-semibold text-white">Payments</h2>
        <p>
          bizfoo subscriptions are billed monthly through Stripe. You can
          cancel anytime in the dashboard. We don&apos;t take a cut of your
          tenant storefront revenue — that&apos;s between you and Stripe.
        </p>

        <h2 className="text-xl font-semibold text-white">Liability</h2>
        <p>
          Service is provided &ldquo;as is&rdquo;. We&apos;re a small team
          shipping fast — we&apos;ll fix issues quickly, but we can&apos;t
          cover lost revenue from outages.
        </p>

        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p>
          Questions? <a href="mailto:hi@bizfoo.com" className="text-brand-300 hover:text-brand-200">hi@bizfoo.com</a>.
        </p>
      </div>
    </div>
  );
}
