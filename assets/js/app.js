import { navigate } from "./router.js";
import { login, logout, getMe, clearToken } from "./api.js";
import { setCurrentUser } from "./state.js";

const root = document.body;

const PLATFORM_ROLES = ["SUPER_ADMIN", "PLATFORM_ADMIN", "SUPPORT_ADMIN"];

function isPlatformUser(user) {
  return PLATFORM_ROLES.includes(user.role);
}

function defaultRouteForUser(user) {
  return isPlatformUser(user) ? "platform-dashboard" : "club-dashboard";
}

function renderLogin() {
  root.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <div class="auth-brand">
          <div class="brand-mark">T</div>
          <div>
            <h1>TMOS Enterprise</h1>
            <p>Secure role-based login</p>
          </div>
        </div>

        <form id="loginForm" class="auth-form">
          <label>
            Email
            <input name="email" type="email" value="admin@tmos.com" required />
          </label>

          <label>
            Password
            <input name="password" type="password" placeholder="Enter password" required />
          </label>

          <button class="primary-btn" id="loginBtn" type="submit">Login</button>
          <p class="form-message" id="loginMessage"></p>
        </form>
      </section>
    </main>
  `;

  const form = document.getElementById("loginForm");
  const button = document.getElementById("loginBtn");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    message.textContent = "Signing in...";
    button.disabled = true;

    try {
      const result = await login(email, password);
      setCurrentUser(result.user);
      renderShell(result.user);
      navigate(defaultRouteForUser(result.user));
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
}

function platformNav() {
  return `
    <div class="sidebar-section">
      <p class="sidebar-label">Platform</p>
      <nav class="nav">
        <button class="nav-item active" data-route="platform-dashboard">Dashboard</button>
        <button class="nav-item" data-route="platform-clubs">Clubs</button>
        <button class="nav-item" data-route="platform-users">Users</button>
        <button class="nav-item" data-route="platform-audit">Audit Logs</button>
      </nav>
    </div>

    <div class="sidebar-section muted-section">
      <p class="sidebar-label">Club Modules</p>
      <button class="nav-item disabled">Members</button>
      <button class="nav-item disabled">Meetings</button>
      <button class="nav-item disabled">Guests</button>
      <button class="nav-item disabled">Education</button>
      <button class="nav-item disabled">Finance</button>
      <button class="nav-item disabled">Reports</button>
    </div>
  `;
}

function clubNav() {
  return `
    <div class="sidebar-section">
      <p class="sidebar-label">Club Portal</p>
      <nav class="nav">
        <button class="nav-item active" data-route="club-dashboard">Dashboard</button>
        <button class="nav-item" data-route="club-members">Members</button>
        <button class="nav-item" data-route="club-meetings">Meetings</button>
        <button class="nav-item" data-route="club-guests">Guests</button>
        <button class="nav-item" data-route="club-education">Education</button>
        <button class="nav-item" data-route="club-finance">Finance</button>
        <button class="nav-item" data-route="club-reports">Reports</button>
        <button class="nav-item" data-route="club-settings">Settings</button>
      </nav>
    </div>
  `;
}

function renderShell(user) {
  const mode = isPlatformUser(user) ? "Platform Console" : "Club Portal";

  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">T</div>
          <div>
            <h1>TMOS</h1>
            <span>Enterprise v2</span>
          </div>
        </div>

        ${isPlatformUser(user) ? platformNav() : clubNav()}

        <div class="sidebar-footer">
          <span>${mode}</span>
          <strong>${user.email}</strong>
          <small>${user.role}</small>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <p class="eyebrow">Toastmasters Operating System</p>
            <h2 id="pageTitle">${mode}</h2>
          </div>

          <div class="top-actions">
            ${isPlatformUser(user)
              ? `<button class="primary-btn" data-route="platform-clubs">Create Club</button>`
              : `<button class="primary-btn" data-route="club-meetings">Plan Meeting</button>`
            }
            <button class="ghost-btn" id="logoutBtn">Logout</button>
          </div>
        </header>

        <section id="app" class="content"></section>
      </main>
    </div>
  `;

  document.addEventListener("click", handleRouteClicks);

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await logout();
    setCurrentUser(null);
    renderLogin();
  });
}

function handleRouteClicks(event) {
  const routeButton = event.target.closest("[data-route]");
  if (!routeButton) return;

  navigate(routeButton.dataset.route);
}

async function boot() {
  try {
    const response = await getMe();
    setCurrentUser(response.data);
    renderShell(response.data);
    navigate(defaultRouteForUser(response.data));
  } catch (_) {
    clearToken();
    renderLogin();
  }
}

boot();
