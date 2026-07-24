use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct MemberRow {
    pub id: String,
    pub member_number: Option<String>,
    pub toastmasters_id: Option<String>,
    pub first_name: String,
    pub last_name: String,
    pub display_name: Option<String>,
    pub recognition_suffix: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub membership_type: Option<String>,
    pub membership_status: String,
    pub join_date: Option<String>,
    pub renewal_date: Option<String>,
    pub pathway_name: Option<String>,
    pub pathway_level: Option<i32>,
    pub active_officer_role: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MemberSummary {
    pub id: String,
    pub member_number: Option<String>,
    pub toastmasters_id: Option<String>,
    pub first_name: String,
    pub last_name: String,
    pub display_name: String,
    pub recognition_suffix: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub membership_type: Option<String>,
    pub membership_status: String,
    pub join_date: Option<String>,
    pub renewal_date: Option<String>,
    pub pathway_name: Option<String>,
    pub pathway_level: i32,
    pub active_officer_role: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<MemberRow> for MemberSummary {
    fn from(row: MemberRow) -> Self {
        let fallback_display_name = format!("{} {}", row.first_name.trim(), row.last_name.trim())
            .trim()
            .to_string();

        Self {
            id: row.id,
            member_number: row.member_number,
            toastmasters_id: row.toastmasters_id,
            first_name: row.first_name,
            last_name: row.last_name,
            display_name: row
                .display_name
                .filter(|value| !value.trim().is_empty())
                .unwrap_or(fallback_display_name),
            recognition_suffix: row.recognition_suffix,
            email: row.email,
            phone: row.phone,
            membership_type: row.membership_type,
            membership_status: row.membership_status,
            join_date: row.join_date,
            renewal_date: row.renewal_date,
            pathway_name: row.pathway_name,
            pathway_level: row.pathway_level.unwrap_or(0),
            active_officer_role: row.active_officer_role,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MembersList {
    pub members: Vec<MemberSummary>,
    pub total: usize,
}
