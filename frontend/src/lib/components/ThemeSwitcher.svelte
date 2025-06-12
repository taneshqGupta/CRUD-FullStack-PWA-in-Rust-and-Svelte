<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<script lang="ts">
    import { enhance } from '$app/forms';
    export let currentPath: string; // Pass the current path from the parent layout

    const themes = [
        'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave',
        'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua',
        'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula',
        'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter',
        'dim', 'nord', 'sunset', 'caramellatte', 'abyss', 'silk'
    ];
    
    let dropdownOpen = false;

    const submitUpdateTheme = () => {
        // @ts-ignore
        return async ({ action, update }) => {
            const theme = action.searchParams.get('theme');
            if (theme) {
                document.documentElement.setAttribute('data-theme', theme);
            }
            await update();
        };
    };
</script>

<div class="dropdown" on:focusin={() => (dropdownOpen = true)} on:focusout={() => (dropdownOpen = false)}>
    <div
        tabindex="0"
        role="button"
        class={`btn btn-ghost text-lg ${dropdownOpen ? 'bg-base-200' : ''}`}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette-icon lucide-palette"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>
        <svg
            width="12px"
            height="12px"
            class="inline-block h-2 w-2 fill-current opacity-60"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
        >
            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
    </div>
    <ul
        tabindex="0"
        class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto absolute right-0 top-full mt-2 z-50"
    >
        <form method="POST" use:enhance={submitUpdateTheme}>
            {#each themes as theme}
                <li>
                    <button
                        class="btn btn-sm btn-ghost w-full justify-start normal-case"
                        formaction="/?/setTheme&theme={theme}&redirectTo={currentPath}"
                    >
                        {theme}
                    </button>
                </li>
            {/each}
        </form>
    </ul>
</div>