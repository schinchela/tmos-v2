import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../modules/auth/authContextValue";

interface AppTopbarProps {
  onOpenMobile: () => void;
}

export function AppTopbar({
  onOpenMobile,
}: AppTopbarProps) {
  const navigate = useNavigate();

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
        String(value).trim().charAt(0),
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
    <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        className="mr-3 rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
        onClick={onOpenMobile}
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
          Toastmasters Operating System
        </p>

        <p className="truncate text-sm font-medium text-slate-500">
          Club operations and member success workspace
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 sm:inline-flex"
        >
          <Search className="size-5" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500" />
        </button>

        <div
          ref={menuRef}
          className="relative ml-1"
        >
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(
                (current) => !current,
              )
            }
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 transition hover:bg-slate-50"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              {initials}
            </div>

            <div className="hidden max-w-48 text-left md:block">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {roleLabel}
              </p>
            </div>

            <ChevronDown className="hidden size-4 text-slate-400 md:block" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <UserRound className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {displayName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() =>
                    void handleLogout()
                  }
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
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
    </header>
  );
}

function formatRole(role: string): string {
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
