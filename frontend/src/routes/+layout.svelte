<script lang="ts">
    import '../app.css';
    import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

    export let data;
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
                <!-- svelte-ignore a11y_missing_attribute -->
                <a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-squirrel-icon lucide-squirrel"><path d="M15.236 22a3 3 0 0 0-2.2-5"/><path d="M16 20a3 3 0 0 1 3-3h1a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4V4"/><path d="M18 13h.01"/><path d="M18 6a4 4 0 0 0-4 4 7 7 0 0 0-7 7c0-5 4-5 4-10.5a4.5 4.5 0 1 0-9 0 2.5 2.5 0 0 0 5 0C7 10 3 11 3 17c0 2.8 2.2 5 5 5h10"/></svg>
                    This is a starter CRUD template for Rust and SvelteKit with dynamic and persistent theme switching.
                </a>
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