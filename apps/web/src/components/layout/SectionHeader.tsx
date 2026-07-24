import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
