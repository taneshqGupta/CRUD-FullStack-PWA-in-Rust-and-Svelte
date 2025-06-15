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
        <div class="footer-start mb-2 sm:mb-0 sm:mr-4">
            <p>&copy; 2025 Taneshq Gupta. All rights reserved.</p>
        </div>

        <div class="footer-center flex gap-4">
            <a href="/about" class="link link-hover">About This Project</a>
            <a
                href="https://github.com/taneshqGupta/rust-svelte-template"
                class="link link-hover flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View project on GitHub"
            >
                <GithubSvg /> GitHub
            </a>
        </div>

        <div class="footer-end">
            </div>
    </footer>
</div>