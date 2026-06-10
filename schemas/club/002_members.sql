CREATE TABLE IF NOT EXISTS members (
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
);

CREATE INDEX IF NOT EXISTS idx_members_status
ON members(membership_status);

CREATE INDEX IF NOT EXISTS idx_members_email
ON members(email);

CREATE INDEX IF NOT EXISTS idx_members_tm_id
ON members(toastmasters_id);

INSERT OR IGNORE INTO schema_migrations (
  version,
  applied_at
)
VALUES (
  '002_members',
  datetime('now')
);
