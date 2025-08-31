import { redirect } from '@sveltejs/kit';
import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
    const sessionCookie = cookies.get('session');

    if (!sessionCookie) {
        throw redirect(307, '/login');
    }

    try {
        const authCheckUrl = `${PUBLIC_BACKEND_URL}auth/check`;
        
        const response = await fetch(authCheckUrl, {
            headers: {
                'Cookie': `session=${sessionCookie}`
            }
        });

        if (!response.ok) {
            throw redirect(307, '/login');
        }

        const authData = await response.json();

        if (!authData.success) {
            throw redirect(307, '/login');
        }

        // Success! Allow the page to load.
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