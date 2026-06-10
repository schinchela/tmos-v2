export function renderPlatformUsers() {
  return `
    <section class="hero">
      <p class="eyebrow">Access Control</p>
      <h3>Platform Users</h3>
      <p>
        Manage SuperAdmins, club admins and future role-based access control.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>SuperAdmins</span>
        <strong>1</strong>
      </article>
      <article class="card">
        <span>Club Admins</span>
        <strong>0</strong>
      </article>
      <article class="card">
        <span>Pending Invites</span>
        <strong>0</strong>
      </article>
      <article class="card">
        <span>RBAC Status</span>
        <strong>Planned</strong>
      </article>
    </section>
  `;
}
