import { apiRequest } from "../../assets/js/api.js";

let currentMeetingId = null;
let meetingData = null;

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

function emptyPanel(title, description) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>${escapeHtml(title)}</h3>
        <span class="badge warning">Next</span>
      </div>
      <div class="enterprise-form">
        <p>${escapeHtml(description)}</p>
      </div>
    </section>
  `;
}

function renderMeetingSummary(data) {
  const meeting = data.meeting;
  const participants = data.participants || [];
  const roles = data.roles || [];
  const speeches = data.speeches || [];

  return `
    <section class="grid">
      <article class="card">
        <span>Status</span>
        <strong>${escapeHtml(meeting.status || "DRAFT")}</strong>
      </article>

      <article class="card">
        <span>Participants</span>
        <strong>${escapeHtml(participants.length)}</strong>
      </article>

      <article class="card">
        <span>Roles</span>
        <strong>${escapeHtml(roles.length)}</strong>
      </article>

      <article class="card">
        <span>Speeches</span>
        <strong>${escapeHtml(speeches.length)}</strong>
      </article>
    </section>
  `;
}

function renderMeetingProfile(meeting) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Meeting Details</h3>
        ${statusBadge(meeting.status)}
      </div>

      <div class="enterprise-form">
        <div class="form-grid">
          <div class="card">
            <span>Title</span>
            <strong>${escapeHtml(meeting.meeting_title || "-")}</strong>
          </div>

          <div class="card">
            <span>Type</span>
            <strong>${escapeHtml(meeting.meeting_type || "REGULAR")}</strong>
          </div>

          <div class="card">
            <span>Date</span>
            <strong>${escapeHtml(formatDate(meeting.meeting_date))}</strong>
          </div>

          <div class="card">
            <span>Time</span>
            <strong>${escapeHtml(`${meeting.start_time || "-"} - ${meeting.end_time || "-"}`)}</strong>
          </div>

          <div class="card">
            <span>Theme</span>
            <strong>${escapeHtml(meeting.meeting_theme || "-")}</strong>
          </div>

          <div class="card">
            <span>Venue</span>
            <strong>${escapeHtml(meeting.venue || "-")}</strong>
          </div>

          <div class="card">
            <span>Online Link</span>
            <strong>${escapeHtml(meeting.online_link || "-")}</strong>
          </div>

          <div class="card">
            <span>Last Updated</span>
            <strong>${escapeHtml(formatDate(meeting.updated_at))}</strong>
          </div>
        </div>

        <div class="module-panel">
          <div class="panel-header">
            <h3>Notes</h3>
          </div>
          <div class="enterprise-form">
            <p>${escapeHtml(meeting.notes || "No notes added yet.")}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderParticipantsPanel(participants) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Attendance & Participants</h3>
        <span class="badge">${participants.length} Present</span>
      </div>

      <form class="enterprise-form" id="addParticipantForm">
        <div class="form-grid">
          <label>
            Participant Type
            <select name="participantType">
              <option value="MEMBER">Member</option>
              <option value="GUEST">Guest</option>
              <option value="VISITOR">Visitor</option>
            </select>
          </label>

          <label>
            Display Name
            <input name="displayName" placeholder="Participant name" required />
          </label>

          <label>
            Email
            <input name="email" type="email" placeholder="Optional email" />
          </label>

          <label>
            Notes
            <input name="notes" placeholder="Optional notes" />
          </label>
        </div>

        <button class="primary-btn" id="addParticipantBtn" type="submit">
          Add Present Participant
        </button>

        <p class="form-message" id="participantMessage"></p>
      </form>

      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            participants.length
              ? participants.map((participant) => `
                <tr>
                  <td><strong>${escapeHtml(participant.display_name)}</strong></td>
                  <td>${escapeHtml(participant.participant_type)}</td>
                  <td>${escapeHtml(participant.email || "-")}</td>
                  <td>${escapeHtml(participant.attendance_status || "PRESENT")}</td>
                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="4">
                    No participants marked present yet.
                  </td>
                </tr>
              `
          }
        </tbody>
      </table>
    </section>
  `;
}

function renderMeetingCommandCenter(data) {
  const meeting = data.meeting;

  return `
    <section class="hero">
      <p class="eyebrow">Meeting Command Center</p>
      <h3>${escapeHtml(meeting.meeting_title || "Meeting")}</h3>
      <p>
        Plan the agenda before the meeting, confirm attendance during the meeting,
        then finalize roles, speeches, table topics and awards from present participants.
      </p>

      <div class="top-actions">
        <button class="ghost-btn" data-route="club-meetings">
          Back to Meetings
        </button>

        <button class="primary-btn" id="editMeetingBtn" type="button">
          Edit Meeting
        </button>
      </div>
    </section>

    ${renderMeetingSummary(data)}

    ${renderMeetingProfile(meeting)}

    ${renderParticipantsPanel(data.participants || [])}
    
    ${emptyPanel(
      "Agenda & Roles",
      "Assign Toastmaster, GE, Timer, Ah Counter, Grammarian, Table Topics Master and custom roles from present participants."
    )}

    ${emptyPanel(
      "Speeches & Evaluations",
      "Add speakers and evaluators from present participants. This will later update Member 360 and Education."
    )}

    ${emptyPanel(
      "Table Topics",
      "Assign table topics responses to anyone present: members, guests or visitors."
    )}

    ${emptyPanel(
      "Awards",
      "Record Best Speaker, Best Evaluator, Best Table Topics and other meeting awards."
    )}

    ${emptyPanel(
      "Close Meeting",
      "Closing the meeting will lock the record and update attendance, speeches, awards and member history."
    )}
  `;
}

export function renderMeetingDetails(meetingId) {
  currentMeetingId = meetingId;

  return `
    <section id="meetingCommandCenter" class="content">
      <section class="hero">
        <p class="eyebrow">Meeting Command Center</p>
        <h3>Loading Meeting...</h3>
        <p>Fetching meeting agenda and tracking data.</p>
      </section>
    </section>
  `;
}

async function loadMeetingDetails() {
  const container = document.getElementById("meetingCommandCenter");

  const response = await apiRequest(`/api/meetings/${currentMeetingId}`);
  meetingData = response.data;

  container.innerHTML = renderMeetingCommandCenter(meetingData);
  bindMeetingCommandCenterEvents();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindMeetingCommandCenterEvents() {
  const form = document.getElementById("addParticipantForm");
  const message = document.getElementById("participantMessage");
  const button = document.getElementById("addParticipantBtn");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());

    message.textContent = "Adding participant...";
    button.disabled = true;

    try {
      await apiRequest(`/api/meetings/${currentMeetingId}/participants`, {
        method: "POST",
        body: payload
      });

      form.reset();
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });
}

export async function initMeetingDetails() {
  const container = document.getElementById("meetingCommandCenter");

  if (!currentMeetingId) {
    container.innerHTML = `
      <section class="module-panel">
        <div class="enterprise-form">
          No meeting selected. Please go back to Meetings and select a meeting.
        </div>
      </section>
    `;
    return;
  }

  try {
    await loadMeetingDetails();
  } catch (error) {
    container.innerHTML = `
      <section class="module-panel">
        <div class="enterprise-form">
          Failed to load meeting: ${escapeHtml(error.message)}
        </div>
      </section>
    `;
  }
}
