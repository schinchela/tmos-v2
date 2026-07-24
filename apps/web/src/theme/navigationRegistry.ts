import type { RouteMetadata } from "./ui.types";
import { getRouteMetadata } from "./routeRegistry";

export interface NavigationSection {
  id: string;
  label: string;
  routes: RouteMetadata[];
}

export const applicationNavigation: NavigationSection[] = [
  {
    id: "overview",
    label: "Overview",
    routes: [
      getRouteMetadata("dashboard"),
    ],
  },
  {
    id: "club-operations",
    label: "Club Operations",
    routes: [
      getRouteMetadata("members"),
      getRouteMetadata("meetings"),
      getRouteMetadata("education"),
      getRouteMetadata("leadership"),
    ],
  },
  {
    id: "management",
    label: "Management",
    routes: [
      getRouteMetadata("reports"),
      getRouteMetadata("administration"),
    ],
  },
];
