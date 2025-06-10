<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->

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
                    Task Manager
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

    <footer class="footer items-center p-4 bg-neutral text-neutral-content">
        <aside class="grid-flow-col items-center mx-auto text-center">
            <p>
                This is a starter CRUD template for Rust and SvelteKit with dynamic and persistent theme switching.
            </p>
            <p>
                <a 
                    href="https://github.com/taneshqGupta/rust-svelte-template" 
                    class="link link-hover font-bold" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="View project on GitHub"
                >
                    View on GitHub
                </a>
            </p>
        </aside>
    </footer>
</div>