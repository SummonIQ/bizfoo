"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/cn";

const STAGE_OPTIONS = [
  { value: "", label: "All" },
  { value: "IDEA", label: "Idea" },
  { value: "SPEC", label: "Spec" },
  { value: "SCAFFOLDED", label: "Scaffolded" },
  { value: "IN_DEV", label: "In dev" },
  { value: "ALPHA", label: "Alpha" },
  { value: "BETA", label: "Beta" },
  { value: "RELEASED", label: "Released" },
];

const STRIPE_OPTIONS = [
  { value: "", label: "Any Stripe state" },
  { value: "synced", label: "Synced" },
  { value: "unsynced", label: "Not synced" },
];

const PRICE_OPTIONS = [
  { value: "", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export type StorefrontOption = {
  id: string;
  name: string;
};

export function ProductFilters({
  storefronts,
  total,
  filtered,
}: {
  storefronts: StorefrontOption[];
  total: number;
  filtered: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  const reset = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const q = searchParams?.get("q") ?? "";
  const stage = searchParams?.get("stage") ?? "";
  const storefront = searchParams?.get("storefront") ?? "";
  const stripe = searchParams?.get("stripe") ?? "";
  const priceTier = searchParams?.get("price") ?? "";

  const hasActive = Boolean(q || stage || storefront || stripe || priceTier);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-3 sm:p-4",
        isPending && "opacity-80",
      )}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative col-span-1 sm:col-span-2 lg:col-span-2">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search by name or slug…"
            className="h-10 w-full rounded-[0.45rem] border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        {storefronts.length > 1 ? (
          <FilterSelect
            label="Storefront"
            value={storefront}
            onChange={(v) => update("storefront", v)}
            options={[
              { value: "", label: "All storefronts" },
              ...storefronts.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        ) : null}

        <FilterSelect
          label="Stripe"
          value={stripe}
          onChange={(v) => update("stripe", v)}
          options={STRIPE_OPTIONS}
        />

        <FilterSelect
          label="Price"
          value={priceTier}
          onChange={(v) => update("price", v)}
          options={PRICE_OPTIONS}
        />
      </div>

      <SegmentedControl
        label="Stage"
        value={stage}
        onChange={(v) => update("stage", v)}
        options={STAGE_OPTIONS}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          Showing <span className="font-semibold text-foreground">{filtered}</span> of {total}
        </span>
        {hasActive ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground/80 hover:bg-muted"
          >
            <X className="size-3" />
            Reset filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SegmentedControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-full flex-wrap items-center gap-1 rounded-[0.55rem] border border-border bg-input p-1"
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value || "all"}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-[0.4rem] px-3 py-1.5 text-xs font-medium transition-colors",
              "min-w-fit whitespace-nowrap",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
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
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 w-full rounded-[0.45rem] border border-border bg-input px-2.5 text-sm text-foreground focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-ring"
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
