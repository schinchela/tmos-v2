import type { ReactNode } from "react";

interface DefinitionItem {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

interface DefinitionListProps {
  items: DefinitionItem[];
  columns?: 1 | 2 | 3;
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
};

export function DefinitionList({
  items,
  columns = 2,
}: DefinitionListProps) {
  return (
    <dl
      className={`grid gap-x-8 gap-y-6 ${columnClasses[columns]}`}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-0"
        >
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {item.icon}
            {item.label}
          </dt>

          <dd className="mt-2 break-words text-sm font-semibold text-slate-800">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
