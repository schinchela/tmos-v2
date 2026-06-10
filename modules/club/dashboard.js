export function renderClubDashboard() {
  return `
    <section class="hero">
      <p class="eyebrow">Club Command Center</p>
      <h3>Club Dashboard</h3>
      <p>
        Welcome to TMOS Club Portal. Monitor membership growth,
        meeting performance, education progress and finances.
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <span>Total Members</span>
        <strong>0</strong>
      </article>

      <article class="card">
        <span>Active Members</span>
        <strong>0</strong>
      </article>

      <article class="card">
        <span>Guests This Month</span>
        <strong>0</strong>
      </article>

      <article class="card">
        <span>Club Health</span>
        <strong>100%</strong>
      </article>
    </section>
  `;
}

export async function initClubDashboard() {}
