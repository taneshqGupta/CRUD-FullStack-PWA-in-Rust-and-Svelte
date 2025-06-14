<!-- $lib/components/InstallAppButton.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';

    let deferredPrompt: any = null;
    export let showInstallButton = false; // Prop to control visibility from outside, though mostly controlled internally

    onMount(() => {
        // Event listener for when the browser is ready to prompt for PWA installation
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); // Prevent the default mini-infobar or browser prompt
            deferredPrompt = e; // Stash the event
            showInstallButton = true; // Make the button visible
            console.log('InstallAppButton: beforeinstallprompt event fired.');
        });

        // Event listener for when the PWA has been successfully installed
        window.addEventListener('appinstalled', () => {
            showInstallButton = false; // Hide the button
            deferredPrompt = null; // Clear the prompt reference
            console.log('InstallAppButton: PWA was installed successfully!');
        });

        // Initial check if the app is already running in standalone mode (installed)
        if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
            console.log('InstallAppButton: App is already in standalone mode. Hiding install button.');
            showInstallButton = false;
        }
    });

    /**
     * Handles the click event for the custom install button.
     * Triggers the PWA installation prompt if available.
     */
    async function handleInstallClick() {
        if (deferredPrompt) {
            deferredPrompt.prompt(); // Show the browser's PWA installation prompt
            const { outcome } = await deferredPrompt.userChoice; // Wait for user response
            
            console.log(`InstallAppButton: User response to the install prompt: ${outcome}`);
            
            deferredPrompt = null; // Clear the prompt
            showInstallButton = false; // Hide the button
        }
    }
</script>

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
