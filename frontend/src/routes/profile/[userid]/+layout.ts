// In: src/routes/profile/[userid]/+layout.ts
import { redirect } from '@sveltejs/kit';
import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
    console.log('[INFO] Layout load function started...');
    
    try {
        const authCheckUrl = `${PUBLIC_BACKEND_URL}auth/check`;
        console.log(`[INFO] Fetching auth status from: ${authCheckUrl}`);
        
        // This is the critical fix: forward the user's cookie to the backend
        const response = await fetch(authCheckUrl, {
            credentials: 'include'
        });

        console.log(`[INFO] Fetch response status: ${response.status}, OK: ${response.ok}`);
        if (!response.ok) {
            console.log('[REDIRECT] Response not OK. Redirecting to /login...');
            throw redirect(307, '/login');
        }

        const authData = await response.json();
        console.log('[INFO] Parsed authData:', authData);

        if (!authData.success) {
            console.log('[REDIRECT] authData.success is false. Redirecting to /login...');
            throw redirect(307, '/login');
        }

        console.log(`[SUCCESS] Auth check successful for user_id: ${authData.user_id}. Allowing page to load.`);
        return {
            user: {
                id: authData.user_id
            }
        };

    } catch (err) {
        if (err instanceof Error && err.message.startsWith('redirect')) {
            throw err;
        }
        
        console.error('[ERROR] An unexpected error occurred in load function:', err);
        console.log('[REDIRECT] Redirecting to /login due to an unexpected error.');
        throw redirect(307, '/login');
    }
};