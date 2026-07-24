import { Search, X } from "lucide-react";
import type {
  ChangeEvent,
  InputHTMLAttributes,
} from "react";

import { cn } from "../ui/cn";

interface SearchFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchField({
  label,
  value,
  onChange,
  onClear,
  className,
  placeholder = "Search...",
  ...props
}: SearchFieldProps) {
  function handleChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    onChange(event.target.value);
  }

  return (
    <label className="block">
      <span className="sr-only">
        {label}
      </span>

      <span className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

        <input
          {...props}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400",
            "hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100",
            className,
          )}
        />

        {value ? (
          <button
            type="button"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </span>
    </label>
  );
}
