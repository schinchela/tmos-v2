use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PlatformUserRow {
    pub id: String,
    pub email: String,
    pub password_hash: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: String,
    pub club_id: Option<String>,
    pub status: String,
    pub created_at: String,
    pub phone: Option<String>,
    pub last_login_at: Option<String>,
    pub invited_at: Option<String>,
    pub created_by: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserSessionRow {
    pub id: String,
    pub user_id: String,
    pub token_hash: String,
    pub expires_at: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ClubRow {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub database_name: String,
    pub status: String,
    pub created_at: String,
    pub created_by: String,
    pub city: Option<String>,
    pub country: Option<String>,
    pub charter_number: Option<String>,
    pub timezone: Option<String>,
    pub meeting_day: Option<String>,
    pub meeting_time: Option<String>,
    pub website: Option<String>,
    pub district: Option<String>,
    pub division: Option<String>,
    pub area: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ClubDatabaseRow {
    pub id: String,
    pub club_id: String,
    pub database_name: String,
    pub database_identifier: Option<String>,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RoleRow {
    pub id: String,
    pub code: String,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PermissionRow {
    pub id: String,
    pub code: String,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProvisioningJobRow {
    pub id: String,
    pub club_id: String,
    pub database_name: String,
    pub status: String,
    pub current_step: Option<String>,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub error_message: Option<String>,
    pub created_by: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AuditLogRow {
    pub id: String,
    pub user_id: Option<String>,
    pub action: String,
    pub entity_type: String,
    pub entity_id: Option<String>,
    pub details: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TableCountRow {
    pub row_count: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformInventory {
    pub users: i64,
    pub user_sessions: i64,
    pub clubs: i64,
    pub club_databases: i64,
    pub audit_logs: i64,
    pub roles: i64,
    pub permissions: i64,
    pub provisioning_jobs: i64,
}
