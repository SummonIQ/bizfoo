import Link from "next/link";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { getProductDisplayInfo } from "@/lib/product-guides";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { ProductFilters } from "./filters";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickString(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const v = params[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const auth = (await ensureOrganizationContext())!;
  const params = (await searchParams) ?? {};
  const q = pickString(params, "q").trim();
  const stage = pickString(params, "stage");
  const storefrontId = pickString(params, "storefront");
  const stripe = pickString(params, "stripe");
  const priceTier = pickString(params, "price");

  const products = await db.product.findMany({
    where: { storefront: { organizationId: auth.organization.id } },
    include: { storefront: true, prices: true, buildPlan: true },
    orderBy: { updatedAt: "desc" },
  });

  const storefronts = Array.from(
    new Map(
      products.map((p) => [p.storefront.id, p.storefront] as const),
    ).values(),
  ).map((s) => ({ id: s.id, name: s.name }));

  const filtered = products.filter((p) => {
    const info = getProductDisplayInfo(p);
    const productStage = p.buildPlan?.stage ?? "IDEA";
    const priceAmount = p.prices[0]?.amount ?? 0;
    const isSynced = Boolean(p.stripeProductId);

    if (q) {
      const needle = q.toLowerCase();
      const haystack = `${info.title} ${info.slug}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (stage && productStage !== stage) return false;
    if (storefrontId && p.storefrontId !== storefrontId) return false;
    if (stripe === "synced" && !isSynced) return false;
    if (stripe === "unsynced" && isSynced) return false;
    if (priceTier === "free" && priceAmount > 0) return false;
    if (priceTier === "paid" && priceAmount <= 0) return false;
    return true;
  });

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

  return (
    <div className="flex flex-col gap-6">
      <div className="px-1">
        <h1 className="text-2xl font-semibold text-foreground">All products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Across every storefront in this workspace.
        </p>
      </div>
      <ProductFilters
        storefronts={storefronts}
        total={products.length}
        filtered={filtered.length}
      />
      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} products</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              {products.length === 0
                ? "No products yet."
                : "No products match the current filters."}
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Stage</th>
                  <th className="px-3 py-2 font-semibold">Stripe</th>
                  <th className="px-3 py-2 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const info = getProductDisplayInfo(p);
                  const stage = p.buildPlan?.stage ?? "IDEA";
                  return (
                    <tr key={p.id} className="hover:bg-muted">
                      <td className="px-4 py-2">
                        <Link
                          href={`/dashboard/storefronts/${p.storefrontId}/products/${p.id}`}
                          className="block"
                        >
                          <div className="font-medium text-foreground">
                            {info.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.storefront.name} · {info.slug}
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={STAGE_TONE[stage] ?? "neutral"}>
                          {STAGE_LABEL[stage] ?? "Idea"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        {p.stripeProductId ? (
                          <Badge tone="success">Synced</Badge>
                        ) : (
                          <Badge tone="neutral">Not synced</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-semibold text-foreground">
                        ${((p.prices[0]?.amount ?? 0) / 100).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
