use serde::Serialize;
use worker::{Headers, Response, Result};

use super::api_error::{ApiError, ApiErrorBody};
use super::request_context::RequestContext;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ResponseMeta {
    request_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SuccessEnvelope<T>
where
    T: Serialize,
{
    success: bool,
    data: T,
    meta: ResponseMeta,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorEnvelope {
    success: bool,
    error: ApiErrorBody,
    meta: ResponseMeta,
}

fn json_headers() -> Result<Headers> {
    let headers = Headers::new();
    headers.set("Content-Type", "application/json; charset=utf-8")?;
    headers.set("Cache-Control", "no-store")?;
    Ok(headers)
}

pub fn success<T>(context: &RequestContext, data: T) -> Result<Response>
where
    T: Serialize,
{
    success_with_status(context, data, 200)
}

pub fn success_with_status<T>(context: &RequestContext, data: T, status: u16) -> Result<Response>
where
    T: Serialize,
{
    let envelope = SuccessEnvelope {
        success: true,
        data,
        meta: ResponseMeta {
            request_id: context.request_id.clone(),
        },
    };

    Ok(Response::from_json(&envelope)?
        .with_status(status)
        .with_headers(json_headers()?))
}

pub fn error(context: &RequestContext, api_error: ApiError) -> Result<Response> {
    let envelope = ErrorEnvelope {
        success: false,
        error: ApiErrorBody {
            code: api_error.code,
            message: api_error.message,
            details: api_error.details,
        },
        meta: ResponseMeta {
            request_id: context.request_id.clone(),
        },
    };

    Ok(Response::from_json(&envelope)?
        .with_status(api_error.status)
        .with_headers(json_headers()?))
}
