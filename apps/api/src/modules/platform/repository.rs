use crate::modules::platform::entities::{PlatformInventory, TableCountRow};
use crate::shared::api_error::ApiError;
use crate::shared::database::platform_database::PlatformDatabase;

pub struct PlatformInventoryRepository {
    database: PlatformDatabase,
}

impl PlatformInventoryRepository {
    pub fn new(database: PlatformDatabase) -> Self {
        Self { database }
    }

    async fn count_table(&self, table_name: &'static str) -> Result<i64, ApiError> {
        let sql = match table_name {
            "users" => "SELECT COUNT(*) AS row_count FROM users",
            "user_sessions" => "SELECT COUNT(*) AS row_count FROM user_sessions",
            "clubs" => "SELECT COUNT(*) AS row_count FROM clubs",
            "club_databases" => "SELECT COUNT(*) AS row_count FROM club_databases",
            "audit_logs" => "SELECT COUNT(*) AS row_count FROM audit_logs",
            "roles" => "SELECT COUNT(*) AS row_count FROM roles",
            "permissions" => "SELECT COUNT(*) AS row_count FROM permissions",
            "provisioning_jobs" => "SELECT COUNT(*) AS row_count FROM provisioning_jobs",
            _ => {
                return Err(ApiError::bad_request(
                    "UNSUPPORTED_PLATFORM_TABLE",
                    "The requested platform table is not supported.",
                ));
            }
        };

        let row = self
            .database
            .inner()
            .prepare(sql)
            .first::<TableCountRow>(None)
            .await
            .map_err(|error| {
                ApiError::internal(
                    "PLATFORM_TABLE_COUNT_FAILED",
                    format!("Could not count rows in platform table {table_name}."),
                )
                .with_details(serde_json::json!({
                    "table": table_name,
                    "workerMessage": error.to_string()
                }))
            })?
            .ok_or_else(|| {
                ApiError::internal(
                    "PLATFORM_TABLE_COUNT_EMPTY",
                    format!("No row count was returned for {table_name}."),
                )
            })?;

        Ok(row.row_count)
    }

    pub async fn inventory(&self) -> Result<PlatformInventory, ApiError> {
        Ok(PlatformInventory {
            users: self.count_table("users").await?,
            user_sessions: self.count_table("user_sessions").await?,
            clubs: self.count_table("clubs").await?,
            club_databases: self.count_table("club_databases").await?,
            audit_logs: self.count_table("audit_logs").await?,
            roles: self.count_table("roles").await?,
            permissions: self.count_table("permissions").await?,
            provisioning_jobs: self.count_table("provisioning_jobs").await?,
        })
    }
}
