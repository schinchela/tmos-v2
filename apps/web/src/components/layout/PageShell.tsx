import type { ReactNode } from "react";

import { PageBreadcrumbs } from "../navigation/PageBreadcrumbs";
import { PageTitleManager } from "../navigation/PageTitleManager";
import { cn } from "../ui/cn";
import { getRouteMetadata } from "../../theme/routeRegistry";

interface PageShellProps {
  routeId: string;
  children: ReactNode;
  currentBreadcrumbLabel?: string;
  browserTitle?: string;
  className?: string;
  showBreadcrumbs?: boolean;
}

export function PageShell({
  routeId,
  children,
  currentBreadcrumbLabel,
  browserTitle,
  className,
  showBreadcrumbs = true,
}: PageShellProps) {
  const route = getRouteMetadata(routeId);

  return (
    <>
      <PageTitleManager
        title={browserTitle || route.browserTitle}
      />

      <div
        className={cn(
          "mx-auto w-full max-w-screen-2xl space-y-6",
          className,
        )}
      >
        {showBreadcrumbs ? (
          <PageBreadcrumbs
            routeId={routeId}
            currentLabel={currentBreadcrumbLabel}
          />
        ) : null}

        {children}
      </div>
    </>
  );
}
