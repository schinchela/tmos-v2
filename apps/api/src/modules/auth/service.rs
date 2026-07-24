use sha2::{Digest, Sha256};
use worker::{Env, Request};

use crate::modules::auth::entities::{AuthenticatedUser, ClubContext, ClubContextResponse};
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

fn bearer_token(request: &Request) -> Result<String, ApiError> {
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

    let token = authorization
        .strip_prefix("Bearer ")
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(unauthorized)?;

    Ok(token.to_string())
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

#[cfg(test)]
mod tests {
    use super::sha256_hex;

    #[test]
    fn creates_lowercase_sha256_hex() {
        assert_eq!(
            sha256_hex("TMOS"),
            "1893c76823650bf62d1f14d05013d987c3fa3b30ae40d23a80ab47836ac7295c"
        );
    }
}
