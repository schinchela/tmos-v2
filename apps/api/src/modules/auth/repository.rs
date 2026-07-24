use wasm_bindgen::JsValue;

use crate::modules::auth::entities::{
    AuthenticatedUserRow, ClubContextRow, LoginUserRow, SessionIdentityRow,
};
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
                database_error(
                    "AUTH_SESSION_QUERY_PREPARATION_FAILED",
                    "The authentication session query could not be prepared.",
                    error,
                )
            })?;

        let session = statement
            .first::<SessionIdentityRow>(None)
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_SESSION_LOOKUP_FAILED",
                    "The authentication session could not be resolved.",
                    error,
                )
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
                    club_id
                FROM users
                WHERE id = ?
                  AND status = 'ACTIVE'
                LIMIT 1
                "#,
            )
            .bind(&[JsValue::from_str(user_id)])
            .map_err(|error| {
                database_error(
                    "AUTH_USER_QUERY_PREPARATION_FAILED",
                    "The authenticated-user query could not be prepared.",
                    error,
                )
            })?;

        statement
            .first::<AuthenticatedUserRow>(None)
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_USER_LOOKUP_FAILED",
                    "The authenticated user could not be resolved.",
                    error,
                )
            })
    }

    pub async fn find_login_user(&self, email: &str) -> Result<Option<LoginUserRow>, ApiError> {
        let statement = self
            .database
            .inner()
            .prepare(
                r#"
                SELECT
                    id,
                    email,
                    password_hash,
                    first_name,
                    last_name,
                    role,
                    club_id
                FROM users
                WHERE lower(email) = lower(?)
                  AND status = 'ACTIVE'
                LIMIT 1
                "#,
            )
            .bind(&[JsValue::from_str(email)])
            .map_err(|error| {
                database_error(
                    "AUTH_LOGIN_USER_QUERY_PREPARATION_FAILED",
                    "The login-user query could not be prepared.",
                    error,
                )
            })?;

        statement
            .first::<LoginUserRow>(None)
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_LOGIN_USER_LOOKUP_FAILED",
                    "The login user could not be resolved.",
                    error,
                )
            })
    }

    pub async fn create_session(
        &self,
        session_id: &str,
        user_id: &str,
        token_hash: &str,
    ) -> Result<(), ApiError> {
        self.database
            .inner()
            .prepare(
                r#"
                INSERT INTO user_sessions (
                    id,
                    user_id,
                    token_hash,
                    expires_at,
                    created_at
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    date('now', '+7 days'),
                    datetime('now')
                )
                "#,
            )
            .bind(&[
                JsValue::from_str(session_id),
                JsValue::from_str(user_id),
                JsValue::from_str(token_hash),
            ])
            .map_err(|error| {
                database_error(
                    "AUTH_SESSION_CREATE_PREPARATION_FAILED",
                    "The session creation query could not be prepared.",
                    error,
                )
            })?
            .run()
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_SESSION_CREATE_FAILED",
                    "The authenticated session could not be created.",
                    error,
                )
            })?;

        Ok(())
    }

    pub async fn update_last_login(&self, user_id: &str) -> Result<(), ApiError> {
        self.database
            .inner()
            .prepare(
                r#"
                UPDATE users
                SET last_login_at = datetime('now')
                WHERE id = ?
                "#,
            )
            .bind(&[JsValue::from_str(user_id)])
            .map_err(|error| {
                database_error(
                    "AUTH_LAST_LOGIN_UPDATE_PREPARATION_FAILED",
                    "The last-login update query could not be prepared.",
                    error,
                )
            })?
            .run()
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_LAST_LOGIN_UPDATE_FAILED",
                    "The user's last-login timestamp could not be updated.",
                    error,
                )
            })?;

        Ok(())
    }

    pub async fn write_login_audit(
        &self,
        audit_id: &str,
        user_id: &str,
        email: &str,
    ) -> Result<(), ApiError> {
        let details = serde_json::json!({
            "email": email
        })
        .to_string();

        self.database
            .inner()
            .prepare(
                r#"
                INSERT INTO audit_logs (
                    id,
                    user_id,
                    action,
                    entity_type,
                    entity_id,
                    details,
                    created_at
                )
                VALUES (
                    ?,
                    ?,
                    'LOGIN',
                    'user',
                    ?,
                    ?,
                    datetime('now')
                )
                "#,
            )
            .bind(&[
                JsValue::from_str(audit_id),
                JsValue::from_str(user_id),
                JsValue::from_str(user_id),
                JsValue::from_str(&details),
            ])
            .map_err(|error| {
                database_error(
                    "AUTH_LOGIN_AUDIT_PREPARATION_FAILED",
                    "The login-audit query could not be prepared.",
                    error,
                )
            })?
            .run()
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_LOGIN_AUDIT_FAILED",
                    "The login audit event could not be recorded.",
                    error,
                )
            })?;

        Ok(())
    }

    pub async fn delete_session(&self, token_hash: &str) -> Result<(), ApiError> {
        self.database
            .inner()
            .prepare(
                r#"
                DELETE FROM user_sessions
                WHERE token_hash = ?
                "#,
            )
            .bind(&[JsValue::from_str(token_hash)])
            .map_err(|error| {
                database_error(
                    "AUTH_LOGOUT_QUERY_PREPARATION_FAILED",
                    "The logout query could not be prepared.",
                    error,
                )
            })?
            .run()
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_LOGOUT_FAILED",
                    "The authenticated session could not be revoked.",
                    error,
                )
            })?;

        Ok(())
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
                database_error(
                    "AUTH_CLUB_QUERY_PREPARATION_FAILED",
                    "The club-context query could not be prepared.",
                    error,
                )
            })?;

        statement
            .first::<ClubContextRow>(None)
            .await
            .map_err(|error| {
                database_error(
                    "AUTH_CLUB_LOOKUP_FAILED",
                    "The authenticated user's club could not be resolved.",
                    error,
                )
            })
    }
}

fn database_error(code: &'static str, message: &'static str, error: impl ToString) -> ApiError {
    ApiError::internal(code, message).with_details(serde_json::json!({
        "workerMessage": error.to_string()
    }))
}
