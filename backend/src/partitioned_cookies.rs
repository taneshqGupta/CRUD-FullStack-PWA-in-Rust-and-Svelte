use axum::body::Body;
use axum::http::{HeaderValue, Request, Response};
use axum::middleware::Next;

/// Middleware to add the Partitioned attribute to session cookies
pub async fn add_partitioned_attribute(request: Request<Body>, next: Next) -> Response<Body> {
    let mut response = next.run(request).await;

    // Get the Set-Cookie headers and modify them
    let headers = response.headers_mut();
    let mut modified_cookies = Vec::new();

    // Find all Set-Cookie headers and collect them
    for (name, value) in headers.iter() {
        if name.as_str().to_lowercase() == "set-cookie" {
            if let Ok(cookie_str) = value.to_str() {
                tracing::info!("Processing cookie: {}", cookie_str);
                
                // Check if this is a session cookie with SameSite=None and Secure
                if cookie_str.contains("SameSite=None") && cookie_str.contains("Secure") {
                    // Add Partitioned attribute if not already present
                    if !cookie_str.contains("Partitioned") {
                        let modified_cookie = format!("{}; Partitioned", cookie_str);
                        tracing::info!("Modified cookie: {}", modified_cookie);
                        modified_cookies.push(modified_cookie);
                    } else {
                        tracing::info!("Cookie already has Partitioned attribute");
                        modified_cookies.push(cookie_str.to_string());
                    }
                } else {
                    tracing::info!("Cookie doesn't match criteria (SameSite=None + Secure)");
                    // Keep other cookies as-is
                    modified_cookies.push(cookie_str.to_string());
                }
            }
        }
    }

    // Remove existing Set-Cookie headers
    headers.remove("set-cookie");

    // Add the modified cookies back
    for cookie_str in modified_cookies {
        if let Ok(header_value) = HeaderValue::from_str(&cookie_str) {
            headers.append("set-cookie", header_value);
        }
    }

    response
}
