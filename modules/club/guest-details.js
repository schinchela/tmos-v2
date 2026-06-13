import { apiRequest } from "../../assets/js/api.js";

let currentGuestId = null;
let guest360Data = null;
let editMode = false;

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
  if (value === "ARCHIVED") return `<span class="badge danger">ARCHIVED</span>`;
  return `<span class="badge">${escapeHtml(value)}</span>`;
}

function renderListTable(title, rows, columns, emptyMessage) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>${escapeHtml(title)}</h3>
        <span class="badge">${rows.length}</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            ${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows.map((row) => `
                <tr>
                  ${columns.map((column) => `
                    <td>
                      ${escapeHtml(column.format ? column.format(row[column.key]) : row[column.key] || "-")}
                    </td>
                  `).join("")}
                </tr>
              `).join("")
              : `<tr><td colspan="${columns.length}">${escapeHtml(emptyMessage)}</td></tr>`
          }
        </tbody>
      </table>
    </section>
  `;
}

function renderEditForm(guest) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Edit Guest</h3>
        ${statusBadge(guest.guest_status)}
      </div>

      <form class="enterprise-form" id="editGuestForm">
        <div class="form-grid">
          <label>
            Full Name
            <input name="displayName" value="${escapeHtml(guest.display_name)}" required />
          </label>

          <label>
            Email
            <input name="email" type="email" value="${escapeHtml(guest.email || "")}" />
          </label>

          <label>
            Phone
            <input name="phone" value="${escapeHtml(guest.phone || "")}" />
          </label>

          <label>
            Organization
            <input name="organization" value="${escapeHtml(guest.organization || "")}" />
          </label>

          <label>
            Status
            <select name="guestStatus">
              <option value="ACTIVE" ${guest.guest_status === "ACTIVE" ? "selected" : ""}>Active</option>
              <option value="ARCHIVED" ${guest.guest_status === "ARCHIVED" ? "selected" : ""}>Archived</option>
            </select>
          </label>

          <label>
            Notes
            <input name="notes" value="${escapeHtml(guest.notes || "")}" />
          </label>
        </div>

        <button class="primary-btn" id="saveGuestBtn" type="submit">Save Changes</button>
        <button class="ghost-btn" id="cancelGuestEditBtn" type="button">Cancel</button>
        <p class="form-message" id="editGuestMessage"></p>
      </form>
    </section>
  `;
}

function renderGuest360(data) {
  const guest = data.guest;

  return `
    <section class="hero">
      <p class="eyebrow">Guest 360</p>
      <h3>${escapeHtml(guest.display_name)}</h3>
      <p>Guest profile, attendance history and awards history.</p>

      <div class="top-actions">
        <button class="ghost-btn" data-route="club-guests" type="button">Back to Guests</button>
        <button class="primary-btn" id="editGuestBtn" type="button">Edit Guest</button>

        ${
          guest.guest_status === "ARCHIVED"
            ? `<button class="ghost-btn" id="reinstateGuestBtn" type="button">Reinstate Guest</button>`
            : `<button class="ghost-btn" id="archiveGuestBtn" type="button">Archive Guest</button>`
        }
      </div>
    </section>

    <section class="grid">
      <article class="card"><span>Status</span><strong>${escapeHtml(guest.guest_status || "ACTIVE")}</strong></article>
      <article class="card"><span>Attendance</span><strong>${escapeHtml((data.attendance || []).length)}</strong></article>
      <article class="card"><span>Awards</span><strong>${escapeHtml((data.awards || []).length)}</strong></article>
      <article class="card"><span>Last Seen</span><strong>${escapeHtml(formatDate(guest.last_seen_at))}</strong></article>
    </section>

    ${
      editMode
        ? renderEditForm(guest)
        : `
          <section class="module-panel">
            <div class="panel-header">
              <h3>Profile</h3>
              ${statusBadge(guest.guest_status)}
            </div>

            <div class="enterprise-form">
              <div class="form-grid">
                <div class="card"><span>Email</span><strong>${escapeHtml(guest.email || "-")}</strong></div>
                <div class="card"><span>Phone</span><strong>${escapeHtml(guest.phone || "-")}</strong></div>
                <div class="card"><span>Organization</span><strong>${escapeHtml(guest.organization || "-")}</strong></div>
                <div class="card"><span>First Seen</span><strong>${escapeHtml(formatDate(guest.first_seen_at))}</strong></div>
              </div>

              <div class="module-panel">
                <div class="panel-header"><h3>Notes</h3></div>
                <div class="enterprise-form">
                  <p>${escapeHtml(guest.notes || "No notes added yet.")}</p>
                </div>
              </div>
            </div>
          </section>
        `
    }

    ${renderListTable(
      "Attendance History",
      data.attendance || [],
      [
        { key: "meeting_date", label: "Date", format: formatDate },
        { key: "meeting_title", label: "Meeting" },
        { key: "meeting_theme", label: "Theme" },
        { key: "attendance_status", label: "Status" },
        { key: "notes", label: "Notes" }
      ],
      "No guest attendance recorded yet."
    )}

    ${renderListTable(
      "Awards History",
      data.awards || [],
      [
        { key: "award_name", label: "Award" },
        { key: "award_date", label: "Date", format: formatDate },
        { key: "source", label: "Source" },
        { key: "notes", label: "Notes" }
      ],
      "No guest awards recorded yet."
    )}
  `;
}

export function renderGuestDetails(guestId) {
  currentGuestId = guestId;
  editMode = false;

  return `
    <section id="guest360Content" class="content">
      <section class="hero">
        <p class="eyebrow">Guest 360</p>
        <h3>Loading Guest.</h3>
        <p>Fetching guest profile and activity history.</p>
      </section>
    </section>
  `;
}

async function loadGuest360() {
  const container = document.getElementById("guest360Content");
  const response = await apiRequest(`/api/guests/${currentGuestId}`);

  guest360Data = response.data;
  container.innerHTML = renderGuest360(guest360Data);
  bindGuest360Events();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindGuest360Events() {
  document.getElementById("editGuestBtn")?.addEventListener("click", () => {
    editMode = true;
    document.getElementById("guest360Content").innerHTML = renderGuest360(guest360Data);
    bindGuest360Events();
  });

  document.getElementById("cancelGuestEditBtn")?.addEventListener("click", () => {
    editMode = false;
    document.getElementById("guest360Content").innerHTML = renderGuest360(guest360Data);
    bindGuest360Events();
  });

  document.getElementById("editGuestForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("editGuestMessage");
    const button = document.getElementById("saveGuestBtn");
    const payload = Object.fromEntries(new FormData(form).entries());

    message.textContent = "Saving guest.";
    button.disabled = true;

    try {
      await apiRequest(`/api/guests/${currentGuestId}`, {
        method: "PUT",
        body: payload
      });

      editMode = false;
      await loadGuest360();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });

  document.getElementById("archiveGuestBtn")?.addEventListener("click", async () => {
    if (!confirm("Archive this guest?")) return;
    await apiRequest(`/api/guests/${currentGuestId}/archive`, { method: "POST" });
    await loadGuest360();
  });

  document.getElementById("reinstateGuestBtn")?.addEventListener("click", async () => {
    await apiRequest(`/api/guests/${currentGuestId}/reinstate`, { method: "POST" });
    await loadGuest360();
  });
}

export async function initGuestDetails() {
  if (!currentGuestId) {
    currentGuestId = window.TMOS_SELECTED_GUEST_ID;
  }

  await loadGuest360();
}
