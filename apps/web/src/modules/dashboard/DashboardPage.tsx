import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mic2,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const metrics = [
  {
    label: "Active members",
    value: "42",
    detail: "3 joined this term",
    icon: Users,
  },
  {
    label: "Meetings this term",
    value: "18",
    detail: "Next meeting in 4 days",
    icon: CalendarDays,
  },
  {
    label: "Speeches completed",
    value: "36",
    detail: "8 this month",
    icon: Mic2,
  },
  {
    label: "Education awards",
    value: "14",
    detail: "5 awaiting recognition",
    icon: Award,
  },
];

const actions = [
  {
    title: "Create next meeting",
    description: "Plan the agenda, speakers and role assignments.",
    to: "/meetings",
    icon: CalendarDays,
  },
  {
    title: "Add a new member",
    description: "Create a member profile and education record.",
    to: "/members",
    icon: UserCheck,
  },
  {
    title: "Review education progress",
    description: "See pathways, speeches and pending achievements.",
    to: "/education",
    icon: Sparkles,
  },
];

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-screen-2xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px] xl:p-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300">
              <Sparkles className="size-4" />
              Club command centre
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
              Good evening, Suketh.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Your club is preparing for its next meeting. Complete the
              remaining role assignments and publish the agenda when ready.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/meetings"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Open next meeting
                <ArrowRight className="size-4" />
              </Link>

              <Link
                to="/members"
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-700 px-5 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                View members
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Next meeting
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  The Power of Perspective
                </h2>
              </div>

              <CalendarDays className="size-6 text-slate-500" />
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <Clock3 className="size-4 text-slate-500" />
                Saturday, 7:00 PM
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Users className="size-4 text-slate-500" />
                19 participants expected
              </div>

              <div className="flex items-center gap-3 text-amber-300">
                <CheckCircle2 className="size-4" />
                78% planning readiness
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-4/5 rounded-full bg-amber-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="size-5" />
                </div>

                <span className="text-xs font-semibold text-emerald-600">
                  Active
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {metric.label}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm font-semibold text-amber-600">
              Operational readiness
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              What needs your attention
            </h2>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {[
              {
                title: "Assign two vacant meeting roles",
                detail: "Timer and Ah-Counter are not yet assigned.",
                status: "Required",
              },
              {
                title: "Review three membership renewals",
                detail: "Renewals fall due within the next 30 days.",
                status: "Upcoming",
              },
              {
                title: "Recognise five education achievements",
                detail: "Members completed pathway levels this term.",
                status: "Review",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 py-5 first:pt-0 sm:flex-row sm:items-center"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <CheckCircle2 className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-amber-600">
            Quick actions
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Continue club operations
          </h2>

          <div className="mt-5 space-y-3">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Icon className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {action.title}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight className="size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                </Link>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
