use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct CloudflareD1QueryRequest {
    pub sql: String,

    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub params: Vec<serde_json::Value>,
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

#[cfg(test)]
mod tests {
    use super::CloudflareD1QueryRequest;

    #[test]
    fn omits_empty_params_from_serialized_request() {
        let request = CloudflareD1QueryRequest {
            sql: "SELECT 1".to_string(),
            params: Vec::new(),
        };

        let json = serde_json::to_value(request).expect("request should serialize");

        assert_eq!(json["sql"], "SELECT 1");
        assert!(json.get("params").is_none());
    }

    #[test]
    fn includes_bound_params_in_serialized_request() {
        let request = CloudflareD1QueryRequest {
            sql: "SELECT * FROM members WHERE id = ?1".to_string(),
            params: vec![serde_json::json!("member_123")],
        };

        let json = serde_json::to_value(request).expect("request should serialize");

        assert_eq!(json["params"][0], "member_123");
    }
}
