import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../modules/dashboard/DashboardPage";
import { LegacyModulePage } from "../modules/legacy/LegacyModulePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "members",
        element: (
          <LegacyModulePage
            title="Members"
            description="Member management will be the first full business module replaced after the dashboard."
            legacyPath="/modules/club/members.html"
          />
        ),
      },
      {
        path: "meetings",
        element: (
          <LegacyModulePage
            title="Meetings"
            description="Meeting planning, live execution, voting and minutes will be migrated as one connected workspace."
            legacyPath="/modules/club/meetings.html"
          />
        ),
      },
      {
        path: "education",
        element: (
          <LegacyModulePage
            title="Education"
            description="Pathways, speeches, evaluations, achievements and member progress will move here."
          />
        ),
      },
      {
        path: "leadership",
        element: (
          <LegacyModulePage
            title="Leadership"
            description="Officer terms, assignments and club leadership records will move here."
          />
        ),
      },
      {
        path: "reports",
        element: (
          <LegacyModulePage
            title="Reports"
            description="Club performance, attendance, education and operational reporting will move here."
          />
        ),
      },
      {
        path: "administration",
        element: (
          <LegacyModulePage
            title="Administration"
            description="Club settings, configuration, users and access controls will move here."
          />
        ),
      },
    ],
  },
]);
