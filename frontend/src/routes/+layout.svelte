<!-- svelte-ignore a11y_missing_attribute -->
<script lang="ts">
    import '../app.css';
    import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
    import { onMount } from 'svelte';
	import { browser, dev } from '$app/environment';
    
    export let data;

        // --- PWA Installation Prompt Variables ---
        let deferredPrompt: Event | null = null; // Stores the beforeinstallprompt event
    let showInstallButton = false; // Controls visibility of the custom install button
    // --- End PWA Installation Prompt Variables ---

    // Function to update the theme-color meta tag (keeping this as per your last request)
    function updateThemeColorMeta() {
        if (!browser) return;

        const htmlElement = document.documentElement;
        const themeColor = getComputedStyle(htmlElement).getPropertyValue('--p').trim();

        let themeMetaTag = document.querySelector('meta[name="theme-color"]');

        if (!themeMetaTag) {
            themeMetaTag = document.createElement('meta');
            themeMetaTag.setAttribute('name', 'theme-color');
            document.head.appendChild(themeMetaTag);
        }

        if (themeColor) {
            themeMetaTag.setAttribute('content', themeColor);
            console.log('PWA Theme Color updated to:', themeColor);
        } else {
            themeMetaTag.setAttribute('content', '#2a303c'); // Fallback
            console.warn('PWA Theme Color: Could not read --p. Falling back to default.');
        }
    }

    // Function to handle the custom install button click
    async function handleInstallClick() {
        if (deferredPrompt) {
            // Show the browser's native install prompt
            // This method is provided by the beforeinstallprompt event
            (deferredPrompt as any).prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await (deferredPrompt as any).userChoice;
            console.log(`User response to install prompt: ${outcome}`);

            // Hide the install button regardless of user choice
            // The PWA can only be installed once per user session from this prompt
            showInstallButton = false;
            deferredPrompt = null; // Clear the stored event
        }
    }

    onMount(async () => {
        // PWA Service Worker Registration
        if (browser && !dev) {
            const { registerSW } = await import('virtual:pwa-register');
            registerSW({
                immediate: true,
                onNeedRefresh() {
                    console.log('PWA: New content available! Please refresh to update.');
                },
                onOfflineReady() {
                    console.log('PWA: App is now ready for offline use!');
                }
            });
        }

        // --- PWA Installation Prompt Logic ---
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the default mini-infobar from appearing
            e.preventDefault();
            // Store the event so it can be triggered later
            deferredPrompt = e;
            // Show your custom install button
            showInstallButton = true;
            console.log('PWA: beforeinstallprompt event fired. Showing install button.');
        });

        // Listen for the 'appinstalled' event to hide the button if the user installs it directly
        window.addEventListener('appinstalled', () => {
            showInstallButton = false;
            deferredPrompt = null;
            console.log('PWA: App installed event fired. Hiding install button.');
        });
        // --- End PWA Installation Prompt Logic ---


        // Initial theme color update on mount
        updateThemeColorMeta();

        // Observe changes to the 'data-theme' attribute for dynamic updates
        if (browser) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                        updateThemeColorMeta();
                    }
                });
            });
            observer.observe(document.documentElement, { attributes: true });
            return () => {
                observer.disconnect();
            };
        }
    });
    
</script>

<div class="flex flex-col min-h-screen bg-base-100">
    <header class="navbar bg-base-100 z-10 border border-base-300">
        <div class="flex-1">
            <h1>
                <a href="/" class="btn btn-ghost font-bold text-xl" aria-label="Go to Task Manager homepage">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    Tasks
                </a>
            </h1>
        </div>
        <div class="flex-none">
            <nav aria-label="Theme Selection">
                <ThemeSwitcher currentPath={data.url.pathname} />
            </nav>
        </div>
    </header>
    
    <main class="flex-grow p-4" id="main-content">
        <slot />
    </main>
    
    <div class="divider divider-accent my-0" aria-hidden="true"></div>
    
    <footer class="footer p-4 bg-neutral text-neutral-content justify-between items-center">
        <div class="footer-start">
                <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rabbit-icon lucide-rabbit"><path d="M13 16a3 3 0 0 1 2.24 5"/><path d="M18 12h.01"/><path d="M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3"/><path d="M20 8.54V4a2 2 0 1 0-4 0v3"/><path d="M7.612 12.524a3 3 0 1 0-1.6 4.3"/></svg>
                    This is a starter CRUD template for Rust and SvelteKit with dynamic and persistent theme switching.
                </div>
        </div>

        <div class="footer-end">
            <p>
                <a
                    href="https://github.com/taneshqGupta/rust-svelte-template"
                    class="link link-hover font-bold flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View project on GitHub"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github-icon lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    View on Github
                </a>
            </p>
        </div>
    </footer>
</div>