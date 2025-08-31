import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, fetch }) => {
    // 1. Get the form data (email/password) that the browser sent.
    const formData = await request.formData();

    // 2. Forward that data to your real backend.
    const response = await fetch(`${PUBLIC_BACKEND_URL}auth/login`, {
        method: 'POST',
        body: formData
    });

    // 3. Check if the backend login was successful.
    if (!response.ok) {
        // If it failed, pass the error back to the browser.
        return json(
            { success: false, message: 'Login failed on backend' },
            { status: response.status }
        );
    }
    
    // 4. IMPORTANT: Take the 'Set-Cookie' header from the backend's response.
    const setCookieHeader = response.headers.get('Set-Cookie');

    const authData = await response.json();

    // 5. Create a new successful response to send to the browser.
    const finalResponse = json(authData);

    // 6. If the backend sent a cookie, attach it to our response to the browser.
    if (setCookieHeader) {
        finalResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return finalResponse;
};