import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const theme = event.cookies.get('theme') || 'lemonade';

    const response = await resolve(event, {
        transformPageChunk: ({ html }) => {
            // Inject client-side script to handle PWA theme loading
            const themeScript = `
                <script>
                    (function() {
                        // Check if we're in a PWA and no theme is set
                        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                                      navigator.standalone;
                        
                        if (isPWA && !document.documentElement.getAttribute('data-theme')) {
                            const savedTheme = localStorage.getItem('theme');
                            if (savedTheme) {
                                document.documentElement.setAttribute('data-theme', savedTheme);
                            }
                        }
                    })();
                </script>
            `;
            
            return html
                .replace('data-theme=""', `data-theme="${theme}"`)
                .replace('</head>', `${themeScript}</head>`);
        }
    });

    return response;
};
