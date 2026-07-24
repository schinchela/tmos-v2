CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_token_hash
ON user_sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
ON audit_logs(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created
ON audit_logs(action, created_at);

DELETE FROM user_sessions
WHERE datetime(expires_at) < datetime('now');
