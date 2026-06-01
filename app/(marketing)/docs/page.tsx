import { BookOpen, Rocket, Zap } from "lucide-react";

export const metadata = { title: "Docs" };

const quickstart = [
  { n: 1, text: "Create a workspace and storefront in the dashboard." },
  { n: 2, text: "Add products with one or more prices." },
  { n: 3, text: "Click Sync to Stripe on each product." },
  { n: 4, text: "Install the SDK and render your catalog." },
];

export default function DocsPage() {
  return (
    <div>
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <BookOpen className="size-3.5 text-brand-300" />
            Docs
          </div>
          <h1 className="mt-5 text-4xl font-bold text-white md:text-5xl">
            Everything you need to ship a bizfoo storefront.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-300">
              <Rocket className="size-4" />
              Quickstart
            </div>
            <ol className="mt-4 flex flex-col gap-3">
              {quickstart.map((step) => (
                <li
                  key={step.n}
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-400/10 font-mono text-xs font-semibold text-brand-300 ring-1 ring-brand-400/20">
                    {step.n}
                  </div>
                  <div className="text-sm text-white/80">{step.text}</div>
                </li>
              ))}
            </ol>
          </div>

          <Section title="Install the client SDK">
            <Code>{`bun add @summoniq/bizfoo-client-sdk
# or
pnpm add @summoniq/bizfoo-client-sdk`}</Code>
          </Section>

          <Section title="List products">
            <Code>{`import { createBizfooClient } from "@summoniq/bizfoo-client-sdk";

const bizfoo = createBizfooClient({
  storefront: "summoniq",
  publicKey: process.env.NEXT_PUBLIC_BIZFOO_KEY!,
});

const { products } = await bizfoo.listProducts();`}</Code>
          </Section>

          <Section title="Get a single product">
            <Code>{`const { product } = await bizfoo.getProduct("nextjs-saas-starter");`}</Code>
          </Section>

          <Section title="Create a checkout">
            <Code>{`const { url } = await bizfoo.createCheckout({
  items: [{ priceId: products[0].prices[0].id }],
  email: "buyer@example.com",
  successUrl: "https://yoursite.com/success",
  cancelUrl: "https://yoursite.com/cancel",
});

window.location.href = url;`}</Code>
          </Section>

          <Section title="Webhooks">
            <p className="text-sm text-white/70">
              bizfoo records every paid order against the originating
              storefront. Forward events to your own systems via the Webhooks
              tab in your storefront settings.
            </p>
          </Section>

          <div className="rounded-2xl border border-brand-400/20 bg-brand-400/[0.04] p-5 text-sm text-white/80">
            <div className="flex items-center gap-2 font-semibold text-brand-300">
              <Zap className="size-4" />
              Heads-up
            </div>
            <p className="mt-2">
              The catalog endpoint is cacheable — set <code className="font-mono text-xs text-brand-300">next: {"{ revalidate: 60 }"}</code>{" "}
              in Next.js or hit it from a static build for max speed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-4 text-xs leading-6 text-white/90">
      {children}
    </pre>
  );
}
