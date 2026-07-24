use worker::{Env, Request};

use crate::modules::club_database::gateway::ClubD1Gateway;
use crate::modules::club_database::service::ClubDatabaseService;
use crate::modules::members::entities::{MemberProfile, MemberRow, MemberSummary};
use crate::shared::api_error::ApiError;

const MEMBER_COLUMNS_SQL: &str = r#"
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
"#;

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

    pub async fn get_by_id(
        request: &Request,
        env: &Env,
        member_id: &str,
    ) -> Result<MemberProfile, ApiError> {
        let normalized_member_id = member_id.trim();

        if normalized_member_id.is_empty() {
            return Err(ApiError::bad_request(
                "MEMBER_ID_REQUIRED",
                "A member identifier is required.",
            ));
        }

        let database_service = ClubDatabaseService::from_env(env)?;

        let database = database_service
            .resolve_internal_for_request(request, env)
            .await?;

        let gateway = ClubD1Gateway::from_env(env)?;

        let sql = format!(
            r#"
                SELECT
                    {MEMBER_COLUMNS_SQL}
                FROM members
                WHERE id = ?1
                  AND archived_at IS NULL
                LIMIT 1
            "#
        );

        let rows = gateway
            .execute_read_rows_with_params::<MemberRow>(
                &database.database_identifier,
                &sql,
                vec![serde_json::json!(normalized_member_id)],
            )
            .await?;

        let member = rows.into_iter().next().ok_or_else(|| {
            ApiError::not_found(
                "MEMBER_NOT_FOUND",
                "The requested member could not be found.",
            )
            .with_details(serde_json::json!({
                "memberId": normalized_member_id
            }))
        })?;

        Ok(MemberProfile::from(member))
    }
}

#[cfg(test)]
mod tests {
    use super::{LIST_MEMBERS_SQL, MEMBER_COLUMNS_SQL};

    #[test]
    fn list_query_excludes_archived_members() {
        assert!(LIST_MEMBERS_SQL.contains("archived_at IS NULL"));
    }

    #[test]
    fn detail_columns_include_member_identity_fields() {
        assert!(MEMBER_COLUMNS_SQL.contains("id"));
        assert!(MEMBER_COLUMNS_SQL.contains("toastmasters_id"));
        assert!(MEMBER_COLUMNS_SQL.contains("membership_status"));
    }
}
