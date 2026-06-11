import { apiRequest } from "../../assets/js/api.js";

let meetingsCache = [];
let clubSettings = {};

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

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getNextRegularMeetingDates(dayValue, count = 4) {
  if (dayValue === "" || dayValue === null || dayValue === undefined) return [];

  const targetDay = Number(dayValue);
  const dates = [];
  const cursor = new Date();

  cursor.setHours(0, 0, 0, 0);

  let daysAhead = targetDay - cursor.getDay();
  if (daysAhead < 0) daysAhead += 7;

  cursor.setDate(cursor.getDate() + daysAhead);

  for (let i = 0; i < count; i += 1) {
    const next = new Date(cursor);
    next.setDate(cursor.getDate() + i * 7);
    dates.push(next);
  }

  return dates;
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

function renderRegularDateOptions() {
  const dates = getNextRegularMeetingDates(clubSettings.regular_meeting_day, 4);

  if (!dates.length) {
    return `
      <option value="">
        Set regular meeting day/time in Club Settings first
      </option>
    `;
  }

  return dates.map((date) => `
    <option value="${toDateInputValue(date)}">
      ${formatDate(toDateInputValue(date))}
    </option>
  `).join("");
}

export function renderClubMeetings() {
  return `
    <section class="hero">
      <p class="eyebrow">Meeting Command Center</p>
      <h3>Meetings</h3>
      <p>
        Create regular meetings from club settings, or create custom/historical meetings
        by choosing date and time manually.
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
        <span class="badge">Minimal Entry</span>
      </div>

      <form class="enterprise-form" id="createMeetingForm">
        <div class="form-grid">
          <label>
            Creation Mode
            <select id="meetingCreationMode">
              <option value="REGULAR">Regular Meeting — use club day/time</option>
              <option value="CUSTOM">Custom / Historical Meeting — choose date/time</option>
            </select>
          </label>

          <label>
            Meeting Type
            <select name="meetingType" id="meetingType">
              <option value="REGULAR">Regular Club Meeting</option>
              <option value="JOINT">Joint Meeting</option>
              <option value="CONTEST">Contest</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="OFFICER">Officer Meeting</option>
              <option value="SPECIAL">Special Session</option>
            </select>
          </label>

          <label>
            Meeting Title
            <input
              name="meetingTitle"
              id="meetingTitle"
              placeholder="Regular Club Meeting"
              required
            />
          </label>

          <label id="regularDateWrap">
            Next Regular Meeting Dates
            <select id="regularMeetingDate">
              ${renderRegularDateOptions()}
            </select>
          </label>

          <label id="customDateWrap" style="display:none;">
            Meeting Date
            <input name="meetingDate" id="customMeetingDate" type="date" />
          </label>

          <label>
            Start Time
            <input name="startTime" id="meetingStartTime" type="time" />
          </label>

          <label>
            End Time
            <input name="endTime" id="meetingEndTime" type="time" />
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

async function loadClubSettings() {
  try {
    const response = await apiRequest("/api/club/settings");
    clubSettings = response.data || {};
  } catch (_) {
    clubSettings = {};
  }
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

function updateMeetingCreationMode() {
  const mode = document.getElementById("meetingCreationMode")?.value || "REGULAR";
  const meetingType = document.getElementById("meetingType");
  const titleInput = document.getElementById("meetingTitle");
  const regularDateWrap = document.getElementById("regularDateWrap");
  const customDateWrap = document.getElementById("customDateWrap");
  const startTimeInput = document.getElementById("meetingStartTime");

  if (mode === "REGULAR") {
    regularDateWrap.style.display = "";
    customDateWrap.style.display = "none";
    meetingType.value = "REGULAR";
    titleInput.value = titleInput.value || "Regular Club Meeting";
    startTimeInput.value = clubSettings.regular_meeting_time || startTimeInput.value || "";
  } else {
    regularDateWrap.style.display = "none";
    customDateWrap.style.display = "";
  }
}

export async function initClubMeetings() {
  await loadClubSettings();

  document.getElementById("app").innerHTML = renderClubMeetings();

  const form = document.getElementById("createMeetingForm");
  const message = document.getElementById("meetingFormMessage");
  const button = document.getElementById("createMeetingBtn");
  const refreshBtn = document.getElementById("refreshMeetingsBtn");
  const modeSelect = document.getElementById("meetingCreationMode");

  refreshBtn?.addEventListener("click", loadMeetings);
  modeSelect?.addEventListener("change", updateMeetingCreationMode);

  bindMeetingNavigation();
  updateMeetingCreationMode();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const mode = document.getElementById("meetingCreationMode").value;
    const payload = Object.fromEntries(new FormData(form).entries());

    if (mode === "REGULAR") {
      payload.meetingDate = document.getElementById("regularMeetingDate").value;
      payload.startTime = clubSettings.regular_meeting_time || payload.startTime;
      payload.meetingType = "REGULAR";
    } else {
      payload.meetingDate = document.getElementById("customMeetingDate").value;
    }

    if (!payload.meetingDate) {
      message.textContent = "Please select a meeting date.";
      return;
    }

    message.textContent = "Creating meeting...";
    button.disabled = true;

    try {
      await apiRequest("/api/meetings", {
        method: "POST",
        body: payload
      });

      message.textContent = "Meeting created successfully.";
      form.reset();
      updateMeetingCreationMode();
      await loadMeetings();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  await loadMeetings();
}
