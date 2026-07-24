use worker::{Env, Request, Response, Result};

use crate::modules::auth::entities::LoginRequest;
use crate::modules::auth::service::AuthService;
use crate::shared::api_error::ApiError;
use crate::shared::api_response;
use crate::shared::request_context::RequestContext;

pub async fn login(request: &mut Request, context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match parse_login_request(request).await {
        Ok(payload) => match AuthService::from_env(env) {
            Ok(service) => match service.login(payload).await {
                Ok(data) => api_response::success(context, data),
                Err(error) => api_response::error(context, error),
            },
            Err(error) => api_response::error(context, error),
        },
        Err(error) => api_response::error(context, error),
    };

    response
}

pub async fn logout(request: &Request, context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match AuthService::from_env(env) {
        Ok(service) => match service.logout(request).await {
            Ok(data) => api_response::success(context, data),
            Err(error) => api_response::error(context, error),
        },
        Err(error) => api_response::error(context, error),
    };

    response
}

pub async fn me(request: &Request, context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match AuthService::from_env(env) {
        Ok(service) => match service.current_user(request).await {
            Ok(user) => api_response::success(context, user),
            Err(error) => api_response::error(context, error),
        },
        Err(error) => api_response::error(context, error),
    };

    response
}

pub async fn club_context(
    request: &Request,
    context: &RequestContext,
    env: &Env,
) -> Result<Response> {
    let response = match AuthService::from_env(env) {
        Ok(service) => match service.club_context(request).await {
            Ok(data) => api_response::success(context, data),
            Err(error) => api_response::error(context, error),
        },
        Err(error) => api_response::error(context, error),
    };

    response
}

async fn parse_login_request(request: &mut Request) -> Result<LoginRequest, ApiError> {
    request.json::<LoginRequest>().await.map_err(|error| {
        ApiError::bad_request(
            "AUTH_INVALID_REQUEST_BODY",
            "The login request must contain a valid email and password.",
        )
        .with_details(serde_json::json!({
            "workerMessage": error.to_string()
        }))
    })
}
