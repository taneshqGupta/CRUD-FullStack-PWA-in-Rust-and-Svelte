<!-- svelte-ignore a11y_missing_attribute -->
<script lang="ts">
    import '../app.css';
    import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
    import InstallAppButton from '$lib/components/InstallAppButton.svelte'; 
	import { GithubSvg, SquirrelSvg, TasksSvg } from '$lib/components/icons';
    
    export let data;
</script>

<div class="flex flex-col min-h-screen bg-base-100">
    <header class="navbar bg-base-100 z-10 border border-base-300">
        <div class="flex-1">
            <h1>
                <a href="/" class="btn btn-ghost font-bold text-xl" aria-label="Go to Task Manager homepage">
                    <TasksSvg />
                    Tasks
                </a>
            </h1>
        </div>
        <div class="flex-none flex items-center gap-2">
            <InstallAppButton />

            <nav aria-label="Theme Selection">
                <ThemeSwitcher currentPath={data.url.pathname} />
            </nav>
        </div>
    </header>
    
    <main class="flex-grow p-4" id="main-content">
        <slot />
    </main>
    
    <div class="divider divider-accent my-0" aria-hidden="true"></div>
    
    <footer class="footer p-4 bg-neutral text-neutral-content flex flex-col sm:flex-row justify-between items-center text-sm">
        <div class="footer-start mb-2 sm:mb-0 sm:mr-4 max-w-full sm:max-w-[70%]"> <div class="flex flex-col gap-1">
                <span>This is a starter CRUD template for Rust and SvelteKit</span>
                <span>Creation: 2025</span>
                <span>By: Taneshq Gupta (CSE Undergrad @ IIT-Mandi)</span>
                <span class="font-bold mt-2">Features:</span> <ul class="list-disc list-inside ml-4">
                    <li>Easily installable as a PWA (Progressive Web-Application).</li>
                    <li>Dynamic + Persistent ThemeSwitching with multi-theme setup.</li>
                </ul>
                <span class="font-bold mt-2">Tech Stack:</span> <ul class="list-disc list-inside ml-4">
                    <li>Backend: Rust (Axum)</li>
                    <li>Frontend: SvelteKit</li>
                    <li>Database: Postgres</li>
                </ul>
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
                    <GithubSvg />
                    View on Github
                </a>
            </p>
        </div>
    </footer>
</div>