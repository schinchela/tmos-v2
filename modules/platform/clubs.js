import { apiRequest } from "../../assets/js/api.js";

let clubsCache = [];
let provisioningCache = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function databaseNameFromCode(code) {
  const clean = String(code || "club")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);

  return `tmos-${clean || "club"}`;
}

function statusBadge(status) {
  const value = String(status || "").toUpperCase();

  if (["FAILED", "SUSPENDED", "ARCHIVED"].includes(value)) {
    return `<span class="badge danger">${escapeHtml(value)}</span>`;
  }

  if (["PENDING", "PROVISIONING", "RUNNING"].includes(value)) {
    return `<span class="badge warning">${escapeHtml(value)}</span>`;
  }

  return `<span class="badge">${escapeHtml(value || "ACTIVE")}</span>`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function renderClubsRows(clubs) {
  if (!clubs.length) {
    return `
      <tr>
        <td colspan="6">No clubs yet.</td>
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
      <td>${statusBadge(club.status)}</td>
      <td>${escapeHtml(formatDate(club.created_at))}</td>
      <td>
        <button class="ghost-btn small-btn" data-run-migrations="${escapeHtml(club.id)}">
          Run Migrations
        </button>
      </td>
    </tr>
  `).join("");
}

function renderProvisioningRows(jobs) {
  if (!jobs.length) {
    return `
      <tr>
        <td colspan="7">No provisioning jobs yet.</td>
      </tr>
    `;
  }

  return jobs.map((job) => {
    const canComplete = ["PENDING", "RUNNING", "FAILED"].includes(String(job.status).toUpperCase());

    return `
      <tr>
        <td>
          <strong>${escapeHtml(job.club_name || "Unknown Club")}</strong><br>
          <small>${escapeHtml(job.club_id)}</small>
        </td>
        <td><code>${escapeHtml(job.database_name)}</code></td>
        <td>${statusBadge(job.status)}</td>
        <td>${escapeHtml(job.current_step || "-")}</td>
        <td>${escapeHtml(formatDate(job.started_at))}</td>
        <td>${escapeHtml(job.error_message || "-")}</td>
        <td>
          ${
            canComplete
              ? `<button class="ghost-btn small-btn" data-complete-provisioning="${escapeHtml(job.id)}">Mark Complete</button>`
              : `<span class="badge">Done</span>`
          }
        </td>
      </tr>
    `;
  }).join("");
}

async function loadClubs() {
  const table = document.getElementById("clubsTable");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="6">Loading clubs...</td>
    </tr>
  `;

  try {
    const response = await apiRequest("/api/platform/clubs");
    clubsCache = response.data || [];
    table.innerHTML = renderClubsRows(clubsCache);
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="6">Failed to load clubs: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}
async function loadProvisioningJobs() {
  const table = document.getElementById("provisioningTable");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="7">Loading provisioning jobs...</td>
    </tr>
  `;

  try {
    const response = await apiRequest("/api/platform/provisioning");
    provisioningCache = response.data || [];
    table.innerHTML = renderProvisioningRows(provisioningCache);
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="7">Failed to load provisioning jobs: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}

async function refreshAll() {
  await Promise.all([
    loadClubs(),
    loadProvisioningJobs()
  ]);
}

export function renderPlatformClubs() {
  return `
    <section class="hero">
      <p class="eyebrow">Club Provisioning</p>
      <h3>Clubs</h3>
      <p>
        Create and manage Toastmasters clubs. Each club receives its own isolated
        Cloudflare D1 database identity and provisioning lifecycle.
      </p>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Create New Club</h3>
        <span class="badge">SuperAdmin Only</span>
      </div>

      <form class="enterprise-form" id="createClubForm">
        <div class="form-grid">
          <label>
            Club Name
            <input name="clubName" placeholder="Toastmasters Club of Central Bhubaneswar" required />
          </label>

          <label>
            Club Short Code
            <input name="clubCode" placeholder="tccb" required />
          </label>

          <label>
            City
            <input name="city" placeholder="Bhubaneswar" />
          </label>

          <label>
            Country
            <input name="country" placeholder="India" />
          </label>

          <label>
            Club Admin Name
            <input name="adminName" placeholder="Club President / Admin" />
          </label>

          <label>
            Club Admin Email
            <input name="adminEmail" placeholder="admin@example.com" type="email" />
          </label>
        </div>

        <div class="provision-preview">
          <span>Generated Database Name</span>
          <strong id="dbPreview">tmos-club</strong>
        </div>

        <button class="primary-btn" id="provisionBtn" type="submit">Create Club</button>
        <p class="form-message" id="clubFormMessage"></p>
      </form>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Provisioning Jobs</h3>
        <button class="ghost-btn" id="refreshProvisioningBtn" type="button">Refresh</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Club</th>
            <th>Database</th>
            <th>Status</th>
            <th>Step</th>
            <th>Started</th>
            <th>Error</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="provisioningTable">
          <tr>
            <td colspan="7">Loading provisioning jobs...</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Provisioned Clubs</h3>
        <button class="ghost-btn" id="refreshClubsBtn" type="button">Refresh</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Club</th>
            <th>Short Code</th>
            <th>D1 Database</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="clubsTable">
          <tr>
            <td colspan="6">Loading clubs...</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}
export function initPlatformClubs() {
  const form = document.getElementById("createClubForm");
  const codeInput = form?.querySelector("[name='clubCode']");
  const preview = document.getElementById("dbPreview");
  const message = document.getElementById("clubFormMessage");
  const button = document.getElementById("provisionBtn");
  const refreshBtn = document.getElementById("refreshClubsBtn");
  const refreshProvisioningBtn = document.getElementById("refreshProvisioningBtn");

  function updatePreview() {
    preview.textContent = databaseNameFromCode(codeInput.value);
  }

  codeInput?.addEventListener("input", updatePreview);
  refreshBtn?.addEventListener("click", loadClubs);
  refreshProvisioningBtn?.addEventListener("click", loadProvisioningJobs);

  document.addEventListener("click", async (event) => {
    const completeButton = event.target.closest("[data-complete-provisioning]");

    if (completeButton) {
      const jobId = completeButton.dataset.completeProvisioning;

      completeButton.disabled = true;
      completeButton.textContent = "Completing...";

      try {
        await apiRequest(`/api/platform/provisioning/${jobId}/complete`, {
          method: "POST"
        });

        await refreshAll();
      } catch (error) {
        alert(error.message);
        completeButton.disabled = false;
        completeButton.textContent = "Mark Complete";
      }

      return;
    }

    const migrateButton = event.target.closest("[data-run-migrations]");

    if (migrateButton) {
      const clubId = migrateButton.dataset.runMigrations;

      migrateButton.disabled = true;
      migrateButton.textContent = "Migrating...";

      try {
        const response = await apiRequest(`/api/platform/clubs/${clubId}/migrate`, {
          method: "POST"
        });

        alert(`Migrations applied: ${(response.data.migrationsApplied || []).join(", ")}`);
        await refreshAll();
      } catch (error) {
        alert(error.message);
        migrateButton.disabled = false;
        migrateButton.textContent = "Run Migrations";
      }

      return;
    }
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    message.textContent = "Creating club and provisioning database...";
    button.disabled = true;

    try {
      const response = await apiRequest("/api/platform/clubs", {
        method: "POST",
        body: payload
      });

      const migrations = response.data.migrationsApplied?.length
        ? `<br>Migrations: ${escapeHtml(response.data.migrationsApplied.join(", "))}`
        : "";

      if (response.data.clubAdmin) {
        message.innerHTML = `
          Club created: ${escapeHtml(response.data.databaseName)}<br>
          Club Admin: ${escapeHtml(response.data.clubAdmin.email)}<br>
          Temporary Password: <strong>${escapeHtml(response.data.clubAdmin.temporaryPassword)}</strong>
          ${migrations}
        `;
      } else {
        message.innerHTML = `
          Club created: ${escapeHtml(response.data.databaseName)}
          ${migrations}
        `;
      }

      form.reset();
      updatePreview();
      await refreshAll();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  updatePreview();
  refreshAll();
}
