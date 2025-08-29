<!-- svelte-ignore a11y_missing_attribute -->
<script lang="ts">
    import '../app.css';
    import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
    import InstallAppButton from '$lib/components/InstallAppButton.svelte'; 
	import { GithubSvg, SquirrelSvg, TasksSvg } from '$lib/components/icons';
    import { authStore, initAuth, logout } from '$lib/auth';
    import { page } from '$app/stores';
    
    import AOS from 'aos';
    import 'aos/dist/aos.css';

    import { onMount } from 'svelte';
    
    export let data;

    onMount(() => {
        AOS.init({
            offset: 120, 
            delay: 0, 
            duration: 800, 
            easing: 'ease', 
            once: false, 
            mirror: false, 
            anchorPlacement: 'top-bottom', 
        });

        // Initialize auth state
        initAuth();
    });

    async function handleLogout() {
        await logout();
    }

    $: isAuthPage = $page.url.pathname === '/login';
</script>

<div class="flex flex-col min-h-screen bg-base-100">
    <header class="navbar bg-base-100 z-10 border border-base-300">
        <div class="flex-1">
            <h1>
                <a href="/" 
                   class="btn btn-ghost font-bold text-xl" aria-label="Go to Skill Share homepage"
                >
                    SkillSwap
                </a>
            </h1>
        </div>
        <div class="flex-none flex items-center gap-2">
            {#if !isAuthPage && $authStore.isAuthenticated}
                <a href="/map" class="btn btn-primary btn-sm">
                    🗺️ Community Map
                </a>
                <button 
                    class="btn btn-ghost btn-sm"
                    on:click={handleLogout}
                >
                    Logout
                </button>
            {/if}
            
            <InstallAppButton />

            <nav aria-label="Theme Selection">
                <ThemeSwitcher currentPath={data?.url?.pathname || $page.url.pathname} />
            </nav>
        </div>
    </header>
    
    <main class="flex-grow p-4" id="main-content">
        <slot />
    </main>
    
    <footer class="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">
    <aside class="grid-flow-col items-center">
        <SquirrelSvg />
        <a href="/about" class="link link-hover">About This Template</a>
    </aside>
    <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a
            href="https://github.com/taneshqGupta/rust-svelte-template"
            class="link link-hover flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View project on GitHub"
            >
            <GithubSvg /> 
            View on GitHub
        </a>
    </nav>
    </footer>
</div>