import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-xl font-black text-slate-950">
          T
        </div>

        <div className="mx-auto mt-6 size-8 animate-spin rounded-full border-4 border-slate-700 border-t-amber-500" />

        <p className="mt-5 text-sm font-medium text-slate-300">
          Restoring your TMOS workspace…
        </p>
      </div>
    </div>
  );
}
