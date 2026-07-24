use serde::de::DeserializeOwned;
use wasm_bindgen::JsValue;
use worker::{Env, Fetch, Headers, Method, Request, RequestInit};

use crate::modules::club_database::cloudflare_entities::{
    CloudflareD1QueryRequest, CloudflareD1QueryResponse,
};
use crate::shared::api_error::ApiError;

const CLOUDFLARE_API_BASE: &str = "https://api.cloudflare.com/client/v4";

pub struct ClubD1Gateway {
    account_id: String,
    api_token: String,
}

impl ClubD1Gateway {
    pub fn from_env(env: &Env) -> Result<Self, ApiError> {
        let account_id = env
            .secret("CF_ACCOUNT_ID")
            .map_err(|_| {
                ApiError::internal(
                    "CLUB_DATABASE_ACCOUNT_SECRET_MISSING",
                    "The Cloudflare account credential is unavailable.",
                )
            })?
            .to_string();

        let api_token = env
            .secret("CF_API_TOKEN")
            .map_err(|_| {
                ApiError::internal(
                    "CLUB_DATABASE_TOKEN_SECRET_MISSING",
                    "The Cloudflare API credential is unavailable.",
                )
            })?
            .to_string();

        if account_id.trim().is_empty() {
            return Err(ApiError::internal(
                "CLUB_DATABASE_ACCOUNT_SECRET_EMPTY",
                "The Cloudflare account credential is empty.",
            ));
        }

        if api_token.trim().is_empty() {
            return Err(ApiError::internal(
                "CLUB_DATABASE_TOKEN_SECRET_EMPTY",
                "The Cloudflare API credential is empty.",
            ));
        }

        Ok(Self {
            account_id,
            api_token,
        })
    }

    pub async fn execute_read_rows<T>(
        &self,
        database_identifier: &str,
        sql: &str,
    ) -> Result<Vec<T>, ApiError>
    where
        T: DeserializeOwned,
    {
        let response = self.execute_read_query(database_identifier, sql).await?;

        let result_set = response.result.into_iter().next().ok_or_else(|| {
            ApiError::internal(
                "CLUB_DATABASE_RESULT_SET_MISSING",
                "The club database query returned no result set.",
            )
        })?;

        if !result_set.success {
            return Err(ApiError::internal(
                "CLUB_DATABASE_RESULT_SET_UNSUCCESSFUL",
                "The club database result set was unsuccessful.",
            ));
        }

        result_set
            .results
            .into_iter()
            .map(|row| {
                serde_json::from_value::<T>(row).map_err(|error| {
                    ApiError::internal(
                        "CLUB_DATABASE_ROW_DESERIALIZATION_FAILED",
                        "A club database row could not be read.",
                    )
                    .with_details(serde_json::json!({
                        "workerMessage": error.to_string()
                    }))
                })
            })
            .collect()
    }

    pub async fn execute_read_query(
        &self,
        database_identifier: &str,
        sql: &str,
    ) -> Result<CloudflareD1QueryResponse, ApiError> {
        validate_read_only_sql(sql)?;

        let endpoint = format!(
            "{CLOUDFLARE_API_BASE}/accounts/{}/d1/database/{}/query",
            self.account_id, database_identifier
        );

        let payload = serde_json::to_string(&CloudflareD1QueryRequest {
            sql: sql.to_string(),
        })
        .map_err(|error| {
            ApiError::internal(
                "CLUB_DATABASE_REQUEST_SERIALIZATION_FAILED",
                "The club database request could not be serialized.",
            )
            .with_details(serde_json::json!({
                "workerMessage": error.to_string()
            }))
        })?;

        let headers = Headers::new();

        headers
            .set("Authorization", &format!("Bearer {}", self.api_token))
            .map_err(ApiError::from)?;

        headers
            .set("Content-Type", "application/json")
            .map_err(ApiError::from)?;

        let mut init = RequestInit::new();

        init.with_method(Method::Post)
            .with_headers(headers)
            .with_body(Some(JsValue::from_str(&payload)));

        let outbound_request = Request::new_with_init(&endpoint, &init).map_err(ApiError::from)?;

        let mut response = Fetch::Request(outbound_request)
            .send()
            .await
            .map_err(|error| {
                ApiError::internal(
                    "CLUB_DATABASE_GATEWAY_REQUEST_FAILED",
                    "The club database gateway request failed.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })?;

        let status = response.status_code();

        let payload = response
            .json::<CloudflareD1QueryResponse>()
            .await
            .map_err(|error| {
                ApiError::internal(
                    "CLUB_DATABASE_GATEWAY_RESPONSE_INVALID",
                    "The club database gateway returned an invalid response.",
                )
                .with_details(serde_json::json!({
                    "httpStatus": status,
                    "workerMessage": error.to_string()
                }))
            })?;

        if status < 200 || status >= 300 || !payload.success {
            let message = first_api_message(&payload)
                .unwrap_or_else(|| "The Cloudflare D1 API rejected the query.".to_string());

            return Err(
                ApiError::internal("CLUB_DATABASE_GATEWAY_QUERY_FAILED", message).with_details(
                    serde_json::json!({
                        "httpStatus": status
                    }),
                ),
            );
        }

        Ok(payload)
    }
}

fn first_api_message(response: &CloudflareD1QueryResponse) -> Option<String> {
    response
        .errors
        .iter()
        .chain(response.messages.iter())
        .find_map(|item| item.message.clone())
}

fn validate_read_only_sql(sql: &str) -> Result<(), ApiError> {
    let normalized = sql.trim().to_ascii_uppercase();

    if normalized.is_empty() {
        return Err(ApiError::bad_request(
            "CLUB_DATABASE_QUERY_EMPTY",
            "The club database query cannot be empty.",
        ));
    }

    let starts_with_approved_statement = normalized.starts_with("SELECT")
        || normalized.starts_with("WITH")
        || normalized.starts_with("PRAGMA TABLE_INFO");

    if !starts_with_approved_statement {
        return Err(ApiError::forbidden(
            "CLUB_DATABASE_QUERY_NOT_READ_ONLY",
            "Only approved read-only club database queries are permitted.",
        ));
    }

    let tokenized = normalized
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || character == '_' {
                character
            } else {
                ' '
            }
        })
        .collect::<String>();

    let prohibited = [
        "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "REPLACE", "ATTACH", "DETACH",
        "VACUUM",
    ];

    if tokenized
        .split_whitespace()
        .any(|token| prohibited.contains(&token))
    {
        return Err(ApiError::forbidden(
            "CLUB_DATABASE_QUERY_NOT_READ_ONLY",
            "Only approved read-only club database queries are permitted.",
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::validate_read_only_sql;

    #[test]
    fn accepts_select_query() {
        assert!(validate_read_only_sql("SELECT 1 AS probe_value").is_ok());
    }

    #[test]
    fn rejects_delete_query() {
        let result = validate_read_only_sql("DELETE FROM members");

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err().code,
            "CLUB_DATABASE_QUERY_NOT_READ_ONLY"
        );
    }

    #[test]
    fn rejects_mutating_cte() {
        let result = validate_read_only_sql(
            "WITH removed AS (DELETE FROM members RETURNING id) SELECT * FROM removed",
        );

        assert!(result.is_err());
    }
}
