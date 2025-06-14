import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const response = await fetch(`${PUBLIC_BACKEND_URL}about`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }

        const readmeHtml = await response.text();

        return {
            readmeHtml: readmeHtml
        };
    } catch (error: any) {
        console.error('Error fetching README from backend:', error);
        return {
            readmeHtml: `<p>Failed to load README from backend: ${error.message}</p>`
        };
    }
};

