use worker::{Env, Request, Response, Result};

use crate::modules::auth::service::AuthService;
use crate::shared::api_response;
use crate::shared::request_context::RequestContext;

pub async fn me(request: &Request, context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match load_current_user(request, env).await {
        Ok(user) => api_response::success(context, user),
        Err(error) => api_response::error(context, error),
    };

    response
}

pub async fn club_context(
    request: &Request,
    context: &RequestContext,
    env: &Env,
) -> Result<Response> {
    let response = match load_club_context(request, env).await {
        Ok(data) => api_response::success(context, data),
        Err(error) => api_response::error(context, error),
    };

    response
}

async fn load_current_user(
    request: &Request,
    env: &Env,
) -> Result<crate::modules::auth::entities::AuthenticatedUser, crate::shared::api_error::ApiError> {
    let service = AuthService::from_env(env)?;
    service.current_user(request).await
}

async fn load_club_context(
    request: &Request,
    env: &Env,
) -> Result<crate::modules::auth::entities::ClubContextResponse, crate::shared::api_error::ApiError>
{
    let service = AuthService::from_env(env)?;
    service.club_context(request).await
}
