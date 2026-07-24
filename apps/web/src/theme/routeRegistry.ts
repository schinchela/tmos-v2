import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { RouteMetadata } from "./ui.types";

export const routeRegistry: Record<
  string,
  RouteMetadata
> = {
  dashboard: {
    id: "dashboard",
    path: "/dashboard",
    title: "Club Dashboard",
    shortTitle: "Dashboard",
    browserTitle: "Dashboard | TMOS",
    description:
      "Monitor club operations, priorities and member progress.",
    eyebrow: "Club Command Centre",
    tone: "dashboard",
    icon: LayoutDashboard,
  },
  members: {
    id: "members",
    path: "/members",
    title: "Members",
    browserTitle: "Members | TMOS",
    description:
      "Manage membership, education progress, officer responsibilities and renewals.",
    eyebrow: "Member Management",
    tone: "members",
    icon: Users,
    parentId: "dashboard",
    backTo: "/dashboard",
    backLabel: "Back to dashboard",
  },
  meetings: {
    id: "meetings",
    path: "/meetings",
    title: "Meetings",
    browserTitle: "Meetings | TMOS",
    description:
      "Plan, execute and document every club meeting.",
    eyebrow: "Club Operations",
    tone: "meetings",
    icon: CalendarDays,
    parentId: "dashboard",
    backTo: "/dashboard",
    backLabel: "Back to dashboard",
  },
  education: {
    id: "education",
    path: "/education",
    title: "Education",
    browserTitle: "Education | TMOS",
    description:
      "Track pathways, speeches, evaluations and achievements.",
    eyebrow: "Member Development",
    tone: "education",
    icon: BookOpenCheck,
    parentId: "dashboard",
    backTo: "/dashboard",
    backLabel: "Back to dashboard",
  },
  leadership: {
    id: "leadership",
    path: "/leadership",
    title: "Leadership",
    browserTitle: "Leadership | TMOS",
    description:
      "Manage officer terms, assignments and leadership continuity.",
    eyebrow: "Club Leadership",
    tone: "leadership",
    icon: ShieldCheck,
    parentId: "dashboard",
    backTo: "/dashboard",
    backLabel: "Back to dashboard",
  },
  reports: {
    id: "reports",
    path: "/reports",
    title: "Reports",
    browserTitle: "Reports | TMOS",
    description:
      "Analyse club performance, participation and member progress.",
    eyebrow: "Operational Intelligence",
    tone: "reports",
    icon: BarChart3,
    parentId: "dashboard",
    backTo: "/dashboard",
    backLabel: "Back to dashboard",
  },
  administration: {
    id: "administration",
    path: "/administration",
    title: "Administration",
    browserTitle: "Administration | TMOS",
    description:
      "Configure club settings, access and operating rules.",
    eyebrow: "Workspace Administration",
    tone: "administration",
    icon: Settings,
    parentId: "dashboard",
    backTo: "/dashboard",
    backLabel: "Back to dashboard",
  },
};

export function getRouteMetadata(
  routeId: string,
): RouteMetadata {
  const route = routeRegistry[routeId];

  if (!route) {
    throw new Error(
      `No TMOS route metadata exists for "${routeId}".`,
    );
  }

  return route;
}

export function getRouteBreadcrumbs(
  routeId: string,
): RouteMetadata[] {
  const route = getRouteMetadata(routeId);
  const breadcrumbs: RouteMetadata[] = [];

  let currentRoute: RouteMetadata | undefined =
    route;

  while (currentRoute) {
    breadcrumbs.unshift(currentRoute);

    currentRoute = currentRoute.parentId
      ? routeRegistry[currentRoute.parentId]
      : undefined;
  }

  return breadcrumbs;
}
