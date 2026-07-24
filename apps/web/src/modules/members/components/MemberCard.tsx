import {
  Award,
  CalendarClock,
  ChevronRight,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { cn } from "../../../components/ui/cn";
import type { MemberSummary } from "../member.types";
import {
  formatMemberDate,
  getMemberInitials,
  getRenewalState,
} from "../member.utils";

interface MemberCardProps {
  member: MemberSummary;
}

const renewalStyles = {
  overdue:
    "border-red-200 bg-red-50 text-red-700",
  "due-soon":
    "border-amber-200 bg-amber-50 text-amber-700",
  current:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  unknown:
    "border-slate-200 bg-slate-50 text-slate-600",
};

const renewalLabels = {
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

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          {getMemberInitials(member)}
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

              <p className="mt-1 truncate text-sm text-slate-500">
                {member.toastmastersId ||
                  member.memberNumber ||
                  "Member identifier pending"}
              </p>
            </div>

            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                member.membershipStatus === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {member.membershipStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {member.activeOfficerRole ? (
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            <ShieldCheck className="size-4 shrink-0" />
            <span className="font-semibold">
              {member.activeOfficerRole}
            </span>
          </div>
        ) : null}

        <div className="flex items-start gap-3 text-sm text-slate-600">
          <Award className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-700">
              {member.pathwayName || "Pathway not assigned"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {member.pathwayName
                ? `Level ${member.pathwayLevel}`
                : "Education profile pending"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm text-slate-600">
          <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <span className="min-w-0 truncate">
            {member.email || "Email not recorded"}
          </span>
        </div>

        <div className="flex items-start gap-3 text-sm text-slate-600">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <span>
            Renewal:{" "}
            <span className="font-medium text-slate-700">
              {formatMemberDate(member.renewalDate)}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-semibold",
            renewalStyles[renewalState],
          )}
        >
          {renewalLabels[renewalState]}
        </span>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition group-hover:text-slate-950"
          disabled
          title="Member profile will be added in the next vertical slice"
        >
          Profile
          <ChevronRight className="size-4" />
        </button>
      </div>
    </article>
  );
}
