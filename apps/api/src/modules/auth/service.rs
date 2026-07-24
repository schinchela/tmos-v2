use sha2::{Digest, Sha256};
use subtle::ConstantTimeEq;
use uuid::Uuid;
use worker::{Env, Request};

use crate::modules::auth::entities::{
    AuthenticatedUser, ClubContext, ClubContextResponse, LoginRequest, LoginResponse,
    LogoutResponse,
};
use crate::modules::auth::repository::AuthRepository;
use crate::shared::api_error::ApiError;
use crate::shared::database::platform_database::PlatformDatabase;

pub struct AuthService {
    repository: AuthRepository,
}

impl AuthService {
    pub fn from_env(env: &Env) -> Result<Self, ApiError> {
        let database = PlatformDatabase::from_env(env)?;

        Ok(Self {
            repository: AuthRepository::new(database),
        })
    }

    pub async fn login(&self, request: LoginRequest) -> Result<LoginResponse, ApiError> {
        let email = request.email.trim().to_lowercase();
        self.repository.delete_expired_sessions().await?;

        if email.is_empty() || request.password.is_empty() {
            return Err(invalid_credentials());
        }

        let user = self
            .repository
            .find_login_user(&email)
            .await?
            .ok_or_else(invalid_credentials)?;

        let stored_password = user
            .password_hash
            .as_deref()
            .filter(|value| *value != "TEMP_RESET_REQUIRED")
            .ok_or_else(invalid_credentials)?;

        verify_legacy_password(&request.password, stored_password)?;

        self.repository.delete_expired_sessions().await?;
        let raw_token = format!("{}.{}", Uuid::new_v4(), Uuid::new_v4());
        let token_hash = sha256_hex(&raw_token);

        let session_id = format!("session_{}", Uuid::new_v4());
        let audit_id = format!("audit_{}", Uuid::new_v4());

        self.repository
            .create_session(&session_id, &user.id, &token_hash)
            .await?;

        self.repository.update_last_login(&user.id).await?;

        self.repository
            .write_login_audit(&audit_id, &user.id, &user.email)
            .await?;

        Ok(LoginResponse {
            token: raw_token,
            user: AuthenticatedUser::from(&user),
        })
    }

    pub async fn logout(&self, request: &Request) -> Result<LogoutResponse, ApiError> {
        let Some(raw_token) = optional_bearer_token(request)? else {
            return Ok(LogoutResponse { logged_out: true });
        };

        let token_hash = sha256_hex(&raw_token);

        let user_id = self
            .repository
            .find_valid_session_user_id(&token_hash)
            .await?;

        self.repository.delete_session(&token_hash).await?;

        if let Some(user_id) = user_id {
            let audit_id = format!("audit_{}", Uuid::new_v4());

            self.repository
                .write_logout_audit(&audit_id, &user_id)
                .await?;
        }

        Ok(LogoutResponse { logged_out: true })
    }

    pub async fn current_user(&self, request: &Request) -> Result<AuthenticatedUser, ApiError> {
        let raw_token = bearer_token(request)?;
        let token_hash = sha256_hex(&raw_token);

        let user_id = self
            .repository
            .find_valid_session_user_id(&token_hash)
            .await?
            .ok_or_else(unauthorized)?;

        let user = self
            .repository
            .find_active_user(&user_id)
            .await?
            .ok_or_else(unauthorized)?;

        Ok(user.into())
    }

    pub async fn club_context(&self, request: &Request) -> Result<ClubContextResponse, ApiError> {
        let user = self.current_user(request).await?;

        let club_id = user.club_id.clone().ok_or_else(|| {
            ApiError::bad_request(
                "AUTH_CLUB_NOT_ASSIGNED",
                "No club is assigned to this user.",
            )
        })?;

        let club = self.repository.find_club(&club_id).await?.ok_or_else(|| {
            ApiError::not_found(
                "AUTH_CLUB_NOT_FOUND",
                "The club assigned to this user was not found.",
            )
        })?;

        Ok(ClubContextResponse {
            user,
            club: ClubContext::from(club),
        })
    }
}

fn verify_legacy_password(password: &str, stored_password: &str) -> Result<(), ApiError> {
    let (salt, saved_hash) = stored_password
        .split_once(':')
        .ok_or_else(invalid_credentials)?;

    if salt.is_empty() || saved_hash.is_empty() {
        return Err(invalid_credentials());
    }

    let attempted_hash = sha256_hex(&format!("{salt}:{password}"));

    let matches: bool = attempted_hash
        .as_bytes()
        .ct_eq(saved_hash.as_bytes())
        .into();

    if !matches {
        return Err(invalid_credentials());
    }

    Ok(())
}

fn optional_bearer_token(request: &Request) -> Result<Option<String>, ApiError> {
    let authorization = request
        .headers()
        .get("Authorization")
        .map_err(|error| {
            ApiError::internal(
                "AUTH_HEADER_READ_FAILED",
                "The Authorization header could not be read.",
            )
            .with_details(serde_json::json!({
                "workerMessage": error.to_string()
            }))
        })?
        .unwrap_or_default();

    if authorization.is_empty() {
        return Ok(None);
    }

    let token = authorization
        .strip_prefix("Bearer ")
        .map(str::trim)
        .filter(|value| !value.is_empty());

    Ok(token.map(str::to_string))
}

fn bearer_token(request: &Request) -> Result<String, ApiError> {
    optional_bearer_token(request)?.ok_or_else(unauthorized)
}

fn sha256_hex(value: &str) -> String {
    let digest = Sha256::digest(value.as_bytes());
    hex::encode(digest)
}

fn unauthorized() -> ApiError {
    ApiError::unauthorized(
        "AUTH_UNAUTHORIZED",
        "A valid authenticated session is required.",
    )
}

fn invalid_credentials() -> ApiError {
    ApiError::unauthorized("AUTH_INVALID_CREDENTIALS", "Invalid email or password.")
}

#[cfg(test)]
mod tests {
    use super::{sha256_hex, verify_legacy_password};

    #[test]
    fn creates_lowercase_sha256_hex() {
        assert_eq!(
            sha256_hex("TMOS"),
            "1893c76823650bf62d1f14d05013d987c3fa3b30ae40d23a80ab47836ac7295c"
        );
    }

    #[test]
    fn validates_legacy_salted_password() {
        let salt = "example-salt";
        let stored = format!("{salt}:{}", sha256_hex("example-salt:secret"));

        assert!(verify_legacy_password("secret", &stored).is_ok());
        assert!(verify_legacy_password("wrong", &stored).is_err());
    }
}
