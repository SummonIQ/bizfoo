import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-400 text-zinc-950 hover:bg-brand-300 shadow-[0_0_24px_-6px_rgba(168,240,21,0.7)] hover:shadow-[0_0_32px_-4px_rgba(168,240,21,0.85)] focus-visible:ring-brand-400",
  secondary:
    "bg-surface-2 text-foreground border border-border hover:bg-muted focus-visible:ring-ring",
  ghost:
    "bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted",
  outline:
    "bg-transparent text-foreground border border-border hover:border-foreground/30 hover:bg-muted focus-visible:ring-ring",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
