import { apiRequest } from "../../assets/js/api.js";

let usersCache = [];
let clubsCache = [];
let rolesCache = [];

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
  return new Date(value).toLocaleString();
}

function renderRoleOptions() {
  return rolesCache.map((role) => `
    <option value="${escapeHtml(role.code)}">
      ${escapeHtml(role.name)} (${escapeHtml(role.scope)})
    </option>
  `).join("");
}

function renderClubOptions() {
  return `
    <option value="">Platform / No Club</option>
    ${clubsCache.map((club) => `
      <option value="${escapeHtml(club.id)}">
        ${escapeHtml(club.name)}
      </option>
    `).join("")}
  `;
}

function renderUserRows(users) {
  if (!users.length) {
    return `
      <tr>
        <td colspan="7">No users found.</td>
      </tr>
    `;
  }

  return users.map((user) => `
    <tr>
      <td>
        <strong>${escapeHtml(`${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed User")}</strong><br>
        <small>${escapeHtml(user.email)}</small>
      </td>
      <td><span class="badge">${escapeHtml(user.role)}</span></td>
      <td>${escapeHtml(user.club_name || "Platform")}</td>
      <td>${escapeHtml(user.phone || "-")}</td>
      <td><span class="badge">${escapeHtml(user.status)}</span></td>
      <td>${escapeHtml(formatDate(user.last_login_at))}</td>
      <td>${escapeHtml(formatDate(user.created_at))}</td>
    </tr>
  `).join("");
}

function renderStats() {
  const total = usersCache.length;
  const active = usersCache.filter((u) => u.status === "ACTIVE").length;
  const platform = usersCache.filter((u) => !u.club_id).length;
  const clubUsers = usersCache.filter((u) => u.club_id).length;

  document.getElementById("usersTotal").textContent = total;
  document.getElementById("usersActive").textContent = active;
  document.getElementById("usersPlatform").textContent = platform;
  document.getElementById("usersClub").textContent = clubUsers;
}

async function loadUsers() {
  const table = document.getElementById("usersTable");
  table.innerHTML = `<tr><td colspan="7">Loading users...</td></tr>`;

  try {
    const response = await apiRequest("/api/platform/users");
    usersCache = response.data || [];
    table.innerHTML = renderUserRows(usersCache);
    renderStats();
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="7">Failed to load users: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}

async function loadLookups() {
  const [rolesResponse, clubsResponse] = await Promise.all([
    apiRequest("/api/platform/roles"),
    apiRequest("/api/platform/clubs")
  ]);

  rolesCache = rolesResponse.data || [];
  clubsCache = clubsResponse.data || [];

  document.getElementById("roleSelect").innerHTML = renderRoleOptions();
  document.getElementById("clubSelect").innerHTML = renderClubOptions();
}

export function renderPlatformUsers() {
  return `
    <section class="hero">
      <p class="eyebrow">Identity & Access</p>
      <h3>Users</h3>
      <p>
        Manage platform admins, club admins and club officers. This is the access-control
        foundation for TMOS Enterprise.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>Total Users</span>
        <strong id="usersTotal">...</strong>
      </article>
      <article class="card">
        <span>Active Users</span>
        <strong id="usersActive">...</strong>
      </article>
      <article class="card">
        <span>Platform Users</span>
        <strong id="usersPlatform">...</strong>
      </article>
      <article class="card">
        <span>Club Users</span>
        <strong id="usersClub">...</strong>
      </article>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Create User</h3>
        <span class="badge">SuperAdmin Only</span>
      </div>

      <form class="enterprise-form" id="createUserForm">
        <div class="form-grid">
          <label>
            First Name
            <input name="firstName" placeholder="First name" />
          </label>

          <label>
            Last Name
            <input name="lastName" placeholder="Last name" />
          </label>

          <label>
            Email
            <input name="email" type="email" placeholder="user@example.com" required />
          </label>

          <label>
            Phone
            <input name="phone" placeholder="+91..." />
          </label>

          <label>
            Role
            <select name="role" id="roleSelect" required>
              <option>Loading roles...</option>
            </select>
          </label>

          <label>
            Club
            <select name="clubId" id="clubSelect">
              <option>Loading clubs...</option>
            </select>
          </label>

          <label>
            Temporary Password
            <input name="password" value="TempPass12345" required />
          </label>
        </div>

        <button class="primary-btn" id="createUserBtn" type="submit">Create User</button>
        <p class="form-message" id="userFormMessage"></p>
      </form>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>All Users</h3>
        <button class="ghost-btn" id="refreshUsersBtn" type="button">Refresh</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Club</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody id="usersTable">
          <tr>
            <td colspan="7">Loading users...</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

export async function initPlatformUsers() {
  const form = document.getElementById("createUserForm");
  const message = document.getElementById("userFormMessage");
  const button = document.getElementById("createUserBtn");
  const refreshBtn = document.getElementById("refreshUsersBtn");

  refreshBtn?.addEventListener("click", loadUsers);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());

    message.textContent = "Creating user...";
    button.disabled = true;

    try {
      const response = await apiRequest("/api/platform/users", {
        method: "POST",
        body: payload
      });

      message.textContent = `User created. Temporary password: ${response.data.temporaryPassword}`;
      form.reset();
      await loadLookups();
      await loadUsers();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  try {
    await loadLookups();
    await loadUsers();
  } catch (error) {
    message.textContent = error.message;
  }
}
