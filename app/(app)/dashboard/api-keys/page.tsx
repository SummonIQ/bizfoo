import Link from "next/link";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ApiKeysIndexPage() {
  const auth = (await ensureOrganizationContext())!;
  const storefronts = await db.storefront.findMany({
    where: { organizationId: auth.organization.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">API keys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each storefront has its own public + secret key pair. Open a
          storefront to view and copy.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {storefronts.map((sf) => (
          <Card key={sf.id}>
            <CardHeader>
              <CardTitle>{sf.name}</CardTitle>
              <Link href={`/dashboard/storefronts/${sf.id}`}>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </Link>
            </CardHeader>
            <CardBody>
              <div className="font-mono text-xs text-muted-foreground">/{sf.slug}</div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
