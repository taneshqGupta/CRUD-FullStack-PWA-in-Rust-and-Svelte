<!-- svelte-ignore a11y_missing_attribute -->
<script lang="ts">
    import '../app.css';
    import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
    import InstallAppButton from '$lib/components/InstallAppButton.svelte'; 
	import { GithubSvg, SquirrelSvg, TasksSvg } from '$lib/components/icons';
    
    // Import AOS and its CSS
    import AOS from 'aos';
    import 'aos/dist/aos.css';

    // Import onMount for Svelte lifecycle
    import { onMount } from 'svelte';
    
    export let data;

    // Initialize AOS when the component mounts
    onMount(() => {
        AOS.init({
            // You can customize these options as needed
            offset: 120, // offset (in px) from the original trigger point
            delay: 0, // values from 0 to 3000, with step 50ms
            duration: 800, // values from 0 to 3000, with step 50ms
            easing: 'ease', // default easing for AOS animations
            once: false, // whether animation should happen only once - while scrolling down
            mirror: false, // whether elements should animate out while scrolling past them
            anchorPlacement: 'top-bottom', // defines which position of the element should trigger the animation
        });
    });
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