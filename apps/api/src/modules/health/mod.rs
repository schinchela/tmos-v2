use serde::Serialize;
use worker::{Env, Response, Result};

use crate::shared::api_response;
use crate::shared::request_context::RequestContext;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct HealthData {
    status: &'static str,
    service: &'static str,
    version: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeData {
    service: &'static str,
    version: &'static str,
    runtime: &'static str,
    environment: String,
    database_binding: &'static str,
}

pub fn health(context: &RequestContext) -> Result<Response> {
    api_response::success(
        context,
        HealthData {
            status: "ok",
            service: "tmos-api",
            version: env!("CARGO_PKG_VERSION"),
        },
    )
}

pub fn runtime(context: &RequestContext, env: &Env) -> Result<Response> {
    let environment = env
        .var("APP_ENV")
        .map(|value| value.to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    api_response::success(
        context,
        RuntimeData {
            service: "tmos-api",
            version: env!("CARGO_PKG_VERSION"),
            runtime: "cloudflare-workers-rust",
            environment,
            database_binding: "DB",
        },
    )
}
