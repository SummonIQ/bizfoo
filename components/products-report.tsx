"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ArrowRight, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/card";

export type ProductRow = {
  id: string;
  storefrontId: string;
  slug: string;
  title: string;
  badge: string | null;
  active: boolean;
  category: string | null;
  priceCount: number;
  amount: number;
  stripeSynced: boolean;
  updatedAt: string;
  stage: string;
  milestonesDone: number;
  milestonesTotal: number;
};

type SortKey =
  | "title"
  | "category"
  | "amount"
  | "priceCount"
  | "updatedAt"
  | "synced"
  | "completion"
  | "stage";

const STAGE_RANK: Record<string, number> = {
  IDEA: 0,
  SPEC: 1,
  SCAFFOLDED: 2,
  IN_DEV: 3,
  ALPHA: 4,
  BETA: 5,
  RELEASED: 6,
};

const STAGE_LABEL: Record<string, string> = {
  IDEA: "Idea",
  SPEC: "Spec'd",
  SCAFFOLDED: "Scaffolded",
  IN_DEV: "In dev",
  ALPHA: "Alpha",
  BETA: "Beta",
  RELEASED: "Released",
};

const STAGE_TONE: Record<string, "neutral" | "brand" | "success" | "warning"> = {
  IDEA: "neutral",
  SPEC: "warning",
  SCAFFOLDED: "warning",
  IN_DEV: "brand",
  ALPHA: "brand",
  BETA: "brand",
  RELEASED: "success",
};

export function ProductsReport({
  products,
  storefrontId,
  defaultPageSize = 50,
  enableFilters = true,
  enableScrollMaxHeight = true,
}: {
  products: ProductRow[];
  storefrontId: string;
  defaultPageSize?: number;
  enableFilters?: boolean;
  enableScrollMaxHeight?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [syncFilter, setSyncFilter] = React.useState<"all" | "synced" | "unsynced">("all");
  const [stageFilter, setStageFilter] = React.useState<string>("all");
  const [activeFilter, setActiveFilter] = React.useState<"all" | "active" | "hidden">("all");

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [products]);

  const stages = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of products) set.add(p.stage);
    return Array.from(set).sort((a, b) => (STAGE_RANK[a] ?? 0) - (STAGE_RANK[b] ?? 0));
  }, [products]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = products;
    if (q) {
      base = base.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") base = base.filter((p) => p.category === categoryFilter);
    if (syncFilter !== "all")
      base = base.filter((p) => (syncFilter === "synced" ? p.stripeSynced : !p.stripeSynced));
    if (stageFilter !== "all") base = base.filter((p) => p.stage === stageFilter);
    if (activeFilter !== "all")
      base = base.filter((p) => (activeFilter === "active" ? p.active : !p.active));

    const dir = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case "title":
          av = a.title.toLowerCase();
          bv = b.title.toLowerCase();
          break;
        case "category":
          av = (a.category ?? "").toLowerCase();
          bv = (b.category ?? "").toLowerCase();
          break;
        case "amount":
          av = a.amount;
          bv = b.amount;
          break;
        case "priceCount":
          av = a.priceCount;
          bv = b.priceCount;
          break;
        case "synced":
          av = a.stripeSynced ? 1 : 0;
          bv = b.stripeSynced ? 1 : 0;
          break;
        case "completion":
          av = a.milestonesTotal === 0 ? 0 : a.milestonesDone / a.milestonesTotal;
          bv = b.milestonesTotal === 0 ? 0 : b.milestonesDone / b.milestonesTotal;
          break;
        case "stage":
          av = STAGE_RANK[a.stage] ?? 0;
          bv = STAGE_RANK[b.stage] ?? 0;
          break;
        case "updatedAt":
        default:
          av = a.updatedAt;
          bv = b.updatedAt;
          break;
      }
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [
    products,
    query,
    categoryFilter,
    syncFilter,
    stageFilter,
    activeFilter,
    sortKey,
    sortDir,
  ]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      const numericDefaults: SortKey[] = ["amount", "priceCount", "updatedAt", "completion", "stage"];
      setSortDir(numericDefaults.includes(k) ? "desc" : "asc");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setSyncFilter("all");
    setStageFilter("all");
    setActiveFilter("all");
  };

  const filterCount =
    (query ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (syncFilter !== "all" ? 1 : 0) +
    (stageFilter !== "all" ? 1 : 0) +
    (activeFilter !== "all" ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-semibold text-foreground">Products</h3>
          <span className="text-xs text-muted-foreground">
            {filtered.length}
            {filtered.length !== products.length ? ` of ${products.length}` : ""}
          </span>
        </div>
        <div className="flex h-8 min-w-[220px] items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, slug, category"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {enableFilters ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs">
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
          />
          <FilterSelect
            label="Stage"
            value={stageFilter}
            onChange={setStageFilter}
            options={[{ value: "all", label: "All stages" }, ...stages.map((s) => ({ value: s, label: STAGE_LABEL[s] ?? s }))]}
          />
          <FilterSelect
            label="Stripe"
            value={syncFilter}
            onChange={(v) => setSyncFilter(v as typeof syncFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "synced", label: "Synced" },
              { value: "unsynced", label: "Not synced" },
            ]}
          />
          <FilterSelect
            label="Visibility"
            value={activeFilter}
            onChange={(v) => setActiveFilter(v as typeof activeFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
          {filterCount > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear filters
              <X className="size-3" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={cn("overflow-auto", enableScrollMaxHeight && "max-h-[640px]")}>
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <SortableTh label="Product" active={sortKey === "title"} dir={sortDir} onClick={() => toggleSort("title")} className="px-4 py-2" />
              <SortableTh label="Category" active={sortKey === "category"} dir={sortDir} onClick={() => toggleSort("category")} className="px-3 py-2" />
              <SortableTh label="Stage" active={sortKey === "stage"} dir={sortDir} onClick={() => toggleSort("stage")} className="px-3 py-2" />
              <SortableTh label="Completion" active={sortKey === "completion"} dir={sortDir} onClick={() => toggleSort("completion")} className="px-3 py-2 w-40" />
              <SortableTh label="Price" active={sortKey === "amount"} dir={sortDir} onClick={() => toggleSort("amount")} className="px-3 py-2 text-right" align="right" />
              <SortableTh label="Stripe" active={sortKey === "synced"} dir={sortDir} onClick={() => toggleSort("synced")} className="px-3 py-2" />
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {filterCount > 0 ? "No products match these filters." : "No products yet."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const pct =
                  p.milestonesTotal === 0
                    ? 0
                    : Math.round((p.milestonesDone / p.milestonesTotal) * 100);
                return (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/storefronts/${storefrontId}/products/${p.id}`}
                          className="truncate font-medium text-foreground hover:text-brand-600 dark:hover:text-brand-300"
                        >
                          {p.title}
                        </Link>
                        {p.badge ? <Badge tone="brand">{p.badge}</Badge> : null}
                        {!p.active ? <Badge tone="neutral">Hidden</Badge> : null}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">{p.slug}</div>
                    </td>
                    <td className="px-3 py-1.5 text-sm text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="px-3 py-1.5">
                      <Badge tone={STAGE_TONE[p.stage] ?? "neutral"}>
                        {STAGE_LABEL[p.stage] ?? p.stage}
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5">
                      <CompletionBar pct={pct} done={p.milestonesDone} total={p.milestonesTotal} />
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-sm text-foreground">
                      {p.amount > 0 ? `$${(p.amount / 100).toLocaleString()}` : "Free"}
                    </td>
                    <td className="px-3 py-1.5">
                      {p.stripeSynced ? <Badge tone="success">Synced</Badge> : <Badge tone="warning">Not synced</Badge>}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <Link
                        href={`/dashboard/storefronts/${storefrontId}/products/${p.id}`}
                        aria-label={`Open ${p.title}`}
                      >
                        <ArrowRight className="size-4 text-muted-foreground/70 hover:text-foreground" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompletionBar({ pct, done, total }: { pct: number; done: number; total: number }) {
  const tone = pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-brand-500" : pct > 0 ? "bg-amber-500" : "bg-muted-foreground/30";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {pct}% <span className="text-muted-foreground/70">({done}/{total})</span>
      </span>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  className,
  align,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
  align?: "left" | "right";
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={className}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end",
        )}
      >
        {label}
        <Icon className="size-3" />
      </button>
    </th>
  );
}
