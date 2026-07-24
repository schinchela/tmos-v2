import type {
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import { cn } from "../ui/cn";

interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  description?: string;
  error?: string;
  leadingIcon?: ReactNode;
}

export function SelectField({
  label,
  description,
  error,
  leadingIcon,
  id,
  className,
  required,
  children,
  ...props
}: SelectFieldProps) {
  const inputId =
    id ||
    `field-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;

  const descriptionId = description
    ? `${inputId}-description`
    : undefined;

  const errorId = error
    ? `${inputId}-error`
    : undefined;

  return (
    <label
      htmlFor={inputId}
      className="block"
    >
      <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
        {label}

        {required ? (
          <span
            aria-hidden="true"
            className="text-rose-600"
          >
            *
          </span>
        ) : null}
      </span>

      {description ? (
        <span
          id={descriptionId}
          className="mt-1 block text-xs leading-5 text-slate-500"
        >
          {description}
        </span>
      ) : null}

      <span className="relative mt-2 block">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-slate-400">
            {leadingIcon}
          </span>
        ) : null}

        <select
          {...props}
          id={inputId}
          required={required}
          aria-invalid={
            error ? true : undefined
          }
          aria-describedby={
            errorId || descriptionId
          }
          className={cn(
            "min-h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-950 outline-none transition",
            "hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100",
            leadingIcon && "pl-12",
            error &&
              "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
            className,
          )}
        >
          {children}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          ▼
        </span>
      </span>

      {error ? (
        <span
          id={errorId}
          className="mt-2 block text-sm font-medium text-rose-700"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
