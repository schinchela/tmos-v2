import { apiRequest } from "../../assets/js/api.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function renderLatestClubs(clubs = []) {
  if (!clubs.length) {
    return `
      <tr>
        <td colspan="4">No clubs created yet.</td>
      </tr>
    `;
  }

  return clubs.map((club) => `
    <tr>
      <td>
        <strong>${escapeHtml(club.name)}</strong><br>
        <small>${escapeHtml(club.city || "")} ${escapeHtml(club.country || "")}</small>
      </td>
      <td>${escapeHtml(club.slug)}</td>
      <td><code>${escapeHtml(club.database_name)}</code></td>
      <td>${escapeHtml(formatDate(club.created_at))}</td>
    </tr>
  `).join("");
}

export function renderPlatformDashboard() {
  return `
    <section class="hero">
      <p class="eyebrow">SuperAdmin Command Center</p>
      <h3>Platform Dashboard</h3>
      <p>
        Live operational command center for TMOS Enterprise. Monitor clubs,
        database registry health, audit activity and platform readiness.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>Total Clubs</span>
        <strong id="statTotalClubs">...</strong>
      </article>
      <article class="card">
        <span>Active Clubs</span>
        <strong id="statActiveClubs">...</strong>
      </article>
      <article class="card">
        <span>Audit Events</span>
        <strong id="statAuditEvents">...</strong>
      </article>
      <article class="card">
        <span>Platform Health</span>
        <strong>Online</strong>
      </article>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Latest Clubs</h3>
        <button class="primary-btn" data-route="platform-clubs">Create Club</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Club</th>
            <th>Code</th>
            <th>D1 Database</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody id="latestClubsTable">
          <tr>
            <td colspan="4">Loading latest clubs...</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Platform Architecture Status</h3>
        <span class="badge">Cloudflare Native</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Purpose</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cloudflare Pages</td>
            <td>Frontend application</td>
            <td><span class="badge">Live</span></td>
          </tr>
          <tr>
            <td>Cloudflare Worker</td>
            <td>Backend API gateway</td>
            <td><span class="badge">Live</span></td>
          </tr>
          <tr>
            <td>Platform D1</td>
            <td>Clubs, users, audit logs and database registry</td>
            <td><span class="badge">Connected</span></td>
          </tr>
          <tr>
            <td>Club D1 Databases</td>
            <td>One isolated database per club</td>
            <td><span class="badge warning">Provisioning Engine Next</span></td>
          </tr>
          <tr>
            <td>Authentication</td>
            <td>SuperAdmin and club user login</td>
            <td><span class="badge warning">Planned</span></td>
          </tr>
          <tr>
            <td>RBAC</td>
            <td>Role-based permissions by platform and club</td>
            <td><span class="badge warning">Planned</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

export async function initPlatformDashboard() {
  try {
    const response = await apiRequest("/api/platform/stats");
    const stats = response.data || {};

    document.getElementById("statTotalClubs").textContent = stats.totalClubs ?? 0;
    document.getElementById("statActiveClubs").textContent = stats.activeClubs ?? 0;
    document.getElementById("statAuditEvents").textContent = stats.auditEvents ?? 0;

    document.getElementById("latestClubsTable").innerHTML =
      renderLatestClubs(stats.latestClubs || []);
  } catch (error) {
    document.getElementById("latestClubsTable").innerHTML = `
      <tr>
        <td colspan="4">Failed to load dashboard: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}
