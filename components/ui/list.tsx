import * as React from "react";
import { cn } from "@/lib/cn";

export function List({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function ListItem({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("px-5 py-4", className)} {...props} />;
}

export function ListEmpty({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-muted px-5 py-8 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
