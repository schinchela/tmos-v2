import type { ReactNode } from "react";

import { Surface } from "../ui/Surface";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function FormSection({
  title,
  description,
  children,
  actions,
}: FormSectionProps) {
  return (
    <Surface padding="lg">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
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

      <div className="mt-6">
        {children}
      </div>
    </Surface>
  );
}
