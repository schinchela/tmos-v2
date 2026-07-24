use worker::{Env, Request};

use crate::modules::club_database::cloudflare_entities::ClubDatabaseProbeRow;
use crate::modules::club_database::entities::ClubDatabaseHealth;
use crate::modules::club_database::gateway::ClubD1Gateway;
use crate::modules::club_database::service::ClubDatabaseService;
use crate::shared::api_error::ApiError;

pub async fn check(request: &Request, env: &Env) -> Result<ClubDatabaseHealth, ApiError> {
    let service = ClubDatabaseService::from_env(env)?;

    let database = service.resolve_internal_for_request(request, env).await?;

    let gateway = ClubD1Gateway::from_env(env)?;

    let response = gateway
        .execute_read_query(
            &database.database_identifier,
            r#"
            SELECT
                1 AS probe_value,
                datetime('now') AS database_time
            "#,
        )
        .await?;

    let first_result = response.result.into_iter().next().ok_or_else(|| {
        ApiError::internal(
            "CLUB_DATABASE_PROBE_RESULT_MISSING",
            "The club database probe returned no result set.",
        )
    })?;

    if !first_result.success {
        return Err(ApiError::internal(
            "CLUB_DATABASE_PROBE_UNSUCCESSFUL",
            "The club database probe was not successful.",
        ));
    }

    let row = first_result.results.into_iter().next().ok_or_else(|| {
        ApiError::internal(
            "CLUB_DATABASE_PROBE_ROW_MISSING",
            "The club database probe returned no row.",
        )
    })?;

    let probe: ClubDatabaseProbeRow = serde_json::from_value(row).map_err(|error| {
        ApiError::internal(
            "CLUB_DATABASE_PROBE_ROW_INVALID",
            "The club database probe returned an invalid row.",
        )
        .with_details(serde_json::json!({
            "workerMessage": error.to_string()
        }))
    })?;

    Ok(ClubDatabaseHealth {
        status: "ok".to_string(),
        club_id: database.club_id,
        club_name: database.club_name,
        database_name: database.database_name,
        database_time: probe.database_time,
        probe_value: probe.probe_value,
        gateway: "cloudflare-d1-rest".to_string(),
    })
}
