import { Download, FileText, Lock, ShieldCheck } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

function ActionLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Download;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="size-4" />
      {label}
    </a>
  );
}

export function GuideDeliverySection({
  productId,
  deliverableTitle,
}: {
  productId: string;
  deliverableTitle: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Document delivery</CardTitle>
          <div className="mt-1 text-sm text-muted-foreground">
            Guides ship as Bizfoo-generated document exports, not buyer setup
            checklists or repo handoffs.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">buyers only</Badge>
          <Badge tone="brand">direct download</Badge>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-surface/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {deliverableTitle}
            </span>
            <Badge tone="neutral">PDF</Badge>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Bizfoo generates the buyer PDF from the guide content above. The
            guide stays private behind the purchase flow, and there is no
            storefront setup checklist for this product type.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionLink
              href={`/api/products/${productId}/guide/export?format=pdf`}
              label="Preview PDF"
              icon={Download}
            />
            <ActionLink
              href={`/api/products/${productId}/guide/export?format=markdown`}
              label="Export Markdown"
              icon={FileText}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4 text-brand-500" />
              Delivery model
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              A direct document download gets issued from Bizfoo after purchase.
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lock className="size-4 text-brand-500" />
              Access
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Buyers keep the full guide and the generated PDF under the same
              private access path.
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-brand-500" />
              Source of truth
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              The editor content above is the source for both the live guide
              reader and the generated PDF.
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
