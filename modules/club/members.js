import { apiRequest } from "../../assets/js/api.js";
import { memberDisplayName }  from "../../assets/js/member-display.js";


let membersCache = [];
let filteredMembers = [];
let currentFilter = "ALL";

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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function isRenewalDue(member) {
  if (!member.renewal_date) return false;

  const renewalDate = new Date(member.renewal_date);
  const today = new Date();
  const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

  return daysUntilRenewal <= 30;
}

function formatPathwayLevel(value) {
  const level = Number(value || 0);

  if (level === 0) return "Not Started";
  if (level === 6) return "Completed";

  return `Level ${level}`;
}

function statusBadge(status) {
  const value = String(status || "ACTIVE").toUpperCase();

  if (["ARCHIVED", "INACTIVE", "SUSPENDED", "TERMINATED"].includes(value)) {
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
          No members found for this view.
        </td>
      </tr>
    `;
  }

  return members.map((member) => `
    <tr
      class="clickable-row"
      data-member-id="${escapeHtml(member.id)}"
      style="cursor:pointer;"
    >
      <td>
        <strong>${escapeHtml(memberDisplayName(member) || `${member.first_name || ""} ${member.last_name || ""}`.trim())}</strong><br>
        <small>${escapeHtml(member.email || "-")}</small>
      </td>
      <td>${escapeHtml(member.toastmasters_id || "-")}</td>
      <td>${escapeHtml(member.phone || "-")}</td>
      <td>${statusBadge(member.membership_status)}</td>
      <td>${escapeHtml(member.membership_type || "-")}</td>
      <td>
        ${escapeHtml(member.pathway_name || "-")}<br>
        <small>${escapeHtml(formatPathwayLevel(member.pathway_level))}</small>
      </td>
      <td>${escapeHtml(member.active_officer_role || "-")}</td>
      <td>${escapeHtml(formatDate(member.join_date))}</td>
    </tr>
  `).join("");
}

function renderStats() {
  const total = membersCache.length;
  const active = membersCache.filter((member) => member.membership_status === "ACTIVE").length;
  const archived = membersCache.filter((member) => member.membership_status === "ARCHIVED").length;
  const officers = membersCache.filter((member) => Boolean(member.active_officer_role)).length;
  const pathways = membersCache.filter((member) => Boolean(member.pathway_name)).length;
  const renewalDue = membersCache.filter(isRenewalDue).length;

  document.getElementById("membersTotal").textContent = total;
  document.getElementById("membersActive").textContent = active;
  document.getElementById("membersArchived").textContent = archived;
  document.getElementById("membersOfficers").textContent = officers;
  document.getElementById("membersPathways").textContent = pathways;
  document.getElementById("membersRenewalDue").textContent = renewalDue;
}

function filterMembers() {
  const searchInput = document.getElementById("memberSearch");
  const query = String(searchInput?.value || "").toLowerCase().trim();

  let result = [...membersCache];

  if (currentFilter === "ACTIVE") {
    result = result.filter((member) => member.membership_status === "ACTIVE");
  }

  if (currentFilter === "ARCHIVED") {
    result = result.filter((member) => member.membership_status === "ARCHIVED");
  }

  if (currentFilter === "OFFICERS") {
    result = result.filter((member) => Boolean(member.active_officer_role));
  }

  if (currentFilter === "NO_PATHWAY") {
    result = result.filter((member) => !member.pathway_name);
  }

  if (currentFilter === "RENEWAL_DUE") {
    result = result.filter(isRenewalDue);
  }

  if (query) {
    result = result.filter((member) => {
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

  filteredMembers = result;
}

function renderFilteredMembers() {
  const table = document.getElementById("membersTable");
  if (!table) return;

  filterMembers();
  table.innerHTML = renderMemberRows(filteredMembers);

  document.querySelectorAll("[data-member-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.memberFilter === currentFilter);
  });
}

export function renderClubMembers() {
  return `
    <section class="hero">
      <p class="eyebrow">Membership Command Center</p>
      <h3>Members</h3>
      <p>
        Manage member profiles, Toastmasters IDs, pathways, officer roles and membership
        lifecycle. This module feeds Meetings, Education, Awards, Attendance and Reports.
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
        <span>Archived</span>
        <strong id="membersArchived">...</strong>
      </article>

      <article class="card">
        <span>Current Officers</span>
        <strong id="membersOfficers">...</strong>
      </article>

      <article class="card">
        <span>Pathways Assigned</span>
        <strong id="membersPathways">...</strong>
      </article>

      <article class="card">
        <span>Renewal Due</span>
        <strong id="membersRenewalDue">...</strong>
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
              <option value="ARCHIVED">Archived</option>
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
            <select name="pathwayName">
              ${pathwayOptions()}
            </select>
          </label>

          <label>
            Pathway Level
            <select name="pathwayLevel">
              ${pathwayLevelOptions()}
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

      <div class="top-actions" style="margin-bottom: 16px; flex-wrap: wrap;">
        <button class="ghost-btn small-btn active" data-member-filter="ALL" type="button">All</button>
        <button class="ghost-btn small-btn" data-member-filter="ACTIVE" type="button">Active</button>
        <button class="ghost-btn small-btn" data-member-filter="ARCHIVED" type="button">Archived</button>
        <button class="ghost-btn small-btn" data-member-filter="OFFICERS" type="button">Officers</button>
        <button class="ghost-btn small-btn" data-member-filter="NO_PATHWAY" type="button">No Pathway</button>
        <button class="ghost-btn small-btn" data-member-filter="RENEWAL_DUE" type="button">Renewal Due</button>
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
  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="8">Loading members...</td>
    </tr>
  `;

  try {
    const response = await apiRequest("/api/members");
    membersCache = response.data || [];
    renderFilteredMembers();
    renderStats();
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="8">Failed to load members: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}

function bindMemberFilters() {
  document.querySelectorAll("[data-member-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.memberFilter;
      renderFilteredMembers();
    });
  });
}

function bindMemberRowNavigation() {
  const table = document.getElementById("membersTable");
  if (!table) return;

  table.addEventListener("click", (event) => {
    const row = event.target.closest("[data-member-id]");
    if (!row) return;

    window.TMOS_SELECTED_MEMBER_ID = row.dataset.memberId;

    import("../../assets/js/router.js").then(({ navigate }) => {
      navigate("club-member-details");
    });
  });
}

export async function initClubMembers() {
  const form = document.getElementById("createMemberForm");
  const message = document.getElementById("memberFormMessage");
  const button = document.getElementById("createMemberBtn");
  const refreshBtn = document.getElementById("refreshMembersBtn");
  const searchInput = document.getElementById("memberSearch");

  currentFilter = "ALL";

  refreshBtn?.addEventListener("click", loadMembers);
  searchInput?.addEventListener("input", renderFilteredMembers);

  bindMemberFilters();
  bindMemberRowNavigation();

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
      currentFilter = "ALL";
      await loadMembers();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  await loadMembers();
}
