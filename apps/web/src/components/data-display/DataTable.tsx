import type {
  Key,
  ReactNode,
} from "react";

import { cn } from "../ui/cn";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => Key;
  caption?: string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
}

const alignmentClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  onRowClick,
  emptyState,
}: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {caption ? (
            <caption className="sr-only">
              {caption}
            </caption>
          ) : null}

          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500",
                    alignmentClasses[
                      column.align || "left"
                    ],
                    column.hideOnMobile &&
                      "hidden md:table-cell",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                tabIndex={
                  onRowClick ? 0 : undefined
                }
                onClick={
                  onRowClick
                    ? () => onRowClick(row)
                    : undefined
                }
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "transition",
                  onRowClick &&
                    "cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "px-4 py-4 text-sm text-slate-700",
                      alignmentClasses[
                        column.align || "left"
                      ],
                      column.hideOnMobile &&
                        "hidden md:table-cell",
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
