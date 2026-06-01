import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { getProductGuide } from "@/lib/product-guides";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";

const statusTone = {
  PENDING: "warning",
  PAID: "success",
  REFUNDED: "neutral",
  CANCELED: "neutral",
  FAILED: "danger",
} as const;

export default async function OrdersPage() {
  const auth = (await ensureOrganizationContext())!;
  const orders = await db.order.findMany({
    where: { storefront: { organizationId: auth.organization.id } },
    include: { storefront: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Recent 100 orders.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{orders.length} orders</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {orders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{o.email || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.storefront.name} ·{" "}
                      {o.items
                        .map((i) => getProductGuide(i.product)?.title ?? i.product.name)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono">
                      ${(o.amountTotal / 100).toFixed(2)}
                    </span>
                    <Badge tone={statusTone[o.status]}>{o.status}</Badge>
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
