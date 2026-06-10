import { setCurrentModule } from "./state.js";

import {
  renderPlatformDashboard,
  initPlatformDashboard
} from "../../modules/platform/dashboard.js";

import {
  renderPlatformClubs,
  initPlatformClubs
} from "../../modules/platform/clubs.js";

import {
  renderPlatformUsers,
  initPlatformUsers
} from "../../modules/platform/users.js";

import {
  renderPlatformAudit,
  initPlatformAudit
} from "../../modules/platform/audit.js";

import {
  renderClubDashboard,
  initClubDashboard
} from "../../modules/club/dashboard.js";

import {
  renderClubMembers,
  initClubMembers
} from "../../modules/club/members.js";

import {
  renderClubMeetings,
  initClubMeetings
} from "../../modules/club/meetings.js";

import {
  renderClubGuests,
  initClubGuests
} from "../../modules/club/guests.js";

import {
  renderClubEducation,
  initClubEducation
} from "../../modules/club/education.js";

import {
  renderClubFinance,
  initClubFinance
} from "../../modules/club/finance.js";

import {
  renderClubReports,
  initClubReports
} from "../../modules/club/reports.js";

import {
  renderClubSettings,
  initClubSettings
} from "../../modules/club/settings.js";

const routes = {
  "platform-dashboard": {
    title: "Platform Dashboard",
    render: renderPlatformDashboard,
    init: initPlatformDashboard
  },
  "platform-clubs": {
    title: "Clubs",
    render: renderPlatformClubs,
    init: initPlatformClubs
  },
  "platform-users": {
    title: "Users",
    render: renderPlatformUsers,
    init: initPlatformUsers
  },
  "platform-audit": {
    title: "Audit Logs",
    render: renderPlatformAudit,
    init: initPlatformAudit
  },

  "club-dashboard": {
    title: "Club Dashboard",
    render: renderClubDashboard,
    init: initClubDashboard
  },
  "club-members": {
    title: "Members",
    render: renderClubMembers,
    init: initClubMembers
  },
  "club-meetings": {
    title: "Meetings",
    render: renderClubMeetings,
    init: initClubMeetings
  },
  "club-guests": {
    title: "Guests",
    render: renderClubGuests,
    init: initClubGuests
  },
  "club-education": {
    title: "Education",
    render: renderClubEducation,
    init: initClubEducation
  },
  "club-finance": {
    title: "Finance",
    render: renderClubFinance,
    init: initClubFinance
  },
  "club-reports": {
    title: "Reports",
    render: renderClubReports,
    init: initClubReports
  },
  "club-settings": {
    title: "Club Settings",
    render: renderClubSettings,
    init: initClubSettings
  }
};

export function navigate(routeKey) {
  const route = routes[routeKey] || routes["platform-dashboard"];

  setCurrentModule(routeKey);

  document.getElementById("pageTitle").textContent = route.title;
  document.getElementById("app").innerHTML = route.render();

  document.querySelectorAll("[data-route]").forEach((item) => {
    item.classList.toggle("active", item.dataset.route === routeKey);
  });

  if (route.init) {
    route.init();
  }
}
