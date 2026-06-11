import { apiRequest } from "../../assets/js/api.js";

let currentMeetingId = null;
let meetingData = null;

let attendanceSources = {
  members: [],
  guests: []
};
let meetingRoleConfig = [];


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

function renderPersonOptions(items) {
  if (!items.length) {
    return `<option value="">No records available</option>`;
  }

  return `
    <option value="">Select person</option>
    ${items.map((item) => `
      <option
        value="${escapeHtml(item.id)}"
        data-name="${escapeHtml(item.display_name)}"
        data-email="${escapeHtml(item.email || "")}"
      >
        ${escapeHtml(item.display_name)}${item.email ? ` — ${escapeHtml(item.email)}` : ""}
      </option>
    `).join("")}
  `;
}

function activeMeetingRoles() {
  return meetingRoleConfig.filter((role) => Number(role.is_active) === 1);
}



function renderParticipantsPanel(participants) {
  const existingMemberIds = new Set(
  participants
    .filter((p) => p.participant_type === "MEMBER")
    .map((p) => p.participant_id)
);

const existingGuestIds = new Set(
  participants
    .filter((p) => p.participant_type === "GUEST")
    .map((p) => p.participant_id)
);

const availableMembers = attendanceSources.members.filter(
  (member) => !existingMemberIds.has(member.id)
);

const availableGuests = attendanceSources.guests.filter(
  (guest) => !existingGuestIds.has(guest.id)
);
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Attendance & Participants</h3>
        <span class="badge">${participants.length} Present</span>
      </div>

      <form class="enterprise-form" id="addParticipantForm">
  <div class="form-grid">
    <label>
      Add From
      <select name="sourceType" id="participantSourceType">
        <option value="MEMBER">Member</option>
        <option value="GUEST">Guest</option>
        <option value="VISITOR">Manual Visitor</option>
      </select>
    </label>

    <label id="memberSelectWrap">
      Member
      <select id="memberParticipantSelect">
        ${renderPersonOptions(availableMembers)}
      </select>
    </label>

    <label id="guestSelectWrap" style="display:none;">
      Guest
      <select id="guestParticipantSelect">
        ${renderPersonOptions(availableGuests)}
      </select>
    </label>

    <label id="visitorNameWrap" style="display:none;">
      Visitor Name
      <input name="displayName" id="visitorDisplayName" placeholder="Visitor name" />
    </label>

    <label>
      Email
      <input name="email" id="participantEmail" type="email" placeholder="Optional email" />
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

function renderAgendaRolesPanel(roles) {
  const plannedRoleCodes = new Set(
  roles.map((role) => role.role_code)
);

const configRoles = activeMeetingRoles().filter(
  (role) => !plannedRoleCodes.has(role.config_key)
);
const availableMembers = attendanceSources.members;
const availableGuests = attendanceSources.guests;

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Agenda & Roles</h3>
        <span class="badge">${roles.length} Planned</span>
      </div>

      <form class="enterprise-form" id="addAgendaRoleForm">
        <div class="form-grid">
          <label>
            Role
            <select id="agendaRoleSelect" required>
              <option value="">Select role</option>
              ${configRoles.map((role) => `
                <option
                  value="${escapeHtml(role.config_key)}"
                  data-name="${escapeHtml(role.config_name)}"
                >
                  ${escapeHtml(role.config_name)}
                </option>
              `).join("")}
            </select>
          </label>

          <label>
            Assign From
            <select id="agendaRoleSourceType">
              <option value="">Leave Vacant</option>
              <option value="MEMBER">Member</option>
              <option value="GUEST">Guest</option>
              <option value="VISITOR">Manual Visitor</option>
            </select>
          </label>

          <label id="agendaMemberWrap" style="display:none;">
            Member
            <select id="agendaMemberSelect">
              ${renderPersonOptions(availableMembers)}
            </select>
          </label>

          <label id="agendaGuestWrap" style="display:none;">
            Guest
            <select id="agendaGuestSelect">
              ${renderPersonOptions(availableGuests)}
            </select>
          </label>

          <label id="agendaVisitorWrap" style="display:none;">
            Visitor Name
            <input id="agendaVisitorName" placeholder="Visitor name" />
          </label>

          <label>
            Notes
            <input id="agendaRoleNotes" placeholder="Optional notes" />
          </label>
        </div>

        <button class="primary-btn" id="addAgendaRoleBtn" type="submit">
          Add Planned Role
        </button>

        <p class="form-message" id="agendaRoleMessage"></p>
      </form>

      <table class="table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Planned Person</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            roles.length
              ? roles.map((role) => `
                <tr>
                  <td><strong>${escapeHtml(role.role_name)}</strong></td>
                  <td>${escapeHtml(role.planned_display_name || "Vacant")}</td>
                  <td>${escapeHtml(role.assignment_status || "PLANNED")}</td>
                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="3">
                    No agenda roles planned yet.
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
    
    ${renderAgendaRolesPanel(data.roles || [])}

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
async function loadAttendanceSources() {
  try {
    const response = await apiRequest("/api/meeting-attendance-sources");
    attendanceSources = response.data || { members: [], guests: [] };
  } catch (_) {
    attendanceSources = { members: [], guests: [] };
  }
}

async function loadMeetingRoleConfig() {
  try {
    const response = await apiRequest("/api/configuration/MEETING_ROLE");
    meetingRoleConfig = response.data || [];
  } catch (_) {
    meetingRoleConfig = [];
  }
}

async function loadMeetingDetails() {
  const container = document.getElementById("meetingCommandCenter");
  await loadAttendanceSources();
  await loadMeetingRoleConfig();
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

  const sourceType = document.getElementById("participantSourceType");
  const memberWrap = document.getElementById("memberSelectWrap");
  const guestWrap = document.getElementById("guestSelectWrap");
  const visitorWrap = document.getElementById("visitorNameWrap");

  const memberSelect = document.getElementById("memberParticipantSelect");
  const guestSelect = document.getElementById("guestParticipantSelect");
  const visitorName = document.getElementById("visitorDisplayName");
  const emailInput = document.getElementById("participantEmail");
  
const agendaRoleForm = document.getElementById("addAgendaRoleForm");
const agendaRoleSourceType = document.getElementById("agendaRoleSourceType");
const agendaMemberWrap = document.getElementById("agendaMemberWrap");
const agendaGuestWrap = document.getElementById("agendaGuestWrap");
const agendaVisitorWrap = document.getElementById("agendaVisitorWrap");

function updateAgendaSourceUI() {
  const value = agendaRoleSourceType?.value || "";

  if (!agendaMemberWrap || !agendaGuestWrap || !agendaVisitorWrap) return;

  agendaMemberWrap.style.display = value === "MEMBER" ? "" : "none";
  agendaGuestWrap.style.display = value === "GUEST" ? "" : "none";
  agendaVisitorWrap.style.display = value === "VISITOR" ? "" : "none";
}

agendaRoleSourceType?.addEventListener("change", updateAgendaSourceUI);
updateAgendaSourceUI();

agendaRoleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = document.getElementById("agendaRoleMessage");
  const button = document.getElementById("addAgendaRoleBtn");
  const roleSelect = document.getElementById("agendaRoleSelect");

  const selectedRole = roleSelect.selectedOptions?.[0];
  const sourceType = agendaRoleSourceType.value;

  let plannedParticipantId = "";
  let plannedDisplayName = "";
  let plannedEmail = "";

  if (sourceType === "MEMBER") {
    const selected = document.getElementById("agendaMemberSelect").selectedOptions?.[0];
    plannedParticipantId = document.getElementById("agendaMemberSelect").value;
    plannedDisplayName = selected?.dataset.name || "";
    plannedEmail = selected?.dataset.email || "";
  }

  if (sourceType === "GUEST") {
    const selected = document.getElementById("agendaGuestSelect").selectedOptions?.[0];
    plannedParticipantId = document.getElementById("agendaGuestSelect").value;
    plannedDisplayName = selected?.dataset.name || "";
    plannedEmail = selected?.dataset.email || "";
  }

  if (sourceType === "VISITOR") {
    plannedDisplayName = document.getElementById("agendaVisitorName").value;
  }

  if (!roleSelect.value) {
    message.textContent = "Please select a role.";
    return;
  }

  message.textContent = "Adding planned role...";
  button.disabled = true;

  try {
    await apiRequest(`/api/meetings/${currentMeetingId}/agenda-roles`, {
      method: "POST",
      body: {
        roleCode: roleSelect.value,
        roleName: selectedRole?.dataset.name || roleSelect.value,
        assignmentStatus: plannedDisplayName ? "PLANNED" : "UNASSIGNED",
        sequenceOrder: 0,
        plannedParticipantType: sourceType || "",
        plannedParticipantId,
        plannedDisplayName,
        plannedEmail,
        notes: document.getElementById("agendaRoleNotes").value
      }
    });

    await loadMeetingDetails();
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
  }
});
  
  
  function updateParticipantSourceUI() {
    const value = sourceType?.value || "MEMBER";

    memberWrap.style.display = value === "MEMBER" ? "" : "none";
    guestWrap.style.display = value === "GUEST" ? "" : "none";
    visitorWrap.style.display = value === "VISITOR" ? "" : "none";

    emailInput.value = "";

    if (value === "MEMBER") {
      const selected = memberSelect.selectedOptions?.[0];
      emailInput.value = selected?.dataset.email || "";
    }

    if (value === "GUEST") {
      const selected = guestSelect.selectedOptions?.[0];
      emailInput.value = selected?.dataset.email || "";
    }
  }

  sourceType?.addEventListener("change", updateParticipantSourceUI);
  memberSelect?.addEventListener("change", updateParticipantSourceUI);
  guestSelect?.addEventListener("change", updateParticipantSourceUI);

  updateParticipantSourceUI();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedSource = sourceType.value;
    let selectedOption = null;

    const payload = {
      participantType: selectedSource,
      participantId: null,
      displayName: "",
      email: emailInput.value || "",
      notes: new FormData(form).get("notes") || "",
      attendanceStatus: "PRESENT"
    };

    if (selectedSource === "MEMBER") {
      selectedOption = memberSelect.selectedOptions?.[0];
      payload.participantId = memberSelect.value;
      payload.displayName = selectedOption?.dataset.name || "";
      payload.email = selectedOption?.dataset.email || payload.email;
    }

    if (selectedSource === "GUEST") {
      selectedOption = guestSelect.selectedOptions?.[0];
      payload.participantId = guestSelect.value;
      payload.displayName = selectedOption?.dataset.name || "";
      payload.email = selectedOption?.dataset.email || payload.email;
    }

    if (selectedSource === "VISITOR") {
      payload.displayName = visitorName.value;
    }

    if (!payload.displayName) {
      message.textContent = "Please select or enter a participant.";
      return;
    }

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
