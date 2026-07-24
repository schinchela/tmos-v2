use worker::{Env, Request};

use crate::modules::club_database::gateway::ClubD1Gateway;
use crate::modules::club_database::service::ClubDatabaseService;
use crate::modules::members::entities::{MemberRow, MemberSummary};
use crate::shared::api_error::ApiError;

const LIST_MEMBERS_SQL: &str = r#"
    SELECT
        id,
        member_number,
        toastmasters_id,
        first_name,
        last_name,
        display_name,
        recognition_suffix,
        email,
        phone,
        membership_type,
        membership_status,
        join_date,
        renewal_date,
        pathway_name,
        pathway_level,
        active_officer_role,
        created_at,
        updated_at
    FROM members
    WHERE archived_at IS NULL
    ORDER BY
        last_name COLLATE NOCASE ASC,
        first_name COLLATE NOCASE ASC,
        id ASC
"#;

pub struct MembersService;

impl MembersService {
    pub async fn list(request: &Request, env: &Env) -> Result<Vec<MemberSummary>, ApiError> {
        let database_service = ClubDatabaseService::from_env(env)?;

        let database = database_service
            .resolve_internal_for_request(request, env)
            .await?;

        let gateway = ClubD1Gateway::from_env(env)?;

        let rows = gateway
            .execute_read_rows::<MemberRow>(&database.database_identifier, LIST_MEMBERS_SQL)
            .await?;

        Ok(rows.into_iter().map(MemberSummary::from).collect())
    }
}
