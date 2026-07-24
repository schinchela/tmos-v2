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
