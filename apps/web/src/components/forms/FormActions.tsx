import type { ReactNode } from "react";

interface FormActionsProps {
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  message?: ReactNode;
}

export function FormActions({
  primaryAction,
  secondaryAction,
  message,
}: FormActionsProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl sm:static sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm text-slate-500">
          {message}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>
    </div>
  );
}
