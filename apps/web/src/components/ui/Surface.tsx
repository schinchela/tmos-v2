import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "./cn";

type SurfaceVariant =
  | "default"
  | "soft"
  | "elevated"
  | "outlined";

interface SurfaceProps
  extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "section" | "article" | "div";
  variant?: SurfaceVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<
  SurfaceVariant,
  string
> = {
  default:
    "border border-slate-200 bg-white shadow-sm",
  soft:
    "border border-slate-200 bg-slate-50/80",
  elevated:
    "border border-slate-200 bg-white shadow-lg shadow-slate-200/50",
  outlined:
    "border border-slate-300 bg-transparent",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Surface({
  children,
  as: Component = "section",
  variant = "default",
  padding = "md",
  className,
  ...props
}: SurfaceProps) {
  return (
    <Component
      {...props}
      className={cn(
        "rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </Component>
  );
}
