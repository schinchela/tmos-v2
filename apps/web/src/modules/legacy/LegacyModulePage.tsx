import { ArrowLeft, ArrowRight, Construction } from "lucide-react";
import { Link } from "react-router-dom";

interface LegacyModulePageProps {
  title: string;
  description: string;
  legacyPath?: string;
}

export function LegacyModulePage({
  title,
  description,
  legacyPath,
}: LegacyModulePageProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Construction className="size-7" />
        </div>

        <p className="mt-7 text-sm font-semibold uppercase tracking-widest text-amber-600">
          Module replacement queued
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="font-semibold text-slate-900">
            Existing functionality remains available
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            TMOS is being replaced module by module. The existing production
            workflow will remain untouched until this module is rebuilt,
            tested and approved.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            Return to dashboard
          </Link>

          {legacyPath ? (
            <a
              href={legacyPath}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open existing module
              <ArrowRight className="size-4" />
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
