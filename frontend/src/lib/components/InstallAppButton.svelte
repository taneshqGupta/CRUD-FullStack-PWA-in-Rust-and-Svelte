<script lang="ts">
	import { onMount } from "svelte";
	import { PhoneSvg, ComputerSvg } from "./icons";

	let deferredPrompt: any = null;
	export let showInstallButton = false;

	onMount(() => {
		window.addEventListener("beforeinstallprompt", (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallButton = true;
			console.log("InstallAppButton: beforeinstallprompt event fired.");
		});

		window.addEventListener("appinstalled", () => {
			showInstallButton = false;
			deferredPrompt = null;
			console.log("InstallAppButton: PWA was installed successfully!");
		});

		if (
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as any).standalone
		) {
			console.log(
				"InstallAppButton: App is already in standalone mode. Hiding install button.",
			);
			showInstallButton = false;
		}
	});

	async function handleInstallClick() {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;

			console.log(
				`InstallAppButton: User response to the install prompt: ${outcome}`,
			);

			deferredPrompt = null;
			showInstallButton = false;
		}
	}
</script>

{#if showInstallButton}
	<button
		id="installButton"
		class="not-lg:hidden btn btn-soft btn-sm text-xs"
		on:click={handleInstallClick}
		aria-label="Install the application"
	>
		<ComputerSvg />
		Install-App
	</button>
	<button
		id="installButton"
		class="lg:hidden btn btn-soft btn-sm text-xs"
		on:click={handleInstallClick}
		aria-label="Install the application"
	>
		<PhoneSvg />
		Install
	</button>
{/if}
