use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct ClubDatabaseMappingRow {
    pub club_id: String,
    pub club_name: String,
    pub club_slug: String,
    pub club_status: String,
    pub club_database_name: String,
    pub mapping_id: Option<String>,
    pub mapped_database_name: Option<String>,
    pub database_identifier: Option<String>,
    pub mapping_status: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ResolvedClubDatabase {
    pub club_id: String,
    pub club_name: String,
    pub club_slug: String,
    pub club_status: String,
    pub database_name: String,
    pub database_identifier: String,
    pub mapping_status: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClubDatabaseContext {
    pub club_id: String,
    pub club_name: String,
    pub club_slug: String,
    pub club_status: String,
    pub database_name: String,
    pub mapping_status: String,
    pub database_identifier_present: bool,
    pub database_identifier_valid: bool,
    pub ready: bool,
}

impl From<&ResolvedClubDatabase> for ClubDatabaseContext {
    fn from(database: &ResolvedClubDatabase) -> Self {
        Self {
            club_id: database.club_id.clone(),
            club_name: database.club_name.clone(),
            club_slug: database.club_slug.clone(),
            club_status: database.club_status.clone(),
            database_name: database.database_name.clone(),
            mapping_status: database.mapping_status.clone(),
            database_identifier_present: true,
            database_identifier_valid: true,
            ready: true,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClubDatabaseHealth {
    pub status: String,
    pub club_id: String,
    pub club_name: String,
    pub database_name: String,
    pub database_time: String,
    pub probe_value: i32,
    pub gateway: String,
}
