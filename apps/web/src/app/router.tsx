import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../modules/dashboard/DashboardPage";
import { LoginPage } from "../modules/auth/LoginPage";
import { ProtectedRoute } from "../modules/auth/ProtectedRoute";
import { LegacyModulePage } from "../modules/legacy/LegacyModulePage";
import { MembersPage } from "../modules/members/MembersPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to="/dashboard"
                replace
              />
            ),
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "members",
            element: <MembersPage />,
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
    ],
  },
  {
    path: "*",
    element: (
      <Navigate
        to="/dashboard"
        replace
      />
    ),
  },
]);
