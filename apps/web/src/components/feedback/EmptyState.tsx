import type { ReactNode } from "react";

import { cn } from "../ui/cn";
import { toneClasses } from "../../theme/tones";
import type { UiTone } from "../../theme/ui.types";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  tone?: UiTone;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  tone = "neutral",
  action,
}: EmptyStateProps) {
  const classes = toneClasses[tone];

  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div
        className={cn(
          "mx-auto flex size-14 items-center justify-center rounded-2xl",
          classes.iconBackground,
          classes.iconText,
        )}
      >
        {icon}
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {description}
      </p>

      {action ? (
        <div className="mt-6 flex justify-center">
          {action}
        </div>
      ) : null}
    </section>
  );
}
