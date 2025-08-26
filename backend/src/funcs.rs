use crate::error;
use error::AppError;
use crate::structs;
use structs::{Todo, NewTodo, DeleteResponse};
use axum::{extract::{Path, State}, Form, Json};
use http::StatusCode;
use sqlx::PgPool;


pub async fn list(State(pool): State<PgPool>) -> Result<Json<Vec<Todo>>, AppError> { 
    let todos = sqlx::query_as!(Todo, "SELECT id, descript, done, category FROM todos ORDER BY id")
        .fetch_all(&pool)
        .await?;

    Ok(Json(todos))
}

pub async fn create(State(pool): State<PgPool>, Form(new_todo): Form<NewTodo>) -> Result<Json<Todo>, AppError> { 
    let created_todo = sqlx::query_as!(
        Todo,
        "INSERT INTO todos (descript, done, category) VALUES ($1, $2, $3) RETURNING id, descript, done, category", 
        new_todo.descript,
        false,
        new_todo.category
    )
    .fetch_one(&pool) 
    .await?;

    Ok(Json(created_todo))
}

pub async fn delete(State(pool): State<PgPool>, Path(id): Path<i32>) -> Result<Json<DeleteResponse>, AppError> { 
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

pub async fn update(State(pool): State<PgPool>, Json(todo): Json<Todo>) -> Result<Json<Todo>, AppError> { 
    let result = sqlx::query!(
        "UPDATE todos SET descript = $1, done = $2, category = $3 WHERE id = $4", 
        todo.descript,
        todo.done,
        todo.category,
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
