import type { MemberSummary } from "./member.types";

export function getMemberInitials(
  member: MemberSummary,
): string {
  const names = [
    member.firstName,
    member.lastName,
  ].filter(Boolean);

  const initials = names
    .map((name) => name.trim().charAt(0))
    .join("")
    .toUpperCase();

  return initials || "TM";
}

export function formatMemberDate(
  value: string | null,
): string {
  if (!value) {
    return "Not recorded";
  }

  const normalizedValue =
    value.length === 10
      ? `${value}T00:00:00`
      : value.replace(" ", "T");

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatMemberDateTime(
  value: string | null,
): string {
  if (!value) {
    return "Not recorded";
  }

  const normalizedValue = value.replace(
    " ",
    "T",
  );

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getRenewalState(
  renewalDate: string | null,
):
  | "overdue"
  | "due-soon"
  | "current"
  | "unknown" {
  if (!renewalDate) {
    return "unknown";
  }

  const renewal = new Date(
    `${renewalDate}T00:00:00`,
  );

  if (Number.isNaN(renewal.getTime())) {
    return "unknown";
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const millisecondsPerDay = 86_400_000;

  const differenceInDays = Math.ceil(
    (renewal.getTime() - today.getTime()) /
      millisecondsPerDay,
  );

  if (differenceInDays < 0) {
    return "overdue";
  }

  if (differenceInDays <= 60) {
    return "due-soon";
  }

  return "current";
}

export function formatMemberStatus(
  status: string,
): string {
  return status
    .trim()
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}
