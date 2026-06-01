"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  Circle,
  CirclePlus,
  Clock,
  ExternalLink,
  FileCode,
  FileText,
  Film,
  Globe,
  Loader2,
  Pencil,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { List, ListEmpty, ListItem } from "@/components/ui/list";
import { FormPanel, ErrorBanner } from "@/components/ui/form-panel";
import {
  DeliveryConfigForm,
  type DeliveryConfigRow,
} from "./delivery-config-form";

type DeliverableType = "REPO" | "FILE" | "DOC" | "VIDEO" | "LINK";
type DeliverableStatus = "DRAFT" | "IN_PROGRESS" | "READY" | "ARCHIVED";
type DeliverableAccess = "PUBLIC" | "BUYERS_ONLY" | "ADMIN_ONLY";

export type DeliverableRow = {
  id: string;
  title: string;
  slug: string;
  type: DeliverableType;
  status: DeliverableStatus;
  access: DeliverableAccess;
  url: string | null;
  notes: string | null;
  versionTag: string | null;
  delivery: DeliveryConfigRow | null;
};

const typeIcon: Record<DeliverableType, React.ComponentType<{ className?: string }>> = {
  REPO: FileCode,
  FILE: FileText,
  DOC: FileText,
  VIDEO: Film,
  LINK: Globe,
};

const statusTone: Record<
  DeliverableStatus,
  { tone: "neutral" | "brand" | "success" | "warning"; icon: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: { tone: "neutral", icon: Circle },
  IN_PROGRESS: { tone: "warning", icon: Wrench },
  READY: { tone: "success", icon: CheckCircle2 },
  ARCHIVED: { tone: "neutral", icon: Archive },
};

export function DeliverablesSection({
  productId,
  initial,
}: {
  productId: string;
  initial: DeliverableRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deliverables</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setAdding((s) => !s);
            setEditingId(null);
          }}
        >
          {adding ? (
            <>
              <X className="size-4" />
              Close
            </>
          ) : (
            <>
              <CirclePlus className="size-4" />
              Add deliverable
            </>
          )}
        </Button>
      </CardHeader>
      <CardBody className="p-0">
        {adding ? (
          <DeliverableForm
            productId={productId}
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              refresh();
            }}
          />
        ) : null}

        {items.length === 0 ? (
          <ListEmpty className="m-5">
            Nothing yet. Add a repo link, downloadable file, doc, or video.
          </ListEmpty>
        ) : (
          <List className="rounded-none border-x-0 border-b-0">
            {items.map((d) => {
              const Icon = typeIcon[d.type];
              const StatusIcon = statusTone[d.status].icon;
              const isEditing = editingId === d.id;
              return (
                <ListItem key={d.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-400/15 font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                        {d.title.charAt(0)}
                      </div>
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-400/15 text-brand-600 dark:text-brand-300">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate font-medium text-foreground">
                            {d.title}
                          </div>
                          <Badge tone={statusTone[d.status].tone}>
                            <StatusIcon className="mr-1 size-3" />
                            {d.status.replace("_", " ").toLowerCase()}
                          </Badge>
                          <Badge tone={d.access === "PUBLIC" ? "success" : d.access === "BUYERS_ONLY" ? "brand" : "neutral"}>
                            {d.access.replace("_", " ").toLowerCase()}
                          </Badge>
                          {d.versionTag ? (
                            <span className="font-mono text-xs text-muted-foreground">
                              {d.versionTag}
                            </span>
                          ) : null}
                        </div>
                        {d.url ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-600 dark:hover:text-brand-300"
                          >
                            {d.url.replace(/^https?:\/\//, "").slice(0, 60)}
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <div className="mt-1 text-xs italic text-muted-foreground/70">
                            no URL yet
                          </div>
                        )}
                        {d.notes ? (
                          <p className="mt-1 text-xs text-muted-foreground">{d.notes}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditingId(isEditing ? null : d.id)
                        }
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <DeleteButton
                        deliverableId={d.id}
                        onDeleted={() => {
                          setItems((cur) => cur.filter((x) => x.id !== d.id));
                          refresh();
                        }}
                      />
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="mt-4 border-t border-border pt-4">
                      <DeliverableForm
                        productId={productId}
                        existing={d}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null);
                          refresh();
                        }}
                      />
                    </div>
                  ) : (
                    <DeliveryConfigForm
                      deliverableId={d.id}
                      initial={d.delivery}
                    />
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </CardBody>
    </Card>
  );
}

function DeliverableForm({
  productId,
  existing,
  onCancel,
  onSaved,
}: {
  productId: string;
  existing?: DeliverableRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const data = new FormData(e.currentTarget);
    const body = {
      title: data.get("title") as string,
      slug: data.get("slug") as string,
      type: data.get("type") as DeliverableType,
      status: data.get("status") as DeliverableStatus,
      access: data.get("access") as DeliverableAccess,
      url: (data.get("url") as string) || null,
      notes: (data.get("notes") as string) || null,
      versionTag: (data.get("versionTag") as string) || null,
    };
    const res = await fetch(
      existing
        ? `/api/deliverables/${existing.id}`
        : `/api/products/${productId}/deliverables`,
      {
        method: existing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(existing ? { ...body, slug: undefined } : body),
      },
    );
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Save failed");
      setBusy(false);
      return;
    }
    setBusy(false);
    onSaved();
  }

  return (
    <FormPanel onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <Input
            name="title"
            required
            defaultValue={existing?.title}
            placeholder="Source repository"
          />
        </Field>
        <Field label="Slug">
          <Input
            name="slug"
            required={!existing}
            disabled={Boolean(existing)}
            pattern="[a-z0-9\-]+"
            defaultValue={existing?.slug}
            placeholder="repo"
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Type">
          <select
            name="type"
            defaultValue={existing?.type ?? "REPO"}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="REPO">Git repo</option>
            <option value="FILE">Downloadable file</option>
            <option value="DOC">Documentation</option>
            <option value="VIDEO">Video</option>
            <option value="LINK">External link</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={existing?.status ?? "DRAFT"}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="DRAFT">Draft</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="READY">Ready</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>
        <Field label="Access">
          <select
            name="access"
            defaultValue={existing?.access ?? "BUYERS_ONLY"}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="BUYERS_ONLY">Buyers only</option>
            <option value="PUBLIC">Public</option>
            <option value="ADMIN_ONLY">Admin only</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Field label="URL" hint="Repo, file, video, or external resource.">
          <Input
            name="url"
            type="url"
            defaultValue={existing?.url ?? ""}
            placeholder="https://github.com/your-org/your-repo"
          />
        </Field>
        <Field label="Version" hint="e.g. v0.1.0">
          <Input
            name="versionTag"
            defaultValue={existing?.versionTag ?? ""}
            placeholder="v0.1.0"
          />
        </Field>
      </div>
      <Field label="Notes" hint="Internal notes — not shown to buyers.">
        <Textarea name="notes" defaultValue={existing?.notes ?? ""} />
      </Field>
      <ErrorBanner>{err}</ErrorBanner>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
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
              {existing ? "Save changes" : "Create"}
            </>
          )}
        </Button>
      </div>
    </FormPanel>
  );
}

function DeleteButton({
  deliverableId,
  onDeleted,
}: {
  deliverableId: string;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this deliverable?")) return;
    setBusy(true);
    const res = await fetch(`/api/deliverables/${deliverableId}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (res.ok) onDeleted();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={busy}>
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5 text-rose-600 dark:text-rose-400" />
      )}
    </Button>
  );
}
