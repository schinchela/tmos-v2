import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Command,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { applicationNavigation } from "../../theme/navigationRegistry";
import { toneClasses } from "../../theme/tones";
import { BrandMark } from "../ui/BrandMark";
import { cn } from "../ui/cn";

interface AppSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onCloseMobile: () => void;
}

export function AppSidebar({
  collapsed,
  mobileOpen,
  onCollapse,
  onCloseMobile,
}: AppSidebarProps) {
  const expanded =
    !collapsed || mobileOpen;

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-slate-800/80 bg-slate-950 text-white shadow-2xl shadow-slate-950/20 transition-all duration-300 ease-out lg:translate-x-0",
          collapsed
            ? "lg:w-24"
            : "lg:w-72",
          mobileOpen
            ? "w-72 translate-x-0"
            : "w-72 -translate-x-full",
        )}
      >
        <div className="relative border-b border-slate-800 px-4 py-5">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-500/15 to-transparent" />

          <div className="relative flex items-center">
            <BrandMark
              inverse
              compact={!expanded}
              className="min-w-0 flex-1"
            />

            <button
              type="button"
              aria-label="Close navigation"
              className="flex size-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
              onClick={onCloseMobile}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-800 p-3">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 p-3",
              !expanded &&
                "flex justify-center p-2.5",
            )}
          >
            <div className="absolute -right-8 -top-8 size-24 rounded-full bg-cyan-500/10 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 text-cyan-300 ring-1 ring-white/10">
                <Building2 className="size-5" />
              </div>

              {expanded ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    Club workspace
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    Connected operating environment
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {applicationNavigation.map(
            (section) => (
              <section
                key={section.id}
                className="mb-7 last:mb-0"
              >
                {expanded ? (
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {section.label}
                  </p>
                ) : (
                  <div className="mx-auto mb-3 h-px w-8 bg-slate-800" />
                )}

                <div className="space-y-1.5">
                  {section.routes.map(
                    (route) => {
                      const Icon = route.icon;
                      const tone =
                        toneClasses[
                          route.tone
                        ];

                      return (
                        <NavLink
                          key={route.id}
                          to={route.path}
                          onClick={
                            onCloseMobile
                          }
                          title={
                            expanded
                              ? undefined
                              : route.title
                          }
                          className={({
                            isActive,
                          }) =>
                            cn(
                              "group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium transition",
                              expanded
                                ? ""
                                : "justify-center px-2",
                              isActive
                                ? "bg-white text-slate-950 shadow-lg shadow-slate-950/25"
                                : "text-slate-300 hover:bg-slate-900 hover:text-white",
                            )
                          }
                        >
                          {({
                            isActive,
                          }) => (
                            <>
                              {isActive ? (
                                <span
                                  className={cn(
                                    "absolute inset-y-2 left-0 w-1 rounded-r-full",
                                    tone.accentBackground,
                                  )}
                                />
                              ) : null}

                              <span
                                className={cn(
                                  "flex size-9 shrink-0 items-center justify-center rounded-xl transition",
                                  isActive
                                    ? cn(
                                        tone.iconBackground,
                                        tone.iconText,
                                      )
                                    : "bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-white",
                                )}
                              >
                                <Icon className="size-5" />
                              </span>

                              {expanded ? (
                                <span className="truncate">
                                  {route.shortTitle ||
                                    route.title}
                                </span>
                              ) : null}
                            </>
                          )}
                        </NavLink>
                      );
                    },
                  )}
                </div>
              </section>
            ),
          )}
        </nav>

        <div className="border-t border-slate-800 p-3">
          {expanded ? (
            <div className="mb-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <Command className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200">
                    TMOS v2 workspace
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Fast, secure and club-aware.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div
            className={cn(
              "flex gap-2",
              !expanded &&
                "flex-col items-center",
            )}
          >
            <button
              type="button"
              aria-label="Help and support"
              title="Help and support"
              className="flex size-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              <CircleHelp className="size-5" />
            </button>

            <button
              type="button"
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              title={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              className={cn(
                "hidden min-h-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-900 hover:text-white lg:flex",
                expanded
                  ? "flex-1 gap-2 px-3"
                  : "size-11",
              )}
              onClick={onCollapse}
            >
              {collapsed ? (
                <ChevronRight className="size-5" />
              ) : (
                <>
                  <ChevronLeft className="size-5" />
                  <span className="text-sm font-medium">
                    Collapse
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
