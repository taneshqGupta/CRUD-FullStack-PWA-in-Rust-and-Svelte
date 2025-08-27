export interface Todo {
    id: number;
    descript: string;
    done: boolean;
    category: string;
    user_id: number;
}

export interface User {
    id: number;
    email: string;
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