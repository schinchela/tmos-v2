import { apiRequest } from "../../assets/js/api.js";

let currentMeetingId = null;
let meetingData = null;

let attendanceSources = {
  members: [],
  guests: []
};
let meetingRoleConfig = [];
let awardCandidates = [];
let votingSession = null;
let votingResults = [];
let finalizedAwards = {
  finalized: false,
  awards: []
};
let meetingMinutes = {
  summary: "",
  key_decisions: "",
  announcements: "",
  general_notes: ""
};
let publicAgenda = {
  published: false
};
let publicMinutes = {
  published: false
};

const PATHWAYS = [
  "Dynamic Leadership",
  "Effective Coaching",
  "Engaging Humor",
  "Innovative Planning",
  "Leadership Development",
  "Motivational Strategies",
  "Persuasive Influence",
  "Presentation Mastery",
  "Strategic Relationships",
  "Team Collaboration",
  "Visionary Communication"
];

function renderPathwayOptions(selected = "") {
  return `
    <option value="">Select Pathway</option>
    ${PATHWAYS.map((pathway) => `
      <option
        value="${escapeHtml(pathway)}"
        ${pathway === selected ? "selected" : ""}
      >
        ${escapeHtml(pathway)}
      </option>
    `).join("")}
  `;
}


function meetingLocked() {
  return Boolean(
    meetingData?.meeting?.locked_at ||
    String(
      meetingData?.meeting?.status || ""
    ).toUpperCase() === "COMPLETED"
  );
}

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
        data-pathway="${escapeHtml(item.pathway_name || "")}"
        data-level="${escapeHtml(item.pathway_level || 0)}"
      >
        ${escapeHtml(item.display_name)}${item.email ? ` — ${escapeHtml(item.email)}` : ""}
      </option>
    `).join("")}
  `;
}

function activeMeetingRoles() {
  return meetingRoleConfig.filter((role) => Number(role.is_active) === 1);
}

function renderAgendaRolesPanel(roles) {
  const plannedRoleCodes = new Set(
  roles
    .filter(
      role => role.role_code !== "SPEECH_EVALUATOR"
    )
    .map(
      role => role.role_code
    )
);
  const plannedSpeechCount =
    meetingData?.speeches?.filter(
      speech => speech.speech_status !== "CANCELLED"
    ).length || 0;

  const speechEvaluatorCount =
    roles.filter(
      role => role.role_code === "SPEECH_EVALUATOR"
    ).length;

  const speechEvaluatorLimitReached =
    speechEvaluatorCount >= plannedSpeechCount;

  const configRoles = activeMeetingRoles().filter((role) => {

  if (role.config_key === "SPEECH_EVALUATOR") {
    return !speechEvaluatorLimitReached;
  }

  return !plannedRoleCodes.has(role.config_key);
});

  const availableMembers = attendanceSources.members;
  const availableGuests = attendanceSources.guests;

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Agenda & Roles</h3>
        <span class="badge">
  ${roles.length} Planned
</span>

<span class="badge">
  Evaluators ${speechEvaluatorCount}/${plannedSpeechCount}
</span>
      </div>

      <form class="enterprise-form" id="addAgendaRoleForm">
        <div class="form-grid">
          <label>
            Role
            <select id="agendaRoleSelect" required ${meetingLocked() ? "disabled" : ""}>
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
            <select id="agendaRoleSourceType" ${meetingLocked() ? "disabled" : ""}>
              <option value="">Leave Vacant</option>
              <option value="MEMBER">Member</option>
              <option value="GUEST">Guest</option>
              <option value="VISITOR">Manual Visitor</option>
            </select>
          </label>

          <label id="agendaMemberWrap" style="display:none;">
            Member
            <select id="agendaMemberSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(availableMembers)}
            </select>
          </label>

          <label id="agendaGuestWrap" style="display:none;">
            Guest
            <select id="agendaGuestSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(availableGuests)}
            </select>
          </label>

          <label id="agendaVisitorWrap" style="display:none;">
            Visitor Name
            <input id="agendaVisitorName" placeholder="Visitor name" ${meetingLocked() ? "disabled" : ""} />
          </label>

          <label>
            Notes
            <input id="agendaRoleNotes" placeholder="Optional notes" ${meetingLocked() ? "disabled" : ""} />
          </label>
        </div>

        <button
          class="primary-btn"
          id="addAgendaRoleBtn"
          type="submit"
          ${meetingLocked() ? "disabled" : ""}
        >
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${
            roles.length
              ? roles.map((role) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(role.role_name)}</strong>
                  </td>
                  <td>
                    ${escapeHtml(role.planned_display_name || "Vacant")}
                  </td>
                  <td>
                    ${escapeHtml(role.assignment_status || "PLANNED")}
                  </td>
                  <td>
                    <button
                      class="ghost-btn small-btn"
                      type="button"
                      data-edit-agenda-role="${escapeHtml(role.id)}"
                      data-status="${escapeHtml(role.assignment_status || "PLANNED")}"
                      data-notes="${escapeHtml(role.notes || "")}"
                      ${meetingLocked() ? "disabled" : ""}
                    >
                      Edit
                    </button>

                    <button
                      class="ghost-btn small-btn danger"
                      type="button"
                      data-delete-agenda-role="${escapeHtml(role.id)}"
                      ${meetingLocked() ? "disabled" : ""}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="4">
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
            <select name="sourceType" id="participantSourceType" ${meetingLocked() ? "disabled" : ""}>
              <option value="MEMBER">Member</option>
              <option value="GUEST">Guest</option>
              <option value="VISITOR">Manual Visitor</option>
            </select>
          </label>

          <label id="memberSelectWrap">
            Member
            <select id="memberParticipantSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(availableMembers)}
            </select>
          </label>

          <label id="guestSelectWrap" style="display:none;">
            Guest
            <select id="guestParticipantSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(availableGuests)}
            </select>
          </label>

          <label id="visitorNameWrap" style="display:none;">
            Visitor Name
            <input name="displayName" id="visitorDisplayName" placeholder="Visitor name" ${meetingLocked() ? "disabled" : ""} />
          </label>

          <label>
            Email
            <input name="email" id="participantEmail" type="email" placeholder="Optional email" ${meetingLocked() ? "disabled" : ""} />
          </label>

          <label>
            Notes
            <input name="notes" placeholder="Optional notes" ${meetingLocked() ? "disabled" : ""} />
          </label>
        </div>

        <button class="primary-btn" id="addParticipantBtn" type="submit" ${meetingLocked() ? "disabled" : ""}>
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
            <th>Actions</th>
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
                  <td>
                    <button
                      class="ghost-btn small-btn"
                      type="button"
                      data-edit-participant="${escapeHtml(participant.id)}"
                      data-name="${escapeHtml(participant.display_name || "")}"
                      data-email="${escapeHtml(participant.email || "")}"
                      data-status="${escapeHtml(participant.attendance_status || "PRESENT")}"
                      data-notes="${escapeHtml(participant.notes || "")}"
                      ${meetingLocked() ? "disabled" : ""}
                    >
                      Edit
                    </button>

                    <button
                      class="ghost-btn small-btn danger"
                      type="button"
                      data-delete-participant="${escapeHtml(participant.id)}"
                      ${meetingLocked() ? "disabled" : ""}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="5">
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


function renderAgendaSpeechesPanel(speeches) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Speeches & Evaluations</h3>
        <span class="badge">${speeches.length} Planned</span>
      </div>

      <form class="enterprise-form" id="addAgendaSpeechForm">
        <div class="form-grid">
          <label>
            Speaker Type
            <select id="speechSpeakerType" ${meetingLocked() ? "disabled" : ""}>
              <option value="MEMBER">Member</option>
              <option value="GUEST">Guest</option>
              <option value="VISITOR">Manual Visitor</option>
            </select>
          </label>

          <label id="speechMemberSpeakerWrap">
            Speaker
            <select id="speechMemberSpeakerSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(attendanceSources.members)}
            </select>
          </label>

          <label id="speechGuestSpeakerWrap" style="display:none;">
            Guest Speaker
            <select id="speechGuestSpeakerSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(attendanceSources.guests)}
            </select>
          </label>

          <label id="speechVisitorSpeakerWrap" style="display:none;">
            Visitor Speaker
            <input id="speechVisitorSpeakerName" placeholder="Speaker name" ${meetingLocked() ? "disabled" : ""} />
          </label>

          <label>
  Speech Title
  <input
    name="speechTitle"
    id="speechTitle"
    placeholder="Leave blank if not finalized"
  />
</label>

<label>
  Pathway
  <select
    name="pathwayName"
    id="speechPathwayName"
  >
    ${renderPathwayOptions()}
  </select>
</label>



<label>
  Level
  <select name="levelNumber" id="speechLevelNumber">
    <option value="">Not set</option>
    <option value="1">Level 1</option>
    <option value="2">Level 2</option>
    <option value="3">Level 3</option>
    <option value="4">Level 4</option>
    <option value="5">Level 5</option>
  </select>
</label>

          <label>
            Project
            <input id="speechProject" placeholder="Project name" ${meetingLocked() ? "disabled" : ""} />
          </label>

          <label>
            Evaluator Type
            <select id="speechEvaluatorType" ${meetingLocked() ? "disabled" : ""}>
              <option value="">No evaluator yet</option>
              <option value="MEMBER">Member</option>
              <option value="GUEST">Guest</option>
              <option value="VISITOR">Manual Visitor</option>
            </select>
          </label>

          <label id="speechMemberEvaluatorWrap" style="display:none;">
            Evaluator
            <select id="speechMemberEvaluatorSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(attendanceSources.members)}
            </select>
          </label>

          <label id="speechGuestEvaluatorWrap" style="display:none;">
            Guest Evaluator
            <select id="speechGuestEvaluatorSelect" ${meetingLocked() ? "disabled" : ""}>
              ${renderPersonOptions(attendanceSources.guests)}
            </select>
          </label>

          <label id="speechVisitorEvaluatorWrap" style="display:none;">
            Visitor Evaluator
            <input id="speechVisitorEvaluatorName" placeholder="Evaluator name" ${meetingLocked() ? "disabled" : ""} />
          </label>

          <label>
            Planned Duration
            <input id="speechDuration" type="number" min="0" placeholder="Minutes" ${meetingLocked() ? "disabled" : ""} />
          </label>

          <label>
            Notes
            <input id="speechNotes" placeholder="Optional notes" ${meetingLocked() ? "disabled" : ""} />
          </label>
        </div>

        <button
          class="primary-btn"
          id="addAgendaSpeechBtn"
          type="submit"
          ${meetingLocked() ? "disabled" : ""}
        >
          Add Planned Speech
        </button>

        <p class="form-message" id="agendaSpeechMessage"></p>
      </form>

      <table class="table">
        <thead>
          <tr>
            <th>Speaker</th>
            <th>Speech</th>
            <th>Evaluator</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${
            speeches.length
              ? speeches.map((speech) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(speech.planned_speaker_name || "Unassigned")}</strong>
                  </td>

                  <td>
                    ${escapeHtml(speech.speech_title || "-")}<br>
                    <small>
                      ${escapeHtml(speech.pathway_name || "")}
                      ${speech.level_number ? ` Level ${escapeHtml(speech.level_number)}` : ""}
                    </small>
                  </td>

                  <td>
                    ${escapeHtml(speech.planned_evaluator_name || "No evaluator")}
                  </td>

                  <td>
                    ${escapeHtml(speech.speech_status || "PLANNED")}
                  </td>

                  <td>
                    ${
                      speech.actual_duration_seconds
                        ? `${Math.floor(Number(speech.actual_duration_seconds) / 60)}m ${Number(speech.actual_duration_seconds) % 60}s`
                        : "-"
                    }
                  </td>

                  <td>
                    <button
                      class="ghost-btn small-btn"
                      type="button"
                      data-edit-speech="${escapeHtml(speech.id)}"
                      data-status="${escapeHtml(speech.speech_status || "PLANNED")}"
                      data-duration="${escapeHtml(speech.actual_duration_seconds || 0)}"
                      data-notes="${escapeHtml(speech.notes || "")}"
                      ${meetingLocked() ? "disabled" : ""}
                    >
                      Edit
                    </button>

                    <button
                      class="ghost-btn small-btn danger"
                      type="button"
                      data-delete-speech="${escapeHtml(speech.id)}"
                      ${meetingLocked() ? "disabled" : ""}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="6">No speeches planned yet.</td>
                </tr>
              `
          }
        </tbody>
      </table>
    </section>
  `;
}



function renderTableTopicsPanel(tableTopics, participants) {
  const usedRefs = new Set(
    tableTopics.map((row) => row.participant_ref_id)
  );

  const availableParticipants = participants.filter(
    (participant) => !usedRefs.has(participant.id)
  );

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Table Topics</h3>
        <span class="badge">${tableTopics.length} Participants</span>
      </div>

      <form class="enterprise-form" id="addTableTopicForm">
        <div class="form-grid">
          <label>
            Participant
            <select id="tableTopicParticipantSelect" required ${meetingLocked() ? "disabled" : ""}>
              <option value="">Select attendee</option>
              ${availableParticipants.map((participant) => `
                <option
                  value="${escapeHtml(participant.id)}"
                  data-type="${escapeHtml(participant.participant_type || "")}"
                  data-participant-id="${escapeHtml(participant.participant_id || "")}"
                  data-name="${escapeHtml(participant.display_name || "")}"
                  data-email="${escapeHtml(participant.email || "")}"
                >
                  ${escapeHtml(participant.display_name || "-")}
                </option>
              `).join("")}
            </select>
          </label>
        </div>

        <button class="primary-btn" id="addTableTopicBtn" type="submit" ${meetingLocked()  ? "disabled": (availableParticipants.length ? "" : "disabled")}>
          Add Table Topics Participant
        </button>

        <p class="form-message" id="tableTopicMessage"></p>
      </form>

      <table class="table">
        <thead>
          <tr>
            <th>Participant</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${
            tableTopics.length
              ? tableTopics.map((row) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(row.participant_name || "-")}</strong><br>
                    <small>${escapeHtml(row.participant_email || "")}</small>
                  </td>
                  <td>${escapeHtml(row.participant_type || "-")}</td>
                  <td>
                    <button  class="ghost-btn small-btn danger"  data-delete-table-topic="${escapeHtml(row.id)}"  type="button"  ${meetingLocked() ? "disabled" : ""}>
                      Remove
                    </button>
                  </td>
                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="3">No Table Topics participants added yet.</td>
                </tr>
              `
          }
        </tbody>
      </table>
    </section>
  `;
}

function groupAwardCandidates(candidates) {
  return candidates.reduce((groups, candidate) => {
    const key = candidate.award_key || "UNKNOWN";

    if (!groups[key]) {
      groups[key] = {
        awardKey: key,
        awardName: candidate.award_name || key,
        candidates: []
      };
    }

    groups[key].candidates.push(candidate);

    return groups;
  }, {});
}

function renderAwardsPanel(candidates, session, results) {
  const awardsAreFinalized =
    finalizedAwards?.finalized === true;

  const winnerAwards =
    finalizedAwards?.awards || [];

  const grouped =
    Object.values(groupAwardCandidates(candidates));

  const voteUrl =
    session?.voteUrl || session?.vote_url || "";

  if (awardsAreFinalized) {
    return `
      <section class="module-panel">
        <div class="panel-header">
          <h3>Award Winners</h3>
          <span class="badge">${winnerAwards.length}</span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Award</th>
              <th>Winner</th>
            </tr>
          </thead>

          <tbody>
            ${winnerAwards.map((award) => `
              <tr>
                <td>${escapeHtml(award.award_name)}</td>
                <td>${escapeHtml(award.winner_name)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
    `;
  }

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Awards</h3>
        <span class="badge">${candidates.length} Candidates</span>
      </div>

      <div class="enterprise-form">
        <div class="top-actions">
          <button
            class="primary-btn"
            id="generateAwardCandidatesBtn"
            type="button"
          >
            Generate / Refresh Candidates
          </button>

          ${
            !session
              ? `
                <button
                  class="primary-btn"
                  id="openVotingBtn"
                  type="button"
                  ${candidates.filter((c) => Number(c.is_excluded) !== 1).length ? "" : "disabled"}
                >
                  Open Voting
                </button>
              `
              : String(session.status || "").toUpperCase() === "OPEN"
              ? `
                <button
                  class="ghost-btn danger"
                  id="closeVotingBtn"
                  type="button"
                >
                  Close Voting
                </button>
              `
              : `
                <button
                  class="ghost-btn"
                  type="button"
                  disabled
                >
                  Voting Closed
                </button>
              `
          }
        </div>

        ${
          session
            ? `
              <div class="module-panel">
                <div class="panel-header">
                  <h3>Voting Link</h3>
                  <span class="badge">${escapeHtml(session.status || "OPEN")}</span>
                </div>

                <div class="enterprise-form">
                  <input
                    id="votingLinkInput"
                    value="${escapeHtml(voteUrl)}"
                    readonly
                  />

                  <button
                    class="ghost-btn"
                    id="copyVotingLinkBtn"
                    type="button"
                  >
                    Copy Voting Link
                  </button>
                </div>
              </div>
            `
            : ""
        }

        ${
          session && String(session.status || "").toUpperCase() === "CLOSED"
            ? renderVotingResultsPanel(results)
            : ""
        }

        <p class="form-message" id="awardCandidatesMessage"></p>
      </div>

      ${
        grouped.length
          ? grouped.map((group) => `
            <section class="module-panel">
              <div class="panel-header">
                <h3>${escapeHtml(group.awardName)}</h3>
                <span class="badge">${group.candidates.length} Eligible</span>
              </div>

              <table class="table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  ${group.candidates.map((candidate) => `
                    <tr>
                      <td>
                        <strong>${escapeHtml(candidate.participant_name || "-")}</strong>
                        ${
                          candidate.participant_email
                            ? `<br><small>${escapeHtml(candidate.participant_email)}</small>`
                            : ""
                        }
                      </td>

                      <td>
                        ${
                          Number(candidate.is_excluded) === 1
                            ? `<span class="badge danger">Excluded</span>`
                            : `<span class="badge">Eligible</span>`
                        }
                      </td>

                      <td>
                        <button
                          class="ghost-btn small-btn ${Number(candidate.is_excluded) === 1 ? "" : "danger"}"
                          data-toggle-award-candidate="${escapeHtml(candidate.id)}"
                          data-current-excluded="${escapeHtml(candidate.is_excluded || 0)}"
                          type="button"
                        >
                          ${
                            Number(candidate.is_excluded) === 1
                              ? "Include"
                              : "Exclude"
                          }
                        </button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </section>
          `).join("")
          : `
            <div class="enterprise-form">
              No award candidates generated yet. Click Generate / Refresh Candidates.
            </div>
          `
      }
    </section>
  `;
}

function groupVotingResults(results) {
  return results.reduce((groups, row) => {
    const key = row.award_key || "UNKNOWN";

    if (!groups[key]) {
      groups[key] = {
        awardKey: key,
        awardName: row.award_name || key,
        rows: []
      };
    }

    groups[key].rows.push(row);

    return groups;
  }, {});
}

function renderVotingResultsPanel(results) {
  const grouped = Object.values(groupVotingResults(results));

  if (!grouped.length) {
    return `
      <div class="module-panel">
        <div class="enterprise-form">
          No voting results available yet.
        </div>
      </div>
    `;
  }

  return `
    <div class="module-panel">
      <div class="panel-header">
        <h3>Voting Results</h3>
        <span class="badge">Closed</span>
      </div>

      <div class="enterprise-form">
        ${grouped.map((group) => `
          <section class="module-panel">
            <div class="panel-header">
              <h3>${escapeHtml(group.awardName)}</h3>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                ${group.rows.map((row) => `
                  <tr>
                    <td>${escapeHtml(row.participant_name || "-")}</td>
                    <td>${escapeHtml(row.vote_count || 0)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="enterprise-form">
              <label>
                Declare Winner
                <select data-award-winner="${escapeHtml(group.awardKey)}">
                  <option value="">Select winner</option>
                  ${group.rows.map((row) => `
                    <option
                      value="${escapeHtml(row.candidate_id)}"
                      data-award-key="${escapeHtml(row.award_key)}"
                      data-award-name="${escapeHtml(row.award_name)}"
                      data-participant-name="${escapeHtml(row.participant_name || "")}"
                    >
                      ${escapeHtml(row.participant_name || "-")} (${escapeHtml(row.vote_count || 0)} votes)
                    </option>
                  `).join("")}
                </select>
              </label>
            </div>
          </section>
        `).join("")}

        <button
          class="primary-btn"
          id="finalizeAwardsBtn"
          type="button"
        >
          Finalize Awards
        </button>
      </div>
    </div>
  `;
}


function renderCloseMeetingPanel(meeting) {
  const isCompleted =
    String(meeting.status || "").toUpperCase() === "COMPLETED";

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Close Meeting</h3>
        ${
          isCompleted
            ? `<span class="badge">COMPLETED</span>`
            : `<span class="badge warning">Pending</span>`
        }
      </div>

      <div class="enterprise-form">
        <p>
          ${
            isCompleted
              ? "This meeting is completed. Reopen it only if corrections are required."
              : "Closing the meeting will lock the record and mark this meeting as completed."
          }
        </p>

        ${
          isCompleted
            ? `
              <button
                class="ghost-btn warning"
                id="reopenMeetingBtn"
                type="button"
              >
                Reopen Meeting
              </button>
            `
            : `
              <button
                class="primary-btn"
                id="closeMeetingBtn"
                type="button"
              >
                Close Meeting
              </button>
            `
        }

        <p class="form-message" id="closeMeetingMessage"></p>
      </div>
    </section>
  `;
}
async function loadMeetingMinutes() {
  try {
    const response = await apiRequest(
      `/api/meetings/${currentMeetingId}/minutes`
    );

    meetingMinutes = response.data || {
      summary: "",
      key_decisions: "",
      announcements: "",
      general_notes: ""
    };
  } catch (_) {
    meetingMinutes = {
      summary: "",
      key_decisions: "",
      announcements: "",
      general_notes: ""
    };
  }
}

function renderMeetingMinutesPanel() {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Meeting Minutes</h3>
        <span class="badge">Auto Generated</span>
      </div>

      <form class="enterprise-form" id="meetingMinutesForm">
        <div class="module-panel">
          <div class="enterprise-form">
            <p>
              TMOS will automatically generate the official meeting minutes from
              attendance, agenda roles, speeches, table topics and awards.
              Use the box below only for extra notes, decisions, announcements
              or context that the club wants included in the final minutes.
            </p>
          </div>
        </div>

        <label>
          Additional Minutes Notes
          <textarea
            id="minutesGeneralNotes"
            rows="6"
            placeholder="Optional: decisions, announcements, special notes, meeting context..."
            ${meetingLocked() ? "disabled" : ""}
          >${escapeHtml(meetingMinutes.general_notes || "")}</textarea>
        </label>

        <button
          class="primary-btn"
          id="saveMeetingMinutesBtn"
          type="submit"
          ${meetingLocked() ? "disabled" : ""}
        >
          Save Additional Notes
        </button>

        <p class="form-message" id="meetingMinutesMessage"></p>
      </form>
    </section>
  `;
}
async function loadPublicAgendaStatus() {
  try {
    const response = await apiRequest(
      `/api/meetings/${currentMeetingId}/publish-agenda`
    );

    publicAgenda = response.data || {
      published: false
    };
  } catch (_) {
    publicAgenda = {
      published: false
    };
  }
}
function renderPublicAgendaPanel() {
  const url = publicAgenda?.url || "";

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Public Agenda</h3>
        <span class="badge">
          ${publicAgenda?.published ? "Published" : "Not Published"}
        </span>
      </div>

      <div class="enterprise-form">
        <p>
          Publish a public agenda link that members and guests can view without login.
        </p>

        <div class="top-actions">
          <button
            class="primary-btn"
            id="publishAgendaBtn"
            type="button"
          >
            ${publicAgenda?.published ? "Republish Agenda" : "Publish Agenda"}
          </button>

          ${
            publicAgenda?.published
              ? `
                <button
                  class="ghost-btn"
                  id="copyPublicAgendaBtn"
                  type="button"
                  data-url="${escapeHtml(url)}"
                >
                  Copy Link
                </button>

                <a
                  class="ghost-btn"
                  href="${escapeHtml(url)}"
                  target="_blank"
                  rel="noopener"
                >
                  View Agenda
                </a>
              `
              : ""
          }
        </div>

        ${
          publicAgenda?.published
            ? `
              <input
                value="${escapeHtml(url)}"
                readonly
              />
            `
            : ""
        }

        <p class="form-message" id="publicAgendaMessage"></p>
      </div>
    </section>
  `;
}

async function loadPublicMinutesStatus() {
  try {
    const response = await apiRequest(
      `/api/meetings/${currentMeetingId}/publish-minutes`
    );

    publicMinutes = response.data || {
      published: false
    };
  } catch (_) {
    publicMinutes = {
      published: false
    };
  }
}

function renderPublicMinutesPanel() {
  const url = publicMinutes?.url || "";

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Public Minutes</h3>
        <span class="badge">
          ${publicMinutes?.published ? "Published" : "Not Published"}
        </span>
      </div>

      <div class="enterprise-form">
        <p>
          Publish printable meeting minutes that members can view without login.
        </p>

        <div class="top-actions">
          <button
            class="primary-btn"
            id="publishMinutesBtn"
            type="button"
          >
            ${publicMinutes?.published ? "Republish Minutes" : "Publish Minutes"}
          </button>

          ${
            publicMinutes?.published
              ? `
                <button
                  class="ghost-btn"
                  id="copyPublicMinutesBtn"
                  type="button"
                  data-url="${escapeHtml(url)}"
                >
                  Copy Link
                </button>

                <a
                  class="ghost-btn"
                  href="${escapeHtml(url)}"
                  target="_blank"
                  rel="noopener"
                >
                  View Minutes
                </a>
              `
              : ""
          }
        </div>

        ${
          publicMinutes?.published
            ? `
              <input
                value="${escapeHtml(url)}"
                readonly
              />
            `
            : ""
        }

        <p class="form-message" id="publicMinutesMessage"></p>
      </div>
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

        <button  class="primary-btn"  id="editMeetingBtn"  type="button"  ${meetingLocked() ? "disabled" : ""}>
          Edit Meeting
        </button>
        <button class="ghost-btn danger"  id="deleteMeetingBtn"  type="button"  ${meetingLocked() ? "disabled" : ""}>
          Delete Meeting
        </button>
      </div>
    </section>

    ${
  meetingLocked()
    ? `
      <section class="module-panel">
        <div class="enterprise-form">
          <strong>🔒 Meeting Locked</strong><br>
          This meeting has been completed and locked.
          Reopen the meeting to make changes.
        </div>
      </section>
    `
    : ""
}

${renderMeetingSummary(data)}

    ${renderMeetingProfile(meeting)}

    ${renderParticipantsPanel(data.participants || [])}
    
    ${renderAgendaRolesPanel(data.roles || [])}

    ${renderAgendaSpeechesPanel(data.speeches || [])}

    ${renderTableTopicsPanel(data.tableTopics || [], data.participants || [])}

    
    ${renderAwardsPanel(awardCandidates, votingSession, votingResults)}

    ${renderMeetingMinutesPanel()}

    ${renderPublicAgendaPanel()}

    ${renderPublicMinutesPanel()}

    ${renderCloseMeetingPanel(meeting)}
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

async function loadAwardCandidates() {
  try {
    const response = await apiRequest(
      `/api/meetings/${currentMeetingId}/award-candidates`
    );

    awardCandidates = response.data || [];
  } catch (_) {
    awardCandidates = [];
  }
}

async function loadVotingSession() {
  try {
    const response = await apiRequest(
      `/api/meetings/${currentMeetingId}/voting`
    );

    votingSession = response.data || null;
  } catch (_) {
    votingSession = null;
  }
}

async function loadVotingResults() {
  try {
    const response = await apiRequest(
      `/api/meetings/${currentMeetingId}/voting/results`
    );

    votingResults = response.data || [];
  } catch (_) {
    votingResults = [];
  }
}

async function loadFinalizedAwards() {
  try {
    const response = await apiRequest(
      `/api/meetings/${currentMeetingId}/awards`
    );

    finalizedAwards = response.data || {
      finalized: false,
      awards: []
    };
  } catch (_) {
    finalizedAwards = {
      finalized: false,
      awards: []
    };
  }
}
async function loadMeetingDetails() {
  const container = document.getElementById("meetingCommandCenter");
  await loadAttendanceSources();
  await loadMeetingRoleConfig();
  await loadAwardCandidates();
  await loadVotingSession();
  await loadVotingResults();
  await loadFinalizedAwards();
  await loadMeetingMinutes();
  await loadPublicAgendaStatus();
  await loadPublicMinutesStatus();
  
  const response = await apiRequest(`/api/meetings/${currentMeetingId}`);
  meetingData = response.data;

  container.innerHTML = renderMeetingCommandCenter(meetingData);
  bindMeetingCommandCenterEvents();
  if (!window.__keepMeetingScroll) {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.__keepMeetingScroll = false;
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

  document.querySelectorAll("[data-edit-participant]").forEach((editButton) => {
    editButton.addEventListener("click", async () => {
      const participantId = editButton.dataset.editParticipant;

      const displayName = prompt("Participant name", editButton.dataset.name || "");
      if (!displayName) return;

      const email = prompt("Email", editButton.dataset.email || "") || "";
      const attendanceStatus =
        prompt("Attendance status", editButton.dataset.status || "PRESENT") || "PRESENT";
      const notes = prompt("Notes", editButton.dataset.notes || "") || "";

      editButton.disabled = true;
      editButton.textContent = "Saving...";

      try {
        await apiRequest(
          `/api/meetings/${currentMeetingId}/participants/${participantId}`,
          {
            method: "PUT",
            body: {
              displayName,
              email,
              attendanceStatus,
              notes
            }
          }
        );

        window.__keepMeetingScroll = true;
        await loadMeetingDetails();
      } catch (error) {
        alert(error.message);
        editButton.disabled = false;
        editButton.textContent = "Edit";
      }
    });
  });

  document.querySelectorAll("[data-delete-participant]").forEach((deleteButton) => {
    deleteButton.addEventListener("click", async () => {
      const participantId = deleteButton.dataset.deleteParticipant;

      if (!confirm("Delete this participant from the meeting?")) return;

      deleteButton.disabled = true;
      deleteButton.textContent = "Deleting...";

      try {
        await apiRequest(
          `/api/meetings/${currentMeetingId}/participants/${participantId}`,
          { method: "DELETE" }
        );

        window.__keepMeetingScroll = true;
        await loadMeetingDetails();
      } catch (error) {
        alert(error.message);
        deleteButton.disabled = false;
        deleteButton.textContent = "Delete";
      }
    });
  });

  document.getElementById("deleteMeetingBtn")?.addEventListener("click", async () => {
    const confirmed = confirm("Delete this meeting and all agenda, attendance, speeches and awards?");
    if (!confirmed) return;

    try {
      await apiRequest(`/api/meetings/${currentMeetingId}`, {
        method: "DELETE"
      });

      const { navigate } = await import("../../assets/js/router.js");
      navigate("club-meetings");
    } catch (error) {
      alert(error.message);
    }
  });

  function updateParticipantSourceUI() {
    const value = sourceType?.value || "MEMBER";

    if (!memberWrap || !guestWrap || !visitorWrap) return;

    memberWrap.style.display = value === "MEMBER" ? "" : "none";
    guestWrap.style.display = value === "GUEST" ? "" : "none";
    visitorWrap.style.display = value === "VISITOR" ? "" : "none";

    if (!emailInput) return;

    emailInput.value = "";

    if (value === "MEMBER") {
      const selected = memberSelect?.selectedOptions?.[0];
      emailInput.value = selected?.dataset.email || "";
    }

    if (value === "GUEST") {
      const selected = guestSelect?.selectedOptions?.[0];
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
      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });

  bindAgendaRoleEvents();
  bindAgendaSpeechEvents();
  bindTableTopicEvents();
  bindAwardEvents();
  bindMeetingMinutes();
  bindPublicAgenda();
  bindPublicMinutes();
  bindCloseMeetingEvents();
  
}
function bindAgendaRoleEvents() {
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
    const plannedSpeechCount =
  meetingData?.speeches?.filter(
    speech => speech.speech_status !== "CANCELLED"
  ).length || 0;

const speechEvaluatorCount =
  meetingData?.roles?.filter(
    role => role.role_code === "SPEECH_EVALUATOR"
  ).length || 0;

if (
  roleSelect.value === "SPEECH_EVALUATOR" &&
  speechEvaluatorCount >= plannedSpeechCount
) {
  message.textContent =
    `Only ${plannedSpeechCount} Speech Evaluator(s) allowed.`;

  return;
}
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

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });
document.querySelectorAll("[data-edit-agenda-role]").forEach((button) => {
  button.addEventListener("click", async () => {
    const roleId = button.dataset.editAgendaRole;

    const assignmentStatus = prompt(
      "Status",
      button.dataset.status || "PLANNED"
    );

    if (assignmentStatus === null) return;

    const notes = prompt(
      "Notes",
      button.dataset.notes || ""
    );

    if (notes === null) return;

    try {
      await apiRequest(
        `/api/meetings/${currentMeetingId}/agenda-roles/${roleId}`,
        {
          method: "PUT",
          body: {
            assignmentStatus,
            notes
          }
        }
      );

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      alert(error.message);
    }
  });
});

document.querySelectorAll("[data-delete-agenda-role]").forEach((button) => {
  button.addEventListener("click", async () => {
    const roleId = button.dataset.deleteAgendaRole;

    if (!confirm("Delete this agenda role?")) {
      return;
    }

    try {
      await apiRequest(
        `/api/meetings/${currentMeetingId}/agenda-roles/${roleId}`,
        {
          method: "DELETE"
        }
      );

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      alert(error.message);
    }
  });
});
  
}

function bindAgendaSpeechEvents() {
  const form = document.getElementById("addAgendaSpeechForm");
  const message = document.getElementById("agendaSpeechMessage");
  const button = document.getElementById("addAgendaSpeechBtn");

  const speakerType = document.getElementById("speechSpeakerType");
  const memberSpeakerWrap = document.getElementById("speechMemberSpeakerWrap");
  const guestSpeakerWrap = document.getElementById("speechGuestSpeakerWrap");
  const visitorSpeakerWrap = document.getElementById("speechVisitorSpeakerWrap");

  const evaluatorType = document.getElementById("speechEvaluatorType");
  const memberEvaluatorWrap = document.getElementById("speechMemberEvaluatorWrap");
  const guestEvaluatorWrap = document.getElementById("speechGuestEvaluatorWrap");
  const visitorEvaluatorWrap = document.getElementById("speechVisitorEvaluatorWrap");

  function syncSpeakerFields() {
    const type = speakerType?.value || "MEMBER";

    if (memberSpeakerWrap) memberSpeakerWrap.style.display = type === "MEMBER" ? "" : "none";
    if (guestSpeakerWrap) guestSpeakerWrap.style.display = type === "GUEST" ? "" : "none";
    if (visitorSpeakerWrap) visitorSpeakerWrap.style.display = type === "VISITOR" ? "" : "none";
  }

  function syncEvaluatorFields() {
    const type = evaluatorType?.value || "";

    if (memberEvaluatorWrap) memberEvaluatorWrap.style.display = type === "MEMBER" ? "" : "none";
    if (guestEvaluatorWrap) guestEvaluatorWrap.style.display = type === "GUEST" ? "" : "none";
    if (visitorEvaluatorWrap) visitorEvaluatorWrap.style.display = type === "VISITOR" ? "" : "none";
  }

  speakerType?.addEventListener("change", syncSpeakerFields);
  evaluatorType?.addEventListener("change", syncEvaluatorFields);

  syncSpeakerFields();
  syncEvaluatorFields();

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (meetingLocked()) return;

    message.textContent = "";
    button.disabled = true;

    try {
      const selectedSpeakerType = speakerType.value;
      let plannedSpeakerId = "";
      let plannedSpeakerName = "";
      let plannedSpeakerEmail = "";

      if (selectedSpeakerType === "MEMBER") {
        const option = document.getElementById("speechMemberSpeakerSelect")?.selectedOptions?.[0];
        plannedSpeakerId = option?.value || "";
        plannedSpeakerName = option?.dataset?.name || option?.textContent?.trim() || "";
        plannedSpeakerEmail = option?.dataset?.email || "";
      }

      if (selectedSpeakerType === "GUEST") {
        const option = document.getElementById("speechGuestSpeakerSelect")?.selectedOptions?.[0];
        plannedSpeakerId = option?.value || "";
        plannedSpeakerName = option?.dataset?.name || option?.textContent?.trim() || "";
        plannedSpeakerEmail = option?.dataset?.email || "";
      }

      if (selectedSpeakerType === "VISITOR") {
        plannedSpeakerName = document.getElementById("speechVisitorSpeakerName")?.value?.trim() || "";
      }

      const selectedEvaluatorType = evaluatorType.value;
      let plannedEvaluatorId = "";
      let plannedEvaluatorName = "";
      let plannedEvaluatorEmail = "";

      if (selectedEvaluatorType === "MEMBER") {
        const option = document.getElementById("speechMemberEvaluatorSelect")?.selectedOptions?.[0];
        plannedEvaluatorId = option?.value || "";
        plannedEvaluatorName = option?.dataset?.name || option?.textContent?.trim() || "";
        plannedEvaluatorEmail = option?.dataset?.email || "";
      }

      if (selectedEvaluatorType === "GUEST") {
        const option = document.getElementById("speechGuestEvaluatorSelect")?.selectedOptions?.[0];
        plannedEvaluatorId = option?.value || "";
        plannedEvaluatorName = option?.dataset?.name || option?.textContent?.trim() || "";
        plannedEvaluatorEmail = option?.dataset?.email || "";
      }

      if (selectedEvaluatorType === "VISITOR") {
        plannedEvaluatorName = document.getElementById("speechVisitorEvaluatorName")?.value?.trim() || "";
      }

      const body = {
  plannedSpeakerType: selectedSpeakerType,
  plannedSpeakerId,
  plannedSpeakerName,
  plannedSpeakerEmail,

  plannedEvaluatorType: selectedEvaluatorType || null,
  plannedEvaluatorId,
  plannedEvaluatorName,
  plannedEvaluatorEmail,

  speechTitle:
    document.getElementById("speechTitle")?.value?.trim() ||
    "To Be Announced",

  speechType: "PATHWAY",

  pathwayName:
    document.getElementById("speechPathwayName")?.value || "",

  levelNumber:
    Number(
      document.getElementById("speechLevelNumber")?.value || 0
    ),

  projectName:
    document.getElementById("speechProjectName")?.value?.trim() || "",

  plannedDurationMin:
    Number(
      document.getElementById("speechDuration")?.value || 0
    ),

  notes:
    document.getElementById("speechNotes")?.value?.trim() || ""
};

      if (!body.plannedSpeakerName) {
        throw new Error("Speaker is required.");
      }

      
      await apiRequest(`/api/meetings/${currentMeetingId}/agenda-speeches`, {
        method: "POST",
        body
      });

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message || "Failed to add speech.";
    } finally {
      button.disabled = false;
    }
  });
  document.querySelectorAll("[data-edit-speech]").forEach((button) => {
  button.addEventListener("click", async () => {
    const speechId = button.dataset.editSpeech;

    const speechStatus = prompt(
      "Speech status",
      button.dataset.status || "PLANNED"
    );

    if (speechStatus === null) return;

    const durationMinutes = prompt(
      "Actual duration in minutes",
      button.dataset.duration
        ? String(Math.round(Number(button.dataset.duration || 0) / 60))
        : "0"
    );

    if (durationMinutes === null) return;

    const notes = prompt(
      "Notes",
      button.dataset.notes || ""
    );

    if (notes === null) return;

    try {
      await apiRequest(
        `/api/meetings/${currentMeetingId}/agenda-speeches/${speechId}`,
        {
          method: "PUT",
          body: {
            speechStatus,
            actualDurationSeconds: Number(durationMinutes || 0) * 60,
            notes
          }
        }
      );

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      alert(error.message);
    }
  });
});

document.querySelectorAll("[data-delete-speech]").forEach((button) => {
  button.addEventListener("click", async () => {
    const speechId = button.dataset.deleteSpeech;

    if (!confirm("Delete this speech?")) {
      return;
    }

    try {
      await apiRequest(
        `/api/meetings/${currentMeetingId}/agenda-speeches/${speechId}`,
        {
          method: "DELETE"
        }
      );

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      alert(error.message);
    }
  });
});
}

function bindAwardEvents() {
  document.getElementById("generateAwardCandidatesBtn")?.addEventListener("click", async () => {
    const message = document.getElementById("awardCandidatesMessage");

    try {
      message.textContent = "Generating candidates...";

      await apiRequest(`/api/meetings/${currentMeetingId}/award-candidates/generate`, {
        method: "POST"
      });

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message || "Failed to generate award candidates.";
    }
  });

  document.getElementById("openVotingBtn")?.addEventListener("click", async () => {
    const message = document.getElementById("awardCandidatesMessage");

    try {
      message.textContent = "Opening voting...";

      await apiRequest(`/api/meetings/${currentMeetingId}/voting/open`, {
        method: "POST"
      });

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message || "Failed to open voting.";
    }
  });

  document.getElementById("closeVotingBtn")?.addEventListener("click", async () => {
    const message = document.getElementById("awardCandidatesMessage");

    try {
      message.textContent = "Closing voting...";

      await apiRequest(`/api/meetings/${currentMeetingId}/voting/close`, {
        method: "POST"
      });

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message || "Failed to close voting.";
    }
  });

  document.getElementById("copyVotingLinkBtn")?.addEventListener("click", async () => {
    const input = document.getElementById("votingLinkInput");
    if (!input?.value) return;

    await navigator.clipboard.writeText(input.value);
  });

  document.querySelectorAll("[data-toggle-award-candidate]").forEach((button) => {
    button.addEventListener("click", async () => {
      const candidateId = button.dataset.toggleAwardCandidate;
      const currentlyExcluded = Number(button.dataset.currentExcluded || 0) === 1;

      try {
       await apiRequest(
  `/api/meetings/${currentMeetingId}/award-candidates/${candidateId}`,
  {
    method: "PUT",
    body: {
      isExcluded: currentlyExcluded ? 0 : 1
    }
  }
);

        window.__keepMeetingScroll = true;
        await loadMeetingDetails();
      } catch (error) {
        const message = document.getElementById("awardCandidatesMessage");
        if (message) {
          message.textContent = error.message || "Failed to update candidate.";
        }
      }
    });
  });

  document.getElementById("finalizeAwardsBtn")?.addEventListener("click", async () => {
    const selectedAwards = [];

    document.querySelectorAll("[data-award-winner]").forEach((select) => {
      const option = select.selectedOptions?.[0];

      if (!option?.value) return;

      selectedAwards.push({
        awardKey: option.dataset.awardKey,
        awardName: option.dataset.awardName,
        candidateId: option.value,
        winnerName: option.dataset.participantName
      });
    });

    if (!selectedAwards.length) {
      const message = document.getElementById("awardCandidatesMessage");
      if (message) message.textContent = "Select at least one winner.";
      return;
    }

    try {
      await apiRequest(`/api/meetings/${currentMeetingId}/awards/finalize`, {
        method: "POST",
        body: {
          awards: selectedAwards
        }
      });

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      const message = document.getElementById("awardCandidatesMessage");
      if (message) {
        message.textContent = error.message || "Failed to finalize awards.";
      }
    }
  });
}
function bindCloseMeetingEvents() {
  const closeBtn = document.getElementById("closeMeetingBtn");
  const reopenBtn = document.getElementById("reopenMeetingBtn");

  closeBtn?.addEventListener("click", async () => {
    const confirmed = confirm(
      "Close and lock this meeting?\n\nThis will finalize attendance, speeches, awards and meeting history."
    );

    if (!confirmed) return;

    closeBtn.disabled = true;

    try {
      await apiRequest(
        `/api/meetings/${currentMeetingId}/close`,
        {
          method: "POST"
        }
      );

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      alert(error.message || "Failed to close meeting.");
      closeBtn.disabled = false;
    }
  });

  reopenBtn?.addEventListener("click", async () => {
    const confirmed = confirm(
      "Reopen this meeting?\n\nThe meeting will become editable again."
    );

    if (!confirmed) return;

    reopenBtn.disabled = true;

    try {
      await apiRequest(
        `/api/meetings/${currentMeetingId}/reopen`,
        {
          method: "POST"
        }
      );

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      alert(error.message || "Failed to reopen meeting.");
      reopenBtn.disabled = false;
    }
  });
}
function bindTableTopicEvents() {
  const tableTopicForm = document.getElementById("addTableTopicForm");

  tableTopicForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("tableTopicMessage");
    const button = document.getElementById("addTableTopicBtn");
    const select = document.getElementById("tableTopicParticipantSelect");
    const selected = select?.selectedOptions?.[0];

    if (!selected?.value) {
      message.textContent = "Please select a participant.";
      return;
    }

    message.textContent = "Adding Table Topics participant...";
    button.disabled = true;

    try {
      await apiRequest(`/api/meetings/${currentMeetingId}/table-topics`, {
        method: "POST",
        body: {
          participantRefId: selected.value,
          participantType: selected.dataset.type,
          participantId: selected.dataset.participantId,
          participantName: selected.dataset.name,
          participantEmail: selected.dataset.email
        }
      });

      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });

  document.querySelectorAll("[data-delete-table-topic]").forEach((button) => {
    button.addEventListener("click", async () => {
      const topicId = button.dataset.deleteTableTopic;

      if (!confirm("Remove this Table Topics participant?")) return;

      button.disabled = true;
      button.textContent = "Removing...";

      try {
        await apiRequest(
          `/api/meetings/${currentMeetingId}/table-topics/${topicId}`,
          { method: "DELETE" }
        );

        window.__keepMeetingScroll = true;
        await loadMeetingDetails();
      } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = "Remove";
      }
    });
  });
}


function bindMeetingMinutes() {
  document.getElementById("meetingMinutesForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("meetingMinutesMessage");

    message.textContent = "Saving additional minutes notes...";

    try {
      await apiRequest(
        `/api/meetings/${currentMeetingId}/minutes`,
        {
          method: "PUT",
          body: {
            summary: "",
            keyDecisions: "",
            announcements: "",
            generalNotes: document.getElementById("minutesGeneralNotes").value
          }
        }
      );

      message.textContent = "Additional minutes notes saved.";
      window.__keepMeetingScroll = true;
      await loadMeetingDetails();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function bindPublicAgenda() 
{
  document.getElementById("publishAgendaBtn")?.addEventListener("click", async () => {
  const message = document.getElementById("publicAgendaMessage");

  message.textContent = "Publishing agenda...";

  try {
    await apiRequest(
      `/api/meetings/${currentMeetingId}/publish-agenda`,
      {
        method: "POST"
      }
    );

    message.textContent = "Agenda published.";
    window.__keepMeetingScroll = true;
    await loadMeetingDetails();
  } catch (error) {
    message.textContent = error.message;
  }
});

document.getElementById("copyPublicAgendaBtn")?.addEventListener("click", async (event) => {
  const url = event.currentTarget.dataset.url;

  try {
    await navigator.clipboard.writeText(url);
    document.getElementById("publicAgendaMessage").textContent =
      "Public agenda link copied.";
  } catch (_) {
    document.getElementById("publicAgendaMessage").textContent =
      "Could not copy link. Please copy it manually.";
  }
});
}

function bindPublicMinutes()
{
  document.getElementById("publishMinutesBtn")?.addEventListener("click", async () => {
  const message = document.getElementById("publicMinutesMessage");

  message.textContent = "Publishing minutes...";

  try {
    await apiRequest(
      `/api/meetings/${currentMeetingId}/publish-minutes`,
      {
        method: "POST"
      }
    );

    message.textContent = "Minutes published.";
    window.__keepMeetingScroll = true;
    await loadMeetingDetails();
  } catch (error) {
    message.textContent = error.message;
  }
});

document.getElementById("copyPublicMinutesBtn")?.addEventListener("click", async (event) => {
  const url = event.currentTarget.dataset.url;

  try {
    await navigator.clipboard.writeText(url);

    document.getElementById("publicMinutesMessage").textContent =
      "Public minutes link copied.";
  } catch (_) {
    document.getElementById("publicMinutesMessage").textContent =
      "Could not copy link. Please copy it manually.";
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
