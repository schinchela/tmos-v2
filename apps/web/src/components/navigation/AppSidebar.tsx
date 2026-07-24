import {
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "../ui/cn";

interface AppSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onCloseMobile: () => void;
}

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Club Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Club Operations",
    items: [
      {
        label: "Members",
        to: "/members",
        icon: Users,
      },
      {
        label: "Meetings",
        to: "/meetings",
        icon: CalendarDays,
      },
      {
        label: "Education",
        to: "/education",
        icon: BookOpenCheck,
      },
      {
        label: "Leadership",
        to: "/leadership",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Reports",
        to: "/reports",
        icon: BarChart3,
      },
      {
        label: "Administration",
        to: "/administration",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar({
  collapsed,
  mobileOpen,
  onCollapse,
  onCloseMobile,
}: AppSidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-950 text-white transition-all duration-200 lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-72",
          mobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full",
        )}
      >
        <div className="flex h-20 items-center border-b border-slate-800 px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-lg font-black text-slate-950">
              T
            </div>

            {!collapsed || mobileOpen ? (
              <div className="min-w-0">
                <p className="truncate text-lg font-bold tracking-tight">
                  TMOS
                </p>
                <p className="truncate text-xs font-medium text-slate-400">
                  Club Operating System
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={onCloseMobile}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-slate-800 p-4">
          <div
            className={cn(
              "rounded-xl border border-slate-800 bg-slate-900 p-3",
              collapsed && !mobileOpen && "flex justify-center",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                <Building2 className="size-4 text-amber-400" />
              </div>

              {!collapsed || mobileOpen ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    Demo Toastmasters Club
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    Club workspace
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div key={section.label} className="mb-7">
              {!collapsed || mobileOpen ? (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {section.label}
                </p>
              ) : null}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                          isActive
                            ? "bg-amber-500 text-slate-950"
                            : "text-slate-300 hover:bg-slate-900 hover:text-white",
                          collapsed && !mobileOpen && "justify-center",
                        )
                      }
                    >
                      <Icon className="size-5 shrink-0" />

                      {!collapsed || mobileOpen ? (
                        <span>{item.label}</span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            className="hidden min-h-11 w-full items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-900 hover:text-white lg:flex"
            onClick={onCollapse}
          >
            {collapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <div className="flex items-center gap-3">
                <ChevronLeft className="size-5" />
                <span className="text-sm font-medium">Collapse sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
