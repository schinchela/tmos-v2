mod modules;
mod shared;

use worker::{event, Context, Env, Method, Request, Response, Result};

use shared::api_error::ApiError;
use shared::request_context::RequestContext;

async fn route_request(
    request: &mut Request,
    env: &Env,
    context: &RequestContext,
) -> Result<Response> {
    let path = request.path();

    match (request.method(), path.as_str()) {
        (Method::Get, "/api/health") => modules::health::health(context),

        (Method::Get, "/api/runtime") => modules::health::runtime(context, env),

        (Method::Get, "/api/health/database") => {
            modules::database_health::health(context, env).await
        }

        (Method::Get, "/api/platform/schema") => {
            modules::database_health::schema(context, env).await
        }

        (Method::Get, "/api/platform/inventory") => {
            modules::platform::routes::inventory(context, env).await
        }

        (Method::Post, "/api/auth/login") => {
            modules::auth::routes::login(request, context, env).await
        }

        (Method::Post, "/api/auth/logout") => {
            modules::auth::routes::logout(request, context, env).await
        }

        (Method::Get, "/api/auth/me") => modules::auth::routes::me(request, context, env).await,

        (Method::Get, "/api/club/context") => {
            modules::auth::routes::club_context(request, context, env).await
        }

        (Method::Get, "/api/club/database-context") => {
            modules::club_database::routes::context(request, context, env).await
        }

        _ => shared::api_response::error(
            context,
            ApiError::not_found(
                "ROUTE_NOT_FOUND",
                format!("No TMOS API route matches {} {}.", request.method(), path),
            ),
        ),
    }
}

#[event(fetch)]
async fn fetch(mut request: Request, env: Env, _ctx: Context) -> Result<Response> {
    let request_context = RequestContext::from_request(&request);

    if request.method() == Method::Options {
        return shared::cors::preflight(&request, &env);
    }

    let response = match route_request(&mut request, &env, &request_context).await {
        Ok(response) => response,

        Err(error) => shared::api_response::error(&request_context, ApiError::from(error))?,
    };

    shared::cors::apply(response, &request, &env, &request_context.request_id)
}
