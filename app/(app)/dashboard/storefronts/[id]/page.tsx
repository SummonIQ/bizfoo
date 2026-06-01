import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CirclePlus, ExternalLink } from "lucide-react";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { getProductDisplayInfo } from "@/lib/product-guides";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductsReport, type ProductRow } from "@/components/products-report";

export default async function StorefrontDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const context = (await ensureOrganizationContext())!;

  const storefront = await db.storefront.findFirst({
    where: { id, organizationId: context.organization.id },
    include: {
      products: {
        include: {
          prices: true,
          buildPlan: { include: { milestones: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!storefront) notFound();

  const products = storefront.products;
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const syncedProducts = products.filter((p) => !!p.stripeProductId).length;
  const notSyncedProducts = totalProducts - syncedProducts;
  const totalPrices = products.reduce((sum, p) => sum + p.prices.length, 0);
  const totalCatalogValue = products.reduce(
    (sum, p) => sum + (p.prices[0]?.amount ?? 0),
    0,
  );
  const categories = new Set(products.map((p) => p.category).filter(Boolean));

  // Aggregate completion across all products' milestones.
  const allMilestones = products.flatMap((p) => p.buildPlan?.milestones ?? []);
  const totalMilestones = allMilestones.length;
  const doneMilestones = allMilestones.filter((m) => m.status === "DONE").length;
  const overallPct =
    totalMilestones === 0 ? 0 : Math.round((doneMilestones / totalMilestones) * 100);

  // Stage histogram for the overview.
  const stageCounts = products.reduce<Record<string, number>>((acc, p) => {
    const stage = p.buildPlan?.stage ?? "IDEA";
    acc[stage] = (acc[stage] ?? 0) + 1;
    return acc;
  }, {});

  const lastUpdated = products[0]?.updatedAt ?? storefront.updatedAt;

  // Top 8 most recently updated for the preview report on this page.
  const previewRows: ProductRow[] = products.slice(0, 8).map((p) => {
    const display = getProductDisplayInfo(p);
    const milestones = p.buildPlan?.milestones ?? [];
    return {
      id: p.id,
      storefrontId: storefront.id,
      slug: display.slug,
      title: display.title,
      badge: p.badge,
      active: p.active,
      category: p.category,
      priceCount: p.prices.length,
      amount: p.prices[0]?.amount ?? 0,
      stripeSynced: !!p.stripeProductId,
      updatedAt: p.updatedAt.toISOString(),
      stage: p.buildPlan?.stage ?? "IDEA",
      milestonesDone: milestones.filter((m) => m.status === "DONE").length,
      milestonesTotal: milestones.length,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="px-1">
        <Link
          href="/dashboard/storefronts"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Storefronts
        </Link>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {storefront.name}
            </h1>
            <div className="mt-1 font-mono text-sm text-muted-foreground">
              /{storefront.slug}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/storefronts/${storefront.id}/products/new`}>
              <Button>
                <CirclePlus className="size-4" />
                New product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Products" value={String(totalProducts)} sub={`${activeProducts} active`} />
        <StatCard
          label="Stripe sync"
          value={`${syncedProducts}/${totalProducts}`}
          sub={notSyncedProducts > 0 ? `${notSyncedProducts} not synced` : "all synced"}
          tone={notSyncedProducts > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Catalog value"
          value={`$${(totalCatalogValue / 100).toLocaleString()}`}
          sub={`${totalPrices} prices · ${categories.size} categories`}
        />
        <StatCard
          label="Build progress"
          value={`${overallPct}%`}
          sub={`${doneMilestones}/${totalMilestones} milestones`}
          tone={overallPct === 100 ? "success" : overallPct > 0 ? "brand" : undefined}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Storefront</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <DetailRow label="Slug" value={`/${storefront.slug}`} mono />
            <DetailRow label="Status" value={storefront.active ? "Active" : "Inactive"} />
            <DetailRow label="Currency" value={storefront.currency.toUpperCase()} />
            <DetailRow label="Last updated" value={formatRelative(lastUpdated)} />
            <DetailRow label="Created" value={formatDate(storefront.createdAt)} />
            {storefront.publicKey ? (
              <DetailRow label="Public key" value={storefront.publicKey} mono className="col-span-2" />
            ) : null}
            {storefront.description ? (
              <DetailRow label="Description" value={storefront.description} className="col-span-2" />
            ) : null}
            {storefront.successUrl ? (
              <DetailRow label="Success URL" value={storefront.successUrl} mono className="col-span-2" />
            ) : null}
            {storefront.cancelUrl ? (
              <DetailRow label="Cancel URL" value={storefront.cancelUrl} mono className="col-span-2" />
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build pipeline</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {Object.entries(stageCounts).length === 0 ? (
              <div className="text-sm text-muted-foreground">No build plans yet.</div>
            ) : (
              ORDERED_STAGES.filter((s) => stageCounts[s]).map((stage) => (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{STAGE_LABEL[stage]}</span>
                  <Badge tone={STAGE_TONE[stage]}>{stageCounts[stage]}</Badge>
                </div>
              ))
            )}
            <div className="pt-2">
              <a
                href={`/api/v1/storefronts/${storefront.slug}/products`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300 dark:hover:text-brand-200"
              >
                Public catalog
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </CardBody>
        </Card>
      </div>

      {totalProducts === 0 ? (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-sm text-muted-foreground">
                No products yet. Create one to start selling.
              </div>
              <Link href={`/dashboard/storefronts/${storefront.id}/products/new`}>
                <Button size="sm">Create product</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <ProductsReport
            products={previewRows}
            storefrontId={storefront.id}
            enableFilters={false}
            enableScrollMaxHeight={false}
          />
          <div className="flex justify-end">
            <Link
              href={`/dashboard/storefronts/${storefront.id}/products`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-300 dark:hover:text-brand-200"
            >
              View all {totalProducts} products
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

const ORDERED_STAGES = ["IDEA", "SPEC", "SCAFFOLDED", "IN_DEV", "ALPHA", "BETA", "RELEASED"] as const;

const STAGE_LABEL: Record<string, string> = {
  IDEA: "Idea",
  SPEC: "Spec'd",
  SCAFFOLDED: "Scaffolded",
  IN_DEV: "In dev",
  ALPHA: "Alpha",
  BETA: "Beta",
  RELEASED: "Released",
};

const STAGE_TONE: Record<string, "neutral" | "brand" | "success" | "warning"> = {
  IDEA: "neutral",
  SPEC: "warning",
  SCAFFOLDED: "warning",
  IN_DEV: "brand",
  ALPHA: "brand",
  BETA: "brand",
  RELEASED: "success",
};

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "success" | "warning" | "brand";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3 backdrop-blur-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {tone ? <Badge tone={tone}>{sub}</Badge> : sub}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={mono ? "mt-0.5 font-mono text-sm text-foreground break-all" : "mt-0.5 text-sm text-foreground"}>
        {value}
      </div>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatRelative(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  return formatDate(date);
}
