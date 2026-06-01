"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Circle,
  CirclePlus,
  Clock,
  ExternalLink,
  GitBranch,
  GitFork,
  Loader2,
  Lightbulb,
  Pause,
  Save,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { List, ListItem, ListEmpty } from "@/components/ui/list";
import { SectionHeading } from "@/components/ui/section-heading";
import { FormPanel, Panel, ErrorBanner } from "@/components/ui/form-panel";

type Stage =
  | "IDEA"
  | "SPEC"
  | "SCAFFOLDED"
  | "IN_DEV"
  | "ALPHA"
  | "BETA"
  | "RELEASED";
type MilestoneStatus = "TODO" | "DOING" | "DONE" | "BLOCKED";

export type BuildPlanRow = {
  id: string | null; // null when no plan yet
  stage: Stage;
  problem: string | null;
  audience: string | null;
  outcome: string | null;
  scope: string | null;
  outOfScope: string | null;
  techNotes: string | null;
  repoUrl: string | null;
};

export type MilestoneRow = {
  id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  estimateHours: number | null;
  parentId: string | null;
};

const STAGES: Stage[] = [
  "IDEA",
  "SPEC",
  "SCAFFOLDED",
  "IN_DEV",
  "ALPHA",
  "BETA",
  "RELEASED",
];

const stageTone: Record<Stage, "neutral" | "brand" | "warning" | "success"> = {
  IDEA: "neutral",
  SPEC: "neutral",
  SCAFFOLDED: "brand",
  IN_DEV: "brand",
  ALPHA: "warning",
  BETA: "warning",
  RELEASED: "success",
};

const milestoneIcon: Record<MilestoneStatus, React.ComponentType<{ className?: string }>> = {
  TODO: Circle,
  DOING: Clock,
  DONE: CheckCircle2,
  BLOCKED: Pause,
};

const milestoneTone: Record<MilestoneStatus, "neutral" | "warning" | "success" | "danger"> = {
  TODO: "neutral",
  DOING: "warning",
  DONE: "success",
  BLOCKED: "danger",
};

export function BuildPlanSection({
  productId,
  initialPlan,
  initialMilestones,
}: {
  productId: string;
  initialPlan: BuildPlanRow;
  initialMilestones: MilestoneRow[];
}) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [scaffolding, setScaffolding] = useState(false);
  const [scaffoldErr, setScaffoldErr] = useState<string | null>(null);

  async function scaffold() {
    if (
      !confirm(
        "Create a private GitHub repo for this product, seed it with README + SPEC, and link it back as a deliverable?",
      )
    ) {
      return;
    }
    setScaffolding(true);
    setScaffoldErr(null);
    const res = await fetch(`/api/products/${productId}/scaffold`, {
      method: "POST",
    });
    setScaffolding(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setScaffoldErr(j.error ?? "Scaffold failed");
      return;
    }
    const j = (await res.json()) as { url: string };
    setPlan((p) => ({ ...p, repoUrl: j.url, stage: "SCAFFOLDED" }));
    router.refresh();
  }

  const stageIdx = STAGES.indexOf(plan.stage);
  const doneCount = milestones.filter((m) => m.status === "DONE").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Lightbulb className="size-4 text-brand-600 dark:text-brand-300" />
            Build plan
          </span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge tone={stageTone[plan.stage]}>{plan.stage.toLowerCase()}</Badge>
          {plan.repoUrl ? (
            <a
              href={plan.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground/80 hover:bg-muted"
            >
              <GitBranch className="size-3" />
              repo
              <ExternalLink className="size-3" />
            </a>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={scaffold}
              disabled={scaffolding}
            >
              {scaffolding ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Scaffolding...
                </>
              ) : (
                <>
                  <GitFork className="size-3.5" />
                  Scaffold to GitHub
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-6">
        <ErrorBanner>{scaffoldErr}</ErrorBanner>

        {/* Stage track */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Stage progress</span>
            <span>
              {stageIdx + 1} / {STAGES.length}
            </span>
          </div>
          <div className="flex gap-1">
            {STAGES.map((s, i) => (
              <div
                key={s}
                className={
                  i <= stageIdx
                    ? "h-1.5 flex-1 rounded-full bg-brand-500"
                    : "h-1.5 flex-1 rounded-full bg-muted"
                }
                title={s}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {STAGES.map((s) => (
              <span key={s} className={s === plan.stage ? "text-brand-600 dark:text-brand-300" : ""}>
                {s.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Spec view / edit */}
        {editing ? (
          <PlanEditor
            productId={productId}
            initial={plan}
            onCancel={() => setEditing(false)}
            onSaved={(next) => {
              setPlan(next);
              setEditing(false);
              router.refresh();
            }}
          />
        ) : (
          <PlanView plan={plan} onEdit={() => setEditing(true)} />
        )}

        {/* Milestones */}
        <div>
          <SectionHeading
            title="Milestones"
            meta={`${doneCount}/${milestones.length} done`}
            action={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAdding((s) => !s)}
              >
                <CirclePlus className="size-3.5" />
                Add milestone
              </Button>
            }
          />

          {adding ? (
            <div className="mb-2">
              <MilestoneAdd
                productId={productId}
                onCancel={() => setAdding(false)}
                onAdded={() => {
                  setAdding(false);
                  router.refresh();
                }}
              />
            </div>
          ) : null}

          {milestones.length === 0 ? (
            <ListEmpty>
              No milestones yet. Add one to start tracking progress.
            </ListEmpty>
          ) : (
            <MilestoneTree
              productId={productId}
              milestones={milestones}
              onChange={(next) => setMilestones(next)}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function PlanView({
  plan,
  onEdit,
}: {
  plan: BuildPlanRow;
  onEdit: () => void;
}) {
  const fields: Array<{ label: string; value: string | null }> = [
    { label: "Problem", value: plan.problem },
    { label: "Audience", value: plan.audience },
    { label: "Outcome", value: plan.outcome },
    { label: "In scope", value: plan.scope },
    { label: "Out of scope", value: plan.outOfScope },
    { label: "Tech notes", value: plan.techNotes },
  ];
  const filled = fields.filter((f) => f.value && f.value.trim().length > 0);

  return (
    <Panel>
      <SectionHeading
        title="Spec"
        action={
          <Button size="sm" variant="ghost" onClick={onEdit}>
            Edit
          </Button>
        }
      />
      {filled.length === 0 ? (
        <div className="text-xs italic text-muted-foreground">
          No spec yet. Fill it in to anchor the build.
        </div>
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          {filled.map((f) => (
            <div key={f.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {f.label}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

function PlanEditor({
  productId,
  initial,
  onCancel,
  onSaved,
}: {
  productId: string;
  initial: BuildPlanRow;
  onCancel: () => void;
  onSaved: (next: BuildPlanRow) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const data = new FormData(e.currentTarget);
    const body = {
      stage: data.get("stage") as Stage,
      problem: (data.get("problem") as string) || null,
      audience: (data.get("audience") as string) || null,
      outcome: (data.get("outcome") as string) || null,
      scope: (data.get("scope") as string) || null,
      outOfScope: (data.get("outOfScope") as string) || null,
      techNotes: (data.get("techNotes") as string) || null,
      repoUrl: (data.get("repoUrl") as string) || null,
    };
    const res = await fetch(`/api/products/${productId}/build-plan`, {
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
    onSaved({ ...initial, ...body, id: initial.id ?? "tmp" });
  }

  return (
    <FormPanel onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Stage">
          <select
            name="stage"
            defaultValue={initial.stage}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Repo URL">
          <Input
            name="repoUrl"
            type="url"
            defaultValue={initial.repoUrl ?? ""}
            placeholder="https://github.com/..."
          />
        </Field>
      </div>
      <Field label="Problem" hint="What pain does this solve?">
        <Textarea name="problem" defaultValue={initial.problem ?? ""} />
      </Field>
      <Field label="Audience">
        <Textarea name="audience" defaultValue={initial.audience ?? ""} />
      </Field>
      <Field label="Outcome" hint="What does success look like?">
        <Textarea name="outcome" defaultValue={initial.outcome ?? ""} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="In scope">
          <Textarea name="scope" defaultValue={initial.scope ?? ""} />
        </Field>
        <Field label="Out of scope">
          <Textarea name="outOfScope" defaultValue={initial.outOfScope ?? ""} />
        </Field>
      </div>
      <Field label="Tech notes">
        <Textarea name="techNotes" defaultValue={initial.techNotes ?? ""} />
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
              Save plan
            </>
          )}
        </Button>
      </div>
    </FormPanel>
  );
}

function MilestoneAdd({
  productId,
  parentId,
  onCancel,
  onAdded,
}: {
  productId: string;
  parentId?: string;
  onCancel: () => void;
  onAdded: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = new FormData(e.currentTarget);
    const res = await fetch(`/api/products/${productId}/milestones`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: data.get("title"),
        description: data.get("description") || null,
        estimateHours:
          Number(data.get("estimateHours")) > 0
            ? Number(data.get("estimateHours"))
            : null,
        parentId: parentId ?? null,
      }),
    });
    setBusy(false);
    if (res.ok) onAdded();
  }

  return (
    <FormPanel onSubmit={handleSubmit} className="gap-2 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
        <Input name="title" required placeholder="Milestone title" />
        <Input
          name="estimateHours"
          type="number"
          min={0}
          placeholder="hrs"
        />
      </div>
      <Input name="description" placeholder="Optional description" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Add
        </Button>
      </div>
    </FormPanel>
  );
}

function DeleteMilestone({
  milestoneId,
  onDeleted,
}: {
  milestoneId: string;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this milestone?")) return;
    setBusy(true);
    const res = await fetch(`/api/milestones/${milestoneId}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (res.ok) onDeleted();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={busy}>
      {busy ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Trash2 className="size-3 text-rose-600 dark:text-rose-400" />
      )}
    </Button>
  );
}

// ─── Hierarchical milestone tree (top-level + nested subtasks) ──

function MilestoneTree({
  productId,
  milestones,
  onChange,
}: {
  productId: string;
  milestones: MilestoneRow[];
  onChange: (next: MilestoneRow[]) => void;
}) {
  const router = useRouter();
  const childrenByParent = new Map<string | null, MilestoneRow[]>();
  for (const m of milestones) {
    const key = m.parentId ?? null;
    const arr = childrenByParent.get(key) ?? [];
    arr.push(m);
    childrenByParent.set(key, arr);
  }
  const roots = childrenByParent.get(null) ?? [];

  return (
    <List>
      {roots.map((root) => (
        <MilestoneNode
          key={root.id}
          productId={productId}
          milestone={root}
          allMilestones={milestones}
          childrenByParent={childrenByParent}
          depth={0}
          onChange={onChange}
          onRefresh={() => router.refresh()}
        />
      ))}
    </List>
  );
}

function MilestoneNode({
  productId,
  milestone: m,
  allMilestones,
  childrenByParent,
  depth,
  onChange,
  onRefresh,
}: {
  productId: string;
  milestone: MilestoneRow;
  allMilestones: MilestoneRow[];
  childrenByParent: Map<string | null, MilestoneRow[]>;
  depth: number;
  onChange: (next: MilestoneRow[]) => void;
  onRefresh: () => void;
}) {
  const Icon = milestoneIcon[m.status];
  const kids = childrenByParent.get(m.id) ?? [];
  const [adding, setAdding] = useState(false);

  async function patchStatus(next: MilestoneStatus) {
    const res = await fetch(`/api/milestones/${m.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      onChange(
        allMilestones.map((x) => (x.id === m.id ? { ...x, status: next } : x)),
      );
      onRefresh();
    }
  }

  return (
    <ListItem style={{ marginLeft: depth * 16 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-400/15 font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-300">
            {depth + 1}
          </div>
          <div className="flex min-w-0 items-start gap-2.5">
            <button
              type="button"
              onClick={() => patchStatus(m.status === "DONE" ? "TODO" : "DONE")}
              className="mt-0.5 shrink-0"
              aria-label="Toggle done"
            >
              <Icon
                className={
                  m.status === "DONE"
                    ? "size-4 text-emerald-600 dark:text-emerald-400"
                    : m.status === "DOING"
                      ? "size-4 text-amber-600 dark:text-amber-400"
                      : m.status === "BLOCKED"
                        ? "size-4 text-rose-600 dark:text-rose-400"
                        : "size-4 text-muted-foreground/70"
                }
              />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={
                    "text-sm font-medium text-foreground " +
                    (m.status === "DONE" ? "line-through opacity-60" : "")
                  }
                >
                  {m.title}
                </div>
                <Badge tone={milestoneTone[m.status]}>
                  {m.status.toLowerCase()}
                </Badge>
                {m.estimateHours ? (
                  <Badge tone="neutral">{m.estimateHours}h</Badge>
                ) : null}
                {kids.length > 0 ? (
                  <Badge tone="brand">
                    {kids.length} subtask{kids.length === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>
              {m.description ? (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {m.description}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <select
            defaultValue={m.status}
            onChange={(e) => patchStatus(e.target.value as MilestoneStatus)}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
          >
            <option value="TODO">Todo</option>
            <option value="DOING">Doing</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          {depth < 2 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAdding((s) => !s)}
              title="Add sub-task"
            >
              <CirclePlus className="size-3.5" />
            </Button>
          ) : null}
          <DeleteMilestone
            milestoneId={m.id}
            onDeleted={() => {
              onChange(allMilestones.filter((x) => x.id !== m.id));
              onRefresh();
            }}
          />
        </div>
      </div>

      {adding ? (
        <div className="mt-3 border-t border-border bg-muted/40 p-3">
          <MilestoneAdd
            productId={productId}
            parentId={m.id}
            onCancel={() => setAdding(false)}
            onAdded={() => {
              setAdding(false);
              onRefresh();
            }}
          />
        </div>
      ) : null}

      {kids.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-0 border-l border-border/70 pl-3">
          {kids.map((c) => (
            <MilestoneNode
              key={c.id}
              productId={productId}
              milestone={c}
              allMilestones={allMilestones}
              childrenByParent={childrenByParent}
              depth={depth + 1}
              onChange={onChange}
              onRefresh={onRefresh}
            />
          ))}
        </ul>
      ) : null}
    </ListItem>
  );
}
