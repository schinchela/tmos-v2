import type { ReactNode } from "react";

import { cn } from "../ui/cn";
import { toneClasses } from "../../theme/tones";
import type { UiTone } from "../../theme/ui.types";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  tone?: UiTone;
  ariaLabel?: string;
}

export function Tabs({
  items,
  activeId,
  onChange,
  tone = "primary",
  ariaLabel = "Page sections",
}: TabsProps) {
  const classes = toneClasses[tone];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex min-w-max gap-1"
      >
        {items.map((item) => {
          const active =
            item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() =>
                onChange(item.id)
              }
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-40",
                classes.ring,
                active
                  ? cn(
                      classes.softBackground,
                      classes.softText,
                    )
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {item.icon}
              {item.label}
              {item.badge}
            </button>
          );
        })}
      </div>
    </div>
  );
}
