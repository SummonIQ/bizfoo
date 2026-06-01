"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/form-panel";
import { PlateMarkdownEditor } from "@/components/ui/plate-markdown-editor";
import { cn } from "@/lib/cn";

export type ProductBasics = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  longDescription: string | null;
  category: string | null;
  badge: string | null;
  stack: string[];
  relatedSlugs: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  codeSampleLang: string | null;
  codeSampleFile: string | null;
  codeSampleCode: string | null;
};

export function ProductBasicsForm({
  product,
  mode = "default",
  categoryOptions,
}: {
  product: ProductBasics;
  mode?: "default" | "guide";
  categoryOptions: string[];
}) {
  const router = useRouter();
  const isGuide = mode === "guide";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setSaved(false);
    const data = new FormData(e.currentTarget);
    const stackStr = (data.get("stack") as string).trim();
    const relStr = (data.get("relatedSlugs") as string).trim();
    const body = {
      name: (data.get("name") as string).trim(),
      tagline: (data.get("tagline") as string) || null,
      description: (data.get("description") as string) || null,
      longDescription: (data.get("longDescription") as string) || null,
      category: (data.get("category") as string) || null,
      badge: (data.get("badge") as string) || null,
      stack: stackStr ? stackStr.split(/,\s*/).filter(Boolean) : [],
      relatedSlugs: relStr ? relStr.split(/,\s*/).filter(Boolean) : [],
      repoUrl: (data.get("repoUrl") as string) || null,
      demoUrl: (data.get("demoUrl") as string) || null,
      codeSampleLang: (data.get("codeSampleLang") as string) || null,
      codeSampleFile: (data.get("codeSampleFile") as string) || null,
      codeSampleCode: (data.get("codeSampleCode") as string) || null,
    };
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
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
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product basics</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid w-full max-w-full gap-3 sm:w-fit sm:grid-cols-[24rem_16rem]">
            <Field label="Name">
              <Input name="name" required defaultValue={product.name} />
            </Field>
            <Field label="Category">
              <CategoryField
                name="category"
                value={product.category ?? ""}
                options={categoryOptions}
              />
            </Field>
          </div>
          <Field label="Tagline" hint="One short sentence shown under the title.">
            <Input name="tagline" defaultValue={product.tagline ?? ""} />
          </Field>
          <Field label="Short description" hint="One paragraph shown on the store listing.">
            <Textarea name="description" rows={2} defaultValue={product.description ?? ""} />
          </Field>
          <Field label="Long description" hint="Supports ## subheads, - bullets, **bold**, `code`.">
            <PlateMarkdownEditor
              name="longDescription"
              defaultValue={product.longDescription ?? ""}
              mode="internal"
              size="sm"
              preview="rich"
              placeholder="Write the full product description..."
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Badge" hint="e.g. popular / new / updated — shown as a pill next to the title.">
              <Input name="badge" defaultValue={product.badge ?? ""} />
            </Field>
            <Field label="Related slugs" hint="Comma-separated slugs to cross-link.">
              <Input name="relatedSlugs" defaultValue={(product.relatedSlugs ?? []).join(", ")} />
            </Field>
          </div>
          <Field
            label="Stack"
            hint={
              isGuide
                ? "Comma-separated tags for the guide surface."
                : "Comma-separated. Also feeds the Tech stack section."
            }
          >
            <Input name="stack" defaultValue={(product.stack ?? []).join(", ")} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            {!isGuide ? (
              <Field label="Repo URL">
                <Input name="repoUrl" type="url" defaultValue={product.repoUrl ?? ""} />
              </Field>
            ) : null}
            <Field label={isGuide ? "Sample URL" : "Demo URL"}>
              <Input name="demoUrl" type="url" defaultValue={product.demoUrl ?? ""} />
            </Field>
          </div>
          {!isGuide ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Code sample language">
                  <Input name="codeSampleLang" defaultValue={product.codeSampleLang ?? ""} placeholder="typescript" />
                </Field>
                <Field label="Code sample filename">
                  <Input name="codeSampleFile" defaultValue={product.codeSampleFile ?? ""} placeholder="app/api/.../route.ts" />
                </Field>
              </div>
              <Field label="Code sample">
                <Textarea name="codeSampleCode" rows={8} defaultValue={product.codeSampleCode ?? ""} />
              </Field>
            </>
          ) : null}
          <ErrorBanner>{err}</ErrorBanner>
          <div className="flex items-center justify-end gap-2">
            {saved ? <span className="text-xs text-emerald-400">Saved</span> : null}
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? <><Loader2 className="size-4 animate-spin" /> Saving</> : <><Save className="size-4" /> Save</>}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function CategoryField({
  name,
  value,
  options,
}: {
  name: string;
  value: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const normalizedOptions = useMemo(() => {
    const values = new Set(options.filter(Boolean));
    if (selected) values.add(selected);
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [options, selected]);

  function handleCreate() {
    const next = draft.trim();
    if (!next) return;
    setSelected(next);
    setDraft("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between rounded-[0.45rem] border border-border bg-input px-3 text-left text-sm text-foreground transition-colors hover:border-foreground/20"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected || "Select category"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-lg border border-border bg-background/95 p-1 shadow-2xl shadow-black/35 backdrop-blur-xl"
        >
          <div className="max-h-56 overflow-y-auto">
            {normalizedOptions.map((option) => {
              const active = option === selected;

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-brand-400/15 text-brand-700 dark:text-brand-300"
                      : "text-foreground/85 hover:bg-muted",
                  )}
                  onClick={() => {
                    setSelected(option);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{option}</span>
                  {active ? <Check className="size-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-1 border-t border-border px-1 pt-2">
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                placeholder="New category"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleCreate();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleCreate}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
