import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { LoginPage } from "../modules/auth/LoginPage";
import { ProtectedRoute } from "../modules/auth/ProtectedRoute";
import { DashboardPage } from "../modules/dashboard/DashboardPage";
import { LegacyModulePage } from "../modules/legacy/LegacyModulePage";
import { NotFoundPage } from "../modules/legacy/NotFoundPage";
import { MemberCreatePage } from "../modules/members/MemberCreatePage";
import { MemberProfilePage } from "../modules/members/MemberProfilePage";
import { MembersPage } from "../modules/members/MembersPage";

export const router =
  createBrowserRouter([
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
              element: (
                <DashboardPage />
              ),
            },
            {
              path: "members",
              element: (
                <MembersPage />
              ),
            },
            {
              path: "members/new",
              element: (
                <MemberCreatePage />
              ),
            },
            {
              path: "members/:memberId",
              element: (
                <MemberProfilePage />
              ),
            },
            {
              path: "meetings",
              element: (
                <LegacyModulePage
                  routeId="meetings"
                  legacyPath="/modules/club/meetings.html"
                />
              ),
            },
            {
              path: "education",
              element: (
                <LegacyModulePage
                  routeId="education"
                />
              ),
            },
            {
              path: "leadership",
              element: (
                <LegacyModulePage
                  routeId="leadership"
                />
              ),
            },
            {
              path: "reports",
              element: (
                <LegacyModulePage
                  routeId="reports"
                />
              ),
            },
            {
              path: "administration",
              element: (
                <LegacyModulePage
                  routeId="administration"
                />
              ),
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);
