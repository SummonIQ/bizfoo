import type { CSSProperties } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/customers", label: "Customers" },
  { href: "/changelog", label: "Changelog" },
  { href: "/docs", label: "Docs" },
];

const backdropStyle: CSSProperties = {
  height: "200%",
  background:
    "linear-gradient(to bottom, color-mix(in srgb, var(--background) 85%, transparent) 0%, color-mix(in srgb, var(--background) 0%, transparent) 50%)",
  backdropFilter: "blur(22px) saturate(160%) brightness(1.15)",
  WebkitBackdropFilter: "blur(22px) saturate(160%) brightness(1.15)",
  maskImage:
    "linear-gradient(to bottom, black 0%, black 50%, transparent 50%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black 50%, transparent 50%, transparent 100%)",
};

const bottomEdgeStyle: CSSProperties = {
  height: "100%",
  transform: "translateY(100%)",
  background: "color-mix(in srgb, var(--foreground) 4%, transparent)",
  backdropFilter: "blur(16px) brightness(180%) saturate(130%) contrast(110%)",
  WebkitBackdropFilter:
    "blur(16px) brightness(180%) saturate(130%) contrast(110%)",
  pointerEvents: "none",
  maskImage:
    "linear-gradient(to bottom, black 0, black 1px, transparent 1px)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0, black 1px, transparent 1px)",
};

const topEdgeStyle: CSSProperties = {
  opacity: 0.7,
  backdropFilter: "blur(16px) saturate(250%) brightness(200%) contrast(120%)",
  WebkitBackdropFilter:
    "blur(16px) saturate(250%) brightness(200%) contrast(120%)",
  maskImage:
    "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
  filter: "blur(0.25px)",
};

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40">
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={backdropStyle}
        />

        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start free</Button>
            </Link>
          </div>
        </div>

        <div
          className="pointer-events-none absolute -top-px right-0 left-0 z-20 h-0.5"
          style={topEdgeStyle}
        />

        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={bottomEdgeStyle}
        />
      </div>
    </header>
  );
}
