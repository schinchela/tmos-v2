use worker::{D1Database, Env};

use crate::shared::api_error::ApiError;

const PLATFORM_DATABASE_BINDING: &str = "DB";

pub struct PlatformDatabase {
    database: D1Database,
}

impl PlatformDatabase {
    pub fn from_env(env: &Env) -> Result<Self, ApiError> {
        let database = env.d1(PLATFORM_DATABASE_BINDING).map_err(|error| {
            ApiError::internal(
                "PLATFORM_DATABASE_BINDING_UNAVAILABLE",
                "The platform database binding is unavailable.",
            )
            .with_details(serde_json::json!({
                "binding": PLATFORM_DATABASE_BINDING,
                "workerMessage": error.to_string()
            }))
        })?;

        Ok(Self { database })
    }

    pub fn inner(&self) -> &D1Database {
        &self.database
    }

    pub fn binding_name(&self) -> &'static str {
        PLATFORM_DATABASE_BINDING
    }
}
