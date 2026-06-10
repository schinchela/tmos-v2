export function renderPlatformClubs() {
  return `
    <section class="hero">
      <p class="eyebrow">Club Provisioning</p>
      <h3>Clubs</h3>
      <p>
        Create and manage Toastmasters clubs. Each club will receive its own isolated
        Cloudflare D1 database with a short unique database name.
      </p>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Create New Club</h3>
        <span class="badge">SuperAdmin Only</span>
      </div>

      <form class="enterprise-form" id="createClubForm">
        <div class="form-grid">
          <label>
            Club Name
            <input name="clubName" placeholder="Toastmasters Club of Central Bhubaneswar" required />
          </label>

          <label>
            Club Short Code
            <input name="clubCode" placeholder="tccb" required />
          </label>

          <label>
            City
            <input name="city" placeholder="Bhubaneswar" />
          </label>

          <label>
            Country
            <input name="country" placeholder="India" />
          </label>

          <label>
            Club Admin Name
            <input name="adminName" placeholder="Club President / Admin" />
          </label>

          <label>
            Club Admin Email
            <input name="adminEmail" placeholder="admin@example.com" type="email" />
          </label>
        </div>

        <div class="provision-preview">
          <span>Generated Database Name</span>
          <strong id="dbPreview">tmos-club</strong>
        </div>

        <button class="primary-btn" type="submit">Provision Club</button>
      </form>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Provisioned Clubs</h3>
        <button class="ghost-btn">Refresh</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Club</th>
            <th>Short Code</th>
            <th>D1 Database</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="clubsTable">
          <tr>
            <td>No clubs yet</td>
            <td>-</td>
            <td>-</td>
            <td><span class="badge warning">Waiting</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

export function initPlatformClubs() {
  const form = document.getElementById("createClubForm");
  const codeInput = form?.querySelector("[name='clubCode']");
  const preview = document.getElementById("dbPreview");

  function updatePreview() {
    const raw = codeInput.value || "club";
    const clean = raw
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 12);

    preview.textContent = `tmos-${clean || "club"}`;
  }

  codeInput?.addEventListener("input", updatePreview);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("Next step: connect this form to the Cloudflare Worker API.");
  });

  updatePreview();
}
