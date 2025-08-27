import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { Todo, Post, NewPost, AuthResponse, LoginRequest } from '$lib/types';

// Post API functions for new skill-sharing system
export async function createPost(description: string, category: string, post_type: 'offer' | 'request', pin_code?: string): Promise<Post> {
    const formData = new URLSearchParams();
    formData.append('description', description);
    formData.append('category', category);
    formData.append('post_type', post_type);
    if (pin_code) formData.append('pin_code', pin_code);

    const response = await fetch(`${PUBLIC_BACKEND_URL}posts/create`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create post: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
}

export async function getPosts(): Promise<Post[]> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}posts`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch posts: ${response.statusText}`);
    }
    return response.json();
}

export async function getCommunityPosts(): Promise<Post[]> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}community`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch community posts: ${response.statusText}`);
    }
    return response.json();
}

export async function getCommunityOffers(): Promise<Post[]> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}community/offers`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch community offers: ${response.statusText}`);
    }
    return response.json();
}

export async function getCommunityRequests(): Promise<Post[]> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}community/requests`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch community requests: ${response.statusText}`);
    }
    return response.json();
}

export async function updatePost(postToUpdate: Post): Promise<Post> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}posts/update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postToUpdate)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update post: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
}

export async function deletePost(id: number): Promise<void> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}posts/delete/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete post: ${response.status} ${response.statusText} - ${errorText}`);
    }
}

// Auth API functions
export async function login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${PUBLIC_BACKEND_URL}auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
    }
    return response.json();
}

export async function register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    if (name) formData.append('name', name);

    const response = await fetch(`${PUBLIC_BACKEND_URL}auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
    }
    return response.json();
}

export async function logout(): Promise<AuthResponse> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}auth/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Logout failed: ${response.statusText}`);
    }
    return response.json();
}

export async function checkAuth(): Promise<AuthResponse> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}auth/check`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Auth check failed: ${response.statusText}`);
    }
    return response.json();
}

// Legacy todo functions for backward compatibility
export async function createTodo(descript: string, category: string): Promise<Todo> {
    const formData = new URLSearchParams();
    formData.append('descript', descript);
    formData.append('category', category);

    const response = await fetch(`${PUBLIC_BACKEND_URL}create`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create todo: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
}

export async function getTodos(): Promise<Todo[]> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch todos: ${response.statusText}`);
    }
    return response.json();
}

export async function updateTodo(todoToUpdate: Todo): Promise<Todo> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoToUpdate)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update todo: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}delete/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete todo: ${response.status} ${response.statusText} - ${errorText}`);
    }
}