use serde::Serialize;
use worker::Error;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiErrorBody {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct ApiError {
    pub status: u16,
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

impl ApiError {
    pub fn new(status: u16, code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            status,
            code: code.into(),
            message: message.into(),
            details: None,
        }
    }

    pub fn bad_request(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(400, code, message)
    }

    pub fn unauthorized(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(401, code, message)
    }

    pub fn forbidden(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(403, code, message)
    }

    pub fn not_found(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(404, code, message)
    }

    pub fn conflict(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(409, code, message)
    }

    pub fn internal(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(500, code, message)
    }

    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = Some(details);
        self
    }
}

impl From<Error> for ApiError {
    fn from(error: Error) -> Self {
        Self::internal(
            "INTERNAL_WORKER_ERROR",
            "An unexpected backend error occurred.",
        )
        .with_details(serde_json::json!({
            "workerMessage": error.to_string()
        }))
    }
}
