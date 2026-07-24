import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { Button } from "../../components/actions/Button";
import { MetricCard } from "../../components/data-display/MetricCard";
import { CardSkeletonGrid } from "../../components/feedback/Skeleton";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SearchField } from "../../components/forms/SearchField";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { Badge } from "../../components/ui/Badge";
import { Surface } from "../../components/ui/Surface";
import { ApiClientError } from "../../lib/api/apiClient";
import { MemberCard } from "./components/MemberCard";
import type { MemberSummary } from "./member.types";
import { listMembers } from "./members.service";

function matchesSearch(
  member: MemberSummary,
  searchTerm: string,
): boolean {
  if (!searchTerm) {
    return true;
  }

  const searchableValues = [
    member.displayName,
    member.firstName,
    member.lastName,
    member.email,
    member.phone,
    member.memberNumber,
    member.toastmastersId,
    member.membershipType,
    member.membershipStatus,
    member.pathwayName,
    member.activeOfficerRole,
  ];

  return searchableValues.some((value) =>
    value
      ?.toLocaleLowerCase()
      .includes(searchTerm),
  );
}

export function MembersPage() {
  const [search, setSearch] =
    useState("");

  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: listMembers,
  });

  const normalizedSearch = search
    .trim()
    .toLocaleLowerCase();

  const members = useMemo(
    () => membersQuery.data ?? [],
    [membersQuery.data],
  );

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        matchesSearch(
          member,
          normalizedSearch,
        ),
      ),
    [members, normalizedSearch],
  );

  const metrics = useMemo(() => {
    const active = members.filter(
      (member) =>
        member.membershipStatus ===
        "ACTIVE",
    ).length;

    const officers = members.filter(
      (member) =>
        Boolean(
          member.activeOfficerRole,
        ),
    ).length;

    const pathwayMembers = members.filter(
      (member) =>
        Boolean(member.pathwayName),
    ).length;

    return {
      total: members.length,
      active,
      officers,
      pathwayMembers,
    };
  }, [members]);

  const isSearching =
    normalizedSearch.length > 0;

  return (
    <PageShell routeId="members">
      <PageHeader
        title="Your club community"
        description="Review membership status, officer responsibilities, education progress and upcoming renewals from one connected directory."
        eyebrow="Member command centre"
        tone="members"
        icon={
          <Users className="size-4" />
        }
        backTo="/dashboard"
        backLabel="Back to dashboard"
        actions={
          <>
            <Button
              tone="members"
              leadingIcon={
                <UserPlus className="size-4" />
              }
              disabled
              title="Member creation will be added in the next vertical slice"
            >
              Add member
            </Button>

            <Button
              tone="members"
              variant="outline"
              leadingIcon={
                <RefreshCw
                  className={
                    membersQuery.isFetching
                      ? "size-4 animate-spin"
                      : "size-4"
                  }
                />
              }
              onClick={() =>
                void membersQuery.refetch()
              }
              disabled={
                membersQuery.isFetching
              }
            >
              Refresh directory
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DirectorySummary
            label="Directory records"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.total
            }
            detail="Non-archived member records"
            tone="members"
          />

          <DirectorySummary
            label="Active members"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.active
            }
            detail="Currently active membership"
            tone="success"
          />

          <DirectorySummary
            label="Club officers"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.officers
            }
            detail="Active officer assignments"
            tone="leadership"
          />

          <DirectorySummary
            label="On a pathway"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.pathwayMembers
            }
            detail="Education pathway recorded"
            tone="education"
          />
        </div>
      </PageHeader>

      {!membersQuery.isError ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Directory members"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.total
            }
            detail="Available member records"
            tone="members"
            icon={
              <Users className="size-5" />
            }
            badge={
              <Badge tone="members">
                Directory
              </Badge>
            }
          />

          <MetricCard
            label="Active members"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.active
            }
            detail="Currently active membership"
            tone="success"
            icon={
              <UserCheck className="size-5" />
            }
            badge={
              <Badge tone="success">
                Active
              </Badge>
            }
          />

          <MetricCard
            label="Club officers"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.officers
            }
            detail="Active officer assignments"
            tone="leadership"
            icon={
              <ShieldCheck className="size-5" />
            }
            badge={
              <Badge tone="leadership">
                Leadership
              </Badge>
            }
          />

          <MetricCard
            label="On a pathway"
            value={
              membersQuery.isLoading
                ? "—"
                : metrics.pathwayMembers
            }
            detail="Education pathway recorded"
            tone="education"
            icon={
              <Award className="size-5" />
            }
            badge={
              <Badge tone="education">
                Education
              </Badge>
            }
          />
        </section>
      ) : null}

      <Surface padding="md">
        <SectionHeader
          eyebrow="Member directory"
          title="Find and review members"
          description="Search names, identifiers, pathways, officer roles, membership status and contact details."
          actions={
            <Badge
              tone={
                isSearching
                  ? "members"
                  : "neutral"
              }
              icon={
                <Filter className="size-3.5" />
              }
            >
              {isSearching
                ? `${filteredMembers.length} matches`
                : `${members.length} records`}
            </Badge>
          }
        />

        <div className="mt-5">
          <SearchField
            label="Search members"
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, member ID, pathway, role or status..."
          />
        </div>
      </Surface>

      {membersQuery.isLoading ? (
        <CardSkeletonGrid count={6} />
      ) : null}

      {membersQuery.isError ? (
        <MembersErrorState
          error={membersQuery.error}
          onRetry={() =>
            void membersQuery.refetch()
          }
        />
      ) : null}

      {membersQuery.isSuccess &&
      filteredMembers.length > 0 ? (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-950">
                {filteredMembers.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-950">
                {members.length}
              </span>{" "}
              members
            </p>

            {isSearching ? (
              <Button
                variant="ghost"
                tone="members"
                size="sm"
                onClick={() =>
                  setSearch("")
                }
              >
                Clear search
              </Button>
            ) : null}
          </div>

          <section
            aria-label="Member directory results"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredMembers.map(
              (member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                />
              ),
            )}
          </section>
        </>
      ) : null}

      {membersQuery.isSuccess &&
      filteredMembers.length === 0 ? (
        <EmptyState
          title="No members found"
          description="Try another name, member identifier, status, pathway, officer role or contact detail."
          tone="members"
          icon={
            <Search className="size-7" />
          }
          action={
            isSearching ? (
              <Button
                tone="members"
                variant="soft"
                onClick={() =>
                  setSearch("")
                }
              >
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : null}
    </PageShell>
  );
}

interface DirectorySummaryProps {
  label: string;
  value: string | number;
  detail: string;
  tone:
    | "members"
    | "success"
    | "leadership"
    | "education";
}

const directorySummaryStyles = {
  members: {
    background:
      "border-teal-100 bg-teal-50/70",
    label: "text-teal-700",
    value: "text-teal-900",
  },
  success: {
    background:
      "border-emerald-100 bg-emerald-50/70",
    label: "text-emerald-700",
    value: "text-emerald-900",
  },
  leadership: {
    background:
      "border-blue-100 bg-blue-50/70",
    label: "text-blue-700",
    value: "text-blue-900",
  },
  education: {
    background:
      "border-violet-100 bg-violet-50/70",
    label: "text-violet-700",
    value: "text-violet-900",
  },
};

function DirectorySummary({
  label,
  value,
  detail,
  tone,
}: DirectorySummaryProps) {
  const styles =
    directorySummaryStyles[tone];

  return (
    <article
      className={`rounded-2xl border p-4 ${styles.background}`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${styles.label}`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${styles.value}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {detail}
      </p>
    </article>
  );
}

interface MembersErrorStateProps {
  error: Error;
  onRetry: () => void;
}

function MembersErrorState({
  error,
  onRetry,
}: MembersErrorStateProps) {
  const apiError =
    error instanceof ApiClientError
      ? error
      : null;

  return (
    <ErrorState
      title="Member directory unavailable"
      description={
        apiError?.status === 401
          ? "Your TMOS session is no longer valid. Sign in again to continue."
          : error.message
      }
      requestId={apiError?.requestId}
      onRetry={onRetry}
    />
  );
}
