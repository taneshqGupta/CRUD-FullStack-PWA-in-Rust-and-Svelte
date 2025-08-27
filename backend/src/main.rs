mod telemetry;
mod funcs;
mod structs;
mod error;
mod auth;
use error::AppError;
use funcs::{list, create, update, delete, };
use auth::{register, login, logout, check_auth};
use std::net::SocketAddr;
use axum::{
    routing::{get, post},
    Router
};
use sqlx::PgPool; 
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use http::{HeaderName, Method}; 
use tower_sessions::{MemoryStore, SessionManagerLayer}; 

#[tokio::main]
async fn main() -> Result<(), AppError> {

    telemetry::init_telemetry();

    let url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| {
            "http://0.0.0.0:8000".to_string()
        });

    tracing::info!("Attempting to connect to database using URL: {:?}", url);
    let pool = PgPool::connect(&url)
        .await
        .map_err(|e| {
            tracing::error!("Failed to connect to database: {:?}", e);
            e
        })?;
    tracing::info!("Successfully connected to database."); 

    let cors = CorsLayer::new()
    .allow_origin([
        std::env::var("FRONTEND_URL").unwrap().parse().unwrap(),
    ])
    .allow_methods([
        Method::GET,
        Method::POST
    ])
    .allow_headers([
        HeaderName::from_static("content-type"),
        HeaderName::from_static("authorization"),
        HeaderName::from_static("accept"),

    ])
    .allow_credentials(true);

    // Set up session store
    let session_store = MemoryStore::default();
    let session_layer = SessionManagerLayer::new(session_store)
        .with_secure(true) // Set to true in production with HTTPS
        .with_same_site(tower_sessions::cookie::SameSite::None);

    let app = Router::new()
        .route("/", get(list))
        .route("/create", post(create))
        .route("/delete/{id}", post(delete))
        .route("/update", post(update))
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/logout", post(logout))
        .route("/auth/check", get(check_auth))
        .with_state(pool)
        .layer(session_layer)
        .layer(cors);

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()?;

    let address = SocketAddr::from(([0,0,0,0], port));

    let listener = TcpListener::bind(&address).await?;
    tracing::debug!("listening on {}", listener.local_addr()?);

    axum::serve(listener, app).await?;

    Ok(())
}
