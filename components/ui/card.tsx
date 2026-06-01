import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral:
      "bg-muted text-muted-foreground ring-1 ring-border",
    brand: "bg-brand-400/10 text-brand-700 dark:text-brand-300 ring-1 ring-brand-400/30",
    success:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-400/30",
    warning:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/30",
    danger:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-400/30",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        toneClass,
        className,
      )}
      {...props}
    />
  );
}
