import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    setTheme: async ({ url, cookies }) => {
        const theme = url.searchParams.get('theme');
        const redirectTo = url.searchParams.get('redirectTo') || '/';

        if (theme) {
            cookies.set('theme', theme, { 
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
                httpOnly: false, // Allow client-side access if needed
                sameSite: 'lax' // More restrictive for better security
            });
        }

        throw redirect(303, redirectTo);
    }
};
