import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { List, ListEmpty, ListItem } from "@/components/ui/list";
import { syncGuideProductArtifacts } from "@/lib/guide-documents";
import { getProductDisplayInfo, getProductGuide } from "@/lib/product-guides";
import { GuideContentSection } from "./guide-content-section";
import { GuideDeliverySection } from "./guide-delivery-section";
import { SyncProductButton } from "./sync-button";
import { DeliverablesSection } from "./deliverables-section";
import { BuildPlanSection } from "./build-plan-section";
import { SetupGuideSection } from "./setup-guide-section";
import { ProductBasicsForm } from "./product-basics-form";
import { ContentSection, type ContentConfig } from "./content-section";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; productId: string }>;
}) {
  const { id, productId } = await params;
  const auth = await ensureOrganizationContext();
  if (!auth) redirect("/sign-in");

  const product = await db.product.findFirst({
    where: {
      id: productId,
      storefront: { id, organizationId: auth.organization.id },
    },
    include: {
      prices: true,
      storefront: true,
      deliverables: {
        orderBy: { position: "asc" },
        include: { delivery: true },
      },
      buildPlan: {
        include: { milestones: { orderBy: { position: "asc" } } },
      },
      setupSteps: {
        orderBy: { position: "asc" },
        include: { inputs: { orderBy: { position: "asc" } } },
      },
      features: { orderBy: { position: "asc" } },
      integrations: { orderBy: { position: "asc" } },
      assets: { orderBy: { position: "asc" } },
      howItWorks: { orderBy: { position: "asc" } },
      faqs: { orderBy: { position: "asc" } },
      highlights: { orderBy: { position: "asc" } },
      dependencies: { orderBy: { position: "asc" } },
    },
  });
  if (!product) notFound();
  const categoryOptions = (
    await db.product.findMany({
      where: {
        storefrontId: product.storefrontId,
        category: { not: null },
      },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    })
  )
    .map((entry) => entry.category)
    .filter((value): value is string => Boolean(value));
  const guide = getProductGuide(product);
  const display = getProductDisplayInfo(product);
  const guideDeliverable = guide
    ? await syncGuideProductArtifacts({
        productId: product.id,
        guide,
      })
    : null;

  return (
    <div className="-my-2 flex flex-col gap-6">
      <div>
        <Link
          href={`/dashboard/storefronts/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {product.storefront.name}
        </Link>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">
                {display.title}
              </h1>
              {product.badge ? <Badge tone="brand">{product.badge}</Badge> : null}
            </div>
            <div className="mt-1 font-mono text-sm text-muted-foreground">
              {display.slug}
            </div>
          </div>
          <SyncProductButton
            productId={product.id}
            isSynced={Boolean(product.stripeProductId)}
          />
        </div>
      </div>

      <ProductBasicsForm
        mode={guide ? "guide" : "default"}
        product={{
          id: product.id,
          name: display.title,
          tagline: product.tagline,
          description: product.description,
          longDescription: product.longDescription,
          category: product.category,
          badge: product.badge,
          stack: product.stack,
          relatedSlugs: product.relatedSlugs,
          repoUrl: product.repoUrl,
          demoUrl: product.demoUrl,
          codeSampleLang: product.codeSampleLang,
          codeSampleFile: product.codeSampleFile,
          codeSampleCode: product.codeSampleCode,
        }}
        categoryOptions={categoryOptions}
      />

      {guide ? (
        <>
          <GuideContentSection
            productId={product.id}
            initialGuide={guide}
          />
          <GuideDeliverySection
            productId={product.id}
            deliverableTitle={guideDeliverable?.title ?? `${guide.title} PDF`}
          />
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Prices</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {product.prices.length === 0 ? (
            <ListEmpty className="m-5">No prices yet.</ListEmpty>
          ) : (
            <List className="rounded-none border-x-0 border-b-0">
              {product.prices.map((price, index) => (
                <ListItem
                  key={price.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-400/15 font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-mono text-foreground">
                        ${(price.amount / 100).toFixed(2)} {price.currency.toUpperCase()}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {price.interval === "ONE_TIME"
                          ? "One-time"
                          : `Every ${price.intervalCount} ${price.interval.toLowerCase()}(s)`}
                      </div>
                    </div>
                  </div>
                  {price.stripePriceId ? (
                    <Badge tone="success">Synced</Badge>
                  ) : (
                    <Badge tone="warning">Not synced</Badge>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </CardBody>
      </Card>

      {!guide ? (
        <>
          <BuildPlanSection
            productId={product.id}
            initialPlan={{
              id: product.buildPlan?.id ?? null,
              stage: product.buildPlan?.stage ?? "IDEA",
              problem: product.buildPlan?.problem ?? null,
              audience: product.buildPlan?.audience ?? null,
              outcome: product.buildPlan?.outcome ?? null,
              scope: product.buildPlan?.scope ?? null,
              outOfScope: product.buildPlan?.outOfScope ?? null,
              techNotes: product.buildPlan?.techNotes ?? null,
              repoUrl: product.buildPlan?.repoUrl ?? null,
            }}
            initialMilestones={(product.buildPlan?.milestones ?? []).map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              status: m.status,
              estimateHours: m.estimateHours,
              parentId: m.parentId,
            }))}
          />

          <SetupGuideSection
            productId={product.id}
            initial={product.setupSteps.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              category: s.category,
              required: s.required,
              helpUrl: s.helpUrl,
              inputs: s.inputs.map((inp) => ({
                id: inp.id,
                key: inp.key,
                label: inp.label,
                description: inp.description,
                inputType: inp.inputType,
                placeholder: inp.placeholder,
                helpUrl: inp.helpUrl,
                required: inp.required,
                validation: inp.validation,
                choices: inp.choices,
              })),
            }))}
          />

          <DeliverablesSection
            productId={product.id}
            initial={product.deliverables.map((d) => ({
              id: d.id,
              title: d.title,
              slug: d.slug,
              type: d.type,
              status: d.status,
              access: d.access,
              url: d.url,
              notes: d.notes,
              versionTag: d.versionTag,
              delivery: d.delivery
                ? {
                    method: d.delivery.method,
                    assetUrl: d.delivery.assetUrl,
                    ttlMinutes: d.delivery.ttlMinutes,
                    maxRedeems: d.delivery.maxRedeems,
                    repoOwner: d.delivery.repoOwner,
                    repoName: d.delivery.repoName,
                    externalUrl: d.delivery.externalUrl,
                    emailSubject: d.delivery.emailSubject,
                    emailBody: d.delivery.emailBody,
                  }
                : null,
            }))}
          />
        </>
      ) : null}

      <ContentSection
        productId={product.id}
        items={product.features}
        config={{
          title: "Features (Highlights)",
          type: "feature",
          fields: [
            { key: "icon", label: "Icon (lucide name)", placeholder: "Sparkles" },
            { key: "title", label: "Title", required: true },
            { key: "desc", label: "Description", type: "textarea", required: true, rows: 3 },
          ],
        }}
      />

      <ContentSection
        productId={product.id}
        items={product.integrations}
        config={{
          title: "Integrations",
          type: "integration",
          fields: [
            { key: "name", label: "Name", required: true },
            { key: "purpose", label: "Purpose", type: "textarea", required: true, rows: 2 },
            { key: "required", label: "Required?", type: "bool" },
          ],
        }}
      />

      {!guide ? (
        <ContentSection
          productId={product.id}
          items={product.dependencies}
          config={{
            title: "Tech stack & dependencies",
            type: "dependency",
            fields: [
              { key: "name", label: "Name", required: true, placeholder: "Next.js 16" },
              { key: "purpose", label: "Purpose", placeholder: "React framework (App Router)" },
              { key: "version", label: "Version", placeholder: "^16.0.0" },
              { key: "category", label: "Category", type: "select", choices: ["framework", "runtime", "library", "service", "tooling", "other"] },
              { key: "homepageUrl", label: "Homepage URL", type: "url" },
              { key: "required", label: "Required?", type: "bool" },
            ],
          }}
        />
      ) : null}

      <ContentSection
        productId={product.id}
        items={product.assets}
        config={{
          title: "Full breakdown (assets)",
          type: "asset",
          fields: [
            { key: "label", label: "Label", required: true },
            { key: "detail", label: "Detail", type: "textarea", required: true, rows: 2 },
          ],
        }}
      />

      <ContentSection
        productId={product.id}
        items={product.howItWorks}
        config={{
          title: "How it works",
          type: "how-step",
          fields: [
            { key: "title", label: "Step title", required: true },
            { key: "desc", label: "Step description", type: "textarea", required: true, rows: 2 },
          ],
        }}
      />

      <ContentSection
        productId={product.id}
        items={product.faqs}
        config={{
          title: "FAQ",
          type: "faq",
          fields: [
            { key: "question", label: "Question", required: true },
            { key: "answer", label: "Answer (markdown supported)", type: "textarea", required: true, rows: 5 },
          ],
        }}
      />

      <ContentSection
        productId={product.id}
        items={product.highlights}
        config={{
          title: "Highlight stats",
          type: "highlight",
          fields: [
            { key: "value", label: "Value (big stat)", required: true, placeholder: "2 weeks" },
            { key: "label", label: "Label", required: true, placeholder: "Of plumbing work you skip" },
          ],
        }}
      />
    </div>
  );
}
