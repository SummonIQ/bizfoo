import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CustomersPage() {
  const auth = (await ensureOrganizationContext())!;
  const customers = await db.customer.findMany({
    where: { storefront: { organizationId: auth.organization.id } },
    include: { storefront: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{customers.length} customers</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {customers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No customers yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {customers.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {c.name ?? c.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.email} · {c.storefront.name}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {c._count.orders} orders
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
