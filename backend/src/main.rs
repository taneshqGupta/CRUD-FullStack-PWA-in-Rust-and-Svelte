mod auth;
mod error;
mod partitioned_cookies;
mod posts;
mod structs;
mod telemetry;
use auth::{check_auth, login, logout, register};
use axum::{
    Router, middleware,
    routing::{delete, get, post},
};
use error::AppError;
use posts::{create_post, delete_post, list_posts, update_post, list_offers, list_requests, 
           list_community_posts, list_community_offers, list_community_requests};
use http::{HeaderName, Method};
use partitioned_cookies::add_partitioned_attribute;
use sqlx::PgPool;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tower_sessions::{MemoryStore, SessionManagerLayer};

#[tokio::main]
async fn main() -> Result<(), AppError> {
    telemetry::init_telemetry();

    let url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "http://0.0.0.0:8000".to_string());

    tracing::info!("Attempting to connect to database using URL: {:?}", url);
    let pool = PgPool::connect(&url).await.map_err(|e| {
        tracing::error!("Failed to connect to database: {:?}", e);
        e
    })?;
    tracing::info!("Successfully connected to database.");

    let cors = CorsLayer::new()
        .allow_origin([std::env::var("FRONTEND_URL").unwrap().parse().unwrap()])
        .allow_methods([Method::GET, Method::POST, Method::DELETE])
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
        // Personal post routes
        .route("/", get(list_posts))  // Keep root path for backward compatibility
        .route("/posts", get(list_posts))
        .route("/posts/offers", get(list_offers))     // Skills I can offer
        .route("/posts/requests", get(list_requests)) // Help I need
        // Community post routes - see everyone's posts
        .route("/community", get(list_community_posts))           // All community posts
        .route("/community/offers", get(list_community_offers))   // All skills available
        .route("/community/requests", get(list_community_requests)) // All help needed
        // Post management
        .route("/create", post(create_post))  // Backward compatibility
        .route("/posts/create", post(create_post))
        .route("/delete/{id}", delete(delete_post))  // Backward compatibility
        .route("/posts/delete/{id}", delete(delete_post))
        .route("/update", post(update_post))  // Backward compatibility
        .route("/posts/update", post(update_post))
        // Auth routes
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/logout", post(logout))
        .route("/auth/check", get(check_auth))
        .with_state(pool)
        .layer(session_layer)
        .layer(middleware::from_fn(add_partitioned_attribute))
        .layer(cors);

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()?;

    let address = SocketAddr::from(([0, 0, 0, 0], port));

    let listener = TcpListener::bind(&address).await?;
    tracing::debug!("listening on {}", listener.local_addr()?);

    axum::serve(listener, app).await?;

    Ok(())
}
