import type { ReactNode } from "react";

import {
  Award,
  CalendarClock,
  ChevronRight,
  Hash,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../../components/ui/Badge";
import { Surface } from "../../../components/ui/Surface";
import { cn } from "../../../components/ui/cn";
import type { UiTone } from "../../../theme/ui.types";
import type { MemberSummary } from "../member.types";
import {
  formatMemberDate,
  getMemberInitials,
  getRenewalState,
} from "../member.utils";

interface MemberCardProps {
  member: MemberSummary;
}

const renewalTone: Record<
  ReturnType<typeof getRenewalState>,
  UiTone
> = {
  overdue: "danger",
  "due-soon": "warning",
  current: "success",
  unknown: "neutral",
};

const renewalLabels: Record<
  ReturnType<typeof getRenewalState>,
  string
> = {
  overdue: "Renewal overdue",
  "due-soon": "Renewal approaching",
  current: "Renewal current",
  unknown: "Renewal not recorded",
};

export function MemberCard({
  member,
}: MemberCardProps) {
  const renewalState = getRenewalState(
    member.renewalDate,
  );

  const memberIdentifier =
    member.toastmastersId ||
    member.memberNumber ||
    "Identifier pending";

  const membershipTone: UiTone =
    member.membershipStatus === "ACTIVE"
      ? "success"
      : "neutral";

  return (
    <Surface
      as="article"
      padding="none"
      className="group relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-100/60"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 opacity-75" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-base font-bold text-white shadow-lg shadow-teal-100">
            {getMemberInitials(member)}

            {member.activeOfficerRole ? (
              <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-lg border-2 border-white bg-indigo-600 text-white">
                <ShieldCheck className="size-3.5" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-950">
                  {member.displayName}
                  {member.recognitionSuffix
                    ? `, ${member.recognitionSuffix}`
                    : ""}
                </h2>

                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                  <Hash className="size-3.5 shrink-0" />

                  <span className="truncate">
                    {memberIdentifier}
                  </span>
                </div>
              </div>

              <Badge tone={membershipTone}>
                {formatStatus(
                  member.membershipStatus,
                )}
              </Badge>
            </div>
          </div>
        </div>

        {member.activeOfficerRole ? (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-3 text-sm text-indigo-800">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <ShieldCheck className="size-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                Club leadership
              </p>

              <p className="mt-0.5 truncate font-semibold">
                {member.activeOfficerRole}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <MemberDetail
            icon={
              <Award className="size-4" />
            }
            label="Education pathway"
            value={
              member.pathwayName ||
              "Pathway not assigned"
            }
            detail={
              member.pathwayName
                ? `Level ${member.pathwayLevel}`
                : "Education profile pending"
            }
            tone="education"
          />

          <MemberDetail
            icon={
              <Mail className="size-4" />
            }
            label="Email address"
            value={
              member.email ||
              "Email not recorded"
            }
            tone="members"
          />

          <MemberDetail
            icon={
              <CalendarClock className="size-4" />
            }
            label="Renewal date"
            value={formatMemberDate(
              member.renewalDate,
            )}
            tone={renewalTone[renewalState]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
        <Badge
          tone={renewalTone[renewalState]}
          outlined
        >
          {renewalLabels[renewalState]}
        </Badge>

        <Link
          to={`/members/${member.id}`}
          aria-label={`Open ${member.displayName}'s member profile`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 hover:text-teal-900"
        >
          View profile
          <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Surface>
  );
}

interface MemberDetailProps {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
  tone: UiTone;
}

const detailToneClasses: Partial<
  Record<UiTone, string>
> = {
  members:
    "bg-teal-50 text-teal-700",
  education:
    "bg-violet-50 text-violet-700",
  success:
    "bg-emerald-50 text-emerald-700",
  warning:
    "bg-amber-50 text-amber-700",
  danger:
    "bg-rose-50 text-rose-700",
  neutral:
    "bg-slate-100 text-slate-600",
};

function MemberDetail({
  icon,
  label,
  value,
  detail,
  tone,
}: MemberDetailProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          detailToneClasses[tone] ||
            detailToneClasses.neutral,
        )}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>

        {detail ? (
          <p className="mt-0.5 text-xs text-slate-500">
            {detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function formatStatus(
  status: string,
): string {
  return status
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}
