import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "../navigation/AppSidebar";
import { AppTopbar } from "../navigation/AppTopbar";
import { cn } from "../ui/cn";

export function AppShell() {
  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <div className="min-h-screen">
      <AppSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCollapse={() =>
          setSidebarCollapsed(
            (current) => !current,
          )
        }
        onCloseMobile={() =>
          setMobileOpen(false)
        }
      />

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300 ease-out",
          sidebarCollapsed
            ? "lg:pl-24"
            : "lg:pl-72",
        )}
      >
        <AppTopbar
          sidebarCollapsed={
            sidebarCollapsed
          }
          onOpenMobile={() =>
            setMobileOpen(true)
          }
        />

        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
