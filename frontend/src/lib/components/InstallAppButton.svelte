<script lang="ts">
    import { onMount } from 'svelte';

    let deferredPrompt: any = null;
    export let showInstallButton = false; 

    onMount(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); 
            deferredPrompt = e; 
            showInstallButton = true; 
            console.log('InstallAppButton: beforeinstallprompt event fired.');
        });

        window.addEventListener('appinstalled', () => {
            showInstallButton = false; 
            deferredPrompt = null; 
            console.log('InstallAppButton: PWA was installed successfully!');
        });

        if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
            console.log('InstallAppButton: App is already in standalone mode. Hiding install button.');
            showInstallButton = false;
        }
    });

    async function handleInstallClick() {
        if (deferredPrompt) {
            deferredPrompt.prompt(); 
            const { outcome } = await deferredPrompt.userChoice; 
            
            console.log(`InstallAppButton: User response to the install prompt: ${outcome}`);
            
            deferredPrompt = null; 
            showInstallButton = false; 
        }
    }
</script>

{#if showInstallButton}
<button
    id="installButton"
    class="btn btn-ghost text-lg"
    on:click={handleInstallClick}
    aria-label="Install the application"
>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
    Install App
</button>
{/if}
