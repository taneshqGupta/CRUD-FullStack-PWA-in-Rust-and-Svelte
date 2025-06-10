<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->

<script lang="ts">
    
	import '../app.css';
    import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	export let data;

</script>

<div class="flex flex-col min-h-screen bg-base-100">
	<div class="navbar bg-base-100 z-10 border border-base-300">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost font-bold text-xl">Task Manager</a>
		</div>
		<div class="flex-none">
			<ThemeSwitcher currentPath={data.url.pathname} />
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
