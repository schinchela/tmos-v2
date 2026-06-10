export function renderPlatformDashboard() {
  return `
    <section class="hero">
      <p class="eyebrow">SuperAdmin Command Center</p>
      <h3>Platform Dashboard</h3>
      <p>
        Manage the entire TMOS Enterprise SaaS platform from one secure control center.
        Track clubs, users, databases, provisioning health and audit activity.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>Total Clubs</span>
        <strong>0</strong>
      </article>
      <article class="card">
        <span>Active Clubs</span>
        <strong>0</strong>
      </article>
      <article class="card">
        <span>Platform Users</span>
        <strong>1</strong>
      </article>
      <article class="card">
        <span>System Health</span>
        <strong>100%</strong>
      </article>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Platform Overview</h3>
        <button class="primary-btn" data-route="platform-clubs">Create Club</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Purpose</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cloudflare Pages</td>
            <td>Frontend application</td>
            <td><span class="badge">Live</span></td>
          </tr>
          <tr>
            <td>Cloudflare Worker</td>
            <td>Backend API gateway</td>
            <td><span class="badge warning">Next</span></td>
          </tr>
          <tr>
            <td>Platform D1</td>
            <td>Clubs, users, audit logs</td>
            <td><span class="badge warning">Next</span></td>
          </tr>
          <tr>
            <td>Club D1 Databases</td>
            <td>One isolated database per club</td>
            <td><span class="badge warning">Planned</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}
