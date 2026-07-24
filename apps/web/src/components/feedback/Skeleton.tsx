import { cn } from "../ui/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xl bg-slate-200",
        className,
      )}
    />
  );
}

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeletonGrid({
  count = 6,
}: CardSkeletonProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map(
        (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex gap-4">
              <Skeleton className="size-12 shrink-0 rounded-2xl" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ),
      )}
    </section>
  );
}
