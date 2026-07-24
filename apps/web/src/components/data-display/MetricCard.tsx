import type { ReactNode } from "react";

import { cn } from "../ui/cn";
import { toneClasses } from "../../theme/tones";
import type { UiTone } from "../../theme/ui.types";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  tone?: UiTone;
  badge?: ReactNode;
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "primary",
  badge,
}: MetricCardProps) {
  const classes = toneClasses[tone];

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            classes.iconBackground,
            classes.iconText,
          )}
        >
          {icon}
        </div>

        {badge}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </div>

      {detail ? (
        <div className="mt-2 text-sm leading-5 text-slate-500">
          {detail}
        </div>
      ) : null}
    </article>
  );
}
