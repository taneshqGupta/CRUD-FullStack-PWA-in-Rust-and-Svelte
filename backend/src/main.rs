use std::net::SocketAddr;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Form, Json, Router
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool; 
use tokio::net::TcpListener;

use tower_http::cors::{Any, CorsLayer}; // Removed Origin as CorsOrigin
use http::{HeaderName, HeaderValue}; // Added HeaderValue import

mod telemetry;
mod error;
use error::AppError;

#[tokio::main]
async fn main() -> Result<(), AppError> {

    telemetry::init_telemetry();

    // let _ = dotenvy::dotenv()?;
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

    // let cors = CorsLayer::new()
    // .allow_origin([
    //     "http://localhost:5173".parse::<HeaderValue>().unwrap(), // Changed to HeaderValue
    //     "http://127.0.0.1:5173".parse::<HeaderValue>().unwrap(), // Changed to HeaderValue
    // ])
    // .allow_methods(Any) 
    // .allow_headers([
    //     HeaderName::from_static("Content-Type"),
    //     HeaderName::from_static("Authorization"),
    //     HeaderName::from_static("Accept"),
    // ]) 
    // .allow_credentials(true); 


    let app = Router::new()
        .route("/", get(list))
        .route("/create", post(create))
        .route("/delete/{id}", post(delete))
        .route("/update", post(update))
        .with_state(pool)
        .layer(CorsLayer::very_permissive());

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse::<u16>()?;

    let address = SocketAddr::from(([0,0,0,0], port));

    let listener = TcpListener::bind(&address).await?;
    tracing::debug!("listening on {}", listener.local_addr()?);

    axum::serve(listener, app).await?;

    Ok(())
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Todo{
    id: i32,
    descript: String,
    done: bool,
}

#[derive(Serialize, Deserialize)]
struct NewTodo{
    descript: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct DeleteResponse {
    success: bool,
    id: i32,
    message: String,
}

async fn list(State(pool): State<PgPool>) -> Result<Json<Vec<Todo>>, AppError> { 
    let todos = sqlx::query_as!(Todo, "SELECT id, descript, done FROM todos ORDER BY id")
        .fetch_all(&pool)
        .await?;

    Ok(Json(todos))
}

async fn create(State(pool): State<PgPool>, Form(new_todo): Form<NewTodo>) -> Result<Json<Todo>, AppError> { 
    let created_todo = sqlx::query_as!(
        Todo,
        "INSERT INTO todos (descript, done) VALUES ($1, $2) RETURNING id, descript, done", 
        new_todo.descript,
        false 
    )
    .fetch_one(&pool) 
    .await?;

    Ok(Json(created_todo))
}

async fn delete(State(pool): State<PgPool>, Path(id): Path<i32>) -> Result<Json<DeleteResponse>, AppError> { 
    let result = sqlx::query!("DELETE FROM todos WHERE id = $1", id) 
        .execute(&pool)
        .await?;

    if result.rows_affected() > 0 {
        Ok(Json(DeleteResponse {success: true, id, message: format!("Todo with id {} deleted successfully.", id)}))
    }
    else {
        Err(AppError::HttpError(StatusCode::NOT_FOUND, anyhow::anyhow!("Task with id {} not found for deletion.", id)))
    }
}

async fn update(State(pool): State<PgPool>, Json(todo): Json<Todo>) -> Result<Json<Todo>, AppError> { 
    let result = sqlx::query!(
        "UPDATE todos SET descript = $1, done = $2 WHERE id = $3", 
        todo.descript,
        todo.done,
        todo.id
    )
    .execute(&pool)
    .await?;

    if result.rows_affected() > 0 {
        Ok(Json(todo))
    } else {
        Err(AppError::HttpError(StatusCode::NOT_FOUND, anyhow::anyhow!("Todo with id {} not found for update.", todo.id)))
    }
}