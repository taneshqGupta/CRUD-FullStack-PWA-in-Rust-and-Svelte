export type PostType = 'offer' | 'request';

export interface Post {
    id: number;
    description: string;
    completed: boolean;
    category: string;
    user_id: number;
    post_type: PostType;
    pin_code?: string;
    user_name?: string;
}

export interface NewPost {
    description: string;
    category: string;
    post_type: PostType;
    pin_code?: string;
}

// Keep Todo for backward compatibility during transition
export interface Todo {
    id: number;
    descript: string;
    done: boolean;
    category: string;
    user_id: number;
}

export interface NewUser {
    email: string;
    password: string;
    name?: string;
    pin_code?: string;
    profile_picture?: string;
}

export interface UserProfile {
    id: number;
    email: string;
    name?: string;
    pin_code?: string;
    profile_picture?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user_id?: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}