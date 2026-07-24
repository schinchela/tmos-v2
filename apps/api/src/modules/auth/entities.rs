use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct SessionIdentityRow {
    pub user_id: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AuthenticatedUserRow {
    pub id: String,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: String,
    pub club_id: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LoginUserRow {
    pub id: String,
    pub email: String,
    pub password_hash: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: String,
    pub club_id: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthenticatedUser {
    pub id: String,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: String,
    pub club_id: Option<String>,
}

impl From<AuthenticatedUserRow> for AuthenticatedUser {
    fn from(row: AuthenticatedUserRow) -> Self {
        Self {
            id: row.id,
            email: row.email,
            first_name: row.first_name,
            last_name: row.last_name,
            role: row.role,
            club_id: row.club_id,
        }
    }
}

impl From<&LoginUserRow> for AuthenticatedUser {
    fn from(row: &LoginUserRow) -> Self {
        Self {
            id: row.id.clone(),
            email: row.email.clone(),
            first_name: row.first_name.clone(),
            last_name: row.last_name.clone(),
            role: row.role.clone(),
            club_id: row.club_id.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub token: String,
    pub user: AuthenticatedUser,
}

#[derive(Debug, Clone, Serialize)]
pub struct LogoutResponse {
    pub logged_out: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ClubContextRow {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub database_name: String,
    pub status: String,
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
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClubContext {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub database_name: String,
    pub status: String,
    pub city: Option<String>,
    pub country: Option<String>,
    pub charter_number: Option<String>,
    pub timezone: String,
    pub meeting_day: Option<String>,
    pub meeting_time: Option<String>,
    pub website: Option<String>,
    pub district: Option<String>,
    pub division: Option<String>,
    pub area: Option<String>,
    pub created_at: String,
}

impl From<ClubContextRow> for ClubContext {
    fn from(row: ClubContextRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            slug: row.slug,
            database_name: row.database_name,
            status: row.status,
            city: row.city,
            country: row.country,
            charter_number: row.charter_number,
            timezone: row
                .timezone
                .filter(|value| !value.trim().is_empty())
                .unwrap_or_else(|| "Asia/Kolkata".to_string()),
            meeting_day: row.meeting_day,
            meeting_time: row.meeting_time,
            website: row.website,
            district: row.district,
            division: row.division,
            area: row.area,
            created_at: row.created_at,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClubContextResponse {
    pub user: AuthenticatedUser,
    pub club: ClubContext,
}
