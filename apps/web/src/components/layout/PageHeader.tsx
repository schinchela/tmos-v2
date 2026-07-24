import type { ReactNode } from "react";

import { BackNavigation } from "../navigation/BackNavigation";
import { Badge } from "../ui/Badge";
import { cn } from "../ui/cn";
import { toneClasses } from "../../theme/tones";
import type { UiTone } from "../../theme/ui.types";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  tone?: UiTone;
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  tone = "primary",
  icon,
  badge,
  actions,
  backTo,
  backLabel = "Back",
  children,
}: PageHeaderProps) {
  const classes = toneClasses[tone];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-sm">
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br px-6 py-7 text-white sm:px-8 sm:py-9",
          classes.gradient,
        )}
      >
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          {backTo ? (
            <div className="mb-5 [&_a]:text-white/75 [&_a:hover]:bg-white/10 [&_a:hover]:text-white">
              <BackNavigation
                to={backTo}
                label={backLabel}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                {eyebrow ? (
                  <Badge
                    tone={tone}
                    className="border border-white/20 bg-white/10 text-white"
                    icon={icon}
                  >
                    {eyebrow}
                  </Badge>
                ) : null}

                {badge}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h1>

              {description ? (
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/75">
                  {description}
                </p>
              ) : null}
            </div>

            {actions ? (
              <div className="flex flex-wrap items-center gap-3">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {children ? (
        <div className="border-t border-slate-100 bg-white px-6 py-5 sm:px-8">
          {children}
        </div>
      ) : null}
    </section>
  );
}
