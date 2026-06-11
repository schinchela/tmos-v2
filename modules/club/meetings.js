import { apiRequest } from "../../assets/js/api.js";

let meetingsCache = [];

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
  return new Date(value).toLocaleDateString();
}

function statusBadge(status) {
  const value = String(status || "DRAFT").toUpperCase();

  if (value === "COMPLETED") return `<span class="badge">COMPLETED</span>`;
  if (value === "CANCELLED") return `<span class="badge danger">CANCELLED</span>`;
  if (value === "IN_PROGRESS") return `<span class="badge warning">IN PROGRESS</span>`;
  if (value === "OPEN") return `<span class="badge warning">OPEN</span>`;

  return `<span class="badge">${escapeHtml(value)}</span>`;
}

function renderMeetingRows(meetings) {
  if (!meetings.length) {
    return `
      <tr>
        <td colspan="7">No meetings created yet.</td>
      </tr>
    `;
  }

  return meetings.map((meeting) => `
    <tr
      class="clickable-row"
      data-meeting-id="${escapeHtml(meeting.id)}"
      style="cursor:pointer;"
    >
      <td>
        <strong>${escapeHtml(meeting.meeting_title)}</strong><br>
        <small>${escapeHtml(meeting.meeting_theme || "-")}</small>
      </td>
      <td>${escapeHtml(meeting.meeting_type || "REGULAR")}</td>
      <td>${escapeHtml(formatDate(meeting.meeting_date))}</td>
      <td>${escapeHtml(meeting.start_time || "-")}</td>
      <td>${escapeHtml(meeting.venue || meeting.online_link || "-")}</td>
      <td>${statusBadge(meeting.status)}</td>
      <td>${escapeHtml(formatDate(meeting.updated_at))}</td>
    </tr>
  `).join("");
}

function renderStats() {
  const total = meetingsCache.length;
  const draft = meetingsCache.filter((m) => m.status === "DRAFT").length;
  const open = meetingsCache.filter((m) => ["OPEN", "IN_PROGRESS"].includes(m.status)).length;
  const completed = meetingsCache.filter((m) => m.status === "COMPLETED").length;

  document.getElementById("meetingsTotal").textContent = total;
  document.getElementById("meetingsDraft").textContent = draft;
  document.getElementById("meetingsOpen").textContent = open;
  document.getElementById("meetingsCompleted").textContent = completed;
}

export function renderClubMeetings() {
  return `
    <section class="hero">
      <p class="eyebrow">Meeting Command Center</p>
      <h3>Meetings</h3>
      <p>
        Plan meetings before the day, mark attendance during the meeting,
        then finalize roles, speeches, table topics and awards from present participants.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>Total Meetings</span>
        <strong id="meetingsTotal">...</strong>
      </article>

      <article class="card">
        <span>Draft</span>
        <strong id="meetingsDraft">...</strong>
      </article>

      <article class="card">
        <span>Open / In Progress</span>
        <strong id="meetingsOpen">...</strong>
      </article>

      <article class="card">
        <span>Completed</span>
        <strong id="meetingsCompleted">...</strong>
      </article>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Create Meeting</h3>
        <span class="badge">Agenda First</span>
      </div>

      <form class="enterprise-form" id="createMeetingForm">
        <div class="form-grid">
          <label>
            Meeting Title
            <input name="meetingTitle" placeholder="Regular Club Meeting" required />
          </label>

          <label>
            Meeting Type
            <select name="meetingType">
              <option value="REGULAR">Regular Club Meeting</option>
              <option value="JOINT">Joint Meeting</option>
              <option value="CONTEST">Contest</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="OFFICER">Officer Meeting</option>
              <option value="SPECIAL">Special Session</option>
            </select>
          </label>

          <label>
            Meeting Date
            <input name="meetingDate" type="date" required />
          </label>

          <label>
            Start Time
            <input name="startTime" type="time" />
          </label>

          <label>
            End Time
            <input name="endTime" type="time" />
          </label>

          <label>
            Theme
            <input name="meetingTheme" placeholder="Theme of the meeting" />
          </label>

          <label>
            Venue
            <input name="venue" placeholder="Venue / physical location" />
          </label>

          <label>
            Online Link
            <input name="onlineLink" placeholder="Zoom / Google Meet link" />
          </label>

          <label>
            Status
            <select name="status">
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>

          <label>
            Notes
            <input name="notes" placeholder="Special notes..." />
          </label>
        </div>

        <button class="primary-btn" id="createMeetingBtn" type="submit">
          Create Meeting
        </button>

        <p class="form-message" id="meetingFormMessage"></p>
      </form>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Meeting List</h3>
        <button class="ghost-btn" id="refreshMeetingsBtn" type="button">Refresh</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Meeting</th>
            <th>Type</th>
            <th>Date</th>
            <th>Start</th>
            <th>Venue / Link</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody id="meetingsTable">
          <tr>
            <td colspan="7">Loading meetings...</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

async function loadMeetings() {
  const table = document.getElementById("meetingsTable");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="7">Loading meetings...</td>
    </tr>
  `;

  try {
    const response = await apiRequest("/api/meetings");
    meetingsCache = response.data || [];
    table.innerHTML = renderMeetingRows(meetingsCache);
    renderStats();
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="7">Failed to load meetings: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}

function bindMeetingNavigation() {
  const table = document.getElementById("meetingsTable");
  if (!table) return;

  table.addEventListener("click", (event) => {
    const row = event.target.closest("[data-meeting-id]");
    if (!row) return;

    window.TMOS_SELECTED_MEETING_ID = row.dataset.meetingId;

    import("../../assets/js/router.js").then(({ navigate }) => {
      navigate("club-meeting-details");
    });
  });
}

export async function initClubMeetings() {
  const form = document.getElementById("createMeetingForm");
  const message = document.getElementById("meetingFormMessage");
  const button = document.getElementById("createMeetingBtn");
  const refreshBtn = document.getElementById("refreshMeetingsBtn");

  refreshBtn?.addEventListener("click", loadMeetings);
  bindMeetingNavigation();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());

    message.textContent = "Creating meeting...";
    button.disabled = true;

    try {
      await apiRequest("/api/meetings", {
        method: "POST",
        body: payload
      });

      message.textContent = "Meeting created successfully.";
      form.reset();
      await loadMeetings();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  await loadMeetings();
}
