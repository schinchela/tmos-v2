use worker::{Env, Request, Response, Result};

use crate::modules::members::service::MembersService;
use crate::shared::api_response;
use crate::shared::request_context::RequestContext;

const MEMBER_DETAIL_PREFIX: &str = "/api/members/";

pub async fn list(request: &Request, context: &RequestContext, env: &Env) -> Result<Response> {
    match MembersService::list(request, env).await {
        Ok(members) => api_response::success(context, members),
        Err(error) => api_response::error(context, error),
    }
}

pub async fn detail(
    request: &Request,
    context: &RequestContext,
    env: &Env,
    member_id: &str,
) -> Result<Response> {
    match MembersService::get_by_id(request, env, member_id).await {
        Ok(member) => api_response::success(context, member),
        Err(error) => api_response::error(context, error),
    }
}

pub fn member_id_from_path(path: &str) -> Option<&str> {
    let member_id = path.strip_prefix(MEMBER_DETAIL_PREFIX)?;

    if member_id.is_empty()
        || member_id.trim().is_empty()
        || member_id.contains('/')
        || member_id.contains('?')
        || member_id.contains('#')
    {
        return None;
    }

    Some(member_id)
}

#[cfg(test)]
mod tests {
    use super::member_id_from_path;

    #[test]
    fn extracts_member_id_from_detail_route() {
        assert_eq!(
            member_id_from_path("/api/members/member_123"),
            Some("member_123")
        );
    }

    #[test]
    fn rejects_members_collection_route() {
        assert_eq!(member_id_from_path("/api/members"), None);
    }

    #[test]
    fn rejects_empty_member_id() {
        assert_eq!(member_id_from_path("/api/members/"), None);
    }

    #[test]
    fn rejects_nested_member_path() {
        assert_eq!(member_id_from_path("/api/members/member_123/history"), None);
    }
}
