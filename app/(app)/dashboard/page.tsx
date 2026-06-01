import Link from "next/link";
import { ArrowRight, Package, Receipt, Store } from "lucide-react";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardOverviewPage() {
  const context = (await ensureOrganizationContext())!;

  const [storefronts, productCount, orderCount, recentOrders] =
    await Promise.all([
      db.storefront.findMany({
        where: { organizationId: context.organization.id },
        include: {
          _count: { select: { products: true, orders: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.product.count({
        where: { storefront: { organizationId: context.organization.id } },
      }),
      db.order.count({
        where: { storefront: { organizationId: context.organization.id } },
      }),
      db.order.findMany({
        where: {
          storefront: { organizationId: context.organization.id },
          status: "PAID",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { storefront: true },
      }),
    ]);

  const stats = [
    { label: "Storefronts", value: storefronts.length, icon: Store },
    { label: "Products", value: productCount, icon: Package },
    { label: "Orders", value: orderCount, icon: Receipt },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What&apos;s happening across your storefronts.
          </p>
        </div>
        <Link href="/dashboard/storefronts/new">
          <Button>
            New storefront
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">
                    {s.value}
                  </div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-400/15 text-brand-600 dark:text-brand-300">
                  <Icon className="size-5" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storefronts</CardTitle>
          <Link href="/dashboard/storefronts">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {storefronts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <div className="text-sm text-muted-foreground">
                No storefronts yet. Create one to start selling.
              </div>
              <Link href="/dashboard/storefronts/new">
                <Button size="sm">Create storefront</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {storefronts.map((sf) => (
                <li key={sf.id}>
                  <Link
                    href={`/dashboard/storefronts/${sf.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {sf.name}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        /{sf.slug}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{sf._count.products} products</span>
                      <span>{sf._count.orders} orders</span>
                      <ArrowRight className="size-4 text-muted-foreground/70" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent paid orders</CardTitle>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium text-foreground">{o.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.storefront.name}
                    </div>
                  </div>
                  <div className="font-mono text-foreground/80">
                    ${(o.amountTotal / 100).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
