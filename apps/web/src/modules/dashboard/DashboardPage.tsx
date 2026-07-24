import type { ReactNode } from "react";

import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mic2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import {
  ButtonLink,
} from "../../components/actions/Button";
import { MetricCard } from "../../components/data-display/MetricCard";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { Badge } from "../../components/ui/Badge";
import { Surface } from "../../components/ui/Surface";
import {
  getRouteMetadata,
} from "../../theme/routeRegistry";

const dashboardRoute =
  getRouteMetadata("dashboard");

const metrics = [
  {
    label: "Active members",
    value: "42",
    detail: "3 joined this term",
    icon: Users,
    tone: "members" as const,
    badge: "Healthy",
  },
  {
    label: "Meetings this term",
    value: "18",
    detail: "Next meeting in 4 days",
    icon: CalendarDays,
    tone: "meetings" as const,
    badge: "On track",
  },
  {
    label: "Speeches completed",
    value: "36",
    detail: "8 completed this month",
    icon: Mic2,
    tone: "education" as const,
    badge: "Growing",
  },
  {
    label: "Education awards",
    value: "14",
    detail: "5 awaiting recognition",
    icon: Award,
    tone: "reports" as const,
    badge: "Review",
  },
];

const attentionItems = [
  {
    title: "Assign two vacant meeting roles",
    description:
      "Timer and Ah-Counter are not yet assigned for the next meeting.",
    status: "Required",
    tone: "danger" as const,
    icon: ShieldCheck,
  },
  {
    title: "Review three membership renewals",
    description:
      "These member renewals fall due within the next 30 days.",
    status: "Upcoming",
    tone: "warning" as const,
    icon: UserCheck,
  },
  {
    title: "Recognise five education achievements",
    description:
      "Members have completed pathway levels that are awaiting recognition.",
    status: "Review",
    tone: "education" as const,
    icon: Award,
  },
];

const quickActions = [
  {
    title: "Create next meeting",
    description:
      "Plan the agenda, speakers and role assignments.",
    to: "/meetings",
    tone: "meetings" as const,
    icon: CalendarDays,
  },
  {
    title: "Add a new member",
    description:
      "Create a member profile and education record.",
    to: "/members",
    tone: "members" as const,
    icon: UserCheck,
  },
  {
    title: "Review education progress",
    description:
      "See pathways, speeches and pending achievements.",
    to: "/education",
    tone: "education" as const,
    icon: Sparkles,
  },
];

export function DashboardPage() {
  return (
    <PageShell routeId="dashboard">
      <PageHeader
        title="Club command centre"
        description="See your club's operational position, upcoming priorities and member progress from one connected workspace."
        eyebrow={
          dashboardRoute.eyebrow
        }
        tone="dashboard"
        icon={
          <Sparkles className="size-4" />
        }
        actions={
          <>
            <ButtonLink
              to="/meetings"
              tone="meetings"
              trailingIcon={
                <ArrowRight className="size-4" />
              }
            >
              Open next meeting
            </ButtonLink>

            <ButtonLink
              to="/members"
              tone="dashboard"
              variant="outline"
            >
              View members
            </ButtonLink>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <HeaderSummary
            label="Next meeting"
            value="The Power of Perspective"
            detail="Saturday, 7:00 PM"
            icon={
              <CalendarDays className="size-5" />
            }
            tone="meetings"
          />

          <HeaderSummary
            label="Expected participants"
            value="19"
            detail="Based on current confirmations"
            icon={
              <Users className="size-5" />
            }
            tone="members"
          />

          <HeaderSummary
            label="Planning readiness"
            value="78%"
            detail="Two critical roles remain vacant"
            icon={
              <CheckCircle2 className="size-5" />
            }
            tone="success"
          />
        </div>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
              tone={metric.tone}
              icon={
                <Icon className="size-5" />
              }
              badge={
                <Badge tone={metric.tone}>
                  {metric.badge}
                </Badge>
              }
            />
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Surface padding="lg">
          <SectionHeader
            eyebrow="Operational readiness"
            title="What needs your attention"
            description="Priority work that may affect the next meeting, member retention or education progress."
          />

          <div className="mt-6 divide-y divide-slate-100">
            {attentionItems.map(
              (item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-950">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <Badge
                      tone={item.tone}
                    >
                      {item.status}
                    </Badge>
                  </div>
                );
              },
            )}
          </div>
        </Surface>

        <Surface padding="lg">
          <SectionHeader
            eyebrow="Quick actions"
            title="Continue club operations"
            description="Jump directly to the workflows that need your attention."
          />

          <div className="mt-5 space-y-3">
            {quickActions.map(
              (action) => {
                const Icon = action.icon;

                return (
                  <ButtonLink
                    key={action.title}
                    to={action.to}
                    tone={action.tone}
                    variant="soft"
                    fullWidth
                    className="min-h-16 justify-start px-4 text-left"
                    leadingIcon={
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
                        <Icon className="size-5" />
                      </span>
                    }
                    trailingIcon={
                      <ArrowRight className="ml-auto size-4 shrink-0" />
                    }
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        {action.title}
                      </span>

                      <span className="mt-1 block text-xs font-normal leading-5 opacity-75">
                        {action.description}
                      </span>
                    </span>
                  </ButtonLink>
                );
              },
            )}
          </div>
        </Surface>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Surface
          variant="soft"
          className="border-blue-200 bg-blue-50/70"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Clock3 className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-700">
                Meeting preparation
              </p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                Four days remaining
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Complete role assignments and publish the agenda before the meeting.
              </p>
            </div>
          </div>
        </Surface>

        <Surface
          variant="soft"
          className="border-teal-200 bg-teal-50/70"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <Users className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-teal-700">
                Member engagement
              </p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                86% participation
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Participation remains strong across meetings and education activities.
              </p>
            </div>
          </div>
        </Surface>

        <Surface
          variant="soft"
          className="border-violet-200 bg-violet-50/70"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Award className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-violet-700">
                Education momentum
              </p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                8 completions
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Eight speeches were completed this month across active pathways.
              </p>
            </div>
          </div>
        </Surface>
      </section>
    </PageShell>
  );
}

interface HeaderSummaryProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone:
    | "members"
    | "meetings"
    | "success";
}

const headerSummaryTone = {
  members: {
    icon: "bg-teal-50 text-teal-700",
    accent: "text-teal-700",
  },
  meetings: {
    icon: "bg-orange-50 text-orange-700",
    accent: "text-orange-700",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-700",
    accent: "text-emerald-700",
  },
};

function HeaderSummary({
  label,
  value,
  detail,
  icon,
  tone,
}: HeaderSummaryProps) {
  const classes =
    headerSummaryTone[tone];

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 truncate text-lg font-bold ${classes.accent}`}
          >
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {detail}
          </p>
        </div>
      </div>
    </article>
  );
}
