import { apiRequest } from "../../assets/js/api.js";
import { dateInputValue } from "../../assets/js/date.js";

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

  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (!year || !month || !day) return "-";

  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
}
function formatMeetingDateToken(meetingDate) {
  const [year, month, day] =
    String(meetingDate || "").split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}${month}${year}`;
}
function getNextRegularMeetingDates(dayValue, count = 4) {
  if (dayValue === "" || dayValue === null || dayValue === undefined) return [];

  const targetDay = Number(dayValue);
  const dates = [];
  const cursor = new Date();

  cursor.setHours(12, 0, 0, 0);

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

function renderRegularDateOptions() {
  const dates = getNextRegularMeetingDates(clubSettings.regular_meeting_day, 4);

  if (!dates.length) {
    return `<option value="">Set regular meeting day/time in Club Settings first</option>`;
  }

  return dates.map((date) => {
    const value = dateInputValue(date);
    return `<option value="${value}">${formatDate(value)}</option>`;
  }).join("");
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
    <tr class="clickable-row" data-meeting-id="${escapeHtml(meeting.id)}" style="cursor:pointer;">
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
function renderMeetingArchive(meetings) {
  const archived = meetings.filter(
    (meeting) =>
      String(meeting.status || "")
        .toUpperCase() === "COMPLETED"
  );

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Meeting Archive</h3>
        <span class="badge">
          ${archived.length}
        </span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Meeting</th>
            <th>Theme</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${
            archived.length
              ? archived.map((meeting) => {
                  const token =
                    formatMeetingDateToken(
                      meeting.meeting_date
                    );

                  return `
                    <tr>
                      <td>
                        ${escapeHtml(
                          formatDate(
                            meeting.meeting_date
                          )
                        )}
                      </td>

                      <td>
                        ${escapeHtml(
                          meeting.meeting_title || "-"
                        )}
                      </td>

                      <td>
                        ${escapeHtml(
                          meeting.meeting_theme || "-"
                        )}
                      </td>

                      <td>
                        <button
                          class="ghost-btn archive-open-meeting"
                          data-meeting-id="${escapeHtml(meeting.id)}"
                          type="button"
                        >
                          View Meeting
                        </button>

                        <a
                          class="ghost-btn"
                          href="/agenda/?token=${escapeHtml(token)}"
                          target="_blank"
                          rel="noopener"
                        >
                          Agenda
                        </a>

                        <a
                          class="ghost-btn"
                          href="/minutes/?token=${escapeHtml(token)}"
                          target="_blank"
                          rel="noopener"
                        >
                          Minutes
                        </a>
                      </td>
                    </tr>
                  `;
                }).join("")
              : `
                <tr>
                  <td colspan="4">
                    No completed meetings yet.
                  </td>
                </tr>
              `
          }
        </tbody>
      </table>
    </section>
  `;
}

function renderStats() {
  document.getElementById("meetingsTotal").textContent = meetingsCache.length;
  document.getElementById("meetingsDraft").textContent =
    meetingsCache.filter((m) => m.status === "DRAFT").length;
  document.getElementById("meetingsOpen").textContent =
    meetingsCache.filter((m) => ["OPEN", "IN_PROGRESS"].includes(m.status)).length;
  document.getElementById("meetingsCompleted").textContent =
    meetingsCache.filter((m) => m.status === "COMPLETED").length;
}

export function renderClubMeetings() {
  return `
    <section class="hero">
      <p class="eyebrow">Meeting Command Center</p>
      <h3>Meetings</h3>
      <p>Create regular meetings from club settings, or create custom/historical meetings manually.</p>
    </section>

    <section class="grid">
      <article class="card"><span>Total Meetings</span><strong id="meetingsTotal">...</strong></article>
      <article class="card"><span>Draft</span><strong id="meetingsDraft">...</strong></article>
      <article class="card"><span>Open / In Progress</span><strong id="meetingsOpen">...</strong></article>
      <article class="card"><span>Completed</span><strong id="meetingsCompleted">...</strong></article>
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
            Meeting Mode
            <select id="meetingMode">
              <option value="PHYSICAL">Physical</option>
              <option value="ONLINE">Online</option>
              <option value="HYBRID">Hybrid</option>
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
            <input name="meetingTitle" id="meetingTitle" placeholder="Regular Club Meeting" required />
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

          <label id="venueWrap">
            Venue
            <input name="venue" id="meetingVenue" placeholder="Venue / physical location" />
          </label>

          <label id="onlineLinkWrap" style="display:none;">
            Online Link
            <input name="onlineLink" id="meetingOnlineLink" placeholder="Zoom / Google Meet link" />
          </label>

          <label>
            Theme
            <input name="meetingTheme" placeholder="Theme of the meeting" />
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

        <button class="primary-btn" id="createMeetingBtn" type="submit">Create Meeting</button>
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
          <tr><td colspan="7">Loading meetings...</td></tr>
        </tbody>
      </table>
    </section>
  </section>
${renderMeetingArchive(meetingsCache)}
`;
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

  table.innerHTML = `<tr><td colspan="7">Loading meetings...</td></tr>`;

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

function updateLocationMode() {
  const mode = document.getElementById("meetingMode")?.value || "PHYSICAL";
  const venueWrap = document.getElementById("venueWrap");
  const onlineLinkWrap = document.getElementById("onlineLinkWrap");
  const venueInput = document.getElementById("meetingVenue");
  const onlineLinkInput = document.getElementById("meetingOnlineLink");

  venueWrap.style.display = ["PHYSICAL", "HYBRID"].includes(mode) ? "" : "none";
  onlineLinkWrap.style.display = ["ONLINE", "HYBRID"].includes(mode) ? "" : "none";

  if (mode === "PHYSICAL") {
    venueInput.value = clubSettings.default_venue || venueInput.value || "";
    onlineLinkInput.value = "";
  }

  if (mode === "ONLINE") {
    venueInput.value = "";
    onlineLinkInput.value = clubSettings.default_online_link || onlineLinkInput.value || "";
  }

  if (mode === "HYBRID") {
    venueInput.value = clubSettings.default_venue || venueInput.value || "";
    onlineLinkInput.value = clubSettings.default_online_link || onlineLinkInput.value || "";
  }
}

function updateMeetingCreationMode() {
  const mode = document.getElementById("meetingCreationMode")?.value || "REGULAR";
  const meetingType = document.getElementById("meetingType");
  const titleInput = document.getElementById("meetingTitle");
  const regularDateWrap = document.getElementById("regularDateWrap");
  const customDateWrap = document.getElementById("customDateWrap");
  const startTimeInput = document.getElementById("meetingStartTime");
  const meetingMode = document.getElementById("meetingMode");

  if (mode === "REGULAR") {
    regularDateWrap.style.display = "";
    customDateWrap.style.display = "none";
    meetingType.value = "REGULAR";
    titleInput.value = titleInput.value || "Regular Club Meeting";
    startTimeInput.value = clubSettings.regular_meeting_time || startTimeInput.value || "";
    meetingMode.value = clubSettings.default_meeting_mode || "PHYSICAL";
  } else {
    regularDateWrap.style.display = "none";
    customDateWrap.style.display = "";
  }

  updateLocationMode();
}

export async function initClubMeetings() {
  await loadClubSettings();

  document.getElementById("app").innerHTML = renderClubMeetings();

  const form = document.getElementById("createMeetingForm");
  const message = document.getElementById("meetingFormMessage");
  const button = document.getElementById("createMeetingBtn");
  const refreshBtn = document.getElementById("refreshMeetingsBtn");
  const modeSelect = document.getElementById("meetingCreationMode");
  const meetingMode = document.getElementById("meetingMode");

  refreshBtn?.addEventListener("click", loadMeetings);
  modeSelect?.addEventListener("change", updateMeetingCreationMode);
  meetingMode?.addEventListener("change", updateLocationMode);

  bindMeetingNavigation();
  updateMeetingCreationMode();

document.addEventListener("click", (event) => {
  const button =
    event.target.closest(
      ".archive-open-meeting"
    );

  if (!button) return;

  window.TMOS_SELECTED_MEETING_ID =
    button.dataset.meetingId;

  import("../../assets/js/router.js")
    .then(({ navigate }) => {
      navigate(
        "club-meeting-details"
      );
    });
});
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const mode = document.getElementById("meetingCreationMode").value;
    const locationMode = document.getElementById("meetingMode").value;
    const payload = Object.fromEntries(new FormData(form).entries());

    if (mode === "REGULAR") {
      payload.meetingDate = document.getElementById("regularMeetingDate").value;
      payload.startTime = clubSettings.regular_meeting_time || payload.startTime;
      payload.meetingType = "REGULAR";
    } else {
      payload.meetingDate = document.getElementById("customMeetingDate").value;
    }

    if (locationMode === "PHYSICAL") {
      payload.venue = document.getElementById("meetingVenue").value;
      payload.onlineLink = "";
    }

    if (locationMode === "ONLINE") {
      payload.venue = "";
      payload.onlineLink = document.getElementById("meetingOnlineLink").value;
    }

    if (locationMode === "HYBRID") {
      payload.venue = document.getElementById("meetingVenue").value;
      payload.onlineLink = document.getElementById("meetingOnlineLink").value;
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
