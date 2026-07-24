import type {
  TextareaHTMLAttributes,
} from "react";

import { cn } from "../ui/cn";

interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  showCharacterCount?: boolean;
}

export function TextAreaField({
  label,
  description,
  error,
  showCharacterCount = false,
  id,
  className,
  required,
  maxLength,
  value,
  ...props
}: TextAreaFieldProps) {
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

  const characterCount =
    typeof value === "string"
      ? value.length
      : 0;

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

      <textarea
        {...props}
        id={inputId}
        required={required}
        maxLength={maxLength}
        value={value}
        aria-invalid={
          error ? true : undefined
        }
        aria-describedby={
          errorId || descriptionId
        }
        className={cn(
          "mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400",
          "hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100",
          error &&
            "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
          className,
        )}
      />

      <span className="mt-2 flex items-start justify-between gap-4">
        {error ? (
          <span
            id={errorId}
            className="text-sm font-medium text-rose-700"
          >
            {error}
          </span>
        ) : (
          <span />
        )}

        {showCharacterCount &&
        maxLength ? (
          <span className="shrink-0 text-xs text-slate-400">
            {characterCount}/{maxLength}
          </span>
        ) : null}
      </span>
    </label>
  );
}
