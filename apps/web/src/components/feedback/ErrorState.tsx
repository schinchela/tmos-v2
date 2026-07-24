import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "../actions/Button";

interface ErrorStateProps {
  title: string;
  description: string;
  requestId?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  description,
  requestId,
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
        <AlertCircle className="size-6" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>

      {requestId ? (
        <p className="mt-3 text-xs text-slate-500">
          Request ID: {requestId}
        </p>
      ) : null}

      {onRetry ? (
        <div className="mt-6">
          <Button
            tone="danger"
            variant="soft"
            leadingIcon={
              <RefreshCw className="size-4" />
            }
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      ) : null}
    </section>
  );
}
