import * as React from "react";
import { cn } from "@/lib/cn";

export function FormPanel({
  className,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      className={cn(
        "flex flex-col gap-4",
        className,
      )}
      {...props}
    />
  );
}

export function Panel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function ErrorBanner({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-400/30 dark:text-rose-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
