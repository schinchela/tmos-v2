import { setCurrentModule } from "./state.js";

import {
  renderPlatformDashboard
} from "../../modules/platform/dashboard.js";

import {
  renderPlatformClubs,
  initPlatformClubs
} from "../../modules/platform/clubs.js";

import {
  renderPlatformUsers
} from "../../modules/platform/users.js";

import {
  renderPlatformAudit
} from "../../modules/platform/audit.js";

const routes = {
  "platform-dashboard": {
    title: "Platform Dashboard",
    render: renderPlatformDashboard
  },
  "platform-clubs": {
    title: "Clubs",
    render: renderPlatformClubs,
    init: initPlatformClubs
  },
  "platform-users": {
    title: "Users",
    render: renderPlatformUsers
  },
  "platform-audit": {
    title: "Audit Logs",
    render: renderPlatformAudit
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
