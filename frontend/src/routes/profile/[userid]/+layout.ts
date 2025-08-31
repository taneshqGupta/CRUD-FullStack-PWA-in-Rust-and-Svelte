// In: src/routes/profile/[userid]/+layout.ts
import { redirect } from '@sveltejs/kit';
import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
    try {
        // Use the universal `fetch` to call your backend's auth check endpoint.
        const response = await fetch(`${PUBLIC_BACKEND_URL}auth/check`);

        if (!response.ok) {
            throw redirect(307, '/login');
        }

        const authData = await response.json();

        if (!authData.success) {
            throw redirect(307, '/login');
        }

        // If authenticated, return the user data.
        return {
            user: {
                id: authData.user_id
            }
        };

    } catch (err) {
        if (err instanceof Error && err.message.startsWith('redirect')) {
            throw err;
        }
        
        throw redirect(307, '/login');
    }
};