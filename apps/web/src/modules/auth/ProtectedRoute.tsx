import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { BrandMark } from "../../components/ui/BrandMark";
import { useAuth } from "./authContextValue";

export function ProtectedRoute() {
  const location = useLocation();

  const {
    isAuthenticated,
    isRestoringSession,
  } = useAuth();

  if (isRestoringSession) {
    return <SessionLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  return <Outlet />;
}

function SessionLoadingScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="absolute left-0 top-0 size-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 size-96 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative w-full max-w-sm text-center">
        <div className="flex justify-center">
          <BrandMark inverse />
        </div>

        <div className="relative mx-auto mt-10 flex size-20 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-400 border-r-cyan-400" />

          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-indigo-200 backdrop-blur-sm">
            <ShieldCheck className="size-6" />
          </div>

          <Sparkles className="absolute -right-1 -top-1 size-5 animate-pulse text-cyan-300" />
        </div>

        <h1 className="mt-8 text-xl font-bold text-white">
          Restoring your workspace
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          TMOS is validating your secure session and
          preparing your club environment.
        </p>

        <div className="mx-auto mt-7 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />
        </div>
      </div>
    </main>
  );
}
