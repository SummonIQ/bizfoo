import { Sparkles } from "lucide-react";

export const metadata = { title: "Changelog" };

const entries = [
  {
    date: "2026-04-18",
    title: "Public launch + new brand",
    badge: "release",
    items: [
      "Public storefront API live at api/v1/storefronts/[slug].",
      "@summoniq/bizfoo-client-sdk published with `listProducts`, `getProduct`, and `createCheckout`.",
      "New dark-first brand and animated landing page.",
      "Marketing site expanded: features, customers, changelog, about, contact.",
    ],
  },
  {
    date: "2026-04-17",
    title: "Stripe sync + multi-storefront workspaces",
    badge: "feature",
    items: [
      "One-click sync from product → Stripe Product + Price.",
      "Per-storefront public + secret key pair.",
      "Unified webhook handler for platform billing and tenant orders.",
      "First powered storefront live: SummonIQ.",
    ],
  },
  {
    date: "2026-04-17",
    title: "Initial scaffold",
    badge: "infra",
    items: [
      "Next.js 16 + Prisma 7 + Better Auth + Tailwind v4.",
      "Bootstrap script: GH repo → Vercel link → Neon Postgres → envs → deploy.",
      "Catalog schema: Storefront → Product → Price → Order → OrderItem.",
    ],
  },
];

const tone = {
  release: "bg-brand-400/10 text-brand-300 ring-brand-400/30",
  feature: "bg-sky-400/10 text-sky-300 ring-sky-400/30",
  infra: "bg-violet-400/10 text-violet-300 ring-violet-400/30",
} as const;

export default function ChangelogPage() {
  return (
    <div>
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <Sparkles className="size-3.5 text-brand-300" />
            Updates ship continuously
          </div>
          <h1 className="mt-5 text-balance text-5xl font-bold text-white md:text-6xl">
            Changelog
          </h1>
          <p className="mt-4 text-white/70">
            Everything new in bizfoo, freshest first.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6">
          {entries.map((entry) => (
            <article
              key={entry.title}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-xs text-white/50">
                  {entry.date}
                </div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 " +
                    tone[entry.badge as keyof typeof tone]
                  }
                >
                  {entry.badge}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">
                {entry.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-white/75">
                {entry.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
