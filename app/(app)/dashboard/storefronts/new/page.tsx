"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackAndFlush } from "@/lib/analytics/client";

export default function NewStorefrontPage() {
  const router = useRouter();
  const { track } = useAnalytics();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/storefronts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        slug: data.get("slug"),
        description: data.get("description"),
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to create storefront");
      track("storefront_create_failed", {
        status: res.status,
        reason: "api_error",
      });
      setSubmitting(false);
      return;
    }
    const j = await res.json();
    await trackAndFlush(track, "storefront_created", {
      storefront_id: j.id,
      slug: String(j.slug ?? data.get("slug") ?? ""),
      has_description: Boolean(data.get("description")),
    });
    router.push(`/dashboard/storefronts/${j.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">New storefront</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Set the basics. You can add products on the next screen.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Name" hint="Shown to your customers.">
              <Input name="name" required placeholder="SummonIQ Store" />
            </Field>
            <Field
              label="Slug"
              hint="URL-safe identifier used in the public API."
            >
              <Input
                name="slug"
                required
                pattern="[a-z0-9\-]+"
                placeholder="summoniq"
              />
            </Field>
            <Field label="Description" hint="Optional, shown on summary cards.">
              <Textarea
                name="description"
                placeholder="Templates, boilerplates, integrations..."
              />
            </Field>
            {error ? (
              <div className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
                {error}
              </div>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create storefront"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
