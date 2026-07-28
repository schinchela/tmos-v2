use uuid::Uuid;
use worker::{Env, Request};

use crate::modules::club_database::gateway::ClubD1Gateway;
use crate::modules::club_database::service::ClubDatabaseService;
use crate::modules::members::entities::{
    CreateMemberRequest, ExistingMemberRow, MemberProfile, MemberRow, MemberSummary,
};
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

const CREATE_MEMBER_SQL: &str = r#"
    INSERT INTO members (
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
        mentor_member_id,
        sponsor_member_id,
        pathway_name,
        pathway_level,
        active_officer_role,
        notes,
        created_at,
        updated_at
    )
    VALUES (
        ?1,
        ?2,
        ?3,
        ?4,
        ?5,
        ?6,
        ?7,
        ?8,
        ?9,
        ?10,
        ?11,
        ?12,
        ?13,
        ?14,
        ?15,
        ?16,
        ?17,
        ?18,
        ?19,
        datetime('now'),
        datetime('now')
    )
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

        find_member_by_id(
            &gateway,
            &database.database_identifier,
            normalized_member_id,
        )
        .await
    }

    pub async fn create(
        request: &Request,
        env: &Env,
        payload: CreateMemberRequest,
    ) -> Result<MemberProfile, ApiError> {
        let normalized = NormalizedCreateMember::try_from(payload)?;

        let database_service = ClubDatabaseService::from_env(env)?;

        let database = database_service
            .resolve_internal_for_request(request, env)
            .await?;

        let gateway = ClubD1Gateway::from_env(env)?;

        ensure_unique_member_fields(&gateway, &database.database_identifier, &normalized).await?;

        let member_id = format!("member_{}", Uuid::new_v4());

        gateway
            .execute_insert_with_params(
                &database.database_identifier,
                CREATE_MEMBER_SQL,
                vec![
                    serde_json::json!(member_id),
                    optional_json(&normalized.member_number),
                    optional_json(&normalized.toastmasters_id),
                    serde_json::json!(normalized.first_name),
                    serde_json::json!(normalized.last_name),
                    serde_json::json!(normalized.display_name),
                    optional_json(&normalized.recognition_suffix),
                    optional_json(&normalized.email),
                    optional_json(&normalized.phone),
                    optional_json(&normalized.membership_type),
                    serde_json::json!(normalized.membership_status),
                    optional_json(&normalized.join_date),
                    optional_json(&normalized.renewal_date),
                    optional_json(&normalized.mentor_member_id),
                    optional_json(&normalized.sponsor_member_id),
                    optional_json(&normalized.pathway_name),
                    serde_json::json!(normalized.pathway_level),
                    optional_json(&normalized.active_officer_role),
                    optional_json(&normalized.notes),
                ],
            )
            .await?;

        find_member_by_id(&gateway, &database.database_identifier, &member_id).await
    }
}

#[derive(Debug)]
struct NormalizedCreateMember {
    member_number: Option<String>,
    toastmasters_id: Option<String>,
    first_name: String,
    last_name: String,
    display_name: String,
    recognition_suffix: Option<String>,
    email: Option<String>,
    phone: Option<String>,
    membership_type: Option<String>,
    membership_status: String,
    join_date: Option<String>,
    renewal_date: Option<String>,
    mentor_member_id: Option<String>,
    sponsor_member_id: Option<String>,
    pathway_name: Option<String>,
    pathway_level: i32,
    active_officer_role: Option<String>,
    notes: Option<String>,
}

impl TryFrom<CreateMemberRequest> for NormalizedCreateMember {
    type Error = ApiError;

    fn try_from(payload: CreateMemberRequest) -> Result<Self, Self::Error> {
        let first_name = required_text("firstName", payload.first_name, 100)?;

        let last_name = required_text("lastName", payload.last_name, 100)?;

        let display_name = clean_optional(payload.display_name, 200, "displayName")?
            .unwrap_or_else(|| format!("{first_name} {last_name}"));

        let email = clean_optional(payload.email, 254, "email")?.map(|value| value.to_lowercase());

        if let Some(value) = &email {
            validate_email(value)?;
        }

        let join_date = clean_optional(payload.join_date, 10, "joinDate")?;

        let renewal_date = clean_optional(payload.renewal_date, 10, "renewalDate")?;

        if let Some(value) = &join_date {
            validate_date("joinDate", value)?;
        }

        if let Some(value) = &renewal_date {
            validate_date("renewalDate", value)?;
        }

        let pathway_level = payload.pathway_level.unwrap_or(0);

        if !(0..=5).contains(&pathway_level) {
            return Err(validation_error(
                "pathwayLevel",
                "Pathway level must be between 0 and 5.",
            ));
        }

        let membership_status = clean_optional(payload.membership_status, 50, "membershipStatus")?
            .unwrap_or_else(|| "ACTIVE".to_string())
            .to_uppercase();

        Ok(Self {
            member_number: clean_optional(payload.member_number, 100, "memberNumber")?,
            toastmasters_id: clean_optional(payload.toastmasters_id, 100, "toastmastersId")?,
            first_name,
            last_name,
            display_name,
            recognition_suffix: clean_optional(
                payload.recognition_suffix,
                100,
                "recognitionSuffix",
            )?,
            email,
            phone: clean_optional(payload.phone, 50, "phone")?,
            membership_type: clean_optional(payload.membership_type, 100, "membershipType")?,
            membership_status,
            join_date,
            renewal_date,
            mentor_member_id: clean_optional(payload.mentor_member_id, 200, "mentorMemberId")?,
            sponsor_member_id: clean_optional(payload.sponsor_member_id, 200, "sponsorMemberId")?,
            pathway_name: clean_optional(payload.pathway_name, 200, "pathwayName")?,
            pathway_level,
            active_officer_role: clean_optional(
                payload.active_officer_role,
                200,
                "activeOfficerRole",
            )?,
            notes: clean_optional(payload.notes, 5_000, "notes")?,
        })
    }
}

async fn find_member_by_id(
    gateway: &ClubD1Gateway,
    database_identifier: &str,
    member_id: &str,
) -> Result<MemberProfile, ApiError> {
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
            database_identifier,
            &sql,
            vec![serde_json::json!(member_id)],
        )
        .await?;

    let member = rows.into_iter().next().ok_or_else(|| {
        ApiError::not_found(
            "MEMBER_NOT_FOUND",
            "The requested member could not be found.",
        )
        .with_details(serde_json::json!({
            "memberId": member_id
        }))
    })?;

    Ok(MemberProfile::from(member))
}

async fn ensure_unique_member_fields(
    gateway: &ClubD1Gateway,
    database_identifier: &str,
    member: &NormalizedCreateMember,
) -> Result<(), ApiError> {
    if let Some(member_number) = &member.member_number {
        ensure_unique_value(
            gateway,
            database_identifier,
            "member_number",
            member_number,
            "MEMBER_NUMBER_EXISTS",
            "A member with this member number already exists.",
            "memberNumber",
        )
        .await?;
    }

    if let Some(toastmasters_id) = &member.toastmasters_id {
        ensure_unique_value(
            gateway,
            database_identifier,
            "toastmasters_id",
            toastmasters_id,
            "MEMBER_TOASTMASTERS_ID_EXISTS",
            "A member with this Toastmasters ID already exists.",
            "toastmastersId",
        )
        .await?;
    }

    if let Some(email) = &member.email {
        ensure_unique_value(
            gateway,
            database_identifier,
            "email",
            email,
            "MEMBER_EMAIL_EXISTS",
            "A member with this email address already exists.",
            "email",
        )
        .await?;
    }

    Ok(())
}

async fn ensure_unique_value(
    gateway: &ClubD1Gateway,
    database_identifier: &str,
    column: &str,
    value: &str,
    error_code: &str,
    error_message: &str,
    field_name: &str,
) -> Result<(), ApiError> {
    let sql = match column {
        "member_number" => {
            r#"
                SELECT id
                FROM members
                WHERE lower(member_number) = lower(?1)
                  AND archived_at IS NULL
                LIMIT 1
            "#
        }
        "toastmasters_id" => {
            r#"
                SELECT id
                FROM members
                WHERE lower(toastmasters_id) = lower(?1)
                  AND archived_at IS NULL
                LIMIT 1
            "#
        }
        "email" => {
            r#"
                SELECT id
                FROM members
                WHERE lower(email) = lower(?1)
                  AND archived_at IS NULL
                LIMIT 1
            "#
        }
        _ => {
            return Err(ApiError::internal(
                "MEMBER_DUPLICATE_CHECK_INVALID",
                "The member duplicate check was configured incorrectly.",
            ));
        }
    };

    let rows = gateway
        .execute_read_rows_with_params::<ExistingMemberRow>(
            database_identifier,
            sql,
            vec![serde_json::json!(value)],
        )
        .await?;

    if let Some(existing) = rows.into_iter().next() {
        return Err(ApiError::conflict(error_code, error_message).with_details(
            serde_json::json!({
                "field": field_name,
                "existingMemberId": existing.id
            }),
        ));
    }

    Ok(())
}

fn required_text(field: &str, value: String, max_length: usize) -> Result<String, ApiError> {
    let trimmed = value.trim();

    if trimmed.is_empty() {
        return Err(validation_error(field, "This field is required."));
    }

    if trimmed.chars().count() > max_length {
        return Err(validation_error(
            field,
            format!("This field cannot exceed {max_length} characters."),
        ));
    }

    Ok(trimmed.to_string())
}

fn clean_optional(
    value: Option<String>,
    max_length: usize,
    field: &str,
) -> Result<Option<String>, ApiError> {
    let Some(value) = value else {
        return Ok(None);
    };

    let trimmed = value.trim();

    if trimmed.is_empty() {
        return Ok(None);
    }

    if trimmed.chars().count() > max_length {
        return Err(validation_error(
            field,
            format!("This field cannot exceed {max_length} characters."),
        ));
    }

    Ok(Some(trimmed.to_string()))
}

fn validate_email(value: &str) -> Result<(), ApiError> {
    let has_single_at = value.matches('@').count() == 1;

    let valid_parts = value
        .split_once('@')
        .map(|(local, domain)| {
            !local.is_empty()
                && domain.contains('.')
                && !domain.starts_with('.')
                && !domain.ends_with('.')
        })
        .unwrap_or(false);

    if !has_single_at || !valid_parts {
        return Err(validation_error("email", "Enter a valid email address."));
    }

    Ok(())
}

fn validate_date(field: &str, value: &str) -> Result<(), ApiError> {
    let bytes = value.as_bytes();

    let valid_shape = bytes.len() == 10
        && bytes[4] == b'-'
        && bytes[7] == b'-'
        && bytes
            .iter()
            .enumerate()
            .all(|(index, byte)| index == 4 || index == 7 || byte.is_ascii_digit());

    if !valid_shape {
        return Err(validation_error(
            field,
            "Enter a date in YYYY-MM-DD format.",
        ));
    }

    let month = value[5..7].parse::<u32>().unwrap_or(0);

    let day = value[8..10].parse::<u32>().unwrap_or(0);

    if !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return Err(validation_error(field, "Enter a valid calendar date."));
    }

    Ok(())
}

fn validation_error(field: &str, message: impl Into<String>) -> ApiError {
    let message = message.into();

    ApiError::bad_request(
        "MEMBER_VALIDATION_FAILED",
        "The member information is invalid.",
    )
    .with_details(serde_json::json!({
        "field": field,
        "message": message
    }))
}

fn optional_json(value: &Option<String>) -> serde_json::Value {
    value
        .as_ref()
        .map(|value| serde_json::json!(value))
        .unwrap_or(serde_json::Value::Null)
}

#[cfg(test)]
mod tests {
    use super::{validate_date, validate_email, NormalizedCreateMember};
    use crate::modules::members::entities::CreateMemberRequest;

    fn valid_request() -> CreateMemberRequest {
        CreateMemberRequest {
            member_number: None,
            toastmasters_id: Some("PN-12345678".to_string()),
            first_name: "  Sanghamitra  ".to_string(),
            last_name: "  Behera ".to_string(),
            display_name: None,
            recognition_suffix: None,
            email: Some(" MEMBER@EXAMPLE.COM ".to_string()),
            phone: None,
            membership_type: Some("Member".to_string()),
            membership_status: None,
            join_date: Some("2026-07-25".to_string()),
            renewal_date: None,
            mentor_member_id: None,
            sponsor_member_id: None,
            pathway_name: None,
            pathway_level: None,
            active_officer_role: None,
            notes: None,
        }
    }

    #[test]
    fn normalizes_create_request() {
        let normalized =
            NormalizedCreateMember::try_from(valid_request()).expect("request should normalize");

        assert_eq!(normalized.first_name, "Sanghamitra");
        assert_eq!(normalized.last_name, "Behera");
        assert_eq!(normalized.display_name, "Sanghamitra Behera");
        assert_eq!(normalized.email.as_deref(), Some("member@example.com"));
        assert_eq!(normalized.membership_status, "ACTIVE");
        assert_eq!(normalized.pathway_level, 0);
    }

    #[test]
    fn rejects_missing_first_name() {
        let mut request = valid_request();

        request.first_name = "   ".to_string();

        let result = NormalizedCreateMember::try_from(request);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "MEMBER_VALIDATION_FAILED");
    }

    #[test]
    fn validates_email_shape() {
        assert!(validate_email("member@example.com").is_ok());

        assert!(validate_email("invalid-email").is_err());
    }

    #[test]
    fn validates_date_shape() {
        assert!(validate_date("joinDate", "2026-07-25").is_ok());

        assert!(validate_date("joinDate", "25-07-2026").is_err());
    }

    #[test]
    fn rejects_pathway_level_over_five() {
        let mut request = valid_request();

        request.pathway_level = Some(6);

        let result = NormalizedCreateMember::try_from(request);

        assert!(result.is_err());
    }
}
