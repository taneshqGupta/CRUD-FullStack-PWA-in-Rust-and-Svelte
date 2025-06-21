import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { Todo } from '$lib/types';

export async function createTodo(descript: string): Promise<Todo> {
    const formData = new URLSearchParams();
    formData.append('descript', descript);

    const response = await fetch(`${PUBLIC_BACKEND_URL}create`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create todo: ${response.statusText}`);
    }
    return response.json();
}

export async function updateTodo(todoToUpdate: Todo): Promise<Todo> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}update`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todoToUpdate)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update todo: ${response.statusText}`);
    }
    return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${PUBLIC_BACKEND_URL}delete/${id}`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete todo: ${response.statusText}`);
    }
}