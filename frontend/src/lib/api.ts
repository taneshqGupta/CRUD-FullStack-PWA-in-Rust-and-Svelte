import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { Todo, AuthResponse, LoginRequest } from '$lib/types';

export async function createTodo(descript: string, category: string): Promise<Todo> {
    const formData = new URLSearchParams();
    formData.append('descript', descript);
    formData.append('category', category);

    console.log('Creating todo with:', { descript, category });
    console.log('Form data:', formData.toString());

    const response = await fetch(`${PUBLIC_BACKEND_URL}create`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create todo: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Created todo:', result);
    return result;
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
		console.error('Update error response:', errorText);
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
        console.error('Delete error response:', errorText);
        throw new Error(`Failed to delete todo: ${response.status} ${response.statusText} - ${errorText}`);
    }
    // No need to parse JSON for a successful delete
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

export async function register(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

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