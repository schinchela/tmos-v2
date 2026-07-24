import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "./cn";
import { toneClasses } from "../../theme/tones";
import type { UiTone } from "../../theme/ui.types";

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: UiTone;
  icon?: ReactNode;
  outlined?: boolean;
}

export function Badge({
  children,
  tone = "neutral",
  icon,
  outlined = false,
  className,
  ...props
}: BadgeProps) {
  const classes = toneClasses[tone];

  return (
    <span
      {...props}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        outlined
          ? cn(
              "border bg-white",
              classes.accentBorder,
              classes.accentText,
            )
          : cn(
              classes.softBackground,
              classes.softText,
            ),
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
