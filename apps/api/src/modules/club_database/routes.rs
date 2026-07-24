use worker::{Env, Request, Response, Result};

use crate::modules::club_database::service::ClubDatabaseService;
use crate::shared::api_response;
use crate::shared::request_context::RequestContext;

pub async fn context(request: &Request, context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match ClubDatabaseService::from_env(env) {
        Ok(service) => match service.resolve_for_request(request, env).await {
            Ok(data) => api_response::success(context, data),
            Err(error) => api_response::error(context, error),
        },
        Err(error) => api_response::error(context, error),
    };

    response
}
