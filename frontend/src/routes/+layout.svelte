<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->

<script lang="ts">
	import { enhance } from '$app/forms';
	import '../app.css';

	export let data;

	const themes = [
		'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave',
		'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua',
		'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula',
		'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter',
		'dim', 'nord', 'sunset', 'caramellatte', 'abyss', 'silk'
	];
    
	let dropdownOpen = false;

	const submitUpdateTheme = () => {
		return async ({ action, update }) => {
			const theme = action.searchParams.get('theme');
			if (theme) {
				document.documentElement.setAttribute('data-theme', theme);
			}
			await update();
		};
	};
</script>

<div class="flex flex-col min-h-screen bg-base-100">
	<div class="navbar bg-base-100 z-10 border border-base-300">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost font-bold text-xl">Task Manager</a>
		</div>
		<div class="flex-none">
			<div class="dropdown" on:focusin={() => (dropdownOpen = true)} on:focusout={() => (dropdownOpen = false)}>
				<div
					tabindex="0"
					role="button"
					class={`btn btn-ghost text-lg ${dropdownOpen ? 'bg-base-200' : ''}`}
				>
					Themes
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
									formaction="/?/setTheme&theme={theme}&redirectTo={data.url.pathname}"
								>
									{theme}
								</button>
							</li>
						{/each}
					</form>
				</ul>
			</div>
		</div>
	</div>

	<main class="flex-grow p-4">
		<slot />
	</main>

    <div class="divider divider-accent my-0"></div>

	<footer class="footer sm:footer-horizontal bg-neutral text-neutral-content p-10">
		<nav>
			<h6 class="footer-title">Services</h6>
			<a class="link link-hover">Branding</a>
			<a class="link link-hover">Design</a>
			<a class="link link-hover">Marketing</a>
			<a class="link link-hover">Advertisement</a>
		</nav>
		<nav>
			<h6 class="footer-title">Company</h6>
			<a class="link link-hover">About us</a>
			<a class="link link-hover">Contact</a>
			<a class="link link-hover">Jobs</a>
			<a class="link link-hover">Press kit</a>
		</nav>
		<nav>
			<h6 class="footer-title">Legal</h6>
			<a class="link link-hover">Terms of use</a>
			<a class="link link-hover">Privacy policy</a>
			<a class="link link-hover">Cookie policy</a>
		</nav>
	</footer>
</div>
