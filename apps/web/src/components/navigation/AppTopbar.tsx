import { Bell, Menu, Search } from "lucide-react";

interface AppTopbarProps {
  onOpenMobile: () => void;
}

export function AppTopbar({ onOpenMobile }: AppTopbarProps) {
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

        <button
          type="button"
          className="ml-1 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            SK
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-slate-900">
              Suketh Kumar
            </p>
            <p className="text-xs text-slate-500">Club Administrator</p>
          </div>
        </button>
      </div>
    </header>
  );
}
