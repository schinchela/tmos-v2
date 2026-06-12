const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

const SESSION_DAYS = 7;

const FRONTEND_URL = "https://tmos.rowepal.com";

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
  },
  {
  version: "009_meetings",
  sql: [
    `CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      meeting_title TEXT NOT NULL,
      meeting_type TEXT NOT NULL DEFAULT 'REGULAR',
      meeting_theme TEXT,
      meeting_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      venue TEXT,
      online_link TEXT,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date)`,
    `CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('009_meetings', datetime('now'))`
  ]
},
{
  version: "010_meeting_participants",
  sql: [
    `CREATE TABLE IF NOT EXISTS meeting_participants (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      participant_type TEXT NOT NULL,
      participant_id TEXT,
      display_name TEXT NOT NULL,
      email TEXT,
      attendance_status TEXT NOT NULL DEFAULT 'PRESENT',
      present_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_participants_type ON meeting_participants(participant_type)`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_participants_attendance ON meeting_participants(attendance_status)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('010_meeting_participants', datetime('now'))`
  ]
},
{
  version: "011_meeting_role_assignments",
  sql: [
    `CREATE TABLE IF NOT EXISTS meeting_role_assignments (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      participant_ref_id TEXT,
      role_code TEXT NOT NULL,
      role_name TEXT NOT NULL,
      assignment_status TEXT NOT NULL DEFAULT 'PLANNED',
      sequence_order INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_roles_meeting ON meeting_role_assignments(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_roles_participant ON meeting_role_assignments(participant_ref_id)`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_roles_role ON meeting_role_assignments(role_code)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('011_meeting_role_assignments', datetime('now'))`
  ]
},
{
  version: "012_meeting_speeches",
  sql: [
    `CREATE TABLE IF NOT EXISTS meeting_speeches (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      speaker_participant_id TEXT,
      evaluator_participant_id TEXT,
      speech_title TEXT,
      speech_type TEXT,
      pathway_name TEXT,
      project_name TEXT,
      level_number INTEGER,
      planned_duration_min INTEGER,
      actual_duration_seconds INTEGER,
      speech_status TEXT NOT NULL DEFAULT 'PLANNED',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_speeches_meeting ON meeting_speeches(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_speeches_speaker ON meeting_speeches(speaker_participant_id)`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_speeches_evaluator ON meeting_speeches(evaluator_participant_id)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('012_meeting_speeches', datetime('now'))`
  ]
},
{
  version: "013_meeting_evaluations",
  sql: [
    `CREATE TABLE IF NOT EXISTS meeting_evaluations (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      speaker_participant_id TEXT,
      evaluator_participant_id TEXT,
      speech_id TEXT,
      evaluation_type TEXT DEFAULT 'SPEECH',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_evaluations_meeting ON meeting_evaluations(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_evaluations_speaker ON meeting_evaluations(speaker_participant_id)`,
    `CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator ON meeting_evaluations(evaluator_participant_id)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('013_meeting_evaluations', datetime('now'))`
  ]
},
{
  version: "014_meeting_table_topics",
  sql: [
    `CREATE TABLE IF NOT EXISTS meeting_table_topics (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      participant_ref_id TEXT,
      question TEXT,
      response_time_seconds INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_table_topics_meeting ON meeting_table_topics(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_table_topics_participant ON meeting_table_topics(participant_ref_id)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('014_meeting_table_topics', datetime('now'))`
  ]
},
{
  version: "015_meeting_awards",
  sql: [
    `CREATE TABLE IF NOT EXISTS meeting_awards (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      participant_ref_id TEXT,
      award_type TEXT NOT NULL,
      award_name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_awards_meeting ON meeting_awards(meeting_id)`,
    `CREATE INDEX IF NOT EXISTS idx_meeting_awards_participant ON meeting_awards(participant_ref_id)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('015_meeting_awards', datetime('now'))`
  ]
},
  {
  version: "016_planned_agenda_roles",
  sql: [
    `CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`,
    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('016_planned_agenda_roles', datetime('now'))`
  ]
},
  {
  version: "017_club_configuration",
  sql: [
    `CREATE TABLE IF NOT EXISTS club_configuration (
      id TEXT PRIMARY KEY,
      config_group TEXT NOT NULL,
      config_type TEXT NOT NULL,
      config_key TEXT NOT NULL,
      config_name TEXT NOT NULL,
      config_value_json TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,

    `CREATE INDEX IF NOT EXISTS idx_club_configuration_group
     ON club_configuration(config_group)`,

    `CREATE INDEX IF NOT EXISTS idx_club_configuration_type
     ON club_configuration(config_type)`,

    `CREATE INDEX IF NOT EXISTS idx_club_configuration_active
     ON club_configuration(is_active)`,

    `INSERT OR IGNORE INTO club_configuration (
      id, config_group, config_type, config_key, config_name,
      config_value_json, is_active, sort_order, created_at, updated_at
    ) VALUES
      ('cfg_role_toastmaster', 'MEETINGS', 'MEETING_ROLE', 'TOASTMASTER', 'Toastmaster', '{}', 1, 10, datetime('now'), datetime('now')),
      ('cfg_role_ge', 'MEETINGS', 'MEETING_ROLE', 'GENERAL_EVALUATOR', 'General Evaluator', '{}', 1, 20, datetime('now'), datetime('now')),
      ('cfg_role_timer', 'MEETINGS', 'MEETING_ROLE', 'TIMER', 'Timer', '{}', 1, 30, datetime('now'), datetime('now')),
      ('cfg_role_ah_counter', 'MEETINGS', 'MEETING_ROLE', 'AH_COUNTER', 'Ah Counter', '{}', 1, 40, datetime('now'), datetime('now')),
      ('cfg_role_grammarian', 'MEETINGS', 'MEETING_ROLE', 'GRAMMARIAN', 'Grammarian', '{}', 1, 50, datetime('now'), datetime('now')),
      ('cfg_role_ttm', 'MEETINGS', 'MEETING_ROLE', 'TABLE_TOPICS_MASTER', 'Table Topics Master', '{}', 1, 60, datetime('now'), datetime('now')),
      ('cfg_role_quiz_master', 'MEETINGS', 'MEETING_ROLE', 'QUIZ_MASTER', 'Quiz Master', '{}', 1, 70, datetime('now'), datetime('now')),
      ('cfg_role_invocation', 'MEETINGS', 'MEETING_ROLE', 'INVOCATION', 'Invocation', '{}', 1, 80, datetime('now'), datetime('now')),
      ('cfg_role_saa', 'MEETINGS', 'MEETING_ROLE', 'SERGEANT_AT_ARMS', 'Sergeant At Arms', '{}', 1, 90, datetime('now'), datetime('now')),
      ('cfg_role_tech_master', 'MEETINGS', 'MEETING_ROLE', 'TECH_MASTER', 'Tech Master', '{}', 1, 100, datetime('now'), datetime('now'))`,

    `INSERT OR IGNORE INTO club_configuration (
      id, config_group, config_type, config_key, config_name,
      config_value_json, is_active, sort_order, created_at, updated_at
    ) VALUES
      ('cfg_award_best_speaker', 'MEETINGS', 'MEETING_AWARD', 'BEST_SPEAKER', 'Best Speaker', '{}', 1, 10, datetime('now'), datetime('now')),
      ('cfg_award_best_evaluator', 'MEETINGS', 'MEETING_AWARD', 'BEST_EVALUATOR', 'Best Evaluator', '{}', 1, 20, datetime('now'), datetime('now')),
      ('cfg_award_best_table_topics', 'MEETINGS', 'MEETING_AWARD', 'BEST_TABLE_TOPICS', 'Best Table Topics', '{}', 1, 30, datetime('now'), datetime('now'))`,

    `INSERT OR IGNORE INTO club_configuration (
      id, config_group, config_type, config_key, config_name,
      config_value_json, is_active, sort_order, created_at, updated_at
    ) VALUES
      ('cfg_meeting_type_regular', 'MEETINGS', 'MEETING_TYPE', 'REGULAR', 'Regular Club Meeting', '{}', 1, 10, datetime('now'), datetime('now')),
      ('cfg_meeting_type_joint', 'MEETINGS', 'MEETING_TYPE', 'JOINT', 'Joint Meeting', '{}', 1, 20, datetime('now'), datetime('now')),
      ('cfg_meeting_type_contest', 'MEETINGS', 'MEETING_TYPE', 'CONTEST', 'Contest', '{}', 1, 30, datetime('now'), datetime('now')),
      ('cfg_meeting_type_workshop', 'MEETINGS', 'MEETING_TYPE', 'WORKSHOP', 'Workshop', '{}', 1, 40, datetime('now'), datetime('now')),
      ('cfg_meeting_type_officer', 'MEETINGS', 'MEETING_TYPE', 'OFFICER', 'Officer Meeting', '{}', 1, 50, datetime('now'), datetime('now')),
      ('cfg_meeting_type_special', 'MEETINGS', 'MEETING_TYPE', 'SPECIAL', 'Special Session', '{}', 1, 60, datetime('now'), datetime('now'))`,

    `INSERT OR IGNORE INTO schema_migrations (version, applied_at)
     VALUES ('017_club_configuration', datetime('now'))`
  ]
}
];

async function getTableColumns(env, databaseId, tableName) {
  const result = await runCloudflareD1Query(
    env,
    databaseId,
    `PRAGMA table_info(${tableName})`
  );

  return (
    result?.[0]?.results ||
    result?.results ||
    []
  );
}

async function ensureColumn(
  env,
  databaseId,
  tableName,
  columnName,
  columnDefinition
) {
  const columns = await getTableColumns(
    env,
    databaseId,
    tableName
  );

  const exists = columns.some(
    (column) => column.name === columnName
  );

  if (exists) {
    return false;
  }

  await runCloudflareD1Batch(
    env,
    databaseId,
    [
      `ALTER TABLE ${tableName}
       ADD COLUMN ${columnName}
       ${columnDefinition}`
    ]
  );

  return true;
}
async function ensureIndex(
  env,
  databaseId,
  indexName,
  tableName,
  columns
) {
  await runCloudflareD1Batch(
    env,
    databaseId,
    [
      `
      CREATE INDEX IF NOT EXISTS
      ${indexName}
      ON ${tableName}
      (${columns})
      `
    ]
  );
}

async function ensureTable(
  env,
  databaseId,
  createSql
) {
  await runCloudflareD1Batch(
    env,
    databaseId,
    [createSql]
  );
}
async function applyMigration018(
  env,
  databaseId
) {
  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_speaker_type",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_speaker_id",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_speaker_name",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_speaker_email",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_evaluator_type",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_evaluator_id",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_evaluator_name",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_speeches",
    "planned_evaluator_email",
    "TEXT"
  );
}

async function applyMigration019(
  env,
  databaseId
) {
  await ensureColumn(
    env,
    databaseId,
    "members",
    "recognition_suffix",
    "TEXT"
  );
}
async function applyMigration020(env, databaseId) {
  await ensureColumn(
    env,
    databaseId,
    "meeting_table_topics",
    "participant_type",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_table_topics",
    "participant_id",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_table_topics",
    "participant_name",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_table_topics",
    "participant_email",
    "TEXT"
  );
}

async function applyMigration021(env, databaseId) {
  await ensureTable(
    env,
    databaseId,
    `
      CREATE TABLE IF NOT EXISTS meeting_award_candidates (
        id TEXT PRIMARY KEY,

        meeting_id TEXT NOT NULL,

        award_config_id TEXT NOT NULL,
        award_key TEXT NOT NULL,
        award_name TEXT NOT NULL,

        participant_type TEXT,
        participant_id TEXT,

        participant_name TEXT,
        participant_email TEXT,

        source_type TEXT,
        source_record_id TEXT,

        is_excluded INTEGER DEFAULT 0,

        created_at TEXT,
        updated_at TEXT
      )
    `
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_award_candidates_meeting",
    "meeting_award_candidates",
    "meeting_id"
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_award_candidates_award",
    "meeting_award_candidates",
    "award_key"
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_award_candidates_source",
    "meeting_award_candidates",
    "source_type, source_record_id"
  );
}

async function applyMigration022(env, databaseId) {
  await ensureColumn(
    env,
    databaseId,
    "meeting_role_assignments",
    "planned_participant_type",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_role_assignments",
    "planned_participant_id",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_role_assignments",
    "planned_display_name",
    "TEXT"
  );

  await ensureColumn(
    env,
    databaseId,
    "meeting_role_assignments",
    "planned_email",
    "TEXT"
  );
}

async function applyMigration023(env, databaseId) {
  await ensureTable(
    env,
    databaseId,
    `
      CREATE TABLE IF NOT EXISTS meeting_vote_sessions (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        public_token TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        opened_at TEXT,
        closed_at TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_vote_sessions_meeting",
    "meeting_vote_sessions",
    "meeting_id"
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_vote_sessions_token",
    "meeting_vote_sessions",
    "public_token"
  );

  await ensureTable(
    env,
    databaseId,
    `
      CREATE TABLE IF NOT EXISTS meeting_votes (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        vote_session_id TEXT NOT NULL,

        award_key TEXT NOT NULL,
        award_name TEXT NOT NULL,

        candidate_id TEXT NOT NULL,
        candidate_name TEXT NOT NULL,

        voter_name TEXT,
        voter_email TEXT,

        created_at TEXT
      )
    `
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_meeting_votes_session",
    "meeting_votes",
    "vote_session_id"
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_meeting_votes_award",
    "meeting_votes",
    "meeting_id, award_key"
  );
}



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
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function addDays(days) {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
  return cloudflareRequest(
    env,
    `/accounts/${env.CF_ACCOUNT_ID}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      body: { sql }
    }
  );
}

async function runCloudflareD1Batch(env, databaseId, statements) {
  const sql = statements
    .map((statement) => statement.trim().replace(/;+\s*$/g, ""))
    .filter(Boolean)
    .join(";\n");

  return runCloudflareD1Query(env, databaseId, sql);
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
        recognition_suffix,
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
        recognition_suffix,
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

async function updateMember(request, env, memberId) {
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

  const updatedAt = now();
  const displayName = `${firstName} ${lastName}`.trim();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE members
      SET
        member_number = ${sqlValue(body.memberNumber)},
        toastmasters_id = ${sqlValue(body.toastmastersId)},
        first_name = ${sqlValue(firstName)},
        last_name = ${sqlValue(lastName)},
        display_name = ${sqlValue(displayName)},
        email = ${sqlValue(body.email)},
        phone = ${sqlValue(body.phone)},
        membership_type = ${sqlValue(body.membershipType)},
        membership_status = ${sqlValue(body.membershipStatus)},
        join_date = ${sqlValue(body.joinDate)},
        renewal_date = ${sqlValue(body.renewalDate)},
        pathway_name = ${sqlValue(body.pathwayName)},
        pathway_level = ${Number(body.pathwayLevel || 0)},
        active_officer_role = ${sqlValue(body.activeOfficerRole)},
        notes = ${sqlValue(body.notes)},
        updated_at = ${sqlValue(updatedAt)}
      WHERE id = ${sqlValue(memberId)}
    `
  );

  return json({
    success: true,
    data: {
      id: memberId,
      updatedAt
    }
  });
}

async function listMemberPathways(request, env, memberId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM member_pathways
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY
        CASE status
          WHEN 'ACTIVE' THEN 1
          WHEN 'COMPLETED' THEN 2
          ELSE 3
        END,
        created_at DESC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function createMemberPathway(request, env, memberId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const body = await request.json();

  const pathwayName = String(body.pathwayName || "").trim();

  if (!pathwayName) {
    return json({ success: false, error: "Pathway name is required" }, 400);
  }

  const pathwayId = id("pathway");
  const timestamp = now();
  const existing = await executeClubQuery(
  env,
  auth.user.club_id,
  `
    SELECT id
    FROM member_pathways
    WHERE member_id = ${sqlValue(memberId)}
      AND pathway_name = ${sqlValue(pathwayName)}
      AND status = 'ACTIVE'
  `
);

const rows =
  existing?.[0]?.results ||
  existing?.results ||
  [];

if (rows.length) {
  return json(
    {
      success: false,
      error: "This pathway already exists for the member."
    },
    400
  );
}
  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO member_pathways (
        id,
        member_id,
        pathway_name,
        current_level,
        status,
        started_at,
        notes,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(pathwayId)},
        ${sqlValue(memberId)},
        ${sqlValue(pathwayName)},
        ${Number(body.currentLevel || 0)},
        ${sqlValue(body.status || "ACTIVE")},
        ${sqlValue(body.startedAt || timestamp)},
        ${sqlValue(body.notes)},
        ${sqlValue(timestamp)},
        ${sqlValue(timestamp)}
      )
    `
  );

  await syncMemberEducationSummary(env, auth.user.club_id, memberId);

  return json({
    success: true,
    data: {
      id: pathwayId
    }
  }, 201);
}

async function updateMemberPathwayLevel(request, env, memberId, pathwayId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const body = await request.json();

  const completedLevel = Math.max(
    0,
    Math.min(Number(body.completedLevel || 0), 5)
  );

  const timestamp = now();

  const levelColumn =
    completedLevel >= 1 && completedLevel <= 5
      ? `level_${completedLevel}_completed_at`
      : null;

  const isCompleted = completedLevel >= 5;

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE member_pathways
      SET
        current_level = ${completedLevel},
        ${levelColumn ? `${levelColumn} = ${sqlValue(body.completedAt || timestamp)},` : ""}
        status = ${sqlValue(isCompleted ? "COMPLETED" : "ACTIVE")},
        completed_at = ${
          isCompleted
            ? sqlValue(body.completedAt || timestamp)
            : "completed_at"
        },
        updated_at = ${sqlValue(timestamp)}
      WHERE id = ${sqlValue(pathwayId)}
        AND member_id = ${sqlValue(memberId)}
    `
  );

  await syncMemberEducationSummary(env, auth.user.club_id, memberId);

  return json({
    success: true,
    data: {
      memberId,
      pathwayId,
      completedLevel,
      status: isCompleted ? "COMPLETED" : "ACTIVE"
    }
  });
}

const PATHWAY_CODES = {
  "Dynamic Leadership": "DL",
  "Effective Coaching": "EC",
  "Engaging Humor": "EH",
  "Innovative Planning": "IP",
  "Leadership Development": "LD",
  "Motivational Strategies": "MS",
  "Persuasive Influence": "PI",
  "Presentation Mastery": "PM",
  "Strategic Relationships": "SR",
  "Team Collaboration": "TC",
  "Visionary Communication": "VC"
};

function buildRecognitionSuffix(pathways, isDtm = false) {
  if (isDtm) return "DTM";

  const suffixes = [
  ...new Set(
    pathways
      .filter((pathway) => Number(pathway.current_level || 0) > 0)
      .map((pathway) => {
        const code = PATHWAY_CODES[pathway.pathway_name] || "";
        const level = Math.min(
          Number(pathway.current_level || 0),
          5
        );

        if (!code || !level) {
          return null;
        }

        return `${code}${level}`;
      })
      .filter(Boolean)
  )
];

return suffixes.join(", ");
}


async function syncMemberEducationSummary(env, clubId, memberId) {
  const result = await executeClubQuery(
    env,
    clubId,
    `
      SELECT *
      FROM member_pathways
      WHERE member_id = ${sqlValue(memberId)}
      ORDER BY
        CASE status
          WHEN 'ACTIVE' THEN 1
          WHEN 'COMPLETED' THEN 2
          ELSE 3
        END,
        updated_at DESC
    `
  );

  const pathways =
    result?.[0]?.results ||
    result?.results ||
    [];

  const active =
    pathways.find((p) => p.status === "ACTIVE") ||
    pathways[0];

  const isDtm = false;

  const recognitionSuffix =
    buildRecognitionSuffix(pathways, isDtm);

  await executeClubStatement(
    env,
    clubId,
    `
      UPDATE members
      SET
        pathway_name = ${sqlValue(active?.pathway_name || null)},
        pathway_level = ${Number(active?.current_level || 0)},
        recognition_suffix = ${sqlValue(recognitionSuffix)},
        updated_at = ${sqlValue(now())}
      WHERE id = ${sqlValue(memberId)}
    `
  );
}


async function getClubSettings(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json(
      { success: false, error: "No club assigned to this user" },
      400
    );
  }

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT
        key,
        value,
        updated_at
      FROM club_settings
      ORDER BY key
    `
  );

  const rows =
    result?.[0]?.results ||
    result?.results ||
    [];

  const settings = {};

  rows.forEach((row) => {
    settings[row.key] = row.value;
  });

  return json({
    success: true,
    data: settings
  });
}

async function updateClubSettings(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  if (!auth.user.club_id) {
    return json(
      { success: false, error: "No club assigned to this user" },
      400
    );
  }

  const officerTermCycle = body.officerTermCycle || "YEARLY";
  const regularMeetingDay = body.regularMeetingDay || "";
  const regularMeetingTime = body.regularMeetingTime || "";
  const defaultMeetingMode = body.defaultMeetingMode || "PHYSICAL";
  const defaultVenue = body.defaultVenue || "";
  const defaultOnlineLink = body.defaultOnlineLink || "";

  const settingsToSave = [
    ["officer_term_cycle", officerTermCycle],
    ["regular_meeting_day", regularMeetingDay],
    ["regular_meeting_time", regularMeetingTime],
    ["default_meeting_mode", defaultMeetingMode],
    ["default_venue", defaultVenue],
    ["default_online_link", defaultOnlineLink]
  ];

  for (const [key, value] of settingsToSave) {
    await executeClubStatement(
      env,
      auth.user.club_id,
      `
        INSERT OR REPLACE INTO club_settings (
          key,
          value,
          updated_at
        )
        VALUES (
          ${sqlValue(key)},
          ${sqlValue(value)},
          ${sqlValue(now())}
        )
      `
    );
  }

  await writeAudit(env, {
    userId: auth.user.id,
    action: "UPDATE_CLUB_SETTINGS",
    entityType: "club_settings",
    details: {
      clubId: auth.user.club_id,
      officerTermCycle,
      regularMeetingDay,
      regularMeetingTime,
      defaultMeetingMode,
      defaultVenue,
      defaultOnlineLink
    }
  });

  return json({
    success: true,
    data: {
      officerTermCycle,
      regularMeetingDay,
      regularMeetingTime,
      defaultMeetingMode,
      defaultVenue,
      defaultOnlineLink
    }
  });
}

async function listOfficerTerms(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM officer_terms
      ORDER BY term_start DESC
    `
  );

  return json({
    success: true,
    data:
      result?.[0]?.results ||
      result?.results ||
      []
  });
}

async function createOfficerTerm(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  const termId = id("term");

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO officer_terms (
        id,
        term_label,
        term_cycle,
        term_start,
        term_end,
        status,
        created_at
      )
      VALUES (
        ${sqlValue(termId)},
        ${sqlValue(body.termLabel)},
        ${sqlValue(body.termCycle)},
        ${sqlValue(body.termStart)},
        ${sqlValue(body.termEnd)},
        'ACTIVE',
        ${sqlValue(now())}
      )
    `
  );

  await writeAudit(env, {
    userId: auth.user.id,
    action: "CREATE_OFFICER_TERM",
    entityType: "officer_term",
    entityId: termId,
    details: {
      clubId: auth.user.club_id,
      termLabel: body.termLabel
    }
  });

  return json({
    success: true,
    data: {
      id: termId
    }
  }, 201);
}

async function assignOfficerTerm(
  request,
  env,
  memberId
) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  const assignmentId = id("officer");

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO member_officer_terms (
        id,
        member_id,
        officer_role,
        term_id,
        term_label,
        term_start,
        term_end,
        status,
        notes,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(assignmentId)},
        ${sqlValue(memberId)},
        ${sqlValue(body.officerRole)},
        ${sqlValue(body.termId)},
        ${sqlValue(body.termLabel)},
        ${sqlValue(body.termStart)},
        ${sqlValue(body.termEnd)},
        'ACTIVE',
        ${sqlValue(body.notes)},
        ${sqlValue(now())},
        ${sqlValue(now())}
      )
    `
  );

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE members
      SET active_officer_role =
        ${sqlValue(body.officerRole)}
      WHERE id =
        ${sqlValue(memberId)}
    `
  );

  await writeAudit(env, {
    userId: auth.user.id,
    action: "ASSIGN_OFFICER_TERM",
    entityType: "member",
    entityId: memberId,
    details: {
      officerRole: body.officerRole,
      termLabel: body.termLabel
    }
  });

  return json({
    success: true,
    data: {
      id: assignmentId
    }
  }, 201);
}

async function endOfficerTerm(request, env, memberId, assignmentId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const completedAt = now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE member_officer_terms
      SET
        status = 'COMPLETED',
        updated_at = ${sqlValue(completedAt)}
      WHERE id = ${sqlValue(assignmentId)}
        AND member_id = ${sqlValue(memberId)}
    `
  );

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE members
      SET
        active_officer_role = NULL,
        updated_at = ${sqlValue(completedAt)}
      WHERE id = ${sqlValue(memberId)}
    `
  );

  await writeAudit(env, {
    userId: auth.user.id,
    action: "END_OFFICER_TERM",
    entityType: "member",
    entityId: memberId,
    details: {
      clubId: auth.user.club_id,
      assignmentId
    }
  });

  return json({
    success: true,
    data: {
      memberId,
      assignmentId,
      status: "COMPLETED",
      completedAt
    }
  });
}

async function archiveMember(request, env, memberId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json(
      { success: false, error: "No club assigned to this user" },
      400
    );
  }

  const body =
    request.method === "POST"
      ? await request.json()
      : {};

  const status =
    body.status === "ACTIVE"
      ? "ACTIVE"
      : "ARCHIVED";

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE members
      SET
        membership_status = ${sqlValue(status)},
        updated_at = ${sqlValue(now())}
      WHERE id = ${sqlValue(memberId)}
    `
  );

  await writeAudit(env, {
    userId: auth.user.id,
    action:
      status === "ACTIVE"
        ? "REINSTATE_MEMBER"
        : "ARCHIVE_MEMBER",
    entityType: "member",
    entityId: memberId,
    details: {
      clubId: auth.user.club_id,
      status
    }
  });

  return json({
    success: true,
    data: {
      memberId,
      status
    }
  });
}

async function listMeetings(request, env) {
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
        meeting_title,
        meeting_type,
        meeting_theme,
        meeting_date,
        start_time,
        end_time,
        venue,
        online_link,
        status,
        notes,
        created_at,
        updated_at
      FROM meetings
      ORDER BY meeting_date DESC, start_time DESC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function createMeeting(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const body = await request.json();

  const title = String(body.meetingTitle || "").trim();
  const meetingDate = String(body.meetingDate || "").trim();

  if (!title) return json({ success: false, error: "Meeting title is required" }, 400);
  if (!meetingDate) return json({ success: false, error: "Meeting date is required" }, 400);

  const meetingId = id("meeting");
  const createdAt = now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO meetings (
        id,
        meeting_title,
        meeting_type,
        meeting_theme,
        meeting_date,
        start_time,
        end_time,
        venue,
        online_link,
        status,
        notes,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(meetingId)},
        ${sqlValue(title)},
        ${sqlValue(body.meetingType || "REGULAR")},
        ${sqlValue(body.meetingTheme)},
        ${sqlValue(meetingDate)},
        ${sqlValue(body.startTime)},
        ${sqlValue(body.endTime)},
        ${sqlValue(body.venue)},
        ${sqlValue(body.onlineLink)},
        ${sqlValue(body.status || "DRAFT")},
        ${sqlValue(body.notes)},
        ${sqlValue(createdAt)},
        ${sqlValue(createdAt)}
      )
    `
  );

  await writeAudit(env, {
    userId: auth.user.id,
    action: "CREATE_MEETING",
    entityType: "meeting",
    entityId: meetingId,
    details: {
      clubId: auth.user.club_id,
      meetingTitle: title,
      meetingDate
    }
  });

  return json({
    success: true,
    data: {
      id: meetingId,
      meetingTitle: title,
      meetingDate,
      status: body.status || "DRAFT",
      createdAt
    }
  }, 201);
}

async function getMeetingDetails(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const meetingResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meetings
      WHERE id = ${sqlValue(meetingId)}
      LIMIT 1
    `
  );

  const meetingRows = meetingResult?.[0]?.results || meetingResult?.results || [];
  const meeting = meetingRows[0];

  if (!meeting) {
    return json({ success: false, error: "Meeting not found" }, 404);
  }

  const participantsResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_participants
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY display_name ASC
    `
  );

  const rolesResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_role_assignments
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY sequence_order ASC, role_name ASC
    `
  );

  const speechesResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_speeches
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY created_at ASC
    `
  );
  const tableTopicsResult = await executeClubQuery(
  env,
  auth.user.club_id,
  `
    SELECT *
    FROM meeting_table_topics
    WHERE meeting_id = ${sqlValue(meetingId)}
    ORDER BY participant_name ASC
  `
);

  return json({
    success: true,
    data: {
      meeting,
      participants: participantsResult?.[0]?.results || participantsResult?.results || [],
      roles: rolesResult?.[0]?.results || rolesResult?.results || [],
      speeches: speechesResult?.[0]?.results || speechesResult?.results || [],
      tableTopics: tableTopicsResult?.[0]?.results || tableTopicsResult?.results || []
    }
  });
}

async function updateMeeting(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const body = await request.json();

  const title = String(body.meetingTitle || "").trim();
  const meetingDate = String(body.meetingDate || "").trim();

  if (!title) return json({ success: false, error: "Meeting title is required" }, 400);
  if (!meetingDate) return json({ success: false, error: "Meeting date is required" }, 400);

  const updatedAt = now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE meetings
      SET
        meeting_title = ${sqlValue(title)},
        meeting_type = ${sqlValue(body.meetingType || "REGULAR")},
        meeting_theme = ${sqlValue(body.meetingTheme)},
        meeting_date = ${sqlValue(meetingDate)},
        start_time = ${sqlValue(body.startTime)},
        end_time = ${sqlValue(body.endTime)},
        venue = ${sqlValue(body.venue)},
        online_link = ${sqlValue(body.onlineLink)},
        status = ${sqlValue(body.status || "DRAFT")},
        notes = ${sqlValue(body.notes)},
        updated_at = ${sqlValue(updatedAt)}
      WHERE id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true,
    data: {
      id: meetingId,
      updatedAt
    }
  });
}

async function listMeetingParticipants(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_participants
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY display_name ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function addMeetingParticipant(request, env, meetingId) {
  const auth = await requireAuth(request, env);

  const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  const body = await request.json();

  const displayName = String(body.displayName || "").trim();
  const participantType = String(body.participantType || "VISITOR").trim();

  if (!displayName) {
    return json({ success: false, error: "Display name is required" }, 400);
  }

  const participantId = id("participant");
  const createdAt = now();
if (body.participantId) {
  const existingResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT id
      FROM meeting_participants
      WHERE meeting_id = ${sqlValue(meetingId)}
        AND participant_type = ${sqlValue(participantType)}
        AND participant_id = ${sqlValue(body.participantId)}
      LIMIT 1
    `
  );

  const existingRows =
    existingResult?.[0]?.results ||
    existingResult?.results ||
    [];

  if (existingRows.length) {
    return json({
      success: false,
      error: "This person is already marked present for this meeting"
    }, 409);
  }
}
  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO meeting_participants (
        id,
        meeting_id,
        participant_type,
        participant_id,
        display_name,
        email,
        attendance_status,
        present_at,
        notes,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(participantId)},
        ${sqlValue(meetingId)},
        ${sqlValue(participantType)},
        ${sqlValue(body.participantId)},
        ${sqlValue(displayName)},
        ${sqlValue(body.email)},
        ${sqlValue(body.attendanceStatus || "PRESENT")},
        ${sqlValue(now())},
        ${sqlValue(body.notes)},
        ${sqlValue(createdAt)},
        ${sqlValue(createdAt)}
      )
    `
  );

  return json({
    success: true,
    data: {
      id: participantId,
      meetingId,
      participantType,
      displayName
    }
  }, 201);
}

async function listMeetingAttendanceSources(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const membersResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT
        id,
        display_name,
        email,
        phone,
        pathway_name,
        pathway_level
      FROM members
      WHERE membership_status != 'ARCHIVED'
      ORDER BY display_name ASC
    `
  );

  let guests = [];

  try {
    const guestsResult = await executeClubQuery(
      env,
      auth.user.club_id,
      `
        SELECT
          id,
          display_name,
          email,
          phone
        FROM guests
        ORDER BY display_name ASC
      `
    );

    guests = guestsResult?.[0]?.results || guestsResult?.results || [];
  } catch (_) {
    guests = [];
  }

  return json({
    success: true,
    data: {
      members: membersResult?.[0]?.results || membersResult?.results || [],
      guests
    }
  });
}

async function listConfiguration(request, env, configType) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM club_configuration
      WHERE config_type = ${sqlValue(configType)}
      ORDER BY sort_order ASC, config_name ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function createConfiguration(request, env, configType) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  const configId = id("cfg");
  const timestamp = now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO club_configuration (
        id,
        config_group,
        config_type,
        config_key,
        config_name,
        config_value_json,
        is_active,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(configId)},
        ${sqlValue(body.configGroup || "MEETINGS")},
        ${sqlValue(configType)},
        ${sqlValue(body.configKey)},
        ${sqlValue(body.configName)},
        ${sqlValue(JSON.stringify(body.configValue || {}))},
        1,
        ${sqlValue(body.sortOrder || 999)},
        ${sqlValue(timestamp)},
        ${sqlValue(timestamp)}
      )
    `
  );

  return json({
    success: true,
    data: { id: configId }
  }, 201);
}

async function updateConfiguration(request, env, configType, configId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE club_configuration
      SET
        config_name = ${sqlValue(body.configName)},
        config_key = ${sqlValue(body.configKey)},
        config_value_json = ${sqlValue(JSON.stringify(body.configValue || {}))},
        is_active = ${body.isActive ? 1 : 0},
        sort_order = ${sqlValue(body.sortOrder || 999)},
        updated_at = ${sqlValue(now())}
      WHERE id = ${sqlValue(configId)}
      AND config_type = ${sqlValue(configType)}
    `
  );

  return json({
    success: true
  });
}

async function listAgendaRoles(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_role_assignments
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY sequence_order ASC, role_name ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function createAgendaRole(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const body = await request.json();

  const roleId = id("role");
  const timestamp = now();
  const existingRoleResult = await executeClubQuery(
  env,
  auth.user.club_id,
  `
    SELECT id
    FROM meeting_role_assignments
    WHERE meeting_id = ${sqlValue(meetingId)}
      AND role_code = ${sqlValue(body.roleCode)}
    LIMIT 1
  `
);

const existingRoleRows =
  existingRoleResult?.[0]?.results ||
  existingRoleResult?.results ||
  [];

if (existingRoleRows.length) {
  return json({
    success: false,
    error: "This role is already planned for this meeting"
  }, 409);
}
  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO meeting_role_assignments (
        id,
        meeting_id,
        participant_ref_id,
        role_code,
        role_name,
        assignment_status,
        sequence_order,
        notes,
        planned_participant_type,
        planned_participant_id,
        planned_display_name,
        planned_email,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(roleId)},
        ${sqlValue(meetingId)},
        NULL,
        ${sqlValue(body.roleCode)},
        ${sqlValue(body.roleName)},
        ${sqlValue(body.assignmentStatus || "PLANNED")},
        ${Number(body.sequenceOrder || 0)},
        ${sqlValue(body.notes)},
        ${sqlValue(body.plannedParticipantType)},
        ${sqlValue(body.plannedParticipantId)},
        ${sqlValue(body.plannedDisplayName)},
        ${sqlValue(body.plannedEmail)},
        ${sqlValue(timestamp)},
        ${sqlValue(timestamp)}
      )
    `
  );

  return json({
    success: true,
    data: {
      id: roleId
    }
  }, 201);
}

async function updateAgendaRole(request, env, meetingId, roleId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const body = await request.json();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE meeting_role_assignments
      SET
        role_code = ${sqlValue(body.roleCode)},
        role_name = ${sqlValue(body.roleName)},
        assignment_status = ${sqlValue(body.assignmentStatus || "PLANNED")},
        sequence_order = ${Number(body.sequenceOrder || 0)},
        notes = ${sqlValue(body.notes)},
        planned_participant_type = ${sqlValue(body.plannedParticipantType)},
        planned_participant_id = ${sqlValue(body.plannedParticipantId)},
        planned_display_name = ${sqlValue(body.plannedDisplayName)},
        planned_email = ${sqlValue(body.plannedEmail)},
        updated_at = ${sqlValue(now())}
      WHERE id = ${sqlValue(roleId)}
      AND meeting_id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true,
    data: {
      id: roleId
    }
  });
}

async function deleteMeeting(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meeting_awards
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meeting_speeches
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meeting_role_assignments
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meeting_participants
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meetings
      WHERE id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true
  });
}

async function listAgendaSpeeches(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_speeches
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY created_at ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function createAgendaSpeech(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const body = await request.json();

  const speechId = id("speech");
  const timestamp = now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO meeting_speeches (
        id,
        meeting_id,
        speaker_participant_id,
        evaluator_participant_id,
        speech_title,
        speech_type,
        pathway_name,
        project_name,
        level_number,
        planned_duration_min,
        actual_duration_seconds,
        speech_status,
        notes,

        planned_speaker_type,
        planned_speaker_id,
        planned_speaker_name,
        planned_speaker_email,

        planned_evaluator_type,
        planned_evaluator_id,
        planned_evaluator_name,
        planned_evaluator_email,

        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(speechId)},
        ${sqlValue(meetingId)},
        NULL,
        NULL,
        ${sqlValue(body.speechTitle)},
        ${sqlValue(body.speechType || "PATHWAY")},
        ${sqlValue(body.pathwayName)},
        ${sqlValue(body.projectName)},
        ${Number(body.levelNumber || 0)},
        ${Number(body.plannedDurationMin || 0)},
        NULL,
        ${sqlValue(body.speechStatus || "PLANNED")},
        ${sqlValue(body.notes)},

        ${sqlValue(body.plannedSpeakerType)},
        ${sqlValue(body.plannedSpeakerId)},
        ${sqlValue(body.plannedSpeakerName)},
        ${sqlValue(body.plannedSpeakerEmail)},

        ${sqlValue(body.plannedEvaluatorType)},
        ${sqlValue(body.plannedEvaluatorId)},
        ${sqlValue(body.plannedEvaluatorName)},
        ${sqlValue(body.plannedEvaluatorEmail)},

        ${sqlValue(timestamp)},
        ${sqlValue(timestamp)}
      )
    `
  );

  return json({
    success: true,
    data: {
      id: speechId
    }
  }, 201);
}

async function updateAgendaSpeech(request, env, meetingId, speechId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const body = await request.json();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE meeting_speeches
      SET
        speech_title = ${sqlValue(body.speechTitle)},
        speech_type = ${sqlValue(body.speechType || "PATHWAY")},
        pathway_name = ${sqlValue(body.pathwayName)},
        project_name = ${sqlValue(body.projectName)},
        level_number = ${Number(body.levelNumber || 0)},
        planned_duration_min = ${Number(body.plannedDurationMin || 0)},
        speech_status = ${sqlValue(body.speechStatus || "PLANNED")},
        notes = ${sqlValue(body.notes)},

        planned_speaker_type = ${sqlValue(body.plannedSpeakerType)},
        planned_speaker_id = ${sqlValue(body.plannedSpeakerId)},
        planned_speaker_name = ${sqlValue(body.plannedSpeakerName)},
        planned_speaker_email = ${sqlValue(body.plannedSpeakerEmail)},

        planned_evaluator_type = ${sqlValue(body.plannedEvaluatorType)},
        planned_evaluator_id = ${sqlValue(body.plannedEvaluatorId)},
        planned_evaluator_name = ${sqlValue(body.plannedEvaluatorName)},
        planned_evaluator_email = ${sqlValue(body.plannedEvaluatorEmail)},

        updated_at = ${sqlValue(now())}
      WHERE id = ${sqlValue(speechId)}
      AND meeting_id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true,
    data: {
      id: speechId
    }
  });
}

async function deleteMemberPathway(request, env, memberId, pathwayId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned to this user" }, 400);
  }

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM member_pathways
      WHERE id = ${sqlValue(pathwayId)}
        AND member_id = ${sqlValue(memberId)}
    `
  );

  await syncMemberEducationSummary(env, auth.user.club_id, memberId);

  return json({
    success: true
  });
}
async function listTableTopics(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_table_topics
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY participant_name ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function addTableTopicParticipant(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const body = await request.json();

  const existing = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT id
      FROM meeting_table_topics
      WHERE meeting_id = ${sqlValue(meetingId)}
        AND participant_ref_id = ${sqlValue(body.participantRefId)}
      LIMIT 1
    `
  );

  const rows = existing?.[0]?.results || existing?.results || [];

  if (rows.length) {
    return json({
      success: false,
      error: "This participant is already added to Table Topics."
    }, 400);
  }

  const topicId = id("tt");
  const timestamp = now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO meeting_table_topics (
        id,
        meeting_id,
        participant_ref_id,
        participant_type,
        participant_id,
        participant_name,
        participant_email,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(topicId)},
        ${sqlValue(meetingId)},
        ${sqlValue(body.participantRefId)},
        ${sqlValue(body.participantType)},
        ${sqlValue(body.participantId)},
        ${sqlValue(body.participantName)},
        ${sqlValue(body.participantEmail)},
        ${sqlValue(timestamp)},
        ${sqlValue(timestamp)}
      )
    `
  );

  return json({
    success: true,
    data: { id: topicId }
  }, 201);
}

async function deleteTableTopicParticipant(request, env, meetingId, topicId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meeting_table_topics
      WHERE id = ${sqlValue(topicId)}
        AND meeting_id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true
  });
}

function parseJsonSafe(value, fallback = {}) {
  try {
    return JSON.parse(value || "{}");
  } catch (_) {
    return fallback;
  }
}

async function listAwardCandidates(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_award_candidates
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY award_name ASC, participant_name ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function generateAwardCandidates(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const timestamp = now();

  const awardsResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM club_configuration
      WHERE config_type = 'MEETING_AWARD'
        AND is_active = 1
      ORDER BY sort_order ASC, config_name ASC
    `
  );

  const awards =
    awardsResult?.[0]?.results ||
    awardsResult?.results ||
    [];

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meeting_award_candidates
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  let inserted = 0;

  for (const award of awards) {
    const config = parseJsonSafe(award.config_value_json);
    const source = config.candidateSource || "ROLES";
    const allowedRoleCodes = config.allowedRoleCodes || [];

    let candidates = [];

    if (source === "SPEECHES") {
      const result = await executeClubQuery(
        env,
        auth.user.club_id,
        `
          SELECT
            id AS source_record_id,
            planned_speaker_type AS participant_type,
            planned_speaker_id AS participant_id,
            planned_speaker_name AS participant_name,
            planned_speaker_email AS participant_email
          FROM meeting_speeches
          WHERE meeting_id = ${sqlValue(meetingId)}
            AND planned_speaker_name IS NOT NULL
            AND planned_speaker_name != ''
          ORDER BY created_at ASC
        `
      );

      candidates =
        result?.[0]?.results ||
        result?.results ||
        [];
    }

    if (source === "ROLES") {
      const roleFilter = allowedRoleCodes.length
        ? `AND role_code IN (${allowedRoleCodes.map(sqlValue).join(", ")})`
        : "";

      const result = await executeClubQuery(
        env,
        auth.user.club_id,
        `
          SELECT
            id AS source_record_id,
            planned_participant_type AS participant_type,
            planned_participant_id AS participant_id,
            planned_display_name AS participant_name,
            planned_email AS participant_email
          FROM meeting_role_assignments
          WHERE meeting_id = ${sqlValue(meetingId)}
            AND planned_display_name IS NOT NULL
            AND planned_display_name != ''
            ${roleFilter}
          ORDER BY sequence_order ASC, role_name ASC
        `
      );

      candidates =
        result?.[0]?.results ||
        result?.results ||
        [];
    }

    if (source === "TABLE_TOPICS") {
      const result = await executeClubQuery(
        env,
        auth.user.club_id,
        `
          SELECT
            id AS source_record_id,
            participant_type,
            participant_id,
            participant_name,
            participant_email
          FROM meeting_table_topics
          WHERE meeting_id = ${sqlValue(meetingId)}
            AND participant_name IS NOT NULL
            AND participant_name != ''
          ORDER BY participant_name ASC
        `
      );

      candidates =
        result?.[0]?.results ||
        result?.results ||
        [];
    }

    const seen = new Set();

    for (const candidate of candidates) {
      const dedupeKey = [
        award.config_key,
        candidate.participant_type || "",
        candidate.participant_id || "",
        candidate.participant_name || ""
      ].join("|");

      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      await executeClubStatement(
        env,
        auth.user.club_id,
        `
          INSERT INTO meeting_award_candidates (
            id,
            meeting_id,
            award_config_id,
            award_key,
            award_name,
            participant_type,
            participant_id,
            participant_name,
            participant_email,
            source_type,
            source_record_id,
            is_excluded,
            created_at,
            updated_at
          )
          VALUES (
            ${sqlValue(id("cand"))},
            ${sqlValue(meetingId)},
            ${sqlValue(award.id)},
            ${sqlValue(award.config_key)},
            ${sqlValue(award.config_name)},
            ${sqlValue(candidate.participant_type)},
            ${sqlValue(candidate.participant_id)},
            ${sqlValue(candidate.participant_name)},
            ${sqlValue(candidate.participant_email)},
            ${sqlValue(source)},
            ${sqlValue(candidate.source_record_id)},
            0,
            ${sqlValue(timestamp)},
            ${sqlValue(timestamp)}
          )
        `
      );

      inserted += 1;
    }
  }

  return json({
    success: true,
    data: {
      inserted
    }
  });
}

async function updateAwardCandidate(request, env, meetingId, candidateId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const body = await request.json();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE meeting_award_candidates
      SET
        is_excluded = ${body.isExcluded ? 1 : 0},
        updated_at = ${sqlValue(now())}
      WHERE id = ${sqlValue(candidateId)}
        AND meeting_id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true
  });
}

async function openVoting(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const existingResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_vote_sessions
      WHERE meeting_id = ${sqlValue(meetingId)}
        AND status = 'OPEN'
      LIMIT 1
    `
  );

  const existing =
    existingResult?.[0]?.results?.[0] ||
    existingResult?.results?.[0];

  if (existing) {
    return json({
      success: true,
      data: existing
    });
  }

    const meetingResult = await executeClubQuery(
  env,
  auth.user.club_id,
  `
    SELECT meeting_date
    FROM meetings
    WHERE id = ${sqlValue(meetingId)}
    LIMIT 1
  `
);

const meeting =
  meetingResult?.[0]?.results?.[0] ||
  meetingResult?.results?.[0];

if (!meeting?.meeting_date) {
  return json({
    success: false,
    error: "Meeting date not found"
  }, 400);
}

let suffix = 0;
let token = votingSlugFromDate(meeting.meeting_date, suffix);

while (true) {
  const existingTokenResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT id
      FROM meeting_vote_sessions
      WHERE public_token = ${sqlValue(token)}
      LIMIT 1
    `
  );

  const existingToken =
    existingTokenResult?.[0]?.results?.[0] ||
    existingTokenResult?.results?.[0];

  if (!existingToken) break;

  suffix += 1;
  token = votingSlugFromDate(meeting.meeting_date, suffix);
}
  const sessionId = id("vote");

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      INSERT INTO meeting_vote_sessions (
        id,
        meeting_id,
        public_token,
        status,
        opened_at,
        created_at,
        updated_at
      )
      VALUES (
        ${sqlValue(sessionId)},
        ${sqlValue(meetingId)},
        ${sqlValue(token)},
        'OPEN',
        ${sqlValue(now())},
        ${sqlValue(now())},
        ${sqlValue(now())}
      )
    `
  );
 const voteUrl =  `${FRONTEND_URL}/vote/?slug=${token}`;
  return json({
    success: true,
    data: {
      id: sessionId,
      publicToken: token, voteUrl,
      status: "OPEN"
    }
  });
}

async function getVotingSession(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_vote_sessions
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY created_at DESC
      LIMIT 1
    `
  );
  const session =
  result?.[0]?.results?.[0] ||
  result?.results?.[0] ||
  null;

return json({
  success: true,
  data: session
    ? {
        ...session,
        publicToken: session.public_token,
        voteUrl: `${FRONTEND_URL}/vote/?slug=${session.public_token}`
      }
    : null
});
}

function votingSlugFromDate(meetingDate, suffix = 0) {
  const date = new Date(`${meetingDate}T12:00:00`);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const base = `${day}${month}${year}`;

  return suffix > 0 ? `${base}-${suffix}` : base;
}

async function getPublicVotePage(request, env, publicToken) {
  const sessionResult = await env.DB.prepare(`
    SELECT cd.database_identifier
    FROM club_databases cd
    JOIN clubs c ON c.id = cd.club_id
    WHERE c.status = 'ACTIVE'
  `).all();

  const clubDatabases = sessionResult.results || [];

  for (const db of clubDatabases) {
    const voteSessionResult = await runCloudflareD1Query(
      env,
      db.database_identifier,
      `
        SELECT *
        FROM meeting_vote_sessions
        WHERE public_token = ${sqlValue(publicToken)}
        LIMIT 1
      `
    );

    const voteSession =
      voteSessionResult?.[0]?.results?.[0] ||
      voteSessionResult?.results?.[0];

    if (!voteSession) continue;

    const candidatesResult = await runCloudflareD1Query(
      env,
      db.database_identifier,
      `
        SELECT *
        FROM meeting_award_candidates
        WHERE meeting_id = ${sqlValue(voteSession.meeting_id)}
          AND is_excluded = 0
        ORDER BY award_name ASC, participant_name ASC
      `
    );

    const candidates =
      candidatesResult?.[0]?.results ||
      candidatesResult?.results ||
      [];

    return json({
      success: true,
      data: {
        session: voteSession,
        candidates
      }
    });
  }

  return json({
    success: false,
    error: "Voting link not found"
  }, 404);
}

async function submitPublicVote(request, env, publicToken) {
  const body = await request.json();

  const votes = Array.isArray(body.votes) ? body.votes : [];

  if (!votes.length) {
    return json({
      success: false,
      error: "No votes submitted"
    }, 400);
  }

  const clubResult = await env.DB.prepare(`
    SELECT cd.database_identifier
    FROM club_databases cd
    JOIN clubs c ON c.id = cd.club_id
    WHERE c.status = 'ACTIVE'
  `).all();

  const clubDatabases = clubResult.results || [];

  for (const db of clubDatabases) {
    const sessionResult = await runCloudflareD1Query(
      env,
      db.database_identifier,
      `
        SELECT *
        FROM meeting_vote_sessions
        WHERE public_token = ${sqlValue(publicToken)}
          AND status = 'OPEN'
        LIMIT 1
      `
    );

    const session =
      sessionResult?.[0]?.results?.[0] ||
      sessionResult?.results?.[0];

    if (!session) continue;

    for (const vote of votes) {
      const candidateResult = await runCloudflareD1Query(
        env,
        db.database_identifier,
        `
          SELECT *
          FROM meeting_award_candidates
          WHERE id = ${sqlValue(vote.candidateId)}
            AND meeting_id = ${sqlValue(session.meeting_id)}
            AND award_key = ${sqlValue(vote.awardKey)}
            AND is_excluded = 0
          LIMIT 1
        `
      );

      const candidate =
        candidateResult?.[0]?.results?.[0] ||
        candidateResult?.results?.[0];

      if (!candidate) continue;

      await runCloudflareD1Query(
        env,
        db.database_identifier,
        `
          INSERT INTO meeting_votes (
            id,
            meeting_id,
            vote_session_id,
            award_key,
            award_name,
            candidate_id,
            candidate_name,
            voter_name,
            voter_email,
            created_at
          )
          VALUES (
            ${sqlValue(id("mvote"))},
            ${sqlValue(session.meeting_id)},
            ${sqlValue(session.id)},
            ${sqlValue(candidate.award_key)},
            ${sqlValue(candidate.award_name)},
            ${sqlValue(candidate.id)},
            ${sqlValue(candidate.participant_name)},
            NULL,
            NULL,
            ${sqlValue(now())}
          )
        `
      );
    }

    return json({
      success: true
    });
  }

  return json({
    success: false,
    error: "Voting is closed or link not found"
  }, 404);
}

async function closeVoting(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE meeting_vote_sessions
      SET
        status = 'CLOSED',
        closed_at = ${sqlValue(now())},
        updated_at = ${sqlValue(now())}
      WHERE meeting_id = ${sqlValue(meetingId)}
        AND status = 'OPEN'
    `
  );

  return json({
    success: true
  });
}

async function getVotingResults(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT
        c.award_key,
        c.award_name,
        c.id AS candidate_id,
        c.participant_type,
        c.participant_id,
        c.participant_name,
        c.participant_email,
        COUNT(v.id) AS vote_count
      FROM meeting_award_candidates c
      LEFT JOIN meeting_votes v
        ON v.candidate_id = c.id
      WHERE c.meeting_id = ${sqlValue(meetingId)}
        AND c.is_excluded = 0
      GROUP BY
        c.award_key,
        c.award_name,
        c.id,
        c.participant_type,
        c.participant_id,
        c.participant_name,
        c.participant_email
      ORDER BY
        c.award_name ASC,
        vote_count DESC,
        c.participant_name ASC
    `
  );

  return json({
    success: true,
    data: result?.[0]?.results || result?.results || []
  });
}

async function finalizeVotingAwards(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
const editable = await assertMeetingEditable(
  env,
  auth.user.club_id,
  meetingId
);

if (!editable.ok) return editable.response;
  const body = await request.json();
  const winners = Array.isArray(body.winners) ? body.winners : [];

  if (!winners.length) {
    return json({
      success: false,
      error: "No winners selected."
    }, 400);
  }

  const meetingResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meetings
      WHERE id = ${sqlValue(meetingId)}
      LIMIT 1
    `
  );

  const meeting =
    meetingResult?.[0]?.results?.[0] ||
    meetingResult?.results?.[0];

  const awardDate = meeting?.meeting_date || now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM meeting_awards
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM member_awards
      WHERE source = ${sqlValue(`MEETING:${meetingId}`)}
    `
  );

  const timestamp = now();

  for (const winner of winners) {
    const candidateResult = await executeClubQuery(
      env,
      auth.user.club_id,
      `
        SELECT *
        FROM meeting_award_candidates
        WHERE id = ${sqlValue(winner.candidateId)}
          AND meeting_id = ${sqlValue(meetingId)}
        LIMIT 1
      `
    );

    const candidate =
      candidateResult?.[0]?.results?.[0] ||
      candidateResult?.results?.[0];

    if (!candidate) continue;

    await executeClubStatement(
      env,
      auth.user.club_id,
      `
        INSERT INTO meeting_awards (
          id,
          meeting_id,
          participant_ref_id,
          award_type,
          award_name,
          notes,
          created_at
        )
        VALUES (
          ${sqlValue(id("award"))},
          ${sqlValue(meetingId)},
          ${sqlValue(candidate.participant_id)},
          ${sqlValue(candidate.award_key)},
          ${sqlValue(candidate.award_name)},
          ${sqlValue(candidate.participant_name)},
          ${sqlValue(timestamp)}
        )
      `
    );

    if (candidate.participant_type === "MEMBER" && candidate.participant_id) {
      await executeClubStatement(
        env,
        auth.user.club_id,
        `
          INSERT INTO member_awards (
            id,
            member_id,
            award_type,
            award_name,
            award_date,
            source,
            notes,
            created_at
          )
          VALUES (
            ${sqlValue(id("maward"))},
            ${sqlValue(candidate.participant_id)},
            ${sqlValue(candidate.award_key)},
            ${sqlValue(candidate.award_name)},
            ${sqlValue(awardDate)},
            ${sqlValue(`MEETING:${meetingId}`)},
            ${sqlValue(meeting?.meeting_title || "")},
            ${sqlValue(timestamp)}
          )
        `
      );
    }
  }

  return json({
    success: true,
    data: {
      saved: winners.length
    }
  });
}

async function getMeetingAwards(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const result = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT
        award_name,
        notes AS winner_name
      FROM meeting_awards
      WHERE meeting_id = ${sqlValue(meetingId)}
      ORDER BY award_name
    `
  );

  const awards =
    result?.[0]?.results ||
    result?.results ||
    [];

  return json({
    success: true,
    data: {
      finalized: awards.length > 0,
      awards
    }
  });
}

async function getMeetingById(env, clubId, meetingId) {
  const result = await executeClubQuery(
    env,
    clubId,
    `
      SELECT *
      FROM meetings
      WHERE id = ${sqlValue(meetingId)}
      LIMIT 1
    `
  );

  return (
    result?.[0]?.results?.[0] ||
    result?.results?.[0] ||
    null
  );
}

function meetingIsLocked(meeting) {
  return Boolean(
    meeting &&
    (
      meeting.locked_at ||
      String(meeting.status || "").toUpperCase() === "COMPLETED"
    )
  );
}

async function assertMeetingEditable(env, clubId, meetingId) {
  const meeting = await getMeetingById(env, clubId, meetingId);

  if (!meeting) {
    return {
      ok: false,
      response: json(
        { success: false, error: "Meeting not found" },
        404
      )
    };
  }

  if (meetingIsLocked(meeting)) {
    return {
      ok: false,
      response: json(
        {
          success: false,
          error: "This meeting is completed and locked. Reopen it before making changes."
        },
        423
      )
    };
  }

  return {
    ok: true,
    meeting
  };
}

async function closeMeeting(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const timestamp = now();

  const meetingResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meetings
      WHERE id = ${sqlValue(meetingId)}
      LIMIT 1
    `
  );

  const meeting =
    meetingResult?.[0]?.results?.[0] ||
    meetingResult?.results?.[0];

  if (!meeting) {
    return json({ success: false, error: "Meeting not found" }, 404);
  }

  if (meeting.status === "COMPLETED") {
    return json({
      success: true,
      data: { meetingId, status: "COMPLETED" }
    });
  }

  const participantsResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_participants
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  const participants =
    participantsResult?.[0]?.results ||
    participantsResult?.results ||
    [];

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM member_attendance
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  for (const participant of participants) {
    if (participant.participant_type !== "MEMBER" || !participant.participant_id) {
      continue;
    }

    await executeClubStatement(
      env,
      auth.user.club_id,
      `
        INSERT INTO member_attendance (
          id,
          member_id,
          meeting_id,
          meeting_date,
          attendance_status,
          role_taken,
          notes,
          created_at
        )
        VALUES (
          ${sqlValue(id("attendance"))},
          ${sqlValue(participant.participant_id)},
          ${sqlValue(meetingId)},
          ${sqlValue(meeting.meeting_date)},
          ${sqlValue(participant.attendance_status || "PRESENT")},
          NULL,
          ${sqlValue(participant.notes)},
          ${sqlValue(timestamp)}
        )
      `
    );
  }

  const speechesResult = await executeClubQuery(
    env,
    auth.user.club_id,
    `
      SELECT *
      FROM meeting_speeches
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  const speeches =
    speechesResult?.[0]?.results ||
    speechesResult?.results ||
    [];

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      DELETE FROM member_speeches
      WHERE meeting_id = ${sqlValue(meetingId)}
    `
  );

  for (const speech of speeches) {
    if (speech.planned_speaker_type !== "MEMBER" || !speech.planned_speaker_id) {
      continue;
    }

    await executeClubStatement(
      env,
      auth.user.club_id,
      `
        INSERT INTO member_speeches (
          id,
          member_id,
          meeting_id,
          speech_title,
          pathway_name,
          project_name,
          level_number,
          speech_date,
          evaluator_member_id,
          duration_seconds,
          status,
          notes,
          created_at,
          updated_at
        )
        VALUES (
          ${sqlValue(id("speech"))},
          ${sqlValue(speech.planned_speaker_id)},
          ${sqlValue(meetingId)},
          ${sqlValue(speech.speech_title)},
          ${sqlValue(speech.pathway_name)},
          ${sqlValue(speech.project_name)},
          ${Number(speech.level_number || 0)},
          ${sqlValue(meeting.meeting_date)},
          NULL,
          ${Number(speech.actual_duration_seconds || 0)},
          'COMPLETED',
          ${sqlValue(speech.notes)},
          ${sqlValue(timestamp)},
          ${sqlValue(timestamp)}
        )
      `
    );
  }

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE meetings
SET
  status = 'COMPLETED',
  locked_at = ${sqlValue(timestamp)},
  locked_by = ${sqlValue(auth.user.email || auth.user.id || "system")},
  lock_reason = ${sqlValue("Meeting completed and locked")},
  updated_at = ${sqlValue(timestamp)}
WHERE id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true,
    data: {
      meetingId,
      status: "COMPLETED"
    }
  });
}

async function reopenMeeting(request, env, meetingId) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const timestamp = now();

  await executeClubStatement(
    env,
    auth.user.club_id,
    `
      UPDATE meetings
SET
  status = 'IN_PROGRESS',
  locked_at = NULL,
  locked_by = NULL,
  lock_reason = NULL,
  updated_at = ${sqlValue(timestamp)}
WHERE id = ${sqlValue(meetingId)}
    `
  );

  return json({
    success: true,
    data: {
      meetingId,
      status: "IN_PROGRESS"
    }
  });
}

async function applyMigration024ForMyClub(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!auth.user.club_id) {
    return json({ success: false, error: "No club assigned" }, 400);
  }

  const dbInfo = await getClubDatabaseInfo(env, auth.user.club_id);

  if (!dbInfo) {
    return json({ success: false, error: "Club database not found" }, 404);
  }

  await applyMigration024(env, dbInfo.database_identifier);

  await runCloudflareD1Batch(
    env,
    dbInfo.database_identifier,
    [
      `
        INSERT OR IGNORE INTO schema_migrations
        (version, applied_at)
        VALUES ('024_meeting_locking', datetime('now'))
      `
    ]
  );

  return json({
    success: true,
    data: {
      migration: "024_meeting_locking",
      database: dbInfo.database_name
    }
  });
}

async function applyMigration025(env, databaseId) {
  await ensureTable(
    env,
    databaseId,
    `
      CREATE TABLE IF NOT EXISTS guests (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        organization TEXT,
        guest_status TEXT NOT NULL DEFAULT 'ACTIVE',
        first_seen_at TEXT,
        last_seen_at TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_guests_email",
    "guests",
    "email"
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_guests_status",
    "guests",
    "guest_status"
  );

  await ensureTable(
    env,
    databaseId,
    `
      CREATE TABLE IF NOT EXISTS guest_attendance (
        id TEXT PRIMARY KEY,
        guest_id TEXT NOT NULL,
        meeting_id TEXT,
        meeting_date TEXT NOT NULL,
        attendance_status TEXT NOT NULL DEFAULT 'PRESENT',
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_guest_attendance_guest",
    "guest_attendance",
    "guest_id"
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_guest_attendance_meeting",
    "guest_attendance",
    "meeting_id"
  );

  await ensureTable(
    env,
    databaseId,
    `
      CREATE TABLE IF NOT EXISTS guest_awards (
        id TEXT PRIMARY KEY,
        guest_id TEXT NOT NULL,
        meeting_id TEXT,
        award_key TEXT,
        award_name TEXT NOT NULL,
        award_date TEXT,
        source TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_guest_awards_guest",
    "guest_awards",
    "guest_id"
  );

  await ensureIndex(
    env,
    databaseId,
    "idx_guest_awards_meeting",
    "guest_awards",
    "meeting_id"
  );
}

async function runClubMigrations(env, databaseId) {
  const applied = [];

  for (const migration of CLUB_MIGRATIONS) {
    await runCloudflareD1Batch(env,databaseId,migration.sql);

    applied.push(migration.version);
  }

  // Idempotent upgrade migrations
  await applyMigration018(env,databaseId);
  await applyMigration019(env,databaseId);
  await applyMigration020(env, databaseId);
  await applyMigration021(env, databaseId);
  await applyMigration022(env, databaseId);
  await applyMigration023(env, databaseId);
  await applyMigration024(env, databaseId);
  await applyMigration025(env, databaseId);
  
await runCloudflareD1Batch(env,databaseId,
  [
    `
  INSERT OR IGNORE INTO schema_migrations
  (version, applied_at)
  VALUES
  (
    '021_award_candidates',
    datetime('now')
  )
`
  ]
);
  
  
  await runCloudflareD1Batch(
  env,
  databaseId,
  [
    `
      INSERT OR IGNORE INTO schema_migrations
      (version, applied_at)
      VALUES
      (
        '018_planned_agenda_speeches',
        datetime('now')
      )
    `,
    `
      INSERT OR IGNORE INTO schema_migrations
      (version, applied_at)
      VALUES
      (
        '019_member_recognition_suffix',
        datetime('now')
      )
    `
  ]
);
  await runCloudflareD1Batch(
  env,
  databaseId,
  [
    `
      INSERT OR IGNORE INTO schema_migrations
      (version, applied_at)
      VALUES
      (
        '020_table_topics_participants',
        datetime('now')
      )
    `
  ]
);

  await runCloudflareD1Batch(
  env,
  databaseId,
  [
    `
      INSERT OR IGNORE INTO schema_migrations
      (version, applied_at)
      VALUES
      (
        '022_meeting_role_assignment_planning',
        datetime('now')
      )
    `
  ]
);
  await runCloudflareD1Batch(
  env,
  databaseId,
  [
    `
      INSERT OR IGNORE INTO schema_migrations
      (version, applied_at)
      VALUES
      (
        '023_voting_sessions',
        datetime('now')
      )
    `
  ]
);
  

  applied.push("018_planned_agenda_speeches");
  applied.push("019_member_recognition_suffix");
  applied.push("020_table_topics_participants");
  applied.push("021_award_candidates");
  applied.push("022_meeting_role_assignment_planning");
  applied.push("023_voting_sessions");
  applied.push("024_meeting_locking");
  applied.push("025_guest_foundation");
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
  if (url.pathname === "/api/club/context" && request.method === "GET") {  return getClubContext(request, env);}
  if (url.pathname === "/api/members" && request.method === "GET") {  return listMembers(request, env);}
  if (url.pathname === "/api/members" && request.method === "POST") {  return createMember(request, env);}
  const memberDetailsMatch = url.pathname.match(/^\/api\/members\/([^/]+)$/);
  if (memberDetailsMatch && request.method === "GET") { return getMemberDetails(request, env, memberDetailsMatch[1]);}
  const updateMemberMatch = url.pathname.match(/^\/api\/members\/([^/]+)$/);
  if (updateMemberMatch && request.method === "PUT") {  return updateMember(request, env, updateMemberMatch[1]);}
  if (url.pathname === "/api/club/settings" && request.method === "GET") { return getClubSettings(request, env);}
  if (url.pathname === "/api/club/settings" && request.method === "PUT") {  return updateClubSettings(request, env);}
  if (url.pathname === "/api/officer-terms" && request.method === "GET") {  return listOfficerTerms(request, env);}
  if (url.pathname === "/api/officer-terms" && request.method === "POST") {  return createOfficerTerm(request, env);}
  const officerAssignmentMatch = url.pathname.match(/^\/api\/members\/([^/]+)\/officer-terms$/);
  if (officerAssignmentMatch && request.method === "POST") { return assignOfficerTerm(request, env, officerAssignmentMatch[1]);}
  const endOfficerTermMatch = url.pathname.match(/^\/api\/members\/([^/]+)\/officer-terms\/([^/]+)\/end$/);
  if (endOfficerTermMatch && request.method === "POST") { return endOfficerTerm(request, env, endOfficerTermMatch[1], endOfficerTermMatch[2]);}
  const archiveMemberMatch = url.pathname.match(/^\/api\/members\/([^/]+)\/archive$/);
  if (archiveMemberMatch && request.method === "POST") {  return archiveMember(request, env, archiveMemberMatch[1]);}
  if (url.pathname === "/api/meetings" && request.method === "GET") { return listMeetings(request, env);}
  if (url.pathname === "/api/meetings" && request.method === "POST") { return createMeeting(request, env);}
  const meetingDetailsMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)$/);
  if (meetingDetailsMatch && request.method === "GET") {  return getMeetingDetails(request, env, meetingDetailsMatch[1]);}
  const updateMeetingMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)$/);
  if (updateMeetingMatch && request.method === "PUT") {  return updateMeeting(request, env, updateMeetingMatch[1]);}
  const meetingParticipantsMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/participants$/);
  if (meetingParticipantsMatch && request.method === "GET") {  return listMeetingParticipants(request, env, meetingParticipantsMatch[1]);}
  if (meetingParticipantsMatch && request.method === "POST") {  return addMeetingParticipant(request, env, meetingParticipantsMatch[1]);}
  if (url.pathname === "/api/meeting-attendance-sources" && request.method === "GET") {  return listMeetingAttendanceSources(request, env);}
  const configurationTypeMatch =  url.pathname.match(/^\/api\/configuration\/([^/]+)$/);
  if (configurationTypeMatch && request.method === "GET") {  return listConfiguration(request,env,configurationTypeMatch[1]);}
  if (configurationTypeMatch && request.method === "POST") { return createConfiguration(request,env,configurationTypeMatch[1]);}
  const configurationUpdateMatch = url.pathname.match(/^\/api\/configuration\/([^/]+)\/([^/]+)$/);
  if (configurationUpdateMatch && request.method === "PUT") { return updateConfiguration(request,env,configurationUpdateMatch[1],configurationUpdateMatch[2]);}                                                      
  const agendaRolesMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/agenda-roles$/);
  if (agendaRolesMatch && request.method === "GET") { return listAgendaRoles(request, env, agendaRolesMatch[1]);}
  if (agendaRolesMatch && request.method === "POST") {  return createAgendaRole(request, env, agendaRolesMatch[1]);}
  const agendaRoleUpdateMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/agenda-roles\/([^/]+)$/);
  if (agendaRoleUpdateMatch && request.method === "PUT") {  return updateAgendaRole(request,env,agendaRoleUpdateMatch[1],agendaRoleUpdateMatch[2]);}
  const meetingMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)$/);
  if (meetingMatch && request.method === "DELETE") {  return deleteMeeting(request,env,meetingMatch[1]);}
  const agendaSpeechesMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/agenda-speeches$/);
  if (agendaSpeechesMatch && request.method === "GET") { return listAgendaSpeeches(request, env, agendaSpeechesMatch[1]);}
  if (agendaSpeechesMatch && request.method === "POST") { return createAgendaSpeech(request, env, agendaSpeechesMatch[1]);}
  const agendaSpeechUpdateMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/agenda-speeches\/([^/]+)$/);
  if (agendaSpeechUpdateMatch && request.method === "PUT") { return updateAgendaSpeech(request,env,agendaSpeechUpdateMatch[1],agendaSpeechUpdateMatch[2]);}
  const memberPathwaysMatch = url.pathname.match(/^\/api\/members\/([^/]+)\/pathways$/);
  if (memberPathwaysMatch && request.method === "GET") { return listMemberPathways(request, env, memberPathwaysMatch[1]);}
  if (memberPathwaysMatch && request.method === "POST") { return createMemberPathway(request, env, memberPathwaysMatch[1]);}
  const memberPathwayLevelMatch =  url.pathname.match(/^\/api\/members\/([^/]+)\/pathways\/([^/]+)\/level$/);
  if (memberPathwayLevelMatch && request.method === "PUT") { return updateMemberPathwayLevel(request,env,memberPathwayLevelMatch[1],memberPathwayLevelMatch[2]);}
  const memberPathwayDeleteMatch =  url.pathname.match(/^\/api\/members\/([^/]+)\/pathways\/([^/]+)$/);
  if (memberPathwayDeleteMatch && request.method === "DELETE") {  return deleteMemberPathway(request,env,memberPathwayDeleteMatch[1],memberPathwayDeleteMatch[2]);}
  const tableTopicsMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/table-topics$/);
  if (tableTopicsMatch && request.method === "GET") {  return listTableTopics(request, env, tableTopicsMatch[1]);}
  if (tableTopicsMatch && request.method === "POST") { return addTableTopicParticipant(request, env, tableTopicsMatch[1]);}
  const tableTopicDeleteMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/table-topics\/([^/]+)$/);
  if (tableTopicDeleteMatch && request.method === "DELETE") { return deleteTableTopicParticipant(request,env,tableTopicDeleteMatch[1],tableTopicDeleteMatch[2]);}
  const awardCandidatesGenerateMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/award-candidates\/generate$/);
  if (awardCandidatesGenerateMatch && request.method === "POST") {  return generateAwardCandidates(request,env,awardCandidatesGenerateMatch[1]);}
  const awardCandidatesMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/award-candidates$/);
  if (awardCandidatesMatch && request.method === "GET") { return listAwardCandidates(request,env,awardCandidatesMatch[1]);}
  const awardCandidateUpdateMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/award-candidates\/([^/]+)$/);
  if (awardCandidateUpdateMatch && request.method === "PUT") { return updateAwardCandidate(request,env,awardCandidateUpdateMatch[1],awardCandidateUpdateMatch[2]);}
  const openVotingMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/voting\/open$/);
  if (openVotingMatch && request.method === "POST") { return openVoting(request,env,openVotingMatch[1]);}
  const votingSessionMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/voting$/);
  if (votingSessionMatch && request.method === "GET") { return getVotingSession(request,env,votingSessionMatch[1]);}
  const publicVoteMatch = url.pathname.match(/^\/api\/vote\/([^/]+)$/);
  if (publicVoteMatch && request.method === "GET") { return getPublicVotePage(request,env,publicVoteMatch[1]);}
  if (publicVoteMatch && request.method === "POST") { return submitPublicVote(request,env,publicVoteMatch[1]);}
  const closeVotingMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/voting\/close$/);
  if (closeVotingMatch && request.method === "POST") { return closeVoting(request,env,closeVotingMatch[1]);}
  const votingResultsMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/voting\/results$/);
  if (votingResultsMatch && request.method === "GET") { return getVotingResults(request,env,votingResultsMatch[1]);}
  const finalizeVotingAwardsMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/voting\/finalize$/);
  if (finalizeVotingAwardsMatch && request.method === "POST") { return finalizeVotingAwards(request,env,finalizeVotingAwardsMatch[1]);}
  const meetingAwardsMatch =  url.pathname.match(/^\/api\/meetings\/([^/]+)\/awards$/);
  if (meetingAwardsMatch &&  request.method === "GET") { return getMeetingAwards(request,env,meetingAwardsMatch[1]);}
  const closeMeetingMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/close$/);
  if (closeMeetingMatch && request.method === "POST") { return closeMeeting(request,env,closeMeetingMatch[1]);}
  const reopenMeetingMatch = url.pathname.match(/^\/api\/meetings\/([^/]+)\/reopen$/);
  if (reopenMeetingMatch && request.method === "POST") {return reopenMeeting(request,env,reopenMeetingMatch[1]);}
  if (url.pathname === "/api/admin/apply-migration-024" &&  request.method === "POST") {  return applyMigration024ForMyClub(request, env);}
  if (url.pathname === "/api/admin/apply-migration-025" &&  request.method === "POST") {  return applyMigration025ForMyClub(request, env);}

  
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
