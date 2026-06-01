"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Settings,
  Store,
  Users,
  BarChart3,
  Receipt,
  KeyRound,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  WorkspaceSwitcher,
  type WorkspaceOption,
} from "@/components/dashboard/workspace-switcher";
import { UserMenu } from "@/components/dashboard/user-menu";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/storefronts", label: "Storefronts", icon: Store },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/api-keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/billing", label: "Billing", icon: Settings },
];

export function DashboardShell({
  organizations,
  activeOrganizationId,
  userEmail,
  children,
}: {
  organizations: WorkspaceOption[];
  activeOrganizationId: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col bg-surface">
        <div className="border-b border-border px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <Link href="/dashboard">
              <BrandMark />
            </Link>
            <ThemeToggle />
          </div>
          <WorkspaceSwitcher
            organizations={organizations}
            activeOrganizationId={activeOrganizationId}
          />
        </div>

        <nav className="flex-1 px-3 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-400/15"
                    : "text-foreground/75 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("size-4", active && "text-brand-400")}
                />
                <span className={cn(active && "text-brand-400")}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <UserMenu email={userEmail} />
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-hidden bg-surface p-3 pl-0">
        <div className="relative h-full overflow-y-auto rounded-xl border border-border bg-surface">
          <div className="relative mx-auto max-w-6xl px-4 py-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
