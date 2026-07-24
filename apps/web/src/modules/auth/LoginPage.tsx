import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import type {
  FormEvent,
  ReactNode,
} from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Button } from "../../components/actions/Button";
import { InlineAlert } from "../../components/feedback/InlineAlert";
import { TextField } from "../../components/forms/TextField";
import { PageTitleManager } from "../../components/navigation/PageTitleManager";
import { BrandMark } from "../../components/ui/BrandMark";
import { Badge } from "../../components/ui/Badge";
import { Surface } from "../../components/ui/Surface";
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

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

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
    <>
      <PageTitleManager title="Sign In | TMOS" />

      <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-14">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950" />

          <div className="absolute left-0 top-0 size-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 size-96 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 size-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <BrandMark inverse />

            <div className="mt-16 max-w-2xl">
              <Badge
                tone="primary"
                icon={
                  <Sparkles className="size-3.5" />
                }
                className="border border-white/15 bg-white/10 text-indigo-100"
              >
                Connected club operations
              </Badge>

              <h1 className="mt-7 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                Lead your club with clarity, speed and confidence.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                TMOS brings members, meetings,
                education, leadership and operational
                intelligence into one secure workspace.
              </p>
            </div>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
              <LoginFeature
                icon={
                  <Users className="size-5" />
                }
                tone="teal"
                title="Member success"
                description="Connected profiles, renewals, pathways and responsibilities."
              />

              <LoginFeature
                icon={
                  <CalendarCheck2 className="size-5" />
                }
                tone="orange"
                title="Meeting execution"
                description="Plan agendas, assign roles and deliver stronger meetings."
              />

              <LoginFeature
                icon={
                  <BarChart3 className="size-5" />
                }
                tone="violet"
                title="Operational intelligence"
                description="Turn club activity into visible priorities and progress."
              />

              <LoginFeature
                icon={
                  <ShieldCheck className="size-5" />
                }
                tone="blue"
                title="Secure club access"
                description="Every session is validated against the TMOS platform."
              />
            </div>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-slate-400">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <ShieldCheck className="size-4" />
            </div>

            <span>
              Secure, authenticated and club-aware
            </span>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute left-0 top-0 size-72 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 size-80 rounded-full bg-cyan-200/35 blur-3xl" />

          <div className="relative w-full max-w-lg">
            <div className="mb-8 lg:hidden">
              <BrandMark />
            </div>

            <Surface
              variant="elevated"
              padding="lg"
              className="relative overflow-hidden rounded-3xl"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <LockKeyhole className="size-5" />
                </div>

                <Badge
                  tone="success"
                  icon={
                    <ShieldCheck className="size-3.5" />
                  }
                >
                  Secure workspace
                </Badge>
              </div>

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                  Welcome to TMOS
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Sign in to continue
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Use your TMOS account credentials to
                  access your authorised club workspace.
                </p>
              </div>

              <form
                className="mt-8 space-y-5"
                onSubmit={handleSubmit}
              >
                <TextField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage(null);
                  }}
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="you@example.com"
                  leadingIcon={
                    <Mail className="size-5" />
                  }
                />

                <TextField
                  label="Password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    );
                    setErrorMessage(null);
                  }}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  leadingIcon={
                    <LockKeyhole className="size-5" />
                  }
                  trailingAction={
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
                      className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  }
                />

                {errorMessage ? (
                  <InlineAlert
                    tone="danger"
                    title="Sign-in unsuccessful"
                  >
                    {errorMessage}
                  </InlineAlert>
                ) : null}

                <Button
                  type="submit"
                  tone="primary"
                  size="lg"
                  fullWidth
                  disabled={
                    isSubmitting ||
                    isRestoringSession
                  }
                  trailingIcon={
                    !isSubmitting ? (
                      <ArrowRight className="size-4" />
                    ) : undefined
                  }
                >
                  {isSubmitting
                    ? "Signing in…"
                    : "Sign in to TMOS"}
                </Button>
              </form>

              <div className="mt-7 border-t border-slate-100 pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <ShieldCheck className="size-4" />
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Your browser stores only the session
                    token required to authenticate with
                    the TMOS API. Signing out revokes the
                    backend session.
                  </p>
                </div>
              </div>
            </Surface>

            <p className="mt-6 text-center text-xs text-slate-500">
              Toastmasters Operating System · Secure club
              operations workspace
            </p>
          </div>
        </section>
      </div>
      </main>
    </>
  );
}

interface LoginFeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
  tone:
    | "teal"
    | "orange"
    | "violet"
    | "blue";
}

const featureToneClasses = {
  teal:
    "border-teal-400/20 bg-teal-400/10 text-teal-200",
  orange:
    "border-orange-400/20 bg-orange-400/10 text-orange-200",
  violet:
    "border-violet-400/20 bg-violet-400/10 text-violet-200",
  blue:
    "border-blue-400/20 bg-blue-400/10 text-blue-200",
};

function LoginFeature({
  icon,
  title,
  description,
  tone,
}: LoginFeatureProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div
        className={`flex size-10 items-center justify-center rounded-xl border ${featureToneClasses[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 font-semibold text-white">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </article>
  );
}
