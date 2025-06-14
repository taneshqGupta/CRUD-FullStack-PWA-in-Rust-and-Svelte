<!-- svelte-ignore a11y_missing_attribute -->
<script lang="ts">
    import '../app.css';
    import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
    import { onMount } from 'svelte'; // Import onMount for client-side logic
    
    export let data;

    // Variables to manage the PWA installation prompt
    let deferredPrompt: any = null; // Stores the 'beforeinstallprompt' event
    let showInstallButton = false; // Controls the visibility of the install button

    // onMount runs only on the client-side after the component is mounted
    onMount(() => {
        // Event listener for when the browser is ready to prompt for PWA installation
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the default mini-infobar or browser prompt from appearing
            e.preventDefault();
            // Stash the event so it can be triggered later by the user's action
            deferredPrompt = e;
            // Set the flag to true to display the install button in the UI
            showInstallButton = true;
            console.log('beforeinstallprompt event fired. Install button is now visible.');
        });

        // Event listener for when the PWA has been successfully installed
        window.addEventListener('appinstalled', () => {
            // Hide the install button as the app is already installed
            showInstallButton = false;
            // Clear the deferred prompt reference
            deferredPrompt = null;
            console.log('PWA was installed successfully!');
        });

        // Optional: Check if the app is already running in standalone mode (installed) on load
        // This provides a fallback to hide the button if it's already installed and
        // the 'beforeinstallprompt' didn't fire due to installation status.
        // `window.matchMedia('(display-mode: standalone)').matches` is for modern browsers.
        // `(navigator as any).standalone` is for older iOS Safari.
        if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
            console.log('App is already running in standalone mode (installed). Hiding install button.');
            showInstallButton = false;
        }
    });

    /**
     * Handles the click event for the custom install button.
     * Triggers the PWA installation prompt if available.
     */
    async function handleInstallClick() {
        if (deferredPrompt) {
            // Show the browser's PWA installation prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt (accept or dismiss)
            const { outcome } = await deferredPrompt.userChoice;
            
            // Log the user's decision for debugging/analytics
            console.log(`User response to the install prompt: ${outcome}`);
            
            // The prompt has been used, so clear the reference
            deferredPrompt = null;
            // Hide the button after the prompt has been presented, regardless of outcome
            showInstallButton = false;
        }
    }
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
        <div class="flex-none flex items-center gap-2">
            <!-- PWA Install Button - only displayed if showInstallButton is true -->
            {#if showInstallButton}
            <button
                id="installButton"
                class="btn btn-primary btn-sm"
                on:click={handleInstallClick}
                aria-label="Install the application"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Install App
            </button>
            {/if}

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
