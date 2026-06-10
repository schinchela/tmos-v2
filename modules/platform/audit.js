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

function formatDetails(value) {
  if (!value) return "-";

  try {
    const parsed = JSON.parse(value);
    return Object.entries(parsed)
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");
  } catch {
    return value;
  }
}

function renderAuditRows(logs) {
  if (!logs.length) {
    return `
      <tr>
        <td colspan="5">No audit logs yet.</td>
      </tr>
    `;
  }

  return logs.map((log) => `
    <tr>
      <td>${escapeHtml(formatDate(log.created_at))}</td>
      <td><code>${escapeHtml(log.user_id || "system")}</code></td>
      <td><span class="badge">${escapeHtml(log.action)}</span></td>
      <td>${escapeHtml(log.entity_type)}<br><small>${escapeHtml(log.entity_id || "-")}</small></td>
      <td>${escapeHtml(formatDetails(log.details))}</td>
    </tr>
  `).join("");
}

export function renderPlatformAudit() {
  return `
    <section class="hero">
      <p class="eyebrow">Compliance & Traceability</p>
      <h3>Audit Logs</h3>
      <p>
        Every important platform action is recorded here: logins, password changes,
        club creation, provisioning events, system errors and permission changes.
      </p>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Recent Audit Events</h3>
        <button class="ghost-btn" id="refreshAuditBtn">Refresh</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody id="auditTable">
          <tr>
            <td colspan="5">Loading audit logs...</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

export async function initPlatformAudit() {
  const table = document.getElementById("auditTable");
  const refreshBtn = document.getElementById("refreshAuditBtn");

  async function loadAuditLogs() {
    table.innerHTML = `
      <tr>
        <td colspan="5">Loading audit logs...</td>
      </tr>
    `;

    try {
      const response = await apiRequest("/api/platform/audit?limit=50");
      table.innerHTML = renderAuditRows(response.data || []);
    } catch (error) {
      table.innerHTML = `
        <tr>
          <td colspan="5">Failed to load audit logs: ${escapeHtml(error.message)}</td>
        </tr>
      `;
    }
  }

  refreshBtn?.addEventListener("click", loadAuditLogs);

  await loadAuditLogs();
}
