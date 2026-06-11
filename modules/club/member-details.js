import { apiRequest } from "../../assets/js/api.js";

let currentMemberId = null;
let member360Data = null;
let officerTermsCache = [];
let editMode = false;
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

function pathwayOptions(selected = "") {
  return `
    <option value="">Select Pathway</option>
    ${PATHWAYS.map((pathway) => `
      <option value="${escapeHtml(pathway)}" ${selected === pathway ? "selected" : ""}>
        ${escapeHtml(pathway)}
      </option>
    `).join("")}
  `;
}

function pathwayLevelOptions(selected = 0) {
  const current = String(selected ?? "0");

  return `
    <option value="0" ${current === "0" ? "selected" : ""}>Not Started</option>
    <option value="1" ${current === "1" ? "selected" : ""}>Level 1</option>
    <option value="2" ${current === "2" ? "selected" : ""}>Level 2</option>
    <option value="3" ${current === "3" ? "selected" : ""}>Level 3</option>
    <option value="4" ${current === "4" ? "selected" : ""}>Level 4</option>
    <option value="5" ${current === "5" ? "selected" : ""}>Level 5</option>
    <option value="6" ${current === "6" ? "selected" : ""}>Completed</option>
  `;
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

function valueOrBlank(value) {
  return escapeHtml(value || "");
}

function statusBadge(status) {
  const value = String(status || "ACTIVE").toUpperCase();

  if (["INACTIVE", "SUSPENDED", "TERMINATED"].includes(value)) {
    return `<span class="badge danger">${escapeHtml(value)}</span>`;
  }

  if (["PROSPECT", "ON_HOLD"].includes(value)) {
    return `<span class="badge warning">${escapeHtml(value)}</span>`;
  }

  return `<span class="badge">${escapeHtml(value)}</span>`;
}

function emptyState(title, description) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>${escapeHtml(title)}</h3>
        <span class="badge warning">Pending</span>
      </div>
      <div class="enterprise-form">
        <p>${escapeHtml(description)}</p>
      </div>
    </section>
  `;
}

function renderEditForm(member) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Edit Profile</h3>
        ${statusBadge(member.membership_status)}
      </div>

      <form class="enterprise-form" id="editMemberForm">
        <div class="form-grid">
          <label>
            First Name
            <input name="firstName" value="${valueOrBlank(member.first_name)}" required />
          </label>

          <label>
            Last Name
            <input name="lastName" value="${valueOrBlank(member.last_name)}" required />
          </label>

          <label>
            Email
            <input name="email" type="email" value="${valueOrBlank(member.email)}" />
          </label>

          <label>
            Phone
            <input name="phone" value="${valueOrBlank(member.phone)}" />
          </label>

          <label>
            Toastmasters ID
            <input name="toastmastersId" value="${valueOrBlank(member.toastmasters_id)}" />
          </label>

          <label>
            Member Number
            <input name="memberNumber" value="${valueOrBlank(member.member_number)}" />
          </label>

          <label>
            Membership Type
            <select name="membershipType">
              <option value="Member" ${member.membership_type === "Member" ? "selected" : ""}>Member</option>
              <option value="Dual Member" ${member.membership_type === "Dual Member" ? "selected" : ""}>Dual Member</option>
              <option value="Reinstated Member" ${member.membership_type === "Reinstated Member" ? "selected" : ""}>Reinstated Member</option>
              <option value="Charter Member" ${member.membership_type === "Charter Member" ? "selected" : ""}>Charter Member</option>
              <option value="Honorary Member" ${member.membership_type === "Honorary Member" ? "selected" : ""}>Honorary Member</option>
            </select>
          </label>

          <label>
            Membership Status
            <select name="membershipStatus">
              <option value="ACTIVE" ${member.membership_status === "ACTIVE" ? "selected" : ""}>Active</option>
              <option value="INACTIVE" ${member.membership_status === "INACTIVE" ? "selected" : ""}>Inactive</option>
              <option value="PROSPECT" ${member.membership_status === "PROSPECT" ? "selected" : ""}>Prospect</option>
              <option value="ON_HOLD" ${member.membership_status === "ON_HOLD" ? "selected" : ""}>On Hold</option>
              <option value="TERMINATED" ${member.membership_status === "TERMINATED" ? "selected" : ""}>Terminated</option>
            </select>
          </label>

          <label>
            Join Date
            <input name="joinDate" type="date" value="${valueOrBlank(member.join_date)}" />
          </label>

          <label>
            Renewal Date
            <input name="renewalDate" type="date" value="${valueOrBlank(member.renewal_date)}" />
          </label>

          <label>
            Pathway
            <select name="pathwayName">
            ${pathwayOptions(member.pathway_name)}
            </select>
          </label>

          <label>
            Pathway Level
            <select name="pathwayLevel">
            ${pathwayLevelOptions(member.pathway_level)}
            </select>
          </label>

          <label>
            Current Officer Role
            <select name="activeOfficerRole">
              <option value="" ${!member.active_officer_role ? "selected" : ""}>None</option>
              <option value="PRESIDENT" ${member.active_officer_role === "PRESIDENT" ? "selected" : ""}>President</option>
              <option value="VPE" ${member.active_officer_role === "VPE" ? "selected" : ""}>Vice President Education</option>
              <option value="VPM" ${member.active_officer_role === "VPM" ? "selected" : ""}>Vice President Membership</option>
              <option value="VPPR" ${member.active_officer_role === "VPPR" ? "selected" : ""}>Vice President Public Relations</option>
              <option value="SECRETARY" ${member.active_officer_role === "SECRETARY" ? "selected" : ""}>Secretary</option>
              <option value="TREASURER" ${member.active_officer_role === "TREASURER" ? "selected" : ""}>Treasurer</option>
              <option value="SAA" ${member.active_officer_role === "SAA" ? "selected" : ""}>Sergeant at Arms</option>
            </select>
          </label>

          <label>
            Notes
            <input name="notes" value="${valueOrBlank(member.notes)}" />
          </label>
        </div>

        <button class="primary-btn" id="saveMemberBtn" type="submit">Save Changes</button>
        <button class="ghost-btn" id="cancelEditBtn" type="button">Cancel</button>
        <p class="form-message" id="editMemberMessage"></p>
      </form>
    </section>
  `;
}
function renderProfile(member) {
  if (editMode) return renderEditForm(member);

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Profile</h3>
        ${statusBadge(member.membership_status)}
      </div>

      <div class="enterprise-form">
        <div class="form-grid">
          <div class="card">
            <span>Name</span>
            <strong>${escapeHtml(member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim())}</strong>
          </div>

          <div class="card">
            <span>Toastmasters ID</span>
            <strong>${escapeHtml(member.toastmasters_id || "-")}</strong>
          </div>

          <div class="card">
            <span>Email</span>
            <strong>${escapeHtml(member.email || "-")}</strong>
          </div>

          <div class="card">
            <span>Phone</span>
            <strong>${escapeHtml(member.phone || "-")}</strong>
          </div>

          <div class="card">
            <span>Membership Type</span>
            <strong>${escapeHtml(member.membership_type || "-")}</strong>
          </div>

          <div class="card">
            <span>Join Date</span>
            <strong>${escapeHtml(formatDate(member.join_date))}</strong>
          </div>

          <div class="card">
            <span>Renewal Date</span>
            <strong>${escapeHtml(formatDate(member.renewal_date))}</strong>
          </div>

          <div class="card">
            <span>Current Officer Role</span>
            <strong>${escapeHtml(member.active_officer_role || "-")}</strong>
          </div>
        </div>

        <div class="module-panel">
          <div class="panel-header">
            <h3>Notes</h3>
          </div>
          <div class="enterprise-form">
            <p>${escapeHtml(member.notes || "No notes added yet.")}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderListTable(title, rows, columns, emptyDescription) {
  if (!rows.length) return emptyState(title, emptyDescription);

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
          ${rows.map((row) => `
            <tr>
              ${columns.map((column) => {
                const rawValue = row[column.key];
                if (column.render) {
  return `<td>${column.render(row)}</td>`;
}

const value = column.format
  ? column.format(rawValue, row)
  : rawValue || "-";

return `<td>${escapeHtml(value)}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderOfficerAssignmentPanel() {
  if (!officerTermsCache.length) {
    return `
      <section class="module-panel">
        <div class="panel-header">
          <h3>Assign Officer Role</h3>
          <span class="badge warning">No Terms</span>
        </div>

        <div class="enterprise-form">
          <p>
            No officer terms are available. Go to Club Settings and generate officer
            terms before assigning officer roles.
          </p>
        </div>
      </section>
    `;
  }

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Assign Officer Role</h3>
        <span class="badge">Leadership</span>
      </div>

      <form class="enterprise-form" id="assignOfficerForm">
        <div class="form-grid">
          <label>
            Officer Role
            <select name="officerRole" required>
              <option value="">Select role</option>
              <option value="PRESIDENT">President</option>
              <option value="VPE">Vice President Education</option>
              <option value="VPM">Vice President Membership</option>
              <option value="VPPR">Vice President Public Relations</option>
              <option value="SECRETARY">Secretary</option>
              <option value="TREASURER">Treasurer</option>
              <option value="SAA">Sergeant at Arms</option>
            </select>
          </label>

          <label>
            Officer Term
            <select name="termId" id="officerTermSelect" required>
              <option value="">Select term</option>
              ${officerTermsCache.map((term) => `
                <option
                  value="${escapeHtml(term.id)}"
                  data-term-label="${escapeHtml(term.term_label)}"
                  data-term-start="${escapeHtml(term.term_start)}"
                  data-term-end="${escapeHtml(term.term_end)}"
                >
                  ${escapeHtml(term.term_label)}
                </option>
              `).join("")}
            </select>
          </label>

          <label>
            Notes
            <input name="notes" placeholder="Optional leadership notes..." />
          </label>
        </div>

        <button class="primary-btn" id="assignOfficerBtn" type="submit">
          Assign Officer Role
        </button>

        <p class="form-message" id="assignOfficerMessage"></p>
      </form>
    </section>
  `;
}
function renderMember360(data) {
  const member = data.member;

  return `
    <section class="hero">
      <p class="eyebrow">Member 360</p>
      <h3>${escapeHtml(member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim())}</h3>
      <p>
        Complete member profile across membership, Pathways, speeches, attendance,
        awards, goals and officer leadership history.
      </p>

      <div class="top-actions">
  <button class="ghost-btn" data-route="club-members">
    Back to Members
  </button>

  <button
    class="primary-btn"
    id="editMemberBtn"
    type="button"
  >
    Edit Member
  </button>

  ${
    member.membership_status === "ARCHIVED"
      ? `
        <button
          class="ghost-btn"
          id="reinstateMemberBtn"
          type="button"
        >
          Reinstate Member
        </button>
      `
      : `
        <button
          class="ghost-btn"
          id="archiveMemberBtn"
          type="button"
        >
          Archive Member
        </button>
      `
  }
</div>
    </section>

    <section class="grid">
      <article class="card">
        <span>Membership Status</span>
        <strong>${escapeHtml(member.membership_status || "ACTIVE")}</strong>
      </article>

      <article class="card">
        <span>Pathway</span>
        <strong>${escapeHtml(member.pathway_name || "Not Set")}</strong>
      </article>

      <article class="card">
        <span>Pathway Level</span>
        <strong>${escapeHtml(member.pathway_level ?? 0)}</strong>
      </article>

      <article class="card">
        <span>Officer Role</span>
        <strong>${escapeHtml(member.active_officer_role || "None")}</strong>
      </article>
    </section>

    ${renderProfile(member)}

    ${renderOfficerAssignmentPanel()}

    ${renderListTable(
      "Officer Terms",
      data.officerTerms || [],
      [
  { key: "officer_role", label: "Role" },
  { key: "term_label", label: "Term" },
  { key: "term_start", label: "Start", format: formatDate },
  { key: "term_end", label: "End", format: formatDate },
  { key: "status", label: "Status" },
  {
    key: "actions",
    label: "Actions",
    render: (row) => {
      if (row.status !== "ACTIVE") return "-";

      return `
        <button
          class="ghost-btn small-btn"
          data-end-officer-term="${escapeHtml(row.id)}"
          type="button"
        >
          End Term
        </button>
      `;
    }
  }
],
      "No officer history yet. Officer term assignment will populate this section."
    )}

    ${renderListTable(
      "Pathways",
      data.pathways || [],
      [
        { key: "pathway_name", label: "Pathway" },
        { key: "current_level", label: "Level" },
        { key: "status", label: "Status" },
        { key: "started_at", label: "Started", format: formatDate },
        { key: "completed_at", label: "Completed", format: formatDate }
      ],
      "No detailed pathway history yet. Future meetings and education tracking will populate this."
    )}

    ${renderListTable(
      "Speeches",
      data.speeches || [],
      [
        { key: "speech_title", label: "Title" },
        { key: "pathway_name", label: "Pathway" },
        { key: "project_name", label: "Project" },
        { key: "level_number", label: "Level" },
        { key: "speech_date", label: "Date", format: formatDate }
      ],
      "No speech history yet. Completed meeting agendas will feed this section."
    )}

    ${renderListTable(
      "Attendance",
      data.attendance || [],
      [
        { key: "meeting_date", label: "Date", format: formatDate },
        { key: "attendance_status", label: "Status" },
        { key: "role_taken", label: "Role" },
        { key: "notes", label: "Notes" }
      ],
      "No attendance records yet. Meeting attendance will populate this automatically."
    )}

    ${renderListTable(
      "Awards",
      data.awards || [],
      [
        { key: "award_type", label: "Type" },
        { key: "award_name", label: "Award" },
        { key: "award_date", label: "Date", format: formatDate },
        { key: "source", label: "Source" }
      ],
      "No awards recorded yet."
    )}

    ${renderListTable(
      "Goals",
      data.goals || [],
      [
        { key: "goal_type", label: "Type" },
        { key: "goal_title", label: "Goal" },
        { key: "target_date", label: "Target", format: formatDate },
        { key: "status", label: "Status" }
      ],
      "No member goals recorded yet."
    )}

    ${emptyState(
      "Mentoring",
      "Mentor and mentee relationships will be connected here after the mentoring module is added."
    )}
  `;
}

export function renderMemberDetails(memberId) {
  currentMemberId = memberId;
  editMode = false;

  return `
    <section id="member360Content" class="content">
      <section class="hero">
        <p class="eyebrow">Member 360</p>
        <h3>Loading Member...</h3>
        <p>Fetching member profile and activity history.</p>
      </section>
    </section>
  `;
}

async function loadOfficerTerms() {
  try {
    const response = await apiRequest("/api/officer-terms");
    officerTermsCache = response.data || [];
  } catch (_) {
    officerTermsCache = [];
  }
}

async function loadMember360() {
  const container = document.getElementById("member360Content");

  await loadOfficerTerms();

  const response = await apiRequest(`/api/members/${currentMemberId}`);
  member360Data = response.data;

  container.innerHTML = renderMember360(member360Data);
  bindMember360Events();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindMember360Events() {
  const editBtn = document.getElementById("editMemberBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const editForm = document.getElementById("editMemberForm");
  const assignOfficerForm = document.getElementById("assignOfficerForm");
  const archiveBtn =  document.getElementById("archiveMemberBtn");
  const reinstateBtn =  document.getElementById("reinstateMemberBtn");
  
  editBtn?.addEventListener("click", () => {
    editMode = true;
    document.getElementById("member360Content").innerHTML = renderMember360(member360Data);
    bindMember360Events();
  });

  cancelBtn?.addEventListener("click", () => {
    editMode = false;
    document.getElementById("member360Content").innerHTML = renderMember360(member360Data);
    bindMember360Events();
  });

  editForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("editMemberMessage");
    const button = document.getElementById("saveMemberBtn");
    const payload = Object.fromEntries(new FormData(editForm).entries());

    message.textContent = "Saving changes...";
    button.disabled = true;

    try {
      await apiRequest(`/api/members/${currentMemberId}`, {
        method: "PUT",
        body: payload
      });

      editMode = false;
      await loadMember360();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });

  assignOfficerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("assignOfficerMessage");
    const button = document.getElementById("assignOfficerBtn");
    const formData = new FormData(assignOfficerForm);
    const payload = Object.fromEntries(formData.entries());

    const selectedTerm = document
      .getElementById("officerTermSelect")
      ?.selectedOptions?.[0];

    payload.termLabel = selectedTerm?.dataset.termLabel || "";
    payload.termStart = selectedTerm?.dataset.termStart || "";
    payload.termEnd = selectedTerm?.dataset.termEnd || "";

    message.textContent = "Assigning officer role...";
    button.disabled = true;

    try {
      await apiRequest(`/api/members/${currentMemberId}/officer-terms`, {
        method: "POST",
        body: payload
      });

      await loadMember360();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });
  document.querySelectorAll("[data-end-officer-term]").forEach((button) => {
  button.addEventListener("click", async () => {
    const assignmentId = button.dataset.endOfficerTerm;

    button.disabled = true;
    button.textContent = "Ending...";

    try {
      await apiRequest(
        `/api/members/${currentMemberId}/officer-terms/${assignmentId}/end`,
        { method: "POST" }
      );

      await loadMember360();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
      button.textContent = "End Term";
    }
  });
});
  archiveBtn?.addEventListener("click", async () => {
  if (
    !confirm(
      "Archive this member? All history will be preserved."
    )
  ) {
    return;
  }

  await apiRequest(
    `/api/members/${currentMemberId}/archive`,
    {
      method: "POST",
      body: {
        status: "ARCHIVED"
      }
    }
  );

  await loadMember360();
});

reinstateBtn?.addEventListener("click", async () => {
  await apiRequest(
    `/api/members/${currentMemberId}/archive`,
    {
      method: "POST",
      body: {
        status: "ACTIVE"
      }
    }
  );

  await loadMember360();
});
}

export async function initMemberDetails() {
  const container = document.getElementById("member360Content");

  if (!currentMemberId) {
    container.innerHTML = `
      <section class="module-panel">
        <div class="enterprise-form">
          No member selected. Please go back to Members and select a member.
        </div>
      </section>
    `;
    return;
  }

  try {
    await loadMember360();
  } catch (error) {
    container.innerHTML = `
      <section class="module-panel">
        <div class="enterprise-form">
          Failed to load member: ${escapeHtml(error.message)}
        </div>
      </section>
    `;
  }
}
