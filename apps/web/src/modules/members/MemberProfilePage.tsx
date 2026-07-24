import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  Edit3,
  Fingerprint,
  Hash,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import {
  useMemo,
} from "react";
import type { ReactNode } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { Button } from "../../components/actions/Button";
import { DefinitionList } from "../../components/data-display/DefinitionList";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { Badge } from "../../components/ui/Badge";
import { Surface } from "../../components/ui/Surface";
import { ApiClientError } from "../../lib/api/apiClient";
import type { UiTone } from "../../theme/ui.types";
import { MemberProfileSkeleton } from "./components/MemberProfileSkeleton";
import type { MemberProfile } from "./member.types";
import {
  formatMemberDate,
  formatMemberDateTime,
  formatMemberStatus,
  getMemberInitials,
  getRenewalState,
} from "./member.utils";
import { getMemberById } from "./members.service";

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

export function MemberProfilePage() {
  const { memberId } = useParams<{
    memberId: string;
  }>();

  const normalizedMemberId =
    memberId?.trim() || "";

  const memberQuery = useQuery({
    queryKey: [
      "members",
      "detail",
      normalizedMemberId,
    ],
    queryFn: () =>
      getMemberById(normalizedMemberId),
    enabled:
      normalizedMemberId.length > 0,
  });

  if (!normalizedMemberId) {
    return (
      <PageShell
        routeId="members"
        browserTitle="Member Not Found | TMOS"
        currentBreadcrumbLabel="Member profile"
      >
        <EmptyState
          title="Member identifier missing"
          description="TMOS could not determine which member profile to open."
          tone="members"
          icon={<User className="size-7" />}
          action={
            <Link
              to="/members"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100"
            >
              <ArrowLeft className="size-4" />
              Return to members
            </Link>
          }
        />
      </PageShell>
    );
  }

  if (memberQuery.isLoading) {
    return (
      <PageShell
        routeId="members"
        browserTitle="Loading Member | TMOS"
        currentBreadcrumbLabel="Member profile"
      >
        <MemberProfileSkeleton />
      </PageShell>
    );
  }

  if (memberQuery.isError) {
    return (
      <MemberProfileError
        error={memberQuery.error}
        onRetry={() =>
          void memberQuery.refetch()
        }
      />
    );
  }

  if (!memberQuery.data) {
    return (
      <PageShell
        routeId="members"
        browserTitle="Member Not Found | TMOS"
        currentBreadcrumbLabel="Member profile"
      >
        <EmptyState
          title="Member profile unavailable"
          description="The requested member record did not return any profile data."
          tone="members"
          icon={<User className="size-7" />}
          action={
            <Link
              to="/members"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100"
            >
              <ArrowLeft className="size-4" />
              Return to members
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <MemberProfileContent
      member={memberQuery.data}
      isRefreshing={
        memberQuery.isFetching
      }
      onRefresh={() =>
        void memberQuery.refetch()
      }
    />
  );
}

interface MemberProfileContentProps {
  member: MemberProfile;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function MemberProfileContent({
  member,
  isRefreshing,
  onRefresh,
}: MemberProfileContentProps) {
  const renewalState = getRenewalState(
    member.renewalDate,
  );

  const browserTitle =
    `${member.displayName} | Members | TMOS`;

  const membershipTone: UiTone =
    member.membershipStatus === "ACTIVE"
      ? "success"
      : "neutral";

  const profileIdentityItems = useMemo(
    () => [
      {
        label: "Full name",
        value: member.displayName,
        icon: <User className="size-4" />,
      },
      {
        label: "Membership status",
        value: (
          <Badge tone={membershipTone}>
            {formatMemberStatus(
              member.membershipStatus,
            )}
          </Badge>
        ),
        icon: (
          <UserCheck className="size-4" />
        ),
      },
      {
        label: "Membership type",
        value:
          member.membershipType ||
          "Not recorded",
        icon: <Users className="size-4" />,
      },
      {
        label: "Join date",
        value: formatMemberDate(
          member.joinDate,
        ),
        icon: (
          <CalendarCheck2 className="size-4" />
        ),
      },
      {
        label: "Renewal date",
        value: (
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {formatMemberDate(
                member.renewalDate,
              )}
            </span>

            <Badge
              tone={
                renewalTone[renewalState]
              }
            >
              {
                renewalLabels[
                  renewalState
                ]
              }
            </Badge>
          </span>
        ),
        icon: (
          <CalendarClock className="size-4" />
        ),
      },
      {
        label: "Recognition suffix",
        value:
          member.recognitionSuffix ||
          "None recorded",
        icon: <Award className="size-4" />,
      },
    ],
    [
      member,
      membershipTone,
      renewalState,
    ],
  );

  const contactItems = useMemo(
    () => [
      {
        label: "Email address",
        value: member.email ? (
          <a
            href={`mailto:${member.email}`}
            className="text-teal-700 transition hover:text-teal-900 hover:underline"
          >
            {member.email}
          </a>
        ) : (
          "Not recorded"
        ),
        icon: <Mail className="size-4" />,
      },
      {
        label: "Phone number",
        value: member.phone ? (
          <a
            href={`tel:${member.phone}`}
            className="text-teal-700 transition hover:text-teal-900 hover:underline"
          >
            {member.phone}
          </a>
        ) : (
          "Not recorded"
        ),
        icon: <Phone className="size-4" />,
      },
    ],
    [member.email, member.phone],
  );

  const identifierItems = useMemo(
    () => [
      {
        label: "TMOS member number",
        value:
          member.memberNumber ||
          "Not assigned",
        icon: <Hash className="size-4" />,
      },
      {
        label: "Toastmasters ID",
        value:
          member.toastmastersId ||
          "Not recorded",
        icon: (
          <Fingerprint className="size-4" />
        ),
      },
      {
        label: "Internal record ID",
        value: (
          <span className="font-mono text-xs">
            {member.id}
          </span>
        ),
        icon: <ShieldCheck className="size-4" />,
      },
    ],
    [
      member.id,
      member.memberNumber,
      member.toastmastersId,
    ],
  );

  return (
    <PageShell
      routeId="members"
      browserTitle={browserTitle}
      currentBreadcrumbLabel={
        member.displayName
      }
    >
      <PageHeader
        title={member.displayName}
        description="Review the member's identity, contact details, membership standing, education pathway and club responsibility."
        eyebrow="Member 360"
        tone="members"
        icon={<User className="size-4" />}
        backTo="/members"
        backLabel="Back to member directory"
        badge={
          <Badge
            tone={membershipTone}
            className="border border-white/20 bg-white/10 text-white"
          >
            {formatMemberStatus(
              member.membershipStatus,
            )}
          </Badge>
        }
        actions={
          <>
            <Button
              tone="members"
              variant="outline"
              leadingIcon={
                <RefreshCw
                  className={
                    isRefreshing
                      ? "size-4 animate-spin"
                      : "size-4"
                  }
                />
              }
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              Refresh profile
            </Button>

            <Button
              tone="members"
              leadingIcon={
                <Edit3 className="size-4" />
              }
              disabled
              title="Member editing will be added in the Members CRUD slice"
            >
              Edit member
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-xl font-bold text-white shadow-lg shadow-teal-100">
            {getMemberInitials(member)}

            {member.activeOfficerRole ? (
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-xl border-2 border-white bg-indigo-600 text-white">
                <ShieldCheck className="size-4" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Member identity
            </p>

            <p className="mt-2 text-xl font-bold text-slate-950">
              {member.toastmastersId ||
                member.memberNumber ||
                "Identifier pending"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={membershipTone}>
                {formatMemberStatus(
                  member.membershipStatus,
                )}
              </Badge>

              <Badge
                tone={
                  renewalTone[renewalState]
                }
              >
                {
                  renewalLabels[
                    renewalState
                  ]
                }
              </Badge>

              {member.activeOfficerRole ? (
                <Badge
                  tone="leadership"
                  icon={
                    <ShieldCheck className="size-3.5" />
                  }
                >
                  {member.activeOfficerRole}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Surface padding="lg">
            <SectionHeader
              eyebrow="Membership profile"
              title="Identity and membership"
              description="The member's primary identity, standing and renewal information."
            />

            <div className="mt-7">
              <DefinitionList
                items={profileIdentityItems}
                columns={2}
              />
            </div>
          </Surface>

          <Surface padding="lg">
            <SectionHeader
              eyebrow="Communication"
              title="Contact information"
              description="Current contact details recorded for club communication."
            />

            <div className="mt-7">
              <DefinitionList
                items={contactItems}
                columns={2}
              />
            </div>
          </Surface>

          <Surface padding="lg">
            <SectionHeader
              eyebrow="Record identity"
              title="Member identifiers"
              description="Internal and Toastmasters identifiers associated with this member."
            />

            <div className="mt-7">
              <DefinitionList
                items={identifierItems}
                columns={3}
              />
            </div>
          </Surface>
        </div>

        <aside className="space-y-6">
          <EducationCard member={member} />

          <LeadershipCard member={member} />

          <Surface padding="lg">
            <SectionHeader
              eyebrow="System record"
              title="Record metadata"
            />

            <div className="mt-6 space-y-5">
              <MetadataItem
                icon={
                  <CalendarCheck2 className="size-4" />
                }
                label="Created"
                value={formatMemberDateTime(
                  member.createdAt,
                )}
              />

              <MetadataItem
                icon={
                  <Clock3 className="size-4" />
                }
                label="Last updated"
                value={formatMemberDateTime(
                  member.updatedAt,
                )}
              />
            </div>
          </Surface>
        </aside>
      </section>
    </PageShell>
  );
}

interface EducationCardProps {
  member: MemberProfile;
}

function EducationCard({
  member,
}: EducationCardProps) {
  const hasPathway = Boolean(
    member.pathwayName,
  );

  return (
    <Surface
      padding="lg"
      className="overflow-hidden border-violet-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <Award className="size-6" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">
            Education
          </p>

          <h2 className="mt-2 text-lg font-bold text-slate-950">
            {hasPathway
              ? member.pathwayName
              : "Pathway not assigned"}
          </h2>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
          Current pathway level
        </p>

        <p className="mt-2 text-3xl font-bold text-violet-900">
          {hasPathway
            ? `Level ${member.pathwayLevel}`
            : "—"}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {hasPathway
            ? "Current recorded progress in the member's active pathway."
            : "Education assignment will appear here once a pathway is recorded."}
        </p>
      </div>
    </Surface>
  );
}

interface LeadershipCardProps {
  member: MemberProfile;
}

function LeadershipCard({
  member,
}: LeadershipCardProps) {
  return (
    <Surface
      padding="lg"
      className="overflow-hidden border-blue-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <ShieldCheck className="size-6" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Club leadership
          </p>

          <h2 className="mt-2 text-lg font-bold text-slate-950">
            {member.activeOfficerRole ||
              "No active officer role"}
          </h2>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">
        {member.activeOfficerRole
          ? "This member currently holds an active club leadership assignment."
          : "No current club officer assignment is recorded for this member."}
      </p>
    </Surface>
  );
}

interface MetadataItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function MetadataItem({
  icon,
  label,
  value,
}: MetadataItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

interface MemberProfileErrorProps {
  error: Error;
  onRetry: () => void;
}

function MemberProfileError({
  error,
  onRetry,
}: MemberProfileErrorProps) {
  const apiError =
    error instanceof ApiClientError
      ? error
      : null;

  const isNotFound =
    apiError?.status === 404 ||
    apiError?.code ===
      "MEMBER_NOT_FOUND";

  if (isNotFound) {
    return (
      <PageShell
        routeId="members"
        browserTitle="Member Not Found | TMOS"
        currentBreadcrumbLabel="Member not found"
      >
        <EmptyState
          title="Member not found"
          description="The requested member may have been removed, archived or the address may be incorrect."
          tone="members"
          icon={<User className="size-7" />}
          action={
            <Link
              to="/members"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100"
            >
              <ArrowLeft className="size-4" />
              Return to members
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      routeId="members"
      browserTitle="Member Profile Unavailable | TMOS"
      currentBreadcrumbLabel="Member profile"
    >
      <ErrorState
        title="Member profile unavailable"
        description={
          apiError?.status === 401
            ? "Your TMOS session is no longer valid. Sign in again to continue."
            : error.message
        }
        requestId={apiError?.requestId}
        onRetry={onRetry}
      />
    </PageShell>
  );
}
