import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Construction,
  Database,
  ExternalLink,
  Layers3,
  ShieldCheck,
} from "lucide-react";

import {
  ButtonLink,
} from "../../components/actions/Button";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { Badge } from "../../components/ui/Badge";
import { Surface } from "../../components/ui/Surface";
import {
  getRouteMetadata,
} from "../../theme/routeRegistry";
import type { UiTone } from "../../theme/ui.types";

interface LegacyModulePageProps {
  routeId:
    | "meetings"
    | "education"
    | "leadership"
    | "reports"
    | "administration";
  legacyPath?: string;
}

const migrationSteps = [
  {
    title: "Legacy workflow preserved",
    description:
      "The existing module remains available while its replacement is built and validated.",
    status: "Protected",
    icon: ShieldCheck,
  },
  {
    title: "Rust API migration",
    description:
      "Business operations will move to typed Rust services and club-specific D1 access.",
    status: "Queued",
    icon: Database,
  },
  {
    title: "Enterprise frontend replacement",
    description:
      "The new React experience will use the shared TMOS design and navigation system.",
    status: "Planned",
    icon: Layers3,
  },
  {
    title: "Controlled production cutover",
    description:
      "The legacy workflow will be retired only after testing, approval and a rollback window.",
    status: "Future",
    icon: CheckCircle2,
  },
];

export function LegacyModulePage({
  routeId,
  legacyPath,
}: LegacyModulePageProps) {
  const route =
    getRouteMetadata(routeId);

  const RouteIcon = route.icon;

  return (
    <PageShell routeId={routeId}>
      <PageHeader
        title={route.title}
        description={
          route.description
        }
        eyebrow={
          route.eyebrow
        }
        tone={route.tone}
        icon={
          <RouteIcon className="size-4" />
        }
        backTo={
          route.backTo ||
          "/dashboard"
        }
        backLabel={
          route.backLabel ||
          "Back to dashboard"
        }
        badge={
          <Badge
            tone="warning"
            icon={
              <Construction className="size-3.5" />
            }
            className="border border-white/20 bg-white/10 text-white"
          >
            Replacement queued
          </Badge>
        }
        actions={
          <>
            <ButtonLink
              to="/dashboard"
              tone={route.tone}
              variant="outline"
              leadingIcon={
                <ArrowLeft className="size-4" />
              }
            >
              Dashboard
            </ButtonLink>

            {legacyPath ? (
              <a
                href={legacyPath}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
              >
                Open existing module
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MigrationSummary
            label="Current state"
            value="Legacy active"
            detail="Existing workflow remains available"
            tone="warning"
          />

          <MigrationSummary
            label="Replacement"
            value="Queued"
            detail="Scheduled for vertical migration"
            tone={route.tone}
          />

          <MigrationSummary
            label="Cutover policy"
            value="Controlled"
            detail="No retirement before approval"
            tone="success"
          />
        </div>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Surface padding="lg">
          <SectionHeader
            eyebrow="Migration roadmap"
            title={`How ${route.title.toLowerCase()} will be replaced`}
            description="TMOS modules are rebuilt as complete vertical slices so backend behaviour, frontend experience, security and performance are validated together."
          />

          <div className="mt-7">
            {migrationSteps.map(
              (step, index) => {
                const Icon = step.icon;
                const isLast =
                  index ===
                  migrationSteps.length - 1;

                return (
                  <div
                    key={step.title}
                    className="relative flex gap-4"
                  >
                    {!isLast ? (
                      <div className="absolute left-5 top-11 h-full w-px bg-slate-200" />
                    ) : null}

                    <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1 pb-7">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-950">
                          {step.title}
                        </p>

                        <Badge
                          tone={
                            index === 0
                              ? "success"
                              : index === 1
                                ? route.tone
                                : "neutral"
                          }
                        >
                          {step.status}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface
            variant="soft"
            className="border-amber-200 bg-amber-50/80"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Construction className="size-5" />
              </div>

              <div>
                <p className="font-semibold text-amber-900">
                  Existing functionality remains available
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-800/80">
                  Continue using the legacy workflow until the new module has been completed, tested and approved.
                </p>
              </div>
            </div>
          </Surface>

          <Surface>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Replacement standards
            </p>

            <div className="mt-4 space-y-4">
              <StandardItem>
                Typed Rust API and validated contracts
              </StandardItem>

              <StandardItem>
                Fast club-specific database access
              </StandardItem>

              <StandardItem>
                Enterprise forms, tables and states
              </StandardItem>

              <StandardItem>
                Responsive and accessible navigation
              </StandardItem>

              <StandardItem>
                Performance review before completion
              </StandardItem>
            </div>
          </Surface>

          {legacyPath ? (
            <a
              href={legacyPath}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
            >
              Continue in existing module
              <ArrowRight className="size-4" />
            </a>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}

interface MigrationSummaryProps {
  label: string;
  value: string;
  detail: string;
  tone: UiTone;
}

const migrationSummaryStyles: Partial<
  Record<UiTone, string>
> = {
  success:
    "border-emerald-100 bg-emerald-50/70 text-emerald-800",
  warning:
    "border-amber-100 bg-amber-50/70 text-amber-800",
  meetings:
    "border-orange-100 bg-orange-50/70 text-orange-800",
  education:
    "border-violet-100 bg-violet-50/70 text-violet-800",
  leadership:
    "border-blue-100 bg-blue-50/70 text-blue-800",
  reports:
    "border-emerald-100 bg-emerald-50/70 text-emerald-800",
  administration:
    "border-indigo-100 bg-indigo-50/70 text-indigo-800",
};

function MigrationSummary({
  label,
  value,
  detail,
  tone,
}: MigrationSummaryProps) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        migrationSummaryStyles[tone] ||
        "border-slate-200 bg-slate-50/70 text-slate-800"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {detail}
      </p>
    </article>
  );
}

interface StandardItemProps {
  children: string;
}

function StandardItem({
  children,
}: StandardItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <CircleDot className="size-3.5" />
      </div>

      <p className="text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
  );
}
