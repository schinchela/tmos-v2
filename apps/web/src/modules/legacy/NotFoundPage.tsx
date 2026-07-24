import type { ReactNode } from "react";

import {
  ArrowLeft,
  Compass,
  Home,
  Map,
  SearchX,
} from "lucide-react";
import {
  useLocation,
} from "react-router-dom";

import {
  ButtonLink,
} from "../../components/actions/Button";
import { PageTitleManager } from "../../components/navigation/PageTitleManager";
import { Badge } from "../../components/ui/Badge";
import { BrandMark } from "../../components/ui/BrandMark";
import { Surface } from "../../components/ui/Surface";

export function NotFoundPage() {
  const location = useLocation();

  return (
    <>
      <PageTitleManager title="Page Not Found | TMOS" />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-12">
        <div className="absolute left-0 top-0 size-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 size-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative w-full max-w-3xl">
          <div className="mb-8 flex justify-center">
            <BrandMark inverse />
          </div>

          <Surface
            variant="elevated"
            padding="lg"
            className="overflow-hidden rounded-3xl text-center"
          >
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-100 to-cyan-100 text-indigo-700">
              <SearchX className="size-8" />
            </div>

            <Badge
              tone="warning"
              className="mx-auto mt-6"
            >
              Error 404
            </Badge>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              This page could not be found
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
              The address may be incorrect, the page may have moved, or the feature may not have been migrated into TMOS v2 yet.
            </p>

            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Requested address
              </p>

              <p className="mt-1 break-all font-mono text-sm text-slate-700">
                {location.pathname}
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink
                to="/dashboard"
                tone="dashboard"
                leadingIcon={
                  <Home className="size-4" />
                }
              >
                Return to dashboard
              </ButtonLink>

              <ButtonLink
                to="/members"
                tone="members"
                variant="soft"
                leadingIcon={
                  <Compass className="size-4" />
                }
              >
                Open members
              </ButtonLink>
            </div>
          </Surface>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <NavigationHint
              icon={
                <Home className="size-4" />
              }
              title="Dashboard"
              description="Return to your club overview."
            />

            <NavigationHint
              icon={
                <Map className="size-4" />
              }
              title="Navigation"
              description="Use the sidebar to find a module."
            />

            <NavigationHint
              icon={
                <ArrowLeft className="size-4" />
              }
              title="Browser back"
              description="Return to the previous page safely."
            />
          </div>
        </div>
      </main>
    </>
  );
}

interface NavigationHintProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function NavigationHint({
  icon,
  title,
  description,
}: NavigationHintProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur-sm">
      <div className="flex items-center gap-2 text-indigo-200">
        {icon}

        <p className="text-sm font-semibold">
          {title}
        </p>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}
