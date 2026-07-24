import {
  ChevronRight,
  Home,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getRouteBreadcrumbs,
  getRouteMetadata,
} from "../../theme/routeRegistry";
import { cn } from "../ui/cn";

interface PageBreadcrumbsProps {
  routeId: string;
  currentLabel?: string;
}

export function PageBreadcrumbs({
  routeId,
  currentLabel,
}: PageBreadcrumbsProps) {
  const breadcrumbs =
    getRouteBreadcrumbs(routeId);

  const route = getRouteMetadata(routeId);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1 text-sm"
    >
      <Link
        to="/dashboard"
        aria-label="Dashboard"
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
      >
        <Home className="size-4" />
      </Link>

      {breadcrumbs
        .filter(
          (breadcrumb) =>
            breadcrumb.id !== "dashboard",
        )
        .map((breadcrumb) => {
          const isCurrent =
            breadcrumb.id === route.id &&
            !currentLabel;

          return (
            <div
              key={breadcrumb.id}
              className="flex min-w-0 items-center gap-1"
            >
              <ChevronRight className="size-4 shrink-0 text-slate-300" />

              {isCurrent ? (
                <span className="truncate px-1 font-semibold text-slate-700">
                  {breadcrumb.shortTitle ||
                    breadcrumb.title}
                </span>
              ) : (
                <Link
                  to={breadcrumb.path}
                  className="truncate rounded-lg px-1.5 py-1 text-slate-500 transition hover:bg-white hover:text-slate-800"
                >
                  {breadcrumb.shortTitle ||
                    breadcrumb.title}
                </Link>
              )}
            </div>
          );
        })}

      {currentLabel ? (
        <div className="flex min-w-0 items-center gap-1">
          <ChevronRight className="size-4 shrink-0 text-slate-300" />

          <span
            className={cn(
              "truncate px-1 font-semibold text-slate-700",
            )}
          >
            {currentLabel}
          </span>
        </div>
      ) : null}
    </nav>
  );
}
