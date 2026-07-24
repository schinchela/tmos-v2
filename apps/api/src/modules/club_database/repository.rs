use wasm_bindgen::JsValue;

use crate::modules::club_database::entities::ClubDatabaseMappingRow;
use crate::shared::api_error::ApiError;
use crate::shared::database::platform_database::PlatformDatabase;

pub struct ClubDatabaseRepository {
    database: PlatformDatabase,
}

impl ClubDatabaseRepository {
    pub fn new(database: PlatformDatabase) -> Self {
        Self { database }
    }

    pub async fn find_mapping(
        &self,
        club_id: &str,
    ) -> Result<Option<ClubDatabaseMappingRow>, ApiError> {
        let statement = self
            .database
            .inner()
            .prepare(
                r#"
                SELECT
                    c.id AS club_id,
                    c.name AS club_name,
                    c.slug AS club_slug,
                    c.status AS club_status,
                    c.database_name AS club_database_name,
                    cd.id AS mapping_id,
                    cd.database_name AS mapped_database_name,
                    cd.database_identifier AS database_identifier,
                    cd.status AS mapping_status
                FROM clubs c
                LEFT JOIN club_databases cd
                    ON cd.club_id = c.id
                WHERE c.id = ?
                LIMIT 1
                "#,
            )
            .bind(&[JsValue::from_str(club_id)])
            .map_err(|error| {
                database_error(
                    "CLUB_DATABASE_QUERY_PREPARATION_FAILED",
                    "The club-database mapping query could not be prepared.",
                    error,
                )
            })?;

        statement
            .first::<ClubDatabaseMappingRow>(None)
            .await
            .map_err(|error| {
                database_error(
                    "CLUB_DATABASE_LOOKUP_FAILED",
                    "The club-database mapping could not be resolved.",
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
