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
                name: 'Your Task Manager',
                short_name: 'TaskManager',
                description: 'A simple yet powerful task manager',
                theme_color: '#34d399', // Your chosen theme color
                display: 'standalone', // Recommended for a PWA experience
                start_url: '/',      // Where the PWA should start when launched
                orientation: 'portrait', // Optional: 'portrait', 'landscape', 'any'
                icons: [
                    // Android Launcher Icons (from your 'android' folder)
                    {
                        src: 'pwa-icons/android-launcher-icon-48-48.png',
                        sizes: '48x48',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launcher-icon-72-72.png',
                        sizes: '72x72',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launcher-icon-96-96.png',
                        sizes: '96x96',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launcher-icon-144-144.png',
                        sizes: '144x144',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-icons/android-launcher-icon-192-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any', // Can be 'any', 'maskable', 'monochrome'
                    },
                    {
                        src: 'pwa-icons/android-launcher-icon-512-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    { // This one is important for adaptive icons on modern Android
                        src: 'pwa-icons/android-launcher-icon-512-512.png', // Use the 512x512 maskable version if provided, or the general one.
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable', // Crucial for Android adaptive icons
                    },

                    // iOS Icons (from your 'ios' folder) - include common sizes
                    // You might not need ALL 26, but the common ones are good.
                    {
                        src: 'pwa-icons/192.png', // Or the actual path like 192x192.png if that's the filename
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
                    // Add other significant iOS sizes you want to support (e.g., 180x180 for iPhone)
                    // PWA Builder often names them by size directly.
                    // Example:
                    // {
                    //    src: 'pwa-icons/180.png',
                    //    sizes: '180x180',
                    //    type: 'image/png',
                    // },


                    // Windows Icons (from your 'windows11' folder) - focus on square ones
                    // The names like Square44x44Logo are often specific for msapplication-config,
                    // but some square ones can be included in the general manifest.
                    // For example, if you have a 150x150 or 310x310 general square icon:
                    {
                        src: 'pwa-icons/Square150x150Logo.scale-100.png', // Adjust filename
                        sizes: '150x150',
                        type: 'image/png',
                    },
                    // Add other relevant square sizes from Windows set
                    {
                        src: 'pwa-icons/Square310x310Logo.scale-100.png', // Adjust filename
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