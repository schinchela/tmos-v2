import { apiRequest } from "../../assets/js/api.js";

let membersCache = [];
let filteredMembers = [];

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

function renderMemberRows(members) {
  if (!members.length) {
    return `
      <tr>
        <td colspan="8">
          No members found. Add your first club member to begin tracking attendance,
          speeches, pathways, officer terms and goals.
        </td>
      </tr>
    `;
  }

  return members.map((member) => `
    <tr>
      <td>
        <strong>${escapeHtml(member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim())}</strong><br>
        <small>${escapeHtml(member.email || "-")}</small>
      </td>
      <td>${escapeHtml(member.toastmasters_id || "-")}</td>
      <td>${escapeHtml(member.phone || "-")}</td>
      <td>${statusBadge(member.membership_status)}</td>
      <td>${escapeHtml(member.membership_type || "-")}</td>
      <td>
        ${escapeHtml(member.pathway_name || "-")}<br>
        <small>Level ${escapeHtml(member.pathway_level ?? 0)}</small>
      </td>
      <td>${escapeHtml(member.active_officer_role || "-")}</td>
      <td>${escapeHtml(formatDate(member.join_date))}</td>
    </tr>
  `).join("");
}

function renderStats() {
  const total = membersCache.length;
  const active = membersCache.filter((member) => member.membership_status === "ACTIVE").length;
  const officers = membersCache.filter((member) => Boolean(member.active_officer_role)).length;
  const pathways = membersCache.filter((member) => Boolean(member.pathway_name)).length;

  document.getElementById("membersTotal").textContent = total;
  document.getElementById("membersActive").textContent = active;
  document.getElementById("membersOfficers").textContent = officers;
  document.getElementById("membersPathways").textContent = pathways;
}
export function renderClubMembers() {
  return `
    <section class="hero">
      <p class="eyebrow">Membership Command Center</p>
      <h3>Members</h3>
      <p>
        Manage member profiles, Toastmasters IDs, pathways, officer roles and membership
        lifecycle. This module will feed Meetings, Education, Awards, Attendance and Reports.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>Total Members</span>
        <strong id="membersTotal">...</strong>
      </article>

      <article class="card">
        <span>Active Members</span>
        <strong id="membersActive">...</strong>
      </article>

      <article class="card">
        <span>Current Officers</span>
        <strong id="membersOfficers">...</strong>
      </article>

      <article class="card">
        <span>Pathways Assigned</span>
        <strong id="membersPathways">...</strong>
      </article>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Add Member</h3>
        <span class="badge">Club Database</span>
      </div>

      <form class="enterprise-form" id="createMemberForm">
        <div class="form-grid">
          <label>
            First Name
            <input name="firstName" placeholder="First name" required />
          </label>

          <label>
            Last Name
            <input name="lastName" placeholder="Last name" required />
          </label>

          <label>
            Email
            <input name="email" type="email" placeholder="member@example.com" />
          </label>

          <label>
            Phone
            <input name="phone" placeholder="+91..." />
          </label>

          <label>
            Toastmasters ID
            <input name="toastmastersId" placeholder="Toastmasters ID" />
          </label>

          <label>
            Member Number
            <input name="memberNumber" placeholder="Club member number" />
          </label>

          <label>
            Membership Type
            <select name="membershipType">
              <option value="Member">Member</option>
              <option value="Dual Member">Dual Member</option>
              <option value="Reinstated Member">Reinstated Member</option>
              <option value="Charter Member">Charter Member</option>
              <option value="Honorary Member">Honorary Member</option>
            </select>
          </label>

          <label>
            Membership Status
            <select name="membershipStatus">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PROSPECT">Prospect</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </label>

          <label>
            Join Date
            <input name="joinDate" type="date" />
          </label>

          <label>
            Renewal Date
            <input name="renewalDate" type="date" />
          </label>

          <label>
            Pathway
            <input name="pathwayName" placeholder="Dynamic Leadership, Presentation Mastery..." />
          </label>

          <label>
            Pathway Level
            <select name="pathwayLevel">
              <option value="0">Not Started</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
            </select>
          </label>

          <label>
            Current Officer Role
            <select name="activeOfficerRole">
              <option value="">None</option>
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
            Notes
            <input name="notes" placeholder="Mentor, goals, special notes..." />
          </label>
        </div>

        <button class="primary-btn" id="createMemberBtn" type="submit">Add Member</button>
        <p class="form-message" id="memberFormMessage"></p>
      </form>
    </section>
        <section class="module-panel">
      <div class="panel-header">
        <h3>Member Directory</h3>
        <div class="top-actions">
          <input
            id="memberSearch"
            placeholder="Search members..."
            style="max-width: 280px;"
          />
          <button class="ghost-btn" id="refreshMembersBtn" type="button">Refresh</button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Member</th>
            <th>TM ID</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Type</th>
            <th>Pathway</th>
            <th>Officer Role</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody id="membersTable">
          <tr>
            <td colspan="8">Loading members...</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

async function loadMembers() {
  const table = document.getElementById("membersTable");

  table.innerHTML = `
    <tr>
      <td colspan="8">Loading members...</td>
    </tr>
  `;

  try {
    const response = await apiRequest("/api/members");
    membersCache = response.data || [];
    filteredMembers = [...membersCache];

    table.innerHTML = renderMemberRows(filteredMembers);
    renderStats();
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="8">Failed to load members: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}

function applySearch() {
  const searchInput = document.getElementById("memberSearch");
  const table = document.getElementById("membersTable");
  const query = String(searchInput?.value || "").toLowerCase().trim();

  if (!query) {
    filteredMembers = [...membersCache];
  } else {
    filteredMembers = membersCache.filter((member) => {
      const haystack = [
        member.first_name,
        member.last_name,
        member.display_name,
        member.email,
        member.phone,
        member.toastmasters_id,
        member.membership_status,
        member.membership_type,
        member.pathway_name,
        member.active_officer_role
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }

  table.innerHTML = renderMemberRows(filteredMembers);
}

export async function initClubMembers() {
  const form = document.getElementById("createMemberForm");
  const message = document.getElementById("memberFormMessage");
  const button = document.getElementById("createMemberBtn");
  const refreshBtn = document.getElementById("refreshMembersBtn");
  const searchInput = document.getElementById("memberSearch");

  refreshBtn?.addEventListener("click", loadMembers);
  searchInput?.addEventListener("input", applySearch);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());

    message.textContent = "Adding member...";
    button.disabled = true;

    try {
      await apiRequest("/api/members", {
        method: "POST",
        body: payload
      });

      message.textContent = "Member added successfully.";
      form.reset();
      await loadMembers();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  await loadMembers();
}
