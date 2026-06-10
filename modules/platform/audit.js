export function renderPlatformAudit() {
  return `
    <section class="hero">
      <p class="eyebrow">Compliance & Traceability</p>
      <h3>Audit Logs</h3>
      <p>
        Every important platform action will be tracked here: club creation,
        database provisioning, user changes, failed logins and permission updates.
      </p>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Recent Audit Events</h3>
        <span class="badge warning">No events yet</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>-</td>
            <td>SuperAdmin</td>
            <td>Awaiting backend</td>
            <td>Platform DB</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}
