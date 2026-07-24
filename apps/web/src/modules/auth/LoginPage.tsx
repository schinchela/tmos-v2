import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { ApiClientError } from "../../lib/api/apiClient";
import { useAuth } from "./authContextValue";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    isRestoringSession,
    login,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const state =
    location.state as
      | LoginLocationState
      | null;

  const destination =
    state?.from || "/dashboard";

  if (
    !isRestoringSession &&
    isAuthenticated
  ) {
    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        "Enter your email address.",
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        "Enter your password.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({
        email: normalizedEmail,
        password,
      });

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "TMOS could not complete the login request.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-slate-800 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />

          <div className="absolute -left-24 top-20 size-80 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-0 size-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-xl font-black text-slate-950">
                T
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight">
                  TMOS
                </p>
                <p className="text-sm text-slate-400">
                  Toastmasters Operating System
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300">
                <Sparkles className="size-4" />
                Club leadership workspace
              </div>

              <h1 className="mt-7 text-5xl font-bold tracking-tight xl:text-6xl">
                Run a stronger club from one connected system.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Manage members, meetings, education,
                leadership, renewals and club performance
                without losing operational context.
              </p>
            </div>

            <div className="mt-14 grid max-w-xl gap-4 sm:grid-cols-2">
              <Feature
                icon={Users}
                title="Member success"
                description="Connected membership and education records."
              />

              <Feature
                icon={ShieldCheck}
                title="Operational control"
                description="Secure club-specific access and workflows."
              />
            </div>
          </div>

          <p className="relative text-sm text-slate-500">
            Secure access to your club operating workspace
          </p>
        </section>

        <section className="flex items-center justify-center bg-slate-100 px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500 text-lg font-black text-slate-950">
                T
              </div>

              <div>
                <p className="text-xl font-bold text-slate-950">
                  TMOS
                </p>
                <p className="text-xs text-slate-500">
                  Club Operating System
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/30 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <LockKeyhole className="size-5" />
              </div>

              <p className="mt-7 text-sm font-semibold uppercase tracking-widest text-amber-600">
                Secure sign in
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your TMOS account credentials to
                continue to your club workspace.
              </p>

              <form
                className="mt-8 space-y-5"
                onSubmit={handleSubmit}
              >
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Email address
                  </span>

                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setErrorMessage(null);
                      }}
                      autoComplete="email"
                      autoFocus
                      placeholder="you@example.com"
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Password
                  </span>

                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrorMessage(null);
                      }}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-3 top-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </label>

                {errorMessage ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isRestoringSession
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Signing in…"
                    : "Sign in to TMOS"}

                  {!isSubmitting ? (
                    <ArrowRight className="size-4" />
                  ) : null}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-500">
              Your session is stored securely in this
              browser and validated against the TMOS API.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

interface FeatureProps {
  icon: typeof Users;
  title: string;
  description: string;
}

function Feature({
  icon: Icon,
  title,
  description,
}: FeatureProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <Icon className="size-5 text-amber-400" />

      <p className="mt-4 font-semibold">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}
