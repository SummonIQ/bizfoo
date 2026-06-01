"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  CirclePlus,
  ExternalLink,
  Loader2,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { List, ListEmpty } from "@/components/ui/list";
import { SectionHeading } from "@/components/ui/section-heading";
import { FormPanel, ErrorBanner } from "@/components/ui/form-panel";

export type SetupInputType =
  | "TEXT"
  | "SECRET"
  | "URL"
  | "EMAIL"
  | "COLOR"
  | "BOOLEAN"
  | "CHOICE"
  | "FILE"
  | "INTEGRATION";

export type SetupInputRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  inputType: SetupInputType;
  placeholder: string | null;
  helpUrl: string | null;
  required: boolean;
  validation: string | null;
  choices: string[];
};

export type SetupStepRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  required: boolean;
  helpUrl: string | null;
  inputs: SetupInputRow[];
};

const INPUT_TYPES: SetupInputType[] = [
  "TEXT",
  "SECRET",
  "URL",
  "EMAIL",
  "COLOR",
  "BOOLEAN",
  "CHOICE",
  "FILE",
  "INTEGRATION",
];

export function SetupGuideSection({
  productId,
  initial,
}: {
  productId: string;
  initial: SetupStepRow[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Settings2 className="size-4 text-brand-600 dark:text-brand-300" />
            Buyer setup guide
          </span>
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAdding((s) => !s)}
        >
          {adding ? (
            <>
              <X className="size-4" />
              Close
            </>
          ) : (
            <>
              <CirclePlus className="size-4" />
              Add step
            </>
          )}
        </Button>
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          What the buyer needs to do <em>after</em> purchase to make this
          product theirs. Each step can collect typed inputs (env vars, brand
          assets, integration keys) — these get rendered as a checklist on
          the storefront's grant access page.
        </p>

        {adding ? (
          <StepForm
            productId={productId}
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              router.refresh();
            }}
          />
        ) : null}

        {initial.length === 0 ? (
          <ListEmpty>
            No setup steps yet. Add one to start building the buyer's onboarding
            checklist.
          </ListEmpty>
        ) : (
          <List>
            {initial.map((step, i) => (
              <StepRow
                key={step.id}
                productId={productId}
                index={i + 1}
                step={step}
              />
            ))}
          </List>
        )}
      </CardBody>
    </Card>
  );
}

function StepRow({
  productId,
  index,
  step,
}: {
  productId: string;
  index: number;
  step: SetupStepRow;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingInput, setAddingInput] = useState(false);

  return (
    <li>
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-0.5 text-muted-foreground hover:text-foreground"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-400/15 font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-300">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium text-foreground">
              {step.title}
            </div>
            {step.category ? (
              <Badge tone="neutral">{step.category}</Badge>
            ) : null}
            {!step.required ? (
              <Badge tone="neutral">optional</Badge>
            ) : null}
            <Badge tone="brand">
              {step.inputs.length} input{step.inputs.length === 1 ? "" : "s"}
            </Badge>
          </div>
          {step.description ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {step.description}
            </p>
          ) : null}
          {step.helpUrl ? (
            <a
              href={step.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-300 hover:underline"
            >
              Docs
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing((s) => !s)}>
            Edit
          </Button>
          <DeleteStepButton stepId={step.id} onDeleted={() => router.refresh()} />
        </div>
      </div>

      {editing ? (
        <div className="border-t border-border p-3">
          <StepForm
            productId={productId}
            existing={step}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              router.refresh();
            }}
          />
        </div>
      ) : null}

      {open ? (
        <div className="border-t border-border bg-muted/40 p-3">
          <SectionHeading
            title="Inputs the buyer must provide"
            action={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAddingInput((s) => !s)}
              >
                {addingInput ? (
                  <>
                    <X className="size-3.5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <CirclePlus className="size-3.5" />
                    Add input
                  </>
                )}
              </Button>
            }
          />

          {addingInput ? (
            <div className="mb-2">
              <InputForm
                stepId={step.id}
                onCancel={() => setAddingInput(false)}
                onSaved={() => {
                  setAddingInput(false);
                  router.refresh();
                }}
              />
            </div>
          ) : null}

          {step.inputs.length === 0 ? (
            <ListEmpty className="px-3 py-3 text-[11px]">
              No inputs yet. Add the env vars, keys, or brand fields the buyer
              should supply.
            </ListEmpty>
          ) : (
            <List>
              {step.inputs.map((inp) => (
                <InputRow
                  key={inp.id}
                  input={inp}
                  onChanged={() => router.refresh()}
                />
              ))}
            </List>
          )}
        </div>
      ) : null}
    </li>
  );
}

function InputRow({
  input,
  onChanged,
}: {
  input: SetupInputRow;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="bg-surface px-3 py-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <code className="font-mono text-[11px] text-foreground">
              {input.key}
            </code>
            <Badge tone="neutral">{input.inputType.toLowerCase()}</Badge>
            {!input.required ? <Badge tone="neutral">optional</Badge> : null}
          </div>
          <div className="mt-0.5 text-xs text-foreground/80">{input.label}</div>
          {input.description ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {input.description}
            </p>
          ) : null}
          {input.helpUrl ? (
            <a
              href={input.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-brand-600 dark:text-brand-300 hover:underline"
            >
              Where to find this
              <ExternalLink className="size-2.5" />
            </a>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button size="sm" variant="ghost" onClick={() => setEditing((s) => !s)}>
            Edit
          </Button>
          <DeleteInputButton
            inputId={input.id}
            onDeleted={onChanged}
          />
        </div>
      </div>
      {editing ? (
        <div className="mt-2 border-t border-border pt-2">
          <InputForm
            stepId={null}
            existing={input}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              onChanged();
            }}
          />
        </div>
      ) : null}
    </li>
  );
}

function StepForm({
  productId,
  existing,
  onCancel,
  onSaved,
}: {
  productId: string;
  existing?: SetupStepRow;
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
      title: data.get("title"),
      description: (data.get("description") as string) || null,
      category: (data.get("category") as string) || null,
      required: data.get("required") === "on",
      helpUrl: (data.get("helpUrl") as string) || null,
    };
    const res = await fetch(
      existing
        ? `/api/setup-steps/${existing.id}`
        : `/api/products/${productId}/setup-steps`,
      {
        method: existing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Save failed");
      return;
    }
    onSaved();
  }

  return (
    <FormPanel onSubmit={handleSubmit} className="p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <Field label="Step title">
          <Input
            name="title"
            required
            defaultValue={existing?.title}
            placeholder="Connect Stripe"
          />
        </Field>
        <Field label="Category" hint="Branding, Integrations, Content...">
          <Input
            name="category"
            defaultValue={existing?.category ?? ""}
            placeholder="Integrations"
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          name="description"
          defaultValue={existing?.description ?? ""}
          placeholder="What the buyer is doing in this step + why."
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field label="Help URL" hint="Docs link or video walkthrough.">
          <Input
            name="helpUrl"
            type="url"
            defaultValue={existing?.helpUrl ?? ""}
            placeholder="https://stripe.com/docs/keys"
          />
        </Field>
        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            name="required"
            defaultChecked={existing?.required ?? true}
            className="size-4"
          />
          <span className="text-sm text-foreground/80">Required</span>
        </label>
      </div>
      <ErrorBanner>{err}</ErrorBanner>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {existing ? "Save" : "Add step"}
        </Button>
      </div>
    </FormPanel>
  );
}

function InputForm({
  stepId,
  existing,
  onCancel,
  onSaved,
}: {
  stepId: string | null;
  existing?: SetupInputRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [type, setType] = useState<SetupInputType>(
    existing?.inputType ?? "TEXT",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const data = new FormData(e.currentTarget);
    const choices = ((data.get("choices") as string) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = {
      key: data.get("key"),
      label: data.get("label"),
      description: (data.get("description") as string) || null,
      inputType: type,
      placeholder: (data.get("placeholder") as string) || null,
      helpUrl: (data.get("helpUrl") as string) || null,
      required: data.get("required") === "on",
      validation: (data.get("validation") as string) || null,
      choices,
    };
    const res = await fetch(
      existing
        ? `/api/setup-inputs/${existing.id}`
        : `/api/setup-steps/${stepId}/inputs`,
      {
        method: existing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(existing ? { ...body, key: undefined } : body),
      },
    );
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Save failed");
      return;
    }
    onSaved();
  }

  return (
    <FormPanel onSubmit={handleSubmit} className="p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Key"
          hint="Env var name or property path. Disabled when editing."
        >
          <Input
            name="key"
            required={!existing}
            disabled={Boolean(existing)}
            defaultValue={existing?.key}
            placeholder="STRIPE_PUBLISHABLE_KEY"
          />
        </Field>
        <Field label="Label">
          <Input
            name="label"
            required
            defaultValue={existing?.label}
            placeholder="Stripe publishable key"
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <Field label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SetupInputType)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            {INPUT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toLowerCase()}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Placeholder">
          <Input
            name="placeholder"
            defaultValue={existing?.placeholder ?? ""}
            placeholder="pk_live_..."
          />
        </Field>
      </div>
      <Field label="Description / instructions">
        <Textarea
          name="description"
          defaultValue={existing?.description ?? ""}
          placeholder="Where to find this and what it does."
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Help URL" hint="Where to find this value.">
          <Input
            name="helpUrl"
            type="url"
            defaultValue={existing?.helpUrl ?? ""}
            placeholder="https://dashboard.stripe.com/apikeys"
          />
        </Field>
        <Field label="Validation regex (optional)">
          <Input
            name="validation"
            defaultValue={existing?.validation ?? ""}
            placeholder="^pk_(test|live)_"
          />
        </Field>
      </div>
      {type === "CHOICE" ? (
        <Field label="Choices" hint="Comma-separated.">
          <Input
            name="choices"
            defaultValue={existing?.choices.join(", ") ?? ""}
            placeholder="us, eu, apac"
          />
        </Field>
      ) : null}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="required"
          defaultChecked={existing?.required ?? true}
          className="size-4"
        />
        <span className="text-sm text-foreground/80">Required</span>
      </label>
      <ErrorBanner>{err}</ErrorBanner>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {existing ? "Save" : "Add input"}
        </Button>
      </div>
    </FormPanel>
  );
}

function DeleteStepButton({
  stepId,
  onDeleted,
}: {
  stepId: string;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this step (and its inputs)?")) return;
        setBusy(true);
        const r = await fetch(`/api/setup-steps/${stepId}`, { method: "DELETE" });
        setBusy(false);
        if (r.ok) onDeleted();
      }}
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5 text-rose-600 dark:text-rose-400" />
      )}
    </Button>
  );
}

function DeleteInputButton({
  inputId,
  onDeleted,
}: {
  inputId: string;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this input?")) return;
        setBusy(true);
        const r = await fetch(`/api/setup-inputs/${inputId}`, { method: "DELETE" });
        setBusy(false);
        if (r.ok) onDeleted();
      }}
    >
      {busy ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Trash2 className="size-3 text-rose-600" />
      )}
    </Button>
  );
}
