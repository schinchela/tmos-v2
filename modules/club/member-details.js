import { apiRequest } from "../../assets/js/api.js";

let currentMemberId = null;
let member360Data = null;

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
    <div class="card">
      <span>${escapeHtml(title)}</span>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

function renderProfile(member) {
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
            <strong>${escapeHtml(member.display_name || `${member.first_name} ${member.last_name}`)}</strong>
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
  if (!rows.length) {
    return emptyState(title, emptyDescription);
  }
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
              ${columns.map((column) => `
                <td>${escapeHtml(column.format ? column.format(row[column.key], row) : row[column.key] || "-")}</td>
              `).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderMember360(data) {
  const member = data.member;

  return `
    <section class="hero">
      <p class="eyebrow">Member 360</p>
      <h3>${escapeHtml(member.display_name || `${member.first_name} ${member.last_name}`)}</h3>
      <p>
        Complete member profile across membership, Pathways, speeches, attendance,
        awards, goals and officer leadership history.
      </p>
      <button class="ghost-btn" data-route="club-members">Back to Members</button>
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
      "Officer Terms",
      data.officerTerms || [],
      [
        { key: "officer_role", label: "Role" },
        { key: "term_label", label: "Term" },
        { key: "term_start", label: "Start", format: formatDate },
        { key: "term_end", label: "End", format: formatDate },
        { key: "status", label: "Status" }
      ],
      "No officer history yet. Officer term assignment will populate this section."
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

  return `
    <section class="hero">
      <p class="eyebrow">Member 360</p>
      <h3>Loading Member...</h3>
      <p>Fetching member profile and activity history.</p>
    </section>

    <section id="member360Content" class="content"></section>
  `;
}

export async function initMemberDetails() {
  const container = document.getElementById("member360Content");

  try {
    const response = await apiRequest(`/api/members/${currentMemberId}`);
    member360Data = response.data;

    container.innerHTML = renderMember360(member360Data);
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
