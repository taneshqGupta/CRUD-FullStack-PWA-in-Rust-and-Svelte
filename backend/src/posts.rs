use crate::error;
use error::AppError;
use crate::structs::{Post, NewPost, DeleteResponse, PostType};
use crate::auth::require_auth;
use axum::{extract::{Path, State}, Form, Json};
use http::StatusCode;
use sqlx::PgPool;
use tower_sessions::Session;

pub async fn list_posts(State(pool): State<PgPool>, session: Session) -> Result<Json<Vec<Post>>, AppError> {
    let user_id = require_auth(session).await?;
    
    let rows = sqlx::query!(
        "SELECT id, description, completed, category, user_id, post_type FROM posts WHERE user_id = $1 ORDER BY id",
        user_id
    )
    .fetch_all(&pool)
    .await?;

    let posts: Vec<Post> = rows
        .into_iter()
        .map(|row| Post {
            id: row.id,
            description: row.description,
            completed: row.completed,
            category: row.category,
            user_id: row.user_id,
            post_type: match row.post_type.as_str() {
                "offer" => PostType::Offer,
                "request" => PostType::Request,
                _ => PostType::Request, // Default to request for unknown types
            },
        })
        .collect();

    Ok(Json(posts))
}

pub async fn create_post(State(pool): State<PgPool>, session: Session, Form(new_post): Form<NewPost>) -> Result<Json<Post>, AppError> {
    let user_id = require_auth(session).await?;
    let post_type_str = new_post.post_type.to_string();
    
    let row = sqlx::query!(
        "INSERT INTO posts (description, completed, category, user_id, post_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, description, completed, category, user_id, post_type", 
        new_post.description,
        false,
        new_post.category,
        user_id,
        post_type_str
    )
    .fetch_one(&pool) 
    .await?;

    let created_post = Post {
        id: row.id,
        description: row.description,
        completed: row.completed,
        category: row.category,
        user_id: row.user_id,
        post_type: new_post.post_type,
    };

    Ok(Json(created_post))
}

pub async fn delete_post(State(pool): State<PgPool>, session: Session, Path(id): Path<i32>) -> Result<Json<DeleteResponse>, AppError> {
    let user_id = require_auth(session).await?;
    
    let result = sqlx::query!("DELETE FROM posts WHERE id = $1 AND user_id = $2", id, user_id) 
        .execute(&pool)
        .await?;

    if result.rows_affected() > 0 {
        Ok(Json(DeleteResponse {success: true, id, message: format!("Post with id {} deleted successfully.", id)}))
    }
    else {
        Err(AppError::HttpError(StatusCode::NOT_FOUND, anyhow::anyhow!("Post with id {} not found for deletion.", id)))
    }
}

pub async fn update_post(State(pool): State<PgPool>, session: Session, Json(post): Json<Post>) -> Result<Json<Post>, AppError> {
    let user_id = require_auth(session).await?;
    let post_type_str = post.post_type.to_string();
    
    let result = sqlx::query!(
        "UPDATE posts SET description = $1, completed = $2, category = $3, post_type = $4 WHERE id = $5 AND user_id = $6", 
        post.description,
        post.completed,
        post.category,
        post_type_str,
        post.id,
        user_id
    )
    .execute(&pool)
    .await?;

    if result.rows_affected() > 0 {
        Ok(Json(post))
    } else {
        Err(AppError::HttpError(StatusCode::NOT_FOUND, anyhow::anyhow!("Post with id {} not found for update.", post.id)))
    }
}
