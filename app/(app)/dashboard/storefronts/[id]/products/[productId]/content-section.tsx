"use client";

// Generic product-content list editor. Drives all 7 content types
// (features, integrations, assets, how-steps, faqs, highlights, dependencies)
// from a single config-driven component.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { FormPanel, ErrorBanner } from "@/components/ui/form-panel";

type FieldType = "text" | "textarea" | "bool" | "select" | "url";

type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  choices?: string[];
};

export type ContentConfig<T extends { id: string }> = {
  title: string;
  type:
    | "feature"
    | "integration"
    | "asset"
    | "how-step"
    | "faq"
    | "highlight"
    | "dependency";
  fields: FieldDef[];
};

export function ContentSection<T extends { id: string } & Record<string, unknown>>({
  productId,
  config,
  items,
}: {
  productId: string;
  config: ContentConfig<T>;
  items: T[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => router.refresh();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setAdding((s) => !s); setEditingId(null); }}
        >
          {adding ? (<><X className="size-4" /> Close</>) : (<><CirclePlus className="size-4" /> Add</>)}
        </Button>
      </CardHeader>
      <CardBody className="p-0">
        {adding ? (
          <div className="border-b border-border">
            <ItemForm
              productId={productId}
              config={config}
              onCancel={() => setAdding(false)}
              onSaved={() => { setAdding(false); refresh(); }}
            />
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nothing yet. Click <span className="font-medium">Add</span> to create the first one.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <li key={item.id} className="px-5 py-3">
                  {isEditing ? (
                    <ItemForm
                      productId={productId}
                      config={config}
                      existing={item}
                      onCancel={() => setEditingId(null)}
                      onSaved={() => { setEditingId(null); refresh(); }}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <ContentPreview type={config.type} item={item} />
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(item.id)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <DeleteButton
                          productId={productId}
                          type={config.type}
                          itemId={item.id}
                          onDeleted={refresh}
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function ContentPreview({
  type,
  item,
}: {
  type: ContentConfig<{ id: string }>["type"];
  item: Record<string, unknown>;
}) {
  switch (type) {
    case "feature":
      return (
        <div>
          <div className="flex items-center gap-2">
            {item.icon ? (
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {String(item.icon)}
              </span>
            ) : null}
            <span className="text-sm font-semibold">{String(item.title ?? "")}</span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {String(item.desc ?? "")}
          </div>
        </div>
      );
    case "integration": {
      const required = Boolean(item.required);
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{String(item.name ?? "")}</span>
            <span
              className={
                required
                  ? "rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] text-brand-600"
                  : "rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              }
            >
              {required ? "required" : "optional"}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {String(item.purpose ?? "")}
          </div>
        </div>
      );
    }
    case "dependency": {
      const required = Boolean(item.required);
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{String(item.name ?? "")}</span>
            {item.version ? (
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {String(item.version)}
              </span>
            ) : null}
            {item.category ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {String(item.category)}
              </span>
            ) : null}
            <span
              className={
                required
                  ? "rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] text-brand-600"
                  : "rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              }
            >
              {required ? "required" : "optional"}
            </span>
          </div>
          {item.purpose ? (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {String(item.purpose)}
            </div>
          ) : null}
        </div>
      );
    }
    case "asset":
      return (
        <div>
          <div className="text-sm font-semibold">{String(item.label ?? "")}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {String(item.detail ?? "")}
          </div>
        </div>
      );
    case "how-step":
      return (
        <div>
          <div className="text-sm font-semibold">{String(item.title ?? "")}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {String(item.desc ?? "")}
          </div>
        </div>
      );
    case "faq":
      return (
        <div>
          <div className="text-sm font-semibold">{String(item.question ?? "")}</div>
          <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {String(item.answer ?? "")}
          </div>
        </div>
      );
    case "highlight":
      return (
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-bold text-foreground">
            {String(item.value ?? "")}
          </span>
          <span className="text-xs text-muted-foreground">
            {String(item.label ?? "")}
          </span>
        </div>
      );
  }
}

function ItemForm<T extends { id: string } & Record<string, unknown>>({
  productId,
  config,
  existing,
  onCancel,
  onSaved,
}: {
  productId: string;
  config: ContentConfig<T>;
  existing?: T;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    for (const f of config.fields) {
      if (f.type === "bool") {
        data[f.key] = form.get(f.key) === "true";
      } else {
        const v = (form.get(f.key) as string) ?? "";
        data[f.key] = v === "" ? (f.required ? "" : null) : v;
      }
    }

    const url = existing
      ? `/api/products/${productId}/content/${existing.id}?type=${config.type}`
      : `/api/products/${productId}/content`;
    const method = existing ? "PATCH" : "POST";
    const body = existing ? data : { type: config.type, data };

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
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
      {config.fields.map((f) => (
        <Field key={f.key} label={f.label} hint={f.hint}>
          {f.type === "textarea" ? (
            <Textarea
              name={f.key}
              required={f.required}
              rows={f.rows ?? 3}
              placeholder={f.placeholder}
              defaultValue={(existing?.[f.key] as string) ?? ""}
            />
          ) : f.type === "bool" ? (
            <select
              name={f.key}
              defaultValue={String(existing?.[f.key] ?? false)}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : f.type === "select" ? (
            <select
              name={f.key}
              defaultValue={(existing?.[f.key] as string) ?? ""}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
            >
              <option value="">—</option>
              {f.choices?.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          ) : (
            <Input
              name={f.key}
              type={f.type === "url" ? "url" : "text"}
              required={f.required}
              placeholder={f.placeholder}
              defaultValue={(existing?.[f.key] as string) ?? ""}
            />
          )}
        </Field>
      ))}
      <ErrorBanner>{err}</ErrorBanner>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <><Loader2 className="size-4 animate-spin" /> Saving</> : <><Save className="size-4" /> {existing ? "Save" : "Create"}</>}
        </Button>
      </div>
    </FormPanel>
  );
}

function DeleteButton({
  productId,
  type,
  itemId,
  onDeleted,
}: {
  productId: string;
  type: string;
  itemId: string;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function handleDelete() {
    if (!confirm("Delete this item?")) return;
    setBusy(true);
    const res = await fetch(`/api/products/${productId}/content/${itemId}?type=${type}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) onDeleted();
  }
  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={busy}>
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5 text-rose-400" />}
    </Button>
  );
}
