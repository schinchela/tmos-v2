import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

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
  const [search, setSearch] = useState("");

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
        matchesSearch(member, normalizedSearch),
      ),
    [members, normalizedSearch],
  );

  const metrics = useMemo(() => {
    const active = members.filter(
      (member) =>
        member.membershipStatus === "ACTIVE",
    ).length;

    const officers = members.filter(
      (member) => member.activeOfficerRole,
    ).length;

    const pathwayMembers = members.filter(
      (member) => member.pathwayName,
    ).length;

    return {
      total: members.length,
      active,
      officers,
      pathwayMembers,
    };
  }, [members]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_340px] xl:p-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300">
              <Users className="size-4" />
              Member command centre
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Your club community
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Review membership status, officer
              responsibilities, education progress and
              upcoming renewals from one connected directory.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                title="Member creation is coming in the next slice"
                className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 opacity-70"
              >
                <UserPlus className="size-4" />
                Add member
              </button>

              <button
                type="button"
                onClick={() => membersQuery.refetch()}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-5 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                <RefreshCw
                  className={
                    membersQuery.isFetching
                      ? "size-4 animate-spin"
                      : "size-4"
                  }
                />
                Refresh directory
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm font-semibold text-amber-300">
              Directory readiness
            </p>

            <p className="mt-3 text-4xl font-bold">
              {membersQuery.isLoading
                ? "—"
                : metrics.total}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Current non-archived member records
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">
                  Active
                </p>
                <p className="mt-1 text-lg font-bold">
                  {metrics.active}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">
                  Officers
                </p>
                <p className="mt-1 text-lg font-bold">
                  {metrics.officers}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!membersQuery.isError ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Directory members",
              value: metrics.total,
              icon: Users,
              detail: "Available member records",
            },
            {
              label: "Active members",
              value: metrics.active,
              icon: Users,
              detail: "Currently active membership",
            },
            {
              label: "Club officers",
              value: metrics.officers,
              icon: ShieldCheck,
              detail: "Active officer assignments",
            },
            {
              label: "On a pathway",
              value: metrics.pathwayMembers,
              icon: Award,
              detail: "Education pathway recorded",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="size-5" />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {metric.label}
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  {membersQuery.isLoading
                    ? "—"
                    : metric.value}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {metric.detail}
                </p>
              </article>
            );
          })}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Member directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search names, identifiers, pathways, roles,
              status and contact details.
            </p>
          </div>

          <label className="relative block w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              type="search"
              placeholder="Search members..."
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
          </label>
        </div>
      </section>

      {membersQuery.isLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
            />
          ))}
        </section>
      ) : null}

      {membersQuery.isError ? (
        <ErrorState
          error={membersQuery.error}
          onRetry={() => membersQuery.refetch()}
        />
      ) : null}

      {membersQuery.isSuccess &&
      filteredMembers.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-950">
                {filteredMembers.length}
              </span>{" "}
              of {members.length} members
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
              />
            ))}
          </section>
        </>
      ) : null}

      {membersQuery.isSuccess &&
      filteredMembers.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Search className="mx-auto size-9 text-slate-300" />

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No members found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try another name, status, pathway, role or
            member identifier.
          </p>
        </section>
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

function ErrorState({
  error,
  onRetry,
}: ErrorStateProps) {
  const apiError =
    error instanceof ApiClientError ? error : null;

  const tokenMissing =
    apiError?.code === "AUTH_TOKEN_MISSING" ||
    apiError?.status === 401;

  return (
    <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
        <AlertCircle className="size-6" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-950">
        {tokenMissing
          ? "TMOS login required"
          : "Member directory unavailable"}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {tokenMissing
          ? "This frontend does not yet have its login screen. Add a valid development access token to this browser, then retry."
          : error.message}
      </p>

      {apiError?.requestId ? (
        <p className="mt-3 text-xs text-slate-500">
          Request ID: {apiError.requestId}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <RefreshCw className="size-4" />
        Retry
      </button>
    </section>
  );
}
