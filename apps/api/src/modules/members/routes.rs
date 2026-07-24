use worker::{Env, Request, Response, Result};

use crate::modules::members::service::MembersService;
use crate::shared::api_response;
use crate::shared::request_context::RequestContext;

pub async fn list(request: &Request, context: &RequestContext, env: &Env) -> Result<Response> {
    match MembersService::list(request, env).await {
        Ok(members) => api_response::success(context, members),
        Err(error) => api_response::error(context, error),
    }
}
