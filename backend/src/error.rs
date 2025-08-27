use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Debug)]
pub enum AppError {
    /// Errors that should result in a specific HTTP status code (e.g., 404 Not Found, 400 Bad Request).
    HttpError(StatusCode, anyhow::Error),
    /// All other internal or unexpected errors that should result in 500 Internal Server Error.
    Internal(anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::HttpError(status_code, err) => {
                // For HTTP-specific errors, use the provided status_code
                (status_code, format!("Error: {}", err)).into_response()
            }
            AppError::Internal(err) => {
                // For general internal errors, default to 500
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Internal Server Error: {}", err),
                )
                    .into_response()
            }
        }
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        AppError::Internal(err.into())
    }
}
