use worker::{Env, Headers, Request, Response, Result};

const DEFAULT_ALLOWED_ORIGINS: &str =
    "http://localhost:5173,http://127.0.0.1:5173,https://tmos.rowepal.com";

fn configured_origins(env: &Env) -> String {
    env.var("ALLOWED_ORIGINS")
        .map(|value| value.to_string())
        .unwrap_or_else(|_| DEFAULT_ALLOWED_ORIGINS.to_string())
}

fn request_origin(request: &Request) -> Option<String> {
    request.headers().get("Origin").ok().flatten()
}

fn is_allowed_origin(origin: &str, env: &Env) -> bool {
    configured_origins(env)
        .split(',')
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .any(|allowed| allowed == origin)
}

fn build_cors_headers(request: &Request, env: &Env) -> Result<Headers> {
    let headers = Headers::new();

    if let Some(origin) = request_origin(request) {
        if is_allowed_origin(&origin, env) {
            headers.set("Access-Control-Allow-Origin", &origin)?;
            headers.set("Vary", "Origin")?;
        }
    }

    headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    )?;

    headers.set(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type, X-Request-ID",
    )?;

    headers.set("Access-Control-Expose-Headers", "X-Request-ID")?;

    headers.set("Access-Control-Max-Age", "86400")?;

    Ok(headers)
}

pub fn preflight(request: &Request, env: &Env) -> Result<Response> {
    Ok(Response::empty()?
        .with_status(204)
        .with_headers(build_cors_headers(request, env)?))
}

pub fn apply(
    mut response: Response,
    request: &Request,
    env: &Env,
    request_id: &str,
) -> Result<Response> {
    let cors_headers = build_cors_headers(request, env)?;

    for (name, value) in cors_headers.entries() {
        response.headers_mut().set(&name, &value)?;
    }

    response.headers_mut().set("X-Request-ID", request_id)?;

    response
        .headers_mut()
        .set("X-Content-Type-Options", "nosniff")?;

    response
        .headers_mut()
        .set("Referrer-Policy", "strict-origin-when-cross-origin")?;

    response.headers_mut().set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
    )?;

    Ok(response)
}
