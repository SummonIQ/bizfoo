export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Privacy policy</h1>
      <p className="mt-2 text-sm text-white/50">Last updated April 2026.</p>

      <div className="mt-8 flex flex-col gap-6 text-white/75">
        <p>
          We collect the minimum information required to run bizfoo: your
          email and name (for sign-in), the products and orders you create,
          and a small set of analytics events about how the dashboard is
          used.
        </p>
        <h2 className="text-xl font-semibold text-white">What we collect</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Account info: email, name, organization, role.</li>
          <li>Catalog data you create: products, prices, customers, orders.</li>
          <li>Analytics: page views, clicks, web vitals (via SignalSplash).</li>
          <li>Stripe metadata: customer IDs, payment intent IDs, subscription IDs.</li>
        </ul>
        <h2 className="text-xl font-semibold text-white">What we don&apos;t do</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>We don&apos;t sell or share your data.</li>
          <li>We don&apos;t store card numbers — Stripe handles all of that.</li>
          <li>We don&apos;t take a cut of your revenue.</li>
        </ul>
        <h2 className="text-xl font-semibold text-white">Your rights</h2>
        <p>
          Email <a href="mailto:privacy@bizfoo.com" className="text-brand-300 hover:text-brand-200">privacy@bizfoo.com</a> to request a copy or deletion of
          your data, or to ask us anything about how we handle it.
        </p>
      </div>
    </div>
  );
}
