import Link from "next/link";
import { notFound } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { getProductDisplayInfo } from "@/lib/product-guides";
import { Button } from "@/components/ui/button";
import { ProductsReport } from "@/components/products-report";

export default async function StorefrontProductsPage({
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

  const reportRows = storefront.products.map((p) => {
    const display = getProductDisplayInfo(p);
    const milestones = p.buildPlan?.milestones ?? [];
    const milestonesDone = milestones.filter((m) => m.status === "DONE").length;
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
      milestonesDone,
      milestonesTotal: milestones.length,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/dashboard/storefronts/${storefront.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {storefront.name}
        </Link>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Products</h1>
            <div className="mt-1 text-sm text-muted-foreground">
              {storefront.products.length} products in /{storefront.slug}
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

      <ProductsReport
        products={reportRows}
        storefrontId={storefront.id}
        enableScrollMaxHeight={false}
      />
    </div>
  );
}
