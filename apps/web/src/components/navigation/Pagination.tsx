import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "../actions/Button";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = "records",
}: PaginationProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize),
  );

  const firstItem =
    totalItems === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastItem = Math.min(
    page * pageSize,
    totalItems,
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-900">
          {firstItem}
        </span>
        –
        <span className="font-semibold text-slate-900">
          {lastItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-900">
          {totalItems}
        </span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          leadingIcon={
            <ChevronLeft className="size-4" />
          }
          disabled={page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
        >
          Previous
        </Button>

        <span className="min-w-24 text-center text-sm font-semibold text-slate-700">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          trailingIcon={
            <ChevronRight className="size-4" />
          }
          disabled={page >= totalPages}
          onClick={() =>
            onPageChange(page + 1)
          }
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
