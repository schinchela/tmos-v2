use wasm_bindgen::JsValue;

use crate::modules::auth::entities::{AuthenticatedUserRow, ClubContextRow, SessionIdentityRow};
use crate::shared::api_error::ApiError;
use crate::shared::database::platform_database::PlatformDatabase;

pub struct AuthRepository {
    database: PlatformDatabase,
}

impl AuthRepository {
    pub fn new(database: PlatformDatabase) -> Self {
        Self { database }
    }

    pub async fn find_valid_session_user_id(
        &self,
        token_hash: &str,
    ) -> Result<Option<String>, ApiError> {
        let statement = self
            .database
            .inner()
            .prepare(
                r#"
                SELECT user_id
                FROM user_sessions
                WHERE token_hash = ?
                  AND datetime(expires_at) >= datetime('now')
                LIMIT 1
                "#,
            )
            .bind(&[JsValue::from_str(token_hash)])
            .map_err(|error| {
                ApiError::internal(
                    "AUTH_SESSION_QUERY_PREPARATION_FAILED",
                    "The authentication session query could not be prepared.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })?;

        let session = statement
            .first::<SessionIdentityRow>(None)
            .await
            .map_err(|error| {
                ApiError::internal(
                    "AUTH_SESSION_LOOKUP_FAILED",
                    "The authentication session could not be resolved.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })?;

        Ok(session.map(|row| row.user_id))
    }

    pub async fn find_active_user(
        &self,
        user_id: &str,
    ) -> Result<Option<AuthenticatedUserRow>, ApiError> {
        let statement = self
            .database
            .inner()
            .prepare(
                r#"
                SELECT
                    id,
                    email,
                    first_name,
                    last_name,
                    role,
                    club_id,
                    status,
                    created_at
                FROM users
                WHERE id = ?
                  AND status = 'ACTIVE'
                LIMIT 1
                "#,
            )
            .bind(&[JsValue::from_str(user_id)])
            .map_err(|error| {
                ApiError::internal(
                    "AUTH_USER_QUERY_PREPARATION_FAILED",
                    "The authenticated-user query could not be prepared.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })?;

        statement
            .first::<AuthenticatedUserRow>(None)
            .await
            .map_err(|error| {
                ApiError::internal(
                    "AUTH_USER_LOOKUP_FAILED",
                    "The authenticated user could not be resolved.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })
    }

    pub async fn find_club(&self, club_id: &str) -> Result<Option<ClubContextRow>, ApiError> {
        let statement = self
            .database
            .inner()
            .prepare(
                r#"
                SELECT
                    id,
                    name,
                    slug,
                    database_name,
                    status,
                    city,
                    country,
                    charter_number,
                    timezone,
                    meeting_day,
                    meeting_time,
                    website,
                    district,
                    division,
                    area,
                    created_at
                FROM clubs
                WHERE id = ?
                LIMIT 1
                "#,
            )
            .bind(&[JsValue::from_str(club_id)])
            .map_err(|error| {
                ApiError::internal(
                    "AUTH_CLUB_QUERY_PREPARATION_FAILED",
                    "The club-context query could not be prepared.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })?;

        statement
            .first::<ClubContextRow>(None)
            .await
            .map_err(|error| {
                ApiError::internal(
                    "AUTH_CLUB_LOOKUP_FAILED",
                    "The authenticated user's club could not be resolved.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })
    }
}
