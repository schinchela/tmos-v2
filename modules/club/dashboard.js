import { apiRequest } from "../../assets/js/api.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderClubDashboard() {
  return `
    <section class="hero">
      <p class="eyebrow">Club Command Center</p>
      <h3 id="clubDashboardTitle">Club Dashboard</h3>
      <p id="clubDashboardSubtitle">
        Welcome to TMOS Club Portal. Monitor membership growth,
        meeting performance, education progress and finances.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>Total Members</span>
        <strong id="dashTotalMembers">...</strong>
      </article>

      <article class="card">
        <span>Active Members</span>
        <strong id="dashActiveMembers">...</strong>
      </article>

      <article class="card">
        <span>Current Officers</span>
        <strong id="dashCurrentOfficers">...</strong>
      </article>

      <article class="card">
        <span>Club Health</span>
        <strong id="dashClubHealth">...</strong>
      </article>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Club Overview</h3>
        <span class="badge">Live</span>
      </div>

      <div class="enterprise-form">
        <div class="form-grid">
          <div class="card">
            <span>Club Name</span>
            <strong id="dashClubName">...</strong>
          </div>

          <div class="card">
            <span>Database</span>
            <strong id="dashClubDatabase">...</strong>
          </div>

          <div class="card">
            <span>Status</span>
            <strong id="dashClubStatus">...</strong>
          </div>

          <div class="card">
            <span>Timezone</span>
            <strong id="dashClubTimezone">...</strong>
          </div>
        </div>
      </div>
    </section>
  `;
}

export async function initClubDashboard() {
  try {
    const [contextResponse, membersResponse] = await Promise.all([
      apiRequest("/api/club/context"),
      apiRequest("/api/members")
    ]);

    const club = contextResponse.data.club;
    const members = membersResponse.data || [];

    const totalMembers = members.length;
    const activeMembers = members.filter((member) => member.membership_status === "ACTIVE").length;
    const currentOfficers = members.filter((member) => Boolean(member.active_officer_role)).length;

    const health = totalMembers === 0
      ? 0
      : Math.round((activeMembers / totalMembers) * 100);

    document.getElementById("clubDashboardTitle").textContent = club.name;
    document.getElementById("clubDashboardSubtitle").textContent =
      `Welcome to ${club.name}. Track membership, officers, meetings, education and reports.`;

    document.getElementById("dashTotalMembers").textContent = totalMembers;
    document.getElementById("dashActiveMembers").textContent = activeMembers;
    document.getElementById("dashCurrentOfficers").textContent = currentOfficers;
    document.getElementById("dashClubHealth").textContent = `${health}%`;

    document.getElementById("dashClubName").textContent = club.name || "-";
    document.getElementById("dashClubDatabase").textContent = club.databaseName || "-";
    document.getElementById("dashClubStatus").textContent = club.status || "-";
    document.getElementById("dashClubTimezone").textContent = club.timezone || "-";
  } catch (error) {
    document.getElementById("clubDashboardSubtitle").textContent =
      `Failed to load dashboard: ${escapeHtml(error.message)}`;
  }
}
