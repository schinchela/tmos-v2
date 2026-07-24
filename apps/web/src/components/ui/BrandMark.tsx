import { Sparkles } from "lucide-react";

import { cn } from "./cn";

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}

export function BrandMark({
  compact = false,
  inverse = false,
  className,
}: BrandMarkProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        className,
      )}
    >
      <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-indigo-950/20">
        T

        <Sparkles className="absolute right-1 top-1 size-3 text-cyan-100" />
      </div>

      {!compact ? (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-lg font-bold tracking-tight",
              inverse
                ? "text-white"
                : "text-slate-950",
            )}
          >
            TMOS
          </p>

          <p
            className={cn(
              "truncate text-xs font-medium",
              inverse
                ? "text-slate-400"
                : "text-slate-500",
            )}
          >
            Toastmasters Operating System
          </p>
        </div>
      ) : null}
    </div>
  );
}
