import { apiRequest } from "../../assets/js/api.js";

let guestsCache = [];
let filteredGuests = [];

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
  return new Date(value).toLocaleDateString("en-IN");
}

function statusBadge(status) {
  const value = String(status || "ACTIVE").toUpperCase();

  if (value === "ARCHIVED") {
    return `<span class="badge danger">ARCHIVED</span>`;
  }

  return `<span class="badge">${escapeHtml(value)}</span>`;
}

function renderStats() {
  document.getElementById("guestsTotal").textContent = guestsCache.length;
  document.getElementById("guestsActive").textContent =
    guestsCache.filter((g) => g.guest_status === "ACTIVE").length;
  document.getElementById("guestsArchived").textContent =
    guestsCache.filter((g) => g.guest_status === "ARCHIVED").length;
}

function renderRows(guests) {
  if (!guests.length) {
    return `<tr><td colspan="7">No guests found.</td></tr>`;
  }

  return guests.map((guest) => `
    <tr class="clickable-row" data-guest-id="${escapeHtml(guest.id)}" style="cursor:pointer;">
      <td>
        <strong>${escapeHtml(guest.display_name)}</strong><br>
        <small>${escapeHtml(guest.email || "-")}</small>
      </td>
      <td>${escapeHtml(guest.phone || "-")}</td>
      <td>${escapeHtml(guest.organization || "-")}</td>
      <td>${statusBadge(guest.guest_status)}</td>
      <td>${escapeHtml(formatDate(guest.first_seen_at))}</td>
      <td>${escapeHtml(formatDate(guest.last_seen_at))}</td>
      <td>${escapeHtml(guest.notes || "-")}</td>
    </tr>
  `).join("");
}

function filterGuests() {
  const query = String(document.getElementById("guestSearch")?.value || "")
    .toLowerCase()
    .trim();

  filteredGuests = guestsCache.filter((guest) => {
    const haystack = [
      guest.display_name,
      guest.email,
      guest.phone,
      guest.organization,
      guest.guest_status,
      guest.notes
    ].join(" ").toLowerCase();

    return haystack.includes(query);
  });
}

function renderFilteredGuests() {
  const table = document.getElementById("guestsTable");
  if (!table) return;

  filterGuests();
  table.innerHTML = renderRows(filteredGuests);
}

export function renderClubGuests() {
  return `
    <section class="hero">
      <p class="eyebrow">Guest Command Center</p>
      <h3>Guests</h3>
      <p>
        Manage guest profiles. Guests feed Meetings for attendance, agenda roles,
        speeches, table topics, voting and awards.
      </p>
    </section>

    <section class="grid">
      <article class="card"><span>Total Guests</span><strong id="guestsTotal">...</strong></article>
      <article class="card"><span>Active Guests</span><strong id="guestsActive">...</strong></article>
      <article class="card"><span>Archived</span><strong id="guestsArchived">...</strong></article>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Add Guest Manually</h3>
        <span class="badge">Club Database</span>
      </div>

      <form class="enterprise-form" id="createGuestForm">
        <div class="form-grid">
          <label>
            Full Name
            <input name="displayName" required />
          </label>

          <label>
            Email
            <input name="email" type="email" />
          </label>

          <label>
            Phone
            <input name="phone" />
          </label>

          <label>
            Organization
            <input name="organization" />
          </label>

          <label>
            Notes
            <input name="notes" />
          </label>
        </div>

        <button class="primary-btn" id="createGuestBtn" type="submit">
          Add Guest
        </button>

        <p class="form-message" id="guestFormMessage"></p>
      </form>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Guest Directory</h3>
        <div class="top-actions">
          <input id="guestSearch" placeholder="Search guests." style="max-width:280px;" />
          <button class="ghost-btn" id="refreshGuestsBtn" type="button">Refresh</button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Phone</th>
            <th>Organization</th>
            <th>Status</th>
            <th>First Seen</th>
            <th>Last Seen</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody id="guestsTable">
          <tr><td colspan="7">Loading guests.</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

async function loadGuests() {
  const table = document.getElementById("guestsTable");
  if (!table) return;

  table.innerHTML = `<tr><td colspan="7">Loading guests.</td></tr>`;

  try {
    const response = await apiRequest("/api/guests");
    guestsCache = response.data || [];
    renderFilteredGuests();
    renderStats();
  } catch (error) {
    table.innerHTML = `<tr><td colspan="7">Failed to load guests: ${escapeHtml(error.message)}</td></tr>`;
  }
}

function bindGuestRowNavigation() {
  const table = document.getElementById("guestsTable");
  if (!table) return;

  table.addEventListener("click", (event) => {
    const row = event.target.closest("[data-guest-id]");
    if (!row) return;

    window.TMOS_SELECTED_GUEST_ID = row.dataset.guestId;

    import("../../assets/js/router.js").then(({ navigate }) => {
      navigate("club-guest-details");
    });
  });
}

export async function initClubGuests() {
  const form = document.getElementById("createGuestForm");
  const message = document.getElementById("guestFormMessage");
  const button = document.getElementById("createGuestBtn");

  document.getElementById("refreshGuestsBtn")?.addEventListener("click", loadGuests);
  document.getElementById("guestSearch")?.addEventListener("input", renderFilteredGuests);

  bindGuestRowNavigation();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());

    message.textContent = "Adding guest.";
    button.disabled = true;

    try {
      await apiRequest("/api/guests", {
        method: "POST",
        body: payload
      });

      form.reset();
      message.textContent = "Guest added.";
      await loadGuests();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  await loadGuests();
}
