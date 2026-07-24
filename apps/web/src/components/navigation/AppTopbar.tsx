import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../modules/auth/authContextValue";
import { routeRegistry } from "../../theme/routeRegistry";
import { toneClasses } from "../../theme/tones";
import { Badge } from "../ui/Badge";
import { cn } from "../ui/cn";

interface AppTopbarProps {
  sidebarCollapsed: boolean;
  onOpenMobile: () => void;
}

export function AppTopbar({
  sidebarCollapsed,
  onOpenMobile,
}: AppTopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    logout,
  } = useAuth();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(
      event: MouseEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, []);

  const activeRoute =
    Object.values(routeRegistry).find(
      (route) =>
        location.pathname === route.path ||
        location.pathname.startsWith(
          `${route.path}/`,
        ),
    ) || routeRegistry.dashboard;

  const activeTone =
    toneClasses[activeRoute.tone];

  const ActiveRouteIcon =
    activeRoute.icon;

  const displayName =
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user?.email ||
    "TMOS User";

  const initials =
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .map((value) =>
        String(value)
          .trim()
          .charAt(0),
      )
      .join("")
      .toUpperCase() || "TM";

  const roleLabel = formatRole(
    user?.role || "",
  );

  async function handleLogout() {
    setIsLoggingOut(true);

    await logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open navigation"
          className="mr-3 flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:hidden"
          onClick={onOpenMobile}
        >
          <Menu className="size-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "hidden size-10 shrink-0 items-center justify-center rounded-xl sm:flex",
              activeTone.iconBackground,
              activeTone.iconText,
            )}
          >
            <ActiveRouteIcon className="size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
                {activeRoute.title}
              </p>

              <Badge
                tone={activeRoute.tone}
                className="hidden lg:inline-flex"
              >
                {activeRoute.eyebrow ||
                  "TMOS Workspace"}
              </Badge>
            </div>

            <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">
              {activeRoute.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search TMOS"
            className="hidden min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-800 md:flex"
          >
            <Search className="size-4" />

            <span className="hidden xl:inline">
              Search workspace
            </span>

            <span className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-400 xl:flex">
              <Command className="size-3" />
              K
            </span>
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            <Bell className="size-5" />

            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() =>
                setMenuOpen(
                  (current) => !current,
                )
              }
              className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-sm font-bold text-white">
                {initials}
              </div>

              <div className="hidden max-w-48 text-left lg:block">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {displayName}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <ChevronDown
                className={cn(
                  "hidden size-4 text-slate-400 transition lg:block",
                  menuOpen && "rotate-180",
                )}
              />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50"
              >
                <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5">
                  <div className="absolute -right-10 -top-10 size-28 rounded-full bg-violet-300/20 blur-2xl" />

                  <div className="relative flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-base font-bold text-white shadow-lg shadow-indigo-200">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950">
                        {displayName}
                      </p>

                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-4 flex flex-wrap gap-2">
                    <Badge
                      tone="primary"
                      icon={
                        <ShieldCheck className="size-3.5" />
                      }
                    >
                      {roleLabel}
                    </Badge>

                    <Badge tone="success">
                      Session active
                    </Badge>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <UserRound className="size-4 text-slate-400" />
                    Account profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    disabled={isLoggingOut}
                    onClick={() =>
                      void handleLogout()
                    }
                    className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="size-4" />

                    {isLoggingOut
                      ? "Signing out…"
                      : "Sign out"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-70",
          activeTone.accentText,
          sidebarCollapsed
            ? "lg:ml-0"
            : "",
        )}
      />
    </header>
  );
}

function formatRole(
  role: string,
): string {
  if (!role) {
    return "TMOS User";
  }

  return role
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}
