use serde::Serialize;
use worker::{Env, Response, Result};

use crate::shared::api_response;
use crate::shared::database::platform_database::PlatformDatabase;
use crate::shared::database::platform_repository::{DatabaseProbe, PlatformRepository};
use crate::shared::request_context::RequestContext;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DatabaseHealthData {
    status: &'static str,
    binding: &'static str,
    database_time: String,
    probe_value: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PlatformSchemaData {
    table_count: usize,
    tables: Vec<String>,
}

pub async fn health(context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match database_health_data(env).await {
        Ok(data) => api_response::success(context, data),

        Err(error) => api_response::error(context, error),
    };

    response
}

pub async fn schema(context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match platform_schema_data(env).await {
        Ok(data) => api_response::success(context, data),

        Err(error) => api_response::error(context, error),
    };

    response
}

async fn database_health_data(
    env: &Env,
) -> Result<DatabaseHealthData, crate::shared::api_error::ApiError> {
    let database = PlatformDatabase::from_env(env)?;
    let binding = database.binding_name();
    let repository = PlatformRepository::new(database);

    let DatabaseProbe {
        database_time,
        probe_value,
    } = repository.probe().await?;

    Ok(DatabaseHealthData {
        status: "ok",
        binding,
        database_time,
        probe_value,
    })
}

async fn platform_schema_data(
    env: &Env,
) -> Result<PlatformSchemaData, crate::shared::api_error::ApiError> {
    let database = PlatformDatabase::from_env(env)?;
    let repository = PlatformRepository::new(database);

    let tables = repository.list_tables().await?;
    let table_names = tables
        .into_iter()
        .map(|table| table.name)
        .collect::<Vec<_>>();

    Ok(PlatformSchemaData {
        table_count: table_names.len(),
        tables: table_names,
    })
}
