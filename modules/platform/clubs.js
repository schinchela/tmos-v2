import { apiRequest } from "../../assets/js/api.js";

let clubsCache = [];

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

function renderClubsRows(clubs) {
  if (!clubs.length) {
    return `
      <tr>
        <td>No clubs yet</td>
        <td>-</td>
        <td>-</td>
        <td><span class="badge warning">Waiting</span></td>
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
      <td><span class="badge">${escapeHtml(club.status)}</span></td>
    </tr>
  `).join("");
}

async function loadClubs() {
  const table = document.getElementById("clubsTable");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="4">Loading clubs...</td>
    </tr>
  `;

  try {
    const response = await apiRequest("/api/platform/clubs");
    clubsCache = response.data || [];
    table.innerHTML = renderClubsRows(clubsCache);
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="4">Failed to load clubs: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}

export function renderPlatformClubs() {
  return `
    <section class="hero">
      <p class="eyebrow">Club Provisioning</p>
      <h3>Clubs</h3>
      <p>
        Create and manage Toastmasters clubs. Each club receives its own isolated
        Cloudflare D1 database identity with a short unique database name.
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

        <button class="primary-btn" id="provisionBtn" type="submit">Provision Club</button>
        <p class="form-message" id="clubFormMessage"></p>
      </form>
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
          </tr>
        </thead>
        <tbody id="clubsTable">
          <tr>
            <td colspan="4">Loading clubs...</td>
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

  function updatePreview() {
    preview.textContent = databaseNameFromCode(codeInput.value);
  }

  codeInput?.addEventListener("input", updatePreview);
  refreshBtn?.addEventListener("click", loadClubs);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    message.textContent = "Provisioning club...";
    button.disabled = true;

    try {
      const response = await apiRequest("/api/platform/clubs", {
        method: "POST",
        body: payload
      });

      message.textContent = `Club created successfully: ${response.data.databaseName}`;
      form.reset();
      updatePreview();
      await loadClubs();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  updatePreview();
  loadClubs();
}
