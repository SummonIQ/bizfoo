import * as React from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  title,
  meta,
  action,
  className,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center justify-between gap-3",
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
        {meta ? (
          <span className="ml-2 normal-case tracking-normal text-muted-foreground/70">
            {meta}
          </span>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
