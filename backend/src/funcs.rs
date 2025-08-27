use crate::error;
use error::AppError;
use crate::structs;
use structs::{Todo, NewTodo, DeleteResponse};
use crate::auth::require_auth;
use axum::{extract::{Path, State}, Form, Json};
use http::StatusCode;
use sqlx::PgPool;
use tower_sessions::Session;


pub async fn list(State(pool): State<PgPool>, session: Session) -> Result<Json<Vec<Todo>>, AppError> {
    let user_id = require_auth(session).await?;
    
    let todos = sqlx::query_as!(
        Todo, 
        "SELECT id, descript, done, category, user_id FROM todos WHERE user_id = $1 ORDER BY id",
        user_id
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(todos))
}

pub async fn create(State(pool): State<PgPool>, session: Session, Form(new_todo): Form<NewTodo>) -> Result<Json<Todo>, AppError> {
    let user_id = require_auth(session).await?;
    
    let created_todo = sqlx::query_as!(
        Todo,
        "INSERT INTO todos (descript, done, category, user_id) VALUES ($1, $2, $3, $4) RETURNING id, descript, done, category, user_id", 
        new_todo.descript,
        false,
        new_todo.category,
        user_id
    )
    .fetch_one(&pool) 
    .await?;

    Ok(Json(created_todo))
}

pub async fn delete(State(pool): State<PgPool>, session: Session, Path(id): Path<i32>) -> Result<Json<DeleteResponse>, AppError> {
    let user_id = require_auth(session).await?;
    
    let result = sqlx::query!("DELETE FROM todos WHERE id = $1 AND user_id = $2", id, user_id) 
        .execute(&pool)
        .await?;

    if result.rows_affected() > 0 {
        Ok(Json(DeleteResponse {success: true, id, message: format!("Todo with id {} deleted successfully.", id)}))
    }
    else {
        Err(AppError::HttpError(StatusCode::NOT_FOUND, anyhow::anyhow!("Task with id {} not found for deletion.", id)))
    }
}

pub async fn update(State(pool): State<PgPool>, session: Session, Json(todo): Json<Todo>) -> Result<Json<Todo>, AppError> {
    let user_id = require_auth(session).await?;
    
    let result = sqlx::query!(
        "UPDATE todos SET descript = $1, done = $2, category = $3 WHERE id = $4 AND user_id = $5", 
        todo.descript,
        todo.done,
        todo.category,
        todo.id,
        user_id
    )
    .execute(&pool)
    .await?;

    if result.rows_affected() > 0 {
        Ok(Json(todo))
    } else {
        Err(AppError::HttpError(StatusCode::NOT_FOUND, anyhow::anyhow!("Todo with id {} not found for update.", todo.id)))
    }
}
