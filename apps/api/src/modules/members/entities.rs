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
pub struct MemberProfile {
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

impl From<MemberRow> for MemberProfile {
    fn from(row: MemberRow) -> Self {
        let summary = MemberSummary::from(row);

        Self {
            id: summary.id,
            member_number: summary.member_number,
            toastmasters_id: summary.toastmasters_id,
            first_name: summary.first_name,
            last_name: summary.last_name,
            display_name: summary.display_name,
            recognition_suffix: summary.recognition_suffix,
            email: summary.email,
            phone: summary.phone,
            membership_type: summary.membership_type,
            membership_status: summary.membership_status,
            join_date: summary.join_date,
            renewal_date: summary.renewal_date,
            pathway_name: summary.pathway_name,
            pathway_level: summary.pathway_level,
            active_officer_role: summary.active_officer_role,
            created_at: summary.created_at,
            updated_at: summary.updated_at,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MembersList {
    pub members: Vec<MemberSummary>,
    pub total: usize,
}

#[cfg(test)]
mod tests {
    use super::{MemberProfile, MemberRow, MemberSummary};

    fn member_row(display_name: Option<&str>, pathway_level: Option<i32>) -> MemberRow {
        MemberRow {
            id: "member_123".to_string(),
            member_number: Some("TMOS-001".to_string()),
            toastmasters_id: Some("1234567".to_string()),
            first_name: "Suketh".to_string(),
            last_name: "Chinchela".to_string(),
            display_name: display_name.map(str::to_string),
            recognition_suffix: None,
            email: Some("member@example.com".to_string()),
            phone: None,
            membership_type: Some("MEMBER".to_string()),
            membership_status: "ACTIVE".to_string(),
            join_date: Some("2026-01-01".to_string()),
            renewal_date: Some("2026-09-30".to_string()),
            pathway_name: Some("Dynamic Leadership".to_string()),
            pathway_level,
            active_officer_role: Some("President".to_string()),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-07-01T00:00:00Z".to_string(),
        }
    }

    #[test]
    fn summary_uses_stored_display_name_when_available() {
        let summary = MemberSummary::from(member_row(Some("Suketh C."), Some(4)));

        assert_eq!(summary.display_name, "Suketh C.");
        assert_eq!(summary.pathway_level, 4);
    }

    #[test]
    fn summary_builds_fallback_display_name() {
        let summary = MemberSummary::from(member_row(Some("   "), None));

        assert_eq!(summary.display_name, "Suketh Chinchela");
        assert_eq!(summary.pathway_level, 0);
    }

    #[test]
    fn profile_preserves_summary_identity_fields() {
        let profile = MemberProfile::from(member_row(None, Some(3)));

        assert_eq!(profile.id, "member_123");
        assert_eq!(profile.display_name, "Suketh Chinchela");
        assert_eq!(profile.pathway_level, 3);
    }
}
