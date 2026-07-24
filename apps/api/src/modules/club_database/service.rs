use uuid::Uuid;
use worker::{Env, Request};

use crate::modules::auth::service::AuthService;
use crate::modules::club_database::entities::{
    ClubDatabaseContext, ClubDatabaseMappingRow, ResolvedClubDatabase,
};
use crate::modules::club_database::repository::ClubDatabaseRepository;
use crate::shared::api_error::ApiError;
use crate::shared::database::platform_database::PlatformDatabase;

pub struct ClubDatabaseService {
    repository: ClubDatabaseRepository,
}

impl ClubDatabaseService {
    pub fn from_env(env: &Env) -> Result<Self, ApiError> {
        let database = PlatformDatabase::from_env(env)?;

        Ok(Self {
            repository: ClubDatabaseRepository::new(database),
        })
    }

    pub async fn resolve_for_request(
        &self,
        request: &Request,
        env: &Env,
    ) -> Result<ClubDatabaseContext, ApiError> {
        let resolved = self.resolve_internal_for_request(request, env).await?;

        Ok(ClubDatabaseContext::from(&resolved))
    }

    pub async fn resolve_internal_for_request(
        &self,
        request: &Request,
        env: &Env,
    ) -> Result<ResolvedClubDatabase, ApiError> {
        let auth_service = AuthService::from_env(env)?;
        let user = auth_service.current_user(request).await?;

        let club_id = user.club_id.ok_or_else(|| {
            ApiError::bad_request(
                "CLUB_DATABASE_CLUB_NOT_ASSIGNED",
                "No club is assigned to the authenticated user.",
            )
        })?;

        let mapping = self
            .repository
            .find_mapping(&club_id)
            .await?
            .ok_or_else(|| {
                ApiError::not_found(
                    "CLUB_DATABASE_CLUB_NOT_FOUND",
                    "The authenticated user's club was not found.",
                )
            })?;

        validate_mapping(mapping)
    }
}

fn validate_mapping(mapping: ClubDatabaseMappingRow) -> Result<ResolvedClubDatabase, ApiError> {
    if mapping.club_status != "ACTIVE" {
        return Err(ApiError::forbidden(
            "CLUB_DATABASE_CLUB_INACTIVE",
            "The authenticated user's club is not active.",
        ));
    }

    if mapping.mapping_id.is_none() {
        return Err(ApiError::not_found(
            "CLUB_DATABASE_MAPPING_NOT_FOUND",
            "No database mapping exists for the authenticated user's club.",
        ));
    }

    let mapped_database_name = mapping
        .mapped_database_name
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            ApiError::conflict(
                "CLUB_DATABASE_NAME_MISSING",
                "The club database mapping has no database name.",
            )
        })?;

    if mapped_database_name != mapping.club_database_name {
        return Err(ApiError::conflict(
            "CLUB_DATABASE_NAME_MISMATCH",
            "The club and mapping database names do not match.",
        ));
    }

    let mapping_status = mapping.mapping_status.as_deref().unwrap_or("UNKNOWN");

    if mapping_status != "ACTIVE" {
        return Err(ApiError::conflict(
            "CLUB_DATABASE_MAPPING_INACTIVE",
            "The club database mapping is not active.",
        ));
    }

    let identifier = mapping
        .database_identifier
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            ApiError::conflict(
                "CLUB_DATABASE_IDENTIFIER_MISSING",
                "The club database mapping has no database identifier.",
            )
        })?;

    if Uuid::parse_str(identifier).is_err() {
        return Err(ApiError::conflict(
            "CLUB_DATABASE_IDENTIFIER_INVALID",
            "The club database identifier is invalid.",
        ));
    }

    Ok(ResolvedClubDatabase {
        club_id: mapping.club_id,
        club_name: mapping.club_name,
        club_slug: mapping.club_slug,
        club_status: mapping.club_status,
        database_name: mapped_database_name.to_string(),
        database_identifier: identifier.to_string(),
        mapping_status: mapping_status.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::validate_mapping;
    use crate::modules::club_database::entities::ClubDatabaseMappingRow;

    fn valid_mapping() -> ClubDatabaseMappingRow {
        ClubDatabaseMappingRow {
            club_id: "club_test".to_string(),
            club_name: "Test Club".to_string(),
            club_slug: "test".to_string(),
            club_status: "ACTIVE".to_string(),
            club_database_name: "tmos-test".to_string(),
            mapping_id: Some("mapping_test".to_string()),
            mapped_database_name: Some("tmos-test".to_string()),
            database_identifier: Some("9579e68f-5abc-46aa-a380-b3ca52bec7fc".to_string()),
            mapping_status: Some("ACTIVE".to_string()),
        }
    }

    #[test]
    fn accepts_valid_mapping() {
        let result = validate_mapping(valid_mapping());

        assert!(result.is_ok());
        assert_eq!(result.unwrap().database_name, "tmos-test");
    }

    #[test]
    fn rejects_database_name_mismatch() {
        let mut mapping = valid_mapping();
        mapping.mapped_database_name = Some("tmos-different".to_string());

        let result = validate_mapping(mapping);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "CLUB_DATABASE_NAME_MISMATCH");
    }

    #[test]
    fn rejects_invalid_database_identifier() {
        let mut mapping = valid_mapping();
        mapping.database_identifier = Some("not-a-database-uuid".to_string());

        let result = validate_mapping(mapping);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "CLUB_DATABASE_IDENTIFIER_INVALID");
    }
}
