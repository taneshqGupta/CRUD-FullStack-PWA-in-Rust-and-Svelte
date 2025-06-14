// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit(),
        SvelteKitPWA({
            manifest: {
                name: 'Tasks',
                short_name: 'Tasks',
                description: ' This is a starter CRUD template for Rust and SvelteKit with dynamic and persistent theme switching.',
                theme_color: '#2a303c', 
                display: 'standalone', 
                start_url: '/',      
                orientation: 'portrait', 
                icons: [
                    {
                        src: 'pwa-icons/android-launchericon-48-48.png',
                        sizes: '48x48',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launchericon-72-72.png',
                        sizes: '72x72',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launchericon-96-96.png',
                        sizes: '96x96',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launchericon-144-144.png',
                        sizes: '144x144',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launchericon-192-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any', 
                    },
                    {
                        src: 'pwa-icons/android-launchericon-512-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    { 
                        src: 'pwa-icons/android-launchericon-512-512.png', 
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable', 
                    },

                    {
                        src: 'pwa-icons/192.png', 
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/1024.png',
                        sizes: '1024x1024',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/Square150x150Logo.scale-100.png', 
                        sizes: '150x150',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/Square310x310Logo.scale-100.png', 
                        sizes: '310x310',
                        type: 'image/png',
                    },

                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
            },
        }),
    ],
});