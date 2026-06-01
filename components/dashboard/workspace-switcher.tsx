"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const ACTIVE_ORGANIZATION_COOKIE = "bf_active_organization";

export type WorkspaceOption = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export function WorkspaceSwitcher({
  organizations,
  activeOrganizationId,
}: {
  organizations: WorkspaceOption[];
  activeOrganizationId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const active = organizations.find((o) => o.id === activeOrganizationId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function handleSelect(id: string) {
    if (id === activeOrganizationId) {
      setOpen(false);
      return;
    }
    setSwitchingId(id);
    try {
      document.cookie = `${ACTIVE_ORGANIZATION_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      setOpen(false);
      router.refresh();
    } finally {
      setSwitchingId(null);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-black/25 px-3 py-2 text-left transition-colors hover:bg-black/35 dark:bg-black/40 dark:hover:bg-black/50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          <div className="truncate text-sm font-medium text-foreground">
            {active?.name ?? "Select workspace"}
          </div>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg backdrop-blur-md"
        >
          {organizations.map((org) => {
            const isActive = org.id === activeOrganizationId;
            const isSwitching = switchingId === org.id;
            return (
              <button
                key={org.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(org.id)}
                disabled={isSwitching}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-brand-400/15 text-brand-700 dark:text-brand-300"
                    : "text-foreground/85 hover:bg-muted",
                )}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-400/20 font-mono text-xs font-semibold uppercase text-brand-700 dark:text-brand-300">
                  {org.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{org.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {org.role}
                  </div>
                </div>
                {isSwitching ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                ) : isActive ? (
                  <Check className="size-4 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
