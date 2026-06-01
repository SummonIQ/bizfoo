"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";
import {
  ChevronsUpDown,
  CreditCard,
  KeyRound,
  LogOut,
  Settings,
  UserCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { flushAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/cn";

type MenuLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const links: MenuLink[] = [
  { href: "/dashboard/account", label: "Account", icon: UserCircle2 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/api-keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/settings", label: "Workspace settings", icon: Settings },
];

export function UserMenu({ email }: { email: string }) {
  const { reset, track } = useAnalytics();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const initial = email.charAt(0).toUpperCase();

  function handleSignOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          track("sign_out_succeeded");
          await flushAnalytics();
          reset();
          window.location.href = "/";
        },
      },
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-black/25 px-2 py-2 text-left transition-colors hover:bg-black/35 dark:bg-black/40 dark:hover:bg-black/50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-400/20 font-mono text-sm font-semibold uppercase text-brand-600 dark:text-brand-300">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {email}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Account
          </div>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg backdrop-blur-md"
        >
          <div className="truncate border-b border-border px-3 py-2 text-xs text-muted-foreground">
            Signed in as <span className="text-foreground">{email}</span>
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground/85 transition-colors hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 text-muted-foreground" />
                {link.label}
              </Link>
            );
          })}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground/85 transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4 text-muted-foreground" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
