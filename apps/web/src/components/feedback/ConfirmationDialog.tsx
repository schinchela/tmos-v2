import {
  AlertTriangle,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../actions/Button";
import { cn } from "../ui/cn";
import { toneClasses } from "../../theme/tones";
import type { UiTone } from "../../theme/ui.types";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: Extract<
    UiTone,
    "primary" | "warning" | "danger"
  >;
  icon?: ReactNode;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  icon,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!open) {
    return null;
  }

  const classes = toneClasses[tone];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl",
              classes.iconBackground,
              classes.iconText,
            )}
          >
            {icon || (
              <AlertTriangle className="size-6" />
            )}
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            onClick={onCancel}
            className="flex size-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6">
          <h2
            id="confirmation-title"
            className="text-xl font-bold text-slate-950"
          >
            {title}
          </h2>

          <p
            id="confirmation-description"
            className="mt-3 text-sm leading-6 text-slate-600"
          >
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>

          <Button
            tone={tone}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming
              ? "Working…"
              : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
