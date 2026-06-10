const modules = {
  dashboard: {
    title: "Dashboard",
    intro: "Command center for the entire TMOS Enterprise platform.",
    stats: [
      ["Total Clubs", "0"],
      ["Active Members", "0"],
      ["Meetings This Month", "0"],
      ["Platform Health", "100%"]
    ]
  },
  clubs: {
    title: "Clubs",
    intro: "SuperAdmin module for creating clubs, provisioning D1 databases, managing status, and reviewing club-level activity.",
    stats: [
      ["Provisioned Clubs", "0"],
      ["Pending Setup", "0"],
      ["Database Mode", "One D1 / Club"],
      ["Audit Coverage", "Enabled"]
    ]
  },
  members: {
    title: "Members",
    intro: "Enterprise member registry with roles, tenure, renewal status, pathways progress, attendance and club history.",
    stats: [
      ["Members", "0"],
      ["Active", "0"],
      ["Renewals Due", "0"],
      ["Officers", "0"]
    ]
  },
  meetings: {
    title: "Meetings",
    intro: "Plan agendas, assign roles, track attendance, record prepared speeches, evaluations and meeting quality metrics.",
    stats: [
      ["Upcoming Meetings", "0"],
      ["Roles Assigned", "0"],
      ["Attendance Rate", "0%"],
      ["Agenda Status", "Draft"]
    ]
  },
  guests: {
    title: "Guests",
    intro: "Capture guest visits, follow-ups, conversion pipeline, source tracking and membership onboarding.",
    stats: [
      ["Guests", "0"],
      ["Follow-ups Due", "0"],
      ["Converted", "0"],
      ["Pipeline Value", "New"]
    ]
  },
  education: {
    title: "Education",
    intro: "Track pathways, speeches, levels, mentor assignments, evaluator records and educational achievements.",
    stats: [
      ["Speeches", "0"],
      ["Pathways Active", "0"],
      ["Awards", "0"],
      ["Mentor Matches", "0"]
    ]
  },
  finance: {
    title: "Finance",
    intro: "Club dues, payments, receipts, renewals, reimbursements and financial reporting.",
    stats: [
      ["Receipts", "0"],
      ["Pending Dues", "0"],
      ["Collections", "₹0"],
      ["Renewal Cycle", "Open"]
    ]
  },
  reports: {
    title: "Reports",
    intro: "Executive reports for SuperAdmin, Area Directors, club officers and compliance tracking.",
    stats: [
      ["Reports", "0"],
      ["Exports", "CSV/PDF"],
      ["Audit Logs", "Enabled"],
      ["Insights", "Coming"]
    ]
  },
  settings: {
    title: "Settings",
    intro: "Platform settings, club settings, permissions, role templates, database bindings and security policies.",
    stats: [
      ["Roles", "SuperAdmin"],
      ["Security", "Cloudflare-native"],
      ["Database", "D1"],
      ["Frontend", "Pages"]
    ]
  }
};

function renderModule(moduleKey) {
  const module = modules[moduleKey] || modules.dashboard;
  document.getElementById("pageTitle").textContent = module.title;

  const app = document.getElementById("app");

  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">TMOS Enterprise Module</p>
      <h3>${module.title}</h3>
      <p>${module.intro}</p>
    </section>

    <section class="grid">
      ${module.stats.map(([label, value]) => `
        <article class="card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `).join("")}
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>${module.title} Workspace</h3>
        <button class="primary-btn">New Record</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Capability</th>
            <th>Status</th>
            <th>Database</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${module.title}</td>
            <td>Enterprise workflow foundation</td>
            <td><span class="badge">Ready for API</span></td>
            <td>Cloudflare D1</td>
          </tr>
          <tr>
            <td>${module.title}</td>
            <td>Role-based access model</td>
            <td><span class="badge">Planned</span></td>
            <td>Platform + Club DB</td>
          </tr>
          <tr>
            <td>${module.title}</td>
            <td>Audit logging</td>
            <td><span class="badge">Planned</span></td>
            <td>Platform DB</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    renderModule(button.dataset.module);
  });
});

renderModule("dashboard");
