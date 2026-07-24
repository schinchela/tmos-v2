use serde::{Deserialize, Serialize};

use crate::shared::api_error::ApiError;

use super::platform_database::PlatformDatabase;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DatabaseProbe {
    pub database_time: String,
    pub probe_value: i32,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PlatformTable {
    pub name: String,
}

pub struct PlatformRepository {
    database: PlatformDatabase,
}

impl PlatformRepository {
    pub fn new(database: PlatformDatabase) -> Self {
        Self { database }
    }

    pub async fn probe(&self) -> Result<DatabaseProbe, ApiError> {
        let statement = self.database.inner().prepare(
            r#"
            SELECT
                datetime('now') AS database_time,
                1 AS probe_value
            "#,
        );

        statement
            .first::<DatabaseProbe>(None)
            .await
            .map_err(|error| {
                ApiError::internal(
                    "PLATFORM_DATABASE_PROBE_FAILED",
                    "The platform database health check failed.",
                )
                .with_details(serde_json::json!({
                    "workerMessage": error.to_string()
                }))
            })?
            .ok_or_else(|| {
                ApiError::internal(
                    "PLATFORM_DATABASE_PROBE_EMPTY",
                    "The platform database returned no health-check result.",
                )
            })
    }

    pub async fn list_tables(&self) -> Result<Vec<PlatformTable>, ApiError> {
        let statement = self.database.inner().prepare(
            r#"
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name NOT LIKE 'sqlite_%'
            ORDER BY name ASC
            "#,
        );

        let result = statement.all().await.map_err(|error| {
            ApiError::internal(
                "PLATFORM_SCHEMA_INSPECTION_FAILED",
                "The platform database schema could not be inspected.",
            )
            .with_details(serde_json::json!({
                "workerMessage": error.to_string()
            }))
        })?;

        result.results::<PlatformTable>().map_err(|error| {
            ApiError::internal(
                "PLATFORM_SCHEMA_DESERIALIZATION_FAILED",
                "The platform schema result could not be read.",
            )
            .with_details(serde_json::json!({
                "workerMessage": error.to_string()
            }))
        })
    }
}
