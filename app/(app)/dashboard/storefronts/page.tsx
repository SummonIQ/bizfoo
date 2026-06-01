import Link from "next/link";
import { ArrowRight, CirclePlus } from "lucide-react";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function StorefrontsPage() {
  const context = (await ensureOrganizationContext())!;
  const storefronts = await db.storefront.findMany({
    where: { organizationId: context.organization.id },
    include: { _count: { select: { products: true, orders: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between px-1">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Storefronts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each storefront has its own products, API keys, and catalog.
          </p>
        </div>
        <Link href="/dashboard/storefronts/new">
          <Button>
            <CirclePlus className="size-4" />
            New storefront
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {storefronts.map((sf) => (
          <Card key={sf.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground">{sf.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    /{sf.slug}
                  </div>
                </div>
                <span
                  className={
                    sf.active
                      ? "inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                      : "inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  }
                >
                  {sf.active ? "Active" : "Disabled"}
                </span>
              </div>
              {sf.description ? (
                <p className="mt-3 text-sm text-muted-foreground">{sf.description}</p>
              ) : null}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{sf._count.products} products</span>
                  <span>{sf._count.orders} orders</span>
                </div>
                <Link href={`/dashboard/storefronts/${sf.id}`}>
                  <Button variant="ghost" size="sm">
                    Open
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
        {storefronts.length === 0 ? (
          <Card className="md:col-span-2">
            <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="text-sm text-muted-foreground">
                No storefronts yet. Create your first one to start selling.
              </div>
              <Link href="/dashboard/storefronts/new">
                <Button size="sm">Create storefront</Button>
              </Link>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
