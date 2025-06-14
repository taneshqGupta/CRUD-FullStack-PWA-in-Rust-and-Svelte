<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<script lang="ts">
    import { enhance } from '$app/forms';
	import { DropdownSvg, ThemeSvg } from './icons';
    export let currentPath: string; 

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
        aria-label="themes"
    >
        <ThemeSvg />
        <DropdownSvg />
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
                        aria-label="{theme}"
                    >
                        {theme}
                    </button>
                </li>
            {/each}
        </form>
    </ul>
</div>