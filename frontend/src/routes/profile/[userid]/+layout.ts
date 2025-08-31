import { authStore } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

// This load function runs BEFORE your page component
export function load() {
    const auth = get(authStore);

    // If the auth check is done and the user is not logged in, redirect them.
    if (!auth.loading && !auth.isAuthenticated) {
        throw redirect(307, '/login');
    }

    // If everything is okay, let the page load
    return {};
}