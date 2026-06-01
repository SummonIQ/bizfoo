"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

export type DeliveryMethod =
  | "EMAIL_LINK"
  | "GITHUB_INVITE"
  | "DIRECT_DOWNLOAD"
  | "EXTERNAL_LINK";

export type DeliveryConfigRow = {
  method: DeliveryMethod;
  assetUrl: string | null;
  ttlMinutes: number;
  maxRedeems: number | null;
  repoOwner: string | null;
  repoName: string | null;
  externalUrl: string | null;
  emailSubject: string | null;
  emailBody: string | null;
};

const METHOD_LABEL: Record<DeliveryMethod, string> = {
  EMAIL_LINK: "Email a time-limited link",
  GITHUB_INVITE: "Invite to private GitHub repo",
  DIRECT_DOWNLOAD: "Direct download (auth-gated by storefront)",
  EXTERNAL_LINK: "Hand off an external/private app link",
};

export function DeliveryConfigForm({
  deliverableId,
  initial,
}: {
  deliverableId: string;
  initial: DeliveryConfigRow | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [method, setMethod] = useState<DeliveryMethod>(
    initial?.method ?? "EMAIL_LINK",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const data = new FormData(e.currentTarget);
    const body = {
      method,
      assetUrl: (data.get("assetUrl") as string) || null,
      ttlMinutes: Number(data.get("ttlMinutes")) || 1440,
      maxRedeems:
        Number(data.get("maxRedeems")) > 0
          ? Number(data.get("maxRedeems"))
          : null,
      repoOwner: (data.get("repoOwner") as string) || null,
      repoName: (data.get("repoName") as string) || null,
      externalUrl: (data.get("externalUrl") as string) || null,
      emailSubject: (data.get("emailSubject") as string) || null,
      emailBody: (data.get("emailBody") as string) || null,
    };

    const res = await fetch(`/api/deliverables/${deliverableId}/delivery`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Save failed");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-foreground/70 hover:bg-muted hover:text-foreground"
        >
          <Truck className="size-3" />
          {initial
            ? `Delivery: ${METHOD_LABEL[initial.method]}`
            : "Configure delivery"}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4"
        >
          <Field label="Delivery method">
            <select
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as DeliveryMethod)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="EMAIL_LINK">{METHOD_LABEL.EMAIL_LINK}</option>
              <option value="GITHUB_INVITE">
                {METHOD_LABEL.GITHUB_INVITE}
              </option>
              <option value="DIRECT_DOWNLOAD">
                {METHOD_LABEL.DIRECT_DOWNLOAD}
              </option>
              <option value="EXTERNAL_LINK">
                {METHOD_LABEL.EXTERNAL_LINK}
              </option>
            </select>
          </Field>

          {(method === "EMAIL_LINK" || method === "DIRECT_DOWNLOAD") && (
            <>
              <Field
                label="Asset URL"
                hint="The underlying file (Vercel Blob, S3, etc.). bizfoo proxies grants through this."
              >
                <Input
                  name="assetUrl"
                  type="url"
                  defaultValue={initial?.assetUrl ?? ""}
                  placeholder="https://blob.vercel-storage.com/..."
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Link TTL (minutes)"
                  hint="0 = never expires. Default 1440 = 24h."
                >
                  <Input
                    name="ttlMinutes"
                    type="number"
                    min={0}
                    max={10080}
                    defaultValue={initial?.ttlMinutes ?? 1440}
                  />
                </Field>
                <Field
                  label="Max redeems per grant"
                  hint="Blank = unlimited. Use 1 for one-time downloads."
                >
                  <Input
                    name="maxRedeems"
                    type="number"
                    min={0}
                    defaultValue={initial?.maxRedeems ?? ""}
                  />
                </Field>
              </div>
            </>
          )}

          {method === "GITHUB_INVITE" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Repo owner">
                <Input
                  name="repoOwner"
                  defaultValue={initial?.repoOwner ?? ""}
                  placeholder="bright-and-early"
                />
              </Field>
              <Field label="Repo name">
                <Input
                  name="repoName"
                  defaultValue={initial?.repoName ?? ""}
                  placeholder="bizfoo-margin-author-suite"
                />
              </Field>
            </div>
          )}

          {method === "EXTERNAL_LINK" && (
            <Field label="External/private app URL">
              <Input
                name="externalUrl"
                type="url"
                defaultValue={initial?.externalUrl ?? ""}
                placeholder="https://tech-lead-toolkit.summoniq.com"
              />
            </Field>
          )}

          {(method === "EMAIL_LINK" || method === "GITHUB_INVITE") && (
            <>
              <Field label="Email subject (optional)">
                <Input
                  name="emailSubject"
                  defaultValue={initial?.emailSubject ?? ""}
                  placeholder="Your purchase is ready"
                />
              </Field>
              <Field label="Email body (optional)">
                <Textarea
                  name="emailBody"
                  defaultValue={initial?.emailBody ?? ""}
                  placeholder="Thanks for your purchase. Click below to access..."
                />
              </Field>
            </>
          )}

          {err ? (
            <div className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {err}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save delivery
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
