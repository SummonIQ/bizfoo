"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackAndFlush } from "@/lib/analytics/client";

const categories = [
  "templates",
  "boilerplates",
  "integrations",
  "design-systems",
  "courses",
  "other",
];

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { track } = useAnalytics();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await fetch(`/api/storefronts/${params.id}/products`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        slug: data.get("slug"),
        tagline: data.get("tagline"),
        description: data.get("description"),
        category: data.get("category"),
        badge: data.get("badge"),
        stack: (data.get("stack") as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        priceAmount: Number(data.get("priceAmount")),
        priceInterval: data.get("priceInterval"),
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to create product");
      track("product_create_failed", {
        status: res.status,
        reason: "api_error",
        storefront_id: params.id,
      });
      setSubmitting(false);
      return;
    }
    const j = await res.json();
    await trackAndFlush(track, "product_created", {
      product_id: j.id,
      storefront_id: params.id,
      slug: String(j.slug ?? data.get("slug") ?? ""),
      category: String(data.get("category") ?? ""),
      billing_interval: String(data.get("priceInterval") ?? ""),
      price_amount: Number(data.get("priceAmount")),
      has_badge: Boolean(data.get("badge")),
    });
    router.push(`/dashboard/storefronts/${params.id}/products/${j.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">New product</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Name">
              <Input name="name" required placeholder="Next.js SaaS Starter" />
            </Field>
            <Field label="Slug" hint="URL-safe, unique within this storefront.">
              <Input
                name="slug"
                required
                pattern="[a-z0-9\-]+"
                placeholder="nextjs-saas-starter"
              />
            </Field>
            <Field label="Tagline">
              <Input name="tagline" placeholder="One-line pitch" />
            </Field>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select
                  name="category"
                  className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  defaultValue="templates"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Badge" hint="Optional: new, popular, updated.">
                <Input name="badge" placeholder="popular" />
              </Field>
            </div>
            <Field label="Stack" hint="Comma-separated tech tags.">
              <Input name="stack" placeholder="Next.js, Prisma, Stripe" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (USD)" hint="Whole dollars; e.g. 99.">
                <Input
                  type="number"
                  name="priceAmount"
                  required
                  min={0}
                  step={1}
                  placeholder="99"
                />
              </Field>
              <Field label="Billing">
                <select
                  name="priceInterval"
                  defaultValue="ONE_TIME"
                  className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="ONE_TIME">One-time</option>
                  <option value="MONTH">Per month</option>
                  <option value="YEAR">Per year</option>
                </select>
              </Field>
            </div>
            {error ? (
              <div className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
                {error}
              </div>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create product"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
