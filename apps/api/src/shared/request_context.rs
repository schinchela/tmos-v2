use worker::Request;

#[derive(Debug, Clone)]
pub struct RequestContext {
    pub request_id: String,
}

impl RequestContext {
    pub fn from_request(request: &Request) -> Self {
        let request_id = request
            .headers()
            .get("cf-ray")
            .ok()
            .flatten()
            .filter(|value| !value.trim().is_empty())
            .map(|value| format!("req_{value}"))
            .unwrap_or_else(generate_fallback_request_id);

        Self { request_id }
    }
}

fn generate_fallback_request_id() -> String {
    let timestamp = js_sys::Date::now() as u64;
    let random = (js_sys::Math::random() * 1_000_000_000.0) as u64;

    format!("req_{timestamp:x}_{random:x}")
}
