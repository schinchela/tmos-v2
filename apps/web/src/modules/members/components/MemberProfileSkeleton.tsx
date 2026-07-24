import { Skeleton } from "../../../components/feedback/Skeleton";
import { Surface } from "../../../components/ui/Surface";

export function MemberProfileSkeleton() {
  return (
    <div
      aria-label="Loading member profile"
      className="space-y-6"
    >
      <Surface
        padding="lg"
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="size-24 shrink-0 rounded-3xl" />

          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-5 w-52 max-w-full" />

            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Surface padding="lg">
            <Skeleton className="h-5 w-40" />

            <div className="mt-7 grid gap-7 sm:grid-cols-2">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="space-y-2"
                  >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-44 max-w-full" />
                  </div>
                ),
              )}
            </div>
          </Surface>

          <Surface padding="lg">
            <Skeleton className="h-5 w-48" />

            <div className="mt-7 grid gap-7 sm:grid-cols-2">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="space-y-2"
                  >
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-40 max-w-full" />
                  </div>
                ),
              )}
            </div>
          </Surface>
        </div>

        <div className="space-y-6">
          <Surface padding="lg">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-5 h-28 w-full" />
          </Surface>

          <Surface padding="lg">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-5 h-24 w-full" />
          </Surface>
        </div>
      </div>
    </div>
  );
}
