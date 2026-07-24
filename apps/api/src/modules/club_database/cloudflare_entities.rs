use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct CloudflareD1QueryRequest {
    pub sql: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CloudflareApiMessage {
    pub message: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CloudflareD1QueryResult {
    #[serde(default)]
    pub results: Vec<serde_json::Value>,

    #[serde(default)]
    pub success: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CloudflareD1QueryResponse {
    #[serde(default)]
    pub success: bool,

    #[serde(default)]
    pub result: Vec<CloudflareD1QueryResult>,

    #[serde(default)]
    pub errors: Vec<CloudflareApiMessage>,

    #[serde(default)]
    pub messages: Vec<CloudflareApiMessage>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ClubDatabaseProbeRow {
    pub probe_value: i32,
    pub database_time: String,
}
