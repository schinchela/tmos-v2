const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

const SESSION_DAYS = 7;

const CLUB_MIGRATIONS = [
  {
    version: "001_core",
    sql: [
      `CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS club_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT NOT NULL)`,
      `INSERT OR IGNORE INTO club_settings (key, value, updated_at) VALUES ('officer_term_cycle', 'YEARLY', datetime('now'))`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('001_core', datetime('now'))`
    ]
  },
  {
    version: "002_members",
    sql: [
      `CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        member_number TEXT,
        toastmasters_id TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        display_name TEXT,
        email TEXT,
        phone TEXT,
        membership_type TEXT,
        membership_status TEXT NOT NULL DEFAULT 'ACTIVE',
        join_date TEXT,
        renewal_date TEXT,
        mentor_member_id TEXT,
        sponsor_member_id TEXT,
        pathway_name TEXT,
        pathway_level INTEGER DEFAULT 0,
        active_officer_role TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status)`,
      `CREATE INDEX IF NOT EXISTS idx_members_email ON members(email)`,
      `CREATE INDEX IF NOT EXISTS idx_members_tm_id ON members(toastmasters_id)`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('002_members', datetime('now'))`
    ]
  },
  {
    version: "003_officer_terms",
    sql: [
      `CREATE TABLE IF NOT EXISTS officer_terms (
        id TEXT PRIMARY KEY,
        term_label TEXT NOT NULL,
        term_cycle TEXT NOT NULL,
        term_start TEXT NOT NULL,
        term_end TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS member_officer_terms (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        officer_role TEXT NOT NULL,
        term_id TEXT NOT NULL,
        term_label TEXT NOT NULL,
        term_start TEXT NOT NULL,
        term_end TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_member_officer_terms_member ON member_officer_terms(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_member_officer_terms_role ON member_officer_terms(officer_role)`,
      `CREATE INDEX IF NOT EXISTS idx_member_officer_terms_term ON member_officer_terms(term_id)`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('003_officer_terms', datetime('now'))`
    ]
  },
  {
    version: "004_member_attendance",
    sql: [
      `CREATE TABLE IF NOT EXISTS member_attendance (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        meeting_id TEXT,
        meeting_date TEXT NOT NULL,
        attendance_status TEXT NOT NULL,
        role_taken TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_attendance_member ON member_attendance(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_attendance_date ON member_attendance(meeting_date)`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('004_member_attendance', datetime('now'))`
    ]
  },
  {
    version: "005_member_speeches",
    sql: [
      `CREATE TABLE IF NOT EXISTS member_speeches (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        meeting_id TEXT,
        speech_title TEXT NOT NULL,
        pathway_name TEXT,
        project_name TEXT,
        level_number INTEGER,
        speech_date TEXT,
        evaluator_member_id TEXT,
        duration_seconds INTEGER,
        status TEXT NOT NULL DEFAULT 'COMPLETED',
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_speeches_member ON member_speeches(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_speeches_date ON member_speeches(speech_date)`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('005_member_speeches', datetime('now'))`
    ]
  },
  {
    version: "006_member_awards",
    sql: [
      `CREATE TABLE IF NOT EXISTS member_awards (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        award_type TEXT NOT NULL,
        award_name TEXT NOT NULL,
        award_date TEXT,
        source TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_awards_member ON member_awards(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_awards_date ON member_awards(award_date)`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('006_member_awards', datetime('now'))`
    ]
  },
  {
    version: "007_member_pathways",
    sql: [
      `CREATE TABLE IF NOT EXISTS member_pathways (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        pathway_name TEXT NOT NULL,
        current_level INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        started_at TEXT,
        level_1_completed_at TEXT,
        level_2_completed_at TEXT,
        level_3_completed_at TEXT,
        level_4_completed_at TEXT,
        level_5_completed_at TEXT,
        completed_at TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_pathways_member ON member_pathways(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_pathways_status ON member_pathways(status)`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('007_member_pathways', datetime('now'))`
    ]
  },
  {
    version: "008_member_goals",
    sql: [
      `CREATE TABLE IF NOT EXISTS member_goals (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        goal_type TEXT NOT NULL,
        goal_title TEXT NOT NULL,
        target_date TEXT,
        status TEXT NOT NULL DEFAULT 'OPEN',
        progress_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_goals_member ON member_goals(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_goals_status ON member_goals(status)`,
      `INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('008_member_goals', datetime('now'))`
    ]
  }
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function cleanSlug(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "").slice(0, 12);
}

function generateTempPassword() {
  return `TMOS-${Math.random().toString(36).slice(2, 8)}-${new Date().getFullYear()}`;
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function passwordHash(password, salt) {
  return sha256(`${salt}:${password}`);
}

async function writeAudit(env, { userId = "system", action, entityType, entityId = null, details = {} }) {
  await env.DB.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id("audit"), userId, action, entityType, entityId, JSON.stringify(details), now()).run();
}

async function cloudflareRequest(env, path, options = {}) {
  if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) {
    throw new Error("Cloudflare provisioning secrets are missing");
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.errors?.[0]?.message ||
      data?.messages?.[0]?.message ||
      "Cloudflare API request failed"
    );
  }

  return data.result;
}

async function createCloudflareD1Database(env, databaseName) {
  const result = await cloudflareRequest(env, `/accounts/${env.CF_ACCOUNT_ID}/d1/database`, {
    method: "POST",
    body: { name: databaseName }
  });

  return {
    id: result.uuid || result.id,
    name: result.name
  };
}

async function runCloudflareD1Query(env, databaseId, sql) {
  return cloudflareRequest(env, `/accounts/${env.CF_ACCOUNT_ID}/d1/database/${databaseId}/query`, {
    method: "POST",
    body: { sql }
  });
}

async function getClubDatabaseInfo(env, clubId) {
  return env.DB.prepare(`
    SELECT
      database_name,
      database_identifier
    FROM club_databases
    WHERE club_id = ?
  `)
  .bind(clubId)
  .first();
}

async function executeClubQuery(
  env,
  clubId,
  sql
) {
  const dbInfo = await getClubDatabaseInfo(
    env,
    clubId
  );

  if (!dbInfo) {
    throw new Error(
      "Club database not found"
    );
  }

  return runCloudflareD1Query(
    env,
    dbInfo.database_identifier,
    sql
  );
}

async function executeClubStatement(
  env,
  clubId,
  sql
) {
  const dbInfo = await getClubDatabaseInfo(
    env,
    clubId
  );

  if (!dbInfo) {
    throw new Error(
      "Club database not found"
    );
  }

  return runCloudflareD1Query(
    env,
    dbInfo.database_identifier,
    sql
  );
}
function sqlEscape(value) {
  if (value === null || value === undefined) return null;
  return String(value).replaceAll("'", "''");
}

function sqlValue(value) {
  if (value === null || value === undefined || value === "") {
    return "NULL";
  }

  return `'${sqlEscape(value)}'`;
}

async function listMembers(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT
        id,
        member_number,
        toastmasters_id,
        first_name,
        last_name,
        display_name,
        email,
        phone,
        membership_type,
        membership_status,
        join_date,
        renewal_date,
        pathway_name,
        pathway_level,
        active_officer_role,
        created_at,
        updated_at
      FROM members
      ORDER BY last_name ASC, first_name ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function createMember(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const body = await request.json();

  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();

  if (!firstName) {
    return json({ success: false, error: "First name is required" }, 400);
  }

  if (!lastName) {
    return json({ success: false, error: "Last name is required" }, 400);
  }

  const memberId = id("member");
  const createdAt = now();
  const displayName = `${firstName} ${lastName}`.trim();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO members (
        id,
        member_number,
        toastmasters_id,
        first_name,
        last_name,
        display_name,
        email,
        phone,
        membership_type,
        membership_status,
        join_date,
        renewal_date,
        mentor_member_id,
        sponsor_member_id,
        pathway_name,
        pathway_level,
        active_officer_role,
        notes,
        created_at,
        updated_at
      ) VALUES (
        ${sqlValue(memberId)},
        ${sqlValue(body.memberNumber)},
        ${sqlValue(body.toastmastersId)},
        ${sqlValue(firstName)},
        ${sqlValue(lastName)},
        ${sqlValue(displayName)},
        ${sqlValue(body.email)},
        ${sqlValue(body.phone)},
        ${sqlValue(body.membershipType || "Member")},
        ${sqlValue(body.membershipStatus || "ACTIVE")},
        ${sqlValue(body.joinDate)},
        ${sqlValue(body.renewalDate)},
        ${sqlValue(body.mentorMemberId)},
        ${sqlValue(body.sponsorMemberId)},
        ${sqlValue(body.pathwayName)},
        ${Number(body.pathwayLevel || 0)},
        ${sqlValue(body.activeOfficerRole)},
        ${sqlValue(body.notes)},
        ${sqlValue(createdAt)},
        ${sqlValue(createdAt)}
      )
    `
  );

  await writeAudit(env, {
    userId: auth.user.id,
    action: "CREATE_MEMBER",
    entityType: "member",
    entityId: memberId,
    details: {
      clubId: auth.user.club_id,
      firstName,
      lastName,
      email: body.email || null
    }
  });

  return json({
    success: true,
    data: {
      id: memberId,
      firstName,
      lastName,
      displayName,
      email: body.email || null,
      membershipStatus: body.membershipStatus || "ACTIVE",
      createdAt
    }
  }, 201);
}
async function getMemberDetails(request, env, memberId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const memberResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT
        id,
        member_number,
        toastmasters_id,
        first_name,
        last_name,
        display_name,
        email,
        phone,
        membership_type,
        membership_status,
        join_date,
        renewal_date,
        mentor_member_id,
        sponsor_member_id,
        pathway_name,
        pathway_level,
        active_officer_role,
        notes,
        created_at,
        updated_at
      FROM members
      WHERE id = ${sqlValue(memberId)}
      LIMIT 1
    `
  );

  const memberRows = memberResult?.[0]?.results || memberResult?.results || [];
  const member = memberRows[0];

  if (!member) {
    return json({ success: false, error: "Member not found" }, 404);
  }

  const pathwaysResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM member_pathways
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY created_at DESC
    `
  );

  const awardsResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM member_awards
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY award_date DESC, created_at DESC
    `
  );

  const officerTermsResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM member_officer_terms
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY term_start DESC
    `
  );

  const attendanceResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM member_attendance
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY meeting_date DESC
      LIMIT 20
    `
  );

  const speechesResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM member_speeches
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY speech_date DESC, created_at DESC
      LIMIT 20
    `
  );

  const goalsResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM member_goals
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY created_at DESC
    `
  );

  return json({
    success: true,
    data: {
      member,
      pathways: pathwaysResult?.[0]?.results || pathwaysResult?.results || [],
      awards: awardsResult?.[0]?.results || awardsResult?.results || [],
      officerTerms: officerTermsResult?.[0]?.results || officerTermsResult?.results || [],
      attendance: attendanceResult?.[0]?.results || attendanceResult?.results || [],
      speeches: speechesResult?.[0]?.results || speechesResult?.results || [],
      goals: goalsResult?.[0]?.results || goalsResult?.results || []
    }
  });
}
import { apiRequest } from "../../assets/js/api.js";

let currentMemberId = null;
let member360Data = null;

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

function emptyState(title, description) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>${escapeHtml(title)}</h3>
        <span class="badge warning">Pending</span>
      </div>
      <div class="enterprise-form">
        <p>${escapeHtml(description)}</p>
      </div>
    </section>
  `;
}

function renderProfile(member) {
  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Profile</h3>
        ${statusBadge(member.membership_status)}
      </div>

      <div class="enterprise-form">
        <div class="form-grid">
          <div class="card">
            <span>Name</span>
            <strong>${escapeHtml(member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim())}</strong>
          </div>

          <div class="card">
            <span>Toastmasters ID</span>
            <strong>${escapeHtml(member.toastmasters_id || "-")}</strong>
          </div>

          <div class="card">
            <span>Email</span>
            <strong>${escapeHtml(member.email || "-")}</strong>
          </div>

          <div class="card">
            <span>Phone</span>
            <strong>${escapeHtml(member.phone || "-")}</strong>
          </div>

          <div class="card">
            <span>Membership Type</span>
            <strong>${escapeHtml(member.membership_type || "-")}</strong>
          </div>

          <div class="card">
            <span>Join Date</span>
            <strong>${escapeHtml(formatDate(member.join_date))}</strong>
          </div>

          <div class="card">
            <span>Renewal Date</span>
            <strong>${escapeHtml(formatDate(member.renewal_date))}</strong>
          </div>

          <div class="card">
            <span>Current Officer Role</span>
            <strong>${escapeHtml(member.active_officer_role || "-")}</strong>
          </div>
        </div>

        <div class="module-panel">
          <div class="panel-header">
            <h3>Notes</h3>
          </div>
          <div class="enterprise-form">
            <p>${escapeHtml(member.notes || "No notes added yet.")}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderListTable(title, rows, columns, emptyDescription) {
  if (!rows.length) {
    return emptyState(title, emptyDescription);
  }

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>${escapeHtml(title)}</h3>
        <span class="badge">${rows.length}</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            ${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              ${columns.map((column) => {
                const rawValue = row[column.key];
                const value = column.format
                  ? column.format(rawValue, row)
                  : rawValue || "-";

                return `<td>${escapeHtml(value)}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderMember360(data) {
  const member = data.member;

  return `
    <section class="hero">
      <p class="eyebrow">Member 360</p>
      <h3>${escapeHtml(member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim())}</h3>
      <p>
        Complete member profile across membership, Pathways, speeches, attendance,
        awards, goals and officer leadership history.
      </p>
      <button class="ghost-btn" data-route="club-members">Back to Members</button>
    </section>

    <section class="grid">
      <article class="card">
        <span>Membership Status</span>
        <strong>${escapeHtml(member.membership_status || "ACTIVE")}</strong>
      </article>

      <article class="card">
        <span>Pathway</span>
        <strong>${escapeHtml(member.pathway_name || "Not Set")}</strong>
      </article>

      <article class="card">
        <span>Pathway Level</span>
        <strong>${escapeHtml(member.pathway_level ?? 0)}</strong>
      </article>

      <article class="card">
        <span>Officer Role</span>
        <strong>${escapeHtml(member.active_officer_role || "None")}</strong>
      </article>
    </section>

    ${renderProfile(member)}

    ${renderListTable(
      "Pathways",
      data.pathways || [],
      [
        { key: "pathway_name", label: "Pathway" },
        { key: "current_level", label: "Level" },
        { key: "status", label: "Status" },
        { key: "started_at", label: "Started", format: formatDate },
        { key: "completed_at", label: "Completed", format: formatDate }
      ],
      "No detailed pathway history yet. Future meetings and education tracking will populate this."
    )}

    ${renderListTable(
      "Speeches",
      data.speeches || [],
      [
        { key: "speech_title", label: "Title" },
        { key: "pathway_name", label: "Pathway" },
        { key: "project_name", label: "Project" },
        { key: "level_number", label: "Level" },
        { key: "speech_date", label: "Date", format: formatDate }
      ],
      "No speech history yet. Completed meeting agendas will feed this section."
    )}

    ${renderListTable(
      "Attendance",
      data.attendance || [],
      [
        { key: "meeting_date", label: "Date", format: formatDate },
        { key: "attendance_status", label: "Status" },
        { key: "role_taken", label: "Role" },
        { key: "notes", label: "Notes" }
      ],
      "No attendance records yet. Meeting attendance will populate this automatically."
    )}

    ${renderListTable(
      "Officer Terms",
      data.officerTerms || [],
      [
        { key: "officer_role", label: "Role" },
        { key: "term_label", label: "Term" },
        { key: "term_start", label: "Start", format: formatDate },
        { key: "term_end", label: "End", format: formatDate },
        { key: "status", label: "Status" }
      ],
      "No officer history yet. Officer term assignment will populate this section."
    )}

    ${renderListTable(
      "Awards",
      data.awards || [],
      [
        { key: "award_type", label: "Type" },
        { key: "award_name", label: "Award" },
        { key: "award_date", label: "Date", format: formatDate },
        { key: "source", label: "Source" }
      ],
      "No awards recorded yet."
    )}

    ${renderListTable(
      "Goals",
      data.goals || [],
      [
        { key: "goal_type", label: "Type" },
        { key: "goal_title", label: "Goal" },
        { key: "target_date", label: "Target", format: formatDate },
        { key: "status", label: "Status" }
      ],
      "No member goals recorded yet."
    )}

    ${emptyState(
      "Mentoring",
      "Mentor and mentee relationships will be connected here after the mentoring module is added."
    )}
  `;
}

export function renderMemberDetails(memberId) {
  currentMemberId = memberId;

  return `
    <section id="member360Content" class="content">
      <section class="hero">
        <p class="eyebrow">Member 360</p>
        <h3>Loading Member...</h3>
        <p>Fetching member profile and activity history.</p>
      </section>
    </section>
  `;
}

export async function initMemberDetails() {
  const container = document.getElementById("member360Content");

  if (!currentMemberId) {
    container.innerHTML = `
      <section class="module-panel">
        <div class="enterprise-form">
          No member selected. Please go back to Members and select a member.
        </div>
      </section>
    `;
    return;
  }

  try {
    const response = await apiRequest(`/api/members/${currentMemberId}`);
    member360Data = response.data;

    container.innerHTML = renderMember360(member360Data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    container.innerHTML = `
      <section class="module-panel">
        <div class="enterprise-form">
          Failed to load member: ${escapeHtml(error.message)}
        </div>
      </section>
    `;
  }
}
async function runClubMigrations(env, databaseId) {
  const applied = [];

  for (const migration of CLUB_MIGRATIONS) {
    for (const statement of migration.sql) {
      await runCloudflareD1Query(env, databaseId, statement);
    }
    applied.push(migration.version);
  }

  return applied;
}

async function provisionClubDatabase(env, databaseName) {
  const d1Database = await createCloudflareD1Database(env, databaseName);
  const migrationsApplied = await runClubMigrations(env, d1Database.id);

  return {
    ...d1Database,
    migrationsApplied
  };
}

function getBearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

async function createSession(env, userId) {
  const rawToken = crypto.randomUUID() + "." + crypto.randomUUID();
  const tokenHash = await sha256(rawToken);

  await env.DB.prepare(`
    INSERT INTO user_sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id("session"), userId, tokenHash, addDays(SESSION_DAYS), now()).run();

  return rawToken;
}

async function getCurrentUser(request, env) {
  const token = getBearerToken(request);
  if (!token) return null;

  const tokenHash = await sha256(token);

  const session = await env.DB.prepare(`
    SELECT user_id, expires_at FROM user_sessions WHERE token_hash = ?
  `).bind(tokenHash).first();

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  return env.DB.prepare(`
    SELECT id, email, first_name, last_name, role, club_id, status, created_at
    FROM users
    WHERE id = ? AND status = 'ACTIVE'
  `).bind(session.user_id).first();
}

async function requireAuth(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) return { ok: false, response: json({ success: false, error: "Unauthorized" }, 401) };
  return { ok: true, user };
}

async function requireSuperAdmin(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth;

  if (auth.user.role !== "SUPER_ADMIN") {
    return { ok: false, response: json({ success: false, error: "Forbidden" }, 403) };
  }

  return auth;
}

async function setupPassword(request, env) {
  const body = await request.json();

  if (!env.SETUP_SECRET || body.setupSecret !== env.SETUP_SECRET) {
    return json({ success: false, error: "Invalid setup secret" }, 403);
  }

  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return json({ success: false, error: "Email and password are required" }, 400);
  }

  const user = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
  if (!user) return json({ success: false, error: "User not found" }, 404);

  const salt = crypto.randomUUID();
  const hash = await passwordHash(password, salt);

  await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`)
    .bind(`${salt}:${hash}`, email)
    .run();

  await writeAudit(env, {
    userId: user.id,
    action: "SET_PASSWORD",
    entityType: "user",
    entityId: user.id,
    details: { email }
  });

  return json({ success: true, data: { email, message: "Password set successfully" } });
}

async function login(request, env) {
  const body = await request.json();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  const user = await env.DB.prepare(`
    SELECT id, email, password_hash, first_name, last_name, role, club_id, status
    FROM users
    WHERE email = ? AND status = 'ACTIVE'
  `).bind(email).first();

  if (!user || !user.password_hash || user.password_hash === "TEMP_RESET_REQUIRED") {
    return json({ success: false, error: "Invalid email or password" }, 401);
  }

  const [salt, savedHash] = user.password_hash.split(":");
  const attemptedHash = await passwordHash(password, salt);

  if (attemptedHash !== savedHash) {
    return json({ success: false, error: "Invalid email or password" }, 401);
  }

  const token = await createSession(env, user.id);

  await env.DB.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`)
    .bind(now(), user.id)
    .run();

  await writeAudit(env, {
    userId: user.id,
    action: "LOGIN",
    entityType: "user",
    entityId: user.id,
    details: { email }
  });

  return json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        clubId: user.club_id
      }
    }
  });
}

async function logout(request, env) {
  const token = getBearerToken(request);
  if (!token) return json({ success: true });

  const tokenHash = await sha256(token);
  await env.DB.prepare(`DELETE FROM user_sessions WHERE token_hash = ?`).bind(tokenHash).run();

  return json({ success: true });
}

async function me(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) return json({ success: false, error: "Unauthorized" }, 401);

  return json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      clubId: user.club_id
    }
  });
}

async function getClubContext(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const club = await env.DB.prepare(`
    SELECT id, name, slug, database_name, status, city, country,
           charter_number, timezone, meeting_day, meeting_time,
           website, district, division, area, created_at
    FROM clubs
    WHERE id = ?
  `).bind(auth.user.club_id).first();

  if (!club) return json({ success: false, error: "Club not found" }, 404);

  return json({
    success: true,
    data: {
      user: {
        id: auth.user.id,
        email: auth.user.email,
        firstName: auth.user.first_name,
        lastName: auth.user.last_name,
        role: auth.user.role,
        clubId: auth.user.club_id
      },
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
        databaseName: club.database_name,
        status: club.status,
        city: club.city,
        country: club.country,
        charterNumber: club.charter_number,
        timezone: club.timezone || "Asia/Kolkata",
        meetingDay: club.meeting_day,
        meetingTime: club.meeting_time,
        website: club.website,
        district: club.district,
        division: club.division,
        area: club.area,
        createdAt: club.created_at
      }
    }
  });
}

async function generateUniqueDatabaseName(db, baseSlug) {
  const base = `tmos-${baseSlug}`;
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await db.prepare(`SELECT id FROM clubs WHERE database_name = ?`).bind(candidate).first();
    if (!existing) return candidate;
    candidate = `${base}${counter}`;
    counter++;
  }
}

async function createClub(request, env) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  const name = String(body.clubName || "").trim();
  const slug = cleanSlug(body.clubCode || body.clubName);
  const adminName = String(body.adminName || "").trim();
  const adminEmail = String(body.adminEmail || "").toLowerCase().trim();

  if (!name) return json({ success: false, error: "Club name is required" }, 400);
  if (!slug) return json({ success: false, error: "Club short code is required" }, 400);

  const existingSlug = await env.DB.prepare(`SELECT id FROM clubs WHERE slug = ?`).bind(slug).first();
  if (existingSlug) return json({ success: false, error: "Club short code already exists" }, 409);

  if (adminEmail) {
    const existingAdmin = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(adminEmail).first();
    if (existingAdmin) return json({ success: false, error: "Club admin email already exists" }, 409);
  }

  const clubId = id("club");
  const clubDbId = id("clubdb");
  const jobId = id("prov");
  const databaseName = await generateUniqueDatabaseName(env.DB, slug);
  const createdAt = now();

  let d1Database;

  try {
    d1Database = await provisionClubDatabase(env, databaseName);
  } catch (error) {
    await writeAudit(env, {
      userId: auth.user.id,
      action: "CLUB_PROVISIONING_FAILED",
      entityType: "club",
      entityId: clubId,
      details: { name, slug, databaseName, error: error.message }
    });

    return json({ success: false, error: `Club provisioning failed: ${error.message}` }, 500);
  }

  let adminUserId = null;
  let temporaryPassword = null;
  let firstName = null;
  let lastName = null;

  const statements = [
    env.DB.prepare(`
      INSERT INTO clubs (id, name, slug, database_name, status, city, country, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(clubId, name, slug, databaseName, "ACTIVE", body.city || null, body.country || null, createdAt, auth.user.id),

    env.DB.prepare(`
      INSERT INTO club_databases (id, club_id, database_name, database_identifier, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(clubDbId, clubId, databaseName, d1Database.id, "ACTIVE", createdAt),

    env.DB.prepare(`
      INSERT INTO provisioning_jobs (
        id, club_id, database_name, status, current_step,
        started_at, completed_at, error_message, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      jobId,
      clubId,
      databaseName,
      "COMPLETED",
      "MIGRATIONS_APPLIED",
      createdAt,
      createdAt,
      null,
      auth.user.id,
      createdAt
    )
  ];

  if (adminEmail) {
    adminUserId = id("user");
    temporaryPassword = generateTempPassword();

    const salt = crypto.randomUUID();
    const hash = await passwordHash(temporaryPassword, salt);

    const parts = adminName.split(" ").filter(Boolean);
    firstName = parts[0] || "Club";
    lastName = parts.slice(1).join(" ") || "Admin";

    statements.push(
      env.DB.prepare(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, role,
          club_id, status, created_at, phone, invited_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        adminUserId,
        adminEmail,
        `${salt}:${hash}`,
        firstName,
        lastName,
        "CLUB_ADMIN",
        clubId,
        "ACTIVE",
        createdAt,
        null,
        createdAt,
        auth.user.id
      )
    );
  }

  await env.DB.batch(statements);

  await writeAudit(env, {
    userId: auth.user.id,
    action: "CREATE_CLUB_WITH_D1_AND_SCHEMA",
    entityType: "club",
    entityId: clubId,
    details: {
      name,
      slug,
      databaseName,
      databaseIdentifier: d1Database.id,
      migrations: d1Database.migrationsApplied,
      provisioningJobId: jobId,
      status: "ACTIVE",
      adminEmail: adminEmail || null
    }
  });

  if (adminEmail) {
    await writeAudit(env, {
      userId: auth.user.id,
      action: "CREATE_CLUB_ADMIN",
      entityType: "user",
      entityId: adminUserId,
      details: { email: adminEmail, role: "CLUB_ADMIN", clubId }
    });
  }

  return json({
    success: true,
    data: {
      id: clubId,
      name,
      slug,
      databaseName,
      databaseIdentifier: d1Database.id,
      status: "ACTIVE",
      provisioningJobId: jobId,
      migrationsApplied: d1Database.migrationsApplied,
      city: body.city || null,
      country: body.country || null,
      createdAt,
      clubAdmin: adminEmail
        ? { id: adminUserId, email: adminEmail, firstName, lastName, role: "CLUB_ADMIN", temporaryPassword }
        : null
    }
  }, 201);
}

async function migrateExistingClub(request, env, clubId) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const club = await env.DB.prepare(`
    SELECT c.id, c.name, c.slug, c.database_name, cd.database_identifier
    FROM clubs c
    LEFT JOIN club_databases cd ON cd.club_id = c.id
    WHERE c.id = ?
  `).bind(clubId).first();

  if (!club) {
    return json({ success: false, error: "Club not found" }, 404);
  }

  if (!club.database_identifier) {
    return json({
      success: false,
      error: "Club has no database_identifier. Create or attach the D1 database first."
    }, 400);
  }

  const applied = await runClubMigrations(env, club.database_identifier);

  await env.DB.prepare(`
    UPDATE provisioning_jobs
    SET status = ?, current_step = ?, completed_at = ?, error_message = NULL
    WHERE club_id = ?
  `).bind("COMPLETED", "MIGRATIONS_APPLIED", now(), clubId).run();

  await env.DB.prepare(`
    UPDATE clubs SET status = 'ACTIVE' WHERE id = ?
  `).bind(clubId).run();

  await env.DB.prepare(`
    UPDATE club_databases SET status = 'ACTIVE' WHERE club_id = ?
  `).bind(clubId).run();

  await writeAudit(env, {
    userId: auth.user.id,
    action: "MIGRATE_EXISTING_CLUB_DATABASE",
    entityType: "club",
    entityId: clubId,
    details: {
      clubName: club.name,
      databaseName: club.database_name,
      databaseIdentifier: club.database_identifier,
      migrationsApplied: applied
    }
  });

  return json({
    success: true,
    data: {
      clubId,
      clubName: club.name,
      databaseName: club.database_name,
      databaseIdentifier: club.database_identifier,
      migrationsApplied: applied
    }
  });
}

async function listClubs(env) {
  const result = await env.DB.prepare(`
    SELECT id, name, slug, database_name, status, city, country, created_at
    FROM clubs
    ORDER BY created_at DESC
  `).all();

  return json({ success: true, data: result.results || [] });
}

async function listProvisioningJobs(request, env) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const result = await env.DB.prepare(`
    SELECT
      p.id, p.club_id, c.name AS club_name, p.database_name,
      p.status, p.current_step, p.started_at, p.completed_at,
      p.error_message, p.created_by, p.created_at
    FROM provisioning_jobs p
    LEFT JOIN clubs c ON c.id = p.club_id
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all();

  return json({ success: true, data: result.results || [] });
}

async function getPlatformStats(env) {
  const totalClubs = await env.DB.prepare(`SELECT COUNT(*) AS count FROM clubs`).first();
  const activeClubs = await env.DB.prepare(`SELECT COUNT(*) AS count FROM clubs WHERE status = 'ACTIVE'`).first();
  const provisioningClubs = await env.DB.prepare(`SELECT COUNT(*) AS count FROM clubs WHERE status = 'PROVISIONING'`).first();
  const users = await env.DB.prepare(`SELECT COUNT(*) AS count FROM users`).first();
  const auditEvents = await env.DB.prepare(`SELECT COUNT(*) AS count FROM audit_logs`).first();

  const pendingProvisioningJobs = await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM provisioning_jobs WHERE status IN ('PENDING', 'RUNNING')
  `).first();

  const latestClubs = await env.DB.prepare(`
    SELECT id, name, slug, database_name, status, city, country, created_at
    FROM clubs
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  return json({
    success: true,
    data: {
      totalClubs: totalClubs?.count || 0,
      activeClubs: activeClubs?.count || 0,
      provisioningClubs: provisioningClubs?.count || 0,
      pendingProvisioningJobs: pendingProvisioningJobs?.count || 0,
      users: users?.count || 0,
      auditEvents: auditEvents?.count || 0,
      latestClubs: latestClubs.results || []
    }
  });
}

async function listAuditLogs(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 25), 1), 100);

  const result = await env.DB.prepare(`
    SELECT id, user_id, action, entity_type, entity_id, details, created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(limit).all();

  return json({ success: true, data: result.results || [] });
}

async function listRoles() {
  return json({
    success: true,
    data: [
      { code: "SUPER_ADMIN", name: "Super Administrator", scope: "PLATFORM" },
      { code: "PLATFORM_ADMIN", name: "Platform Administrator", scope: "PLATFORM" },
      { code: "SUPPORT_ADMIN", name: "Support Administrator", scope: "PLATFORM" },
      { code: "CLUB_ADMIN", name: "Club Administrator", scope: "CLUB" },
      { code: "PRESIDENT", name: "President", scope: "CLUB" },
      { code: "VPE", name: "Vice President Education", scope: "CLUB" },
      { code: "VPM", name: "Vice President Membership", scope: "CLUB" },
      { code: "VPPR", name: "Vice President Public Relations", scope: "CLUB" },
      { code: "SECRETARY", name: "Secretary", scope: "CLUB" },
      { code: "TREASURER", name: "Treasurer", scope: "CLUB" },
      { code: "SAA", name: "Sergeant at Arms", scope: "CLUB" },
      { code: "MEMBER", name: "Member", scope: "CLUB" }
    ]
  });
}

async function listUsers(request, env) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const result = await env.DB.prepare(`
    SELECT
      u.id, u.email, u.first_name, u.last_name, u.phone, u.role,
      u.club_id, c.name AS club_name, u.status, u.last_login_at,
      u.invited_at, u.created_at
    FROM users u
    LEFT JOIN clubs c ON c.id = u.club_id
    ORDER BY u.created_at DESC
  `).all();

  return json({ success: true, data: result.results || [] });
}

async function createUser(request, env) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  const email = String(body.email || "").toLowerCase().trim();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phone = String(body.phone || "").trim();
  const role = String(body.role || "").trim();
  const clubId = body.clubId || null;
  const password = String(body.password || "TempPass12345");

  if (!email) return json({ success: false, error: "Email is required" }, 400);
  if (!role) return json({ success: false, error: "Role is required" }, 400);

  const existing = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
  if (existing) return json({ success: false, error: "User already exists" }, 409);

  const userId = id("user");
  const salt = crypto.randomUUID();
  const hash = await passwordHash(password, salt);
  const createdAt = now();

  await env.DB.prepare(`
    INSERT INTO users (
      id, email, password_hash, first_name, last_name, role,
      club_id, status, created_at, phone, invited_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    userId,
    email,
    `${salt}:${hash}`,
    firstName || null,
    lastName || null,
    role,
    clubId,
    "ACTIVE",
    createdAt,
    phone || null,
    createdAt,
    auth.user.id
  ).run();

  await writeAudit(env, {
    userId: auth.user.id,
    action: "CREATE_USER",
    entityType: "user",
    entityId: userId,
    details: { email, role, clubId }
  });

  return json({
    success: true,
    data: {
      id: userId,
      email,
      firstName,
      lastName,
      phone,
      role,
      clubId,
      status: "ACTIVE",
      temporaryPassword: password,
      createdAt
    }
  }, 201);
}

async function completeProvisioning(request, env, jobId) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const completedAt = now();

  const job = await env.DB.prepare(`
    SELECT id, club_id, database_name FROM provisioning_jobs WHERE id = ?
  `).bind(jobId).first();

  if (!job) return json({ success: false, error: "Provisioning job not found" }, 404);

  await env.DB.batch([
    env.DB.prepare(`
      UPDATE provisioning_jobs SET status = ?, current_step = ?, completed_at = ?, error_message = NULL WHERE id = ?
    `).bind("COMPLETED", "COMPLETED", completedAt, jobId),
    env.DB.prepare(`UPDATE clubs SET status = ? WHERE id = ?`).bind("ACTIVE", job.club_id),
    env.DB.prepare(`UPDATE club_databases SET status = ? WHERE club_id = ?`).bind("ACTIVE", job.club_id)
  ]);

  await writeAudit(env, {
    userId: auth.user.id,
    action: "PROVISIONING_COMPLETED",
    entityType: "provisioning_job",
    entityId: jobId,
    details: { clubId: job.club_id, databaseName: job.database_name }
  });

  return json({
    success: true,
    data: { id: jobId, clubId: job.club_id, databaseName: job.database_name, status: "COMPLETED", completedAt }
  });
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (url.pathname === "/") {
    return json({ success: true, service: "TMOS Enterprise API", version: "v2", status: "online" });
  }

  if (url.pathname === "/health") {
    return json({
      success: true,
      status: "healthy",
      runtime: "Cloudflare Worker",
      database: env.DB ? "connected" : "missing",
      auth: "enabled",
      automaticD1Provisioning: "enabled",
      schemaMigrations: CLUB_MIGRATIONS.map((m) => m.version)
    });
  }

  if (url.pathname === "/api/setup/password" && request.method === "POST") return setupPassword(request, env);
  if (url.pathname === "/api/auth/login" && request.method === "POST") return login(request, env);
  if (url.pathname === "/api/auth/logout" && request.method === "POST") return logout(request, env);
  if (url.pathname === "/api/auth/me" && request.method === "GET") return me(request, env);

  if (url.pathname === "/api/club/context" && request.method === "GET") return getClubContext(request, env);
  if (url.pathname === "/api/members" && request.method === "GET") {  return listMembers(request, env);}
  if (url.pathname === "/api/members" && request.method === "POST") { return createMember(request, env);}
  const memberDetailsMatch = url.pathname.match(/^\/api\/members\/([^/]+)$/);
if (memberDetailsMatch && request.method === "GET") {
  return getMemberDetails(request, env, memberDetailsMatch[1]);
}
  const updateMemberMatch = url.pathname.match(/^\/api\/members\/([^/]+)$/);
if (updateMemberMatch && request.method === "PUT") {
  return updateMember(request, env, updateMemberMatch[1]);
}
  if (url.pathname === "/api/platform/stats" && request.method === "GET") return getPlatformStats(env);
  if (url.pathname === "/api/platform/clubs" && request.method === "GET") return listClubs(env);
  if (url.pathname === "/api/platform/clubs" && request.method === "POST") return createClub(request, env);
  if (url.pathname === "/api/platform/provisioning" && request.method === "GET") return listProvisioningJobs(request, env);
  if (url.pathname === "/api/platform/audit" && request.method === "GET") return listAuditLogs(request, env);
  if (url.pathname === "/api/platform/roles" && request.method === "GET") return listRoles();
  if (url.pathname === "/api/platform/users" && request.method === "GET") return listUsers(request, env);
  if (url.pathname === "/api/platform/users" && request.method === "POST") return createUser(request, env);

  const migrateMatch = url.pathname.match(/^\/api\/platform\/clubs\/([^/]+)\/migrate$/);
  if (migrateMatch && request.method === "POST") {
    return migrateExistingClub(request, env, migrateMatch[1]);
  }

  const completeMatch = url.pathname.match(/^\/api\/platform\/provisioning\/([^/]+)\/complete$/);
  if (completeMatch && request.method === "POST") {
    return completeProvisioning(request, env, completeMatch[1]);
  }

  return json({ success: false, error: "Route not found" }, 404);
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      try {
        await writeAudit(env, {
          action: "API_ERROR",
          entityType: "system",
          details: { message: error.message || "Internal server error" }
        });
      } catch (_) {}

      return json({ success: false, error: error.message || "Internal server error" }, 500);
    }
  }
};
