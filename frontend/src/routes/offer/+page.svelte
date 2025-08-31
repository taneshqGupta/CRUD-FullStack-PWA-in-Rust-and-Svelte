<script lang="ts">
	import type { PostType, Category } from "$lib/types";
	import { createPost, getUserProfile } from "$lib/api";
	import { authStore } from "$lib/auth";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { PinSvg } from "$lib/components/icons";
	import { CATEGORIES } from "$lib/types";

	let newPostDescription = "";
	let newPostCategory: Category | null = null;
	const newPostType: PostType = "offer";
	let newPinCode = "";
	let userDefaultPinCode = "";
	let loading = false;
	let success = "";
	let error = "";
	let categorySearch = "";

	$: filteredCategories = CATEGORIES.filter((cat) =>
		cat.toLowerCase().includes(categorySearch.toLowerCase()),
	);

	$: if (!$authStore.loading && !$authStore.isAuthenticated) {
		goto("/login");
	}

	onMount(async () => {
		if ($authStore.isAuthenticated) {
			try {
				const userProfile = await getUserProfile();
				userDefaultPinCode = userProfile.pin_code || "";
				newPinCode = userDefaultPinCode;
			} catch (error) {
				console.error("Error loading user profile:", error);
			}
		}
	});

	async function handleCreatePost() {
		if (!newPostDescription.trim()) {
			error = "Please describe your skill";
			return;
		}

		if (!newPostCategory) {
			error = "Please select a category";
			return;
		}

		const description = newPostDescription.trim();
		const category = newPostCategory;
		const pinCode = newPinCode.trim() || userDefaultPinCode;

		try {
			loading = true;
			error = "";

			await createPost(description, category, newPostType, pinCode);

			success = "Skill offer posted successfully!";

			newPostDescription = "";
			newPostCategory = null;
			newPinCode = userDefaultPinCode;

			setTimeout(() => goto("/"), 1500);
		} catch (err) {
			error =
				err instanceof Error ? err.message : "Failed to create post";
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Offer Skill - SkillSwap</title>
	<meta name="description" content="Share your skills with the community" />
</svelte:head>

{#if $authStore.isAuthenticated}
	<div class="h-full flex items-center justify-center">
		<div class="card card-border w-full max-w-md shadow-2xl bg-base-100">
			<div class="card-body">
				<div class="text-center mb-8">
					<h2
						class="card-title text-2xl font-bold text-base-content justify-center"
					>
						Offer a Skill
					</h2>
					<p class="text-base-content/70 text-sm">
						Share something you're good at to people around you.
					</p>
				</div>

				{#if success}
					<div class="alert alert-success">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="stroke-current flex-shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{success}</span>
					</div>
				{/if}

				{#if error}
					<div class="alert alert-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="stroke-current flex-shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{error}</span>
					</div>
				{/if}

				<form class="space-y-6">
					<div class="form-control">
						<fieldset class="fieldset">
							<legend class="fieldset-legend"
								>What skill can you share?</legend
							>
							<textarea
								class="input textarea h-24 w-full"
								placeholder="I can cook rice, design websites .."
								bind:value={newPostDescription}
								required
							></textarea>
						</fieldset>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<div class="dropdown dropdown-bottom">
								<div
									role="button"
									class="btn btn-soft btn-block justify-start"
									tabindex="0"
								>
									{newPostCategory || "Select a category..."}
								</div>
								<div
									class="dropdown-content bg-base-100 rounded-box z-[1] w-69 p-2 shadow max-h-60 overflow-y-auto"
								>
									<div class="form-control mb-2">
										<input
											class="input input-bordered input-sm"
											placeholder="Search categories..."
											bind:value={categorySearch}
										/>
									</div>

									<ul class="menu">
										{#each filteredCategories as category}
											<li>
												<button
													class="text-left text-sm"
													on:click={() =>
														(newPostCategory =
															category)}
												>
													{category}
												</button>
											</li>
										{/each}
										{#if filteredCategories.length === 0}
											<li>
												<span class="text-xs opacity-50"
													>No categories found</span
												>
											</li>
										{/if}
									</ul>
								</div>
							</div>
						</div>

						<div class="form-control">
							<input
								id="skill-pincode"
								name="pincode"
								class="input input-bordered"
								type="text"
								placeholder={userDefaultPinCode ||
									"e.g., 110001"}
								bind:value={newPinCode}
								maxlength="10"
								title="Enter your pin code (optional)"
							/>
							<div class="label">
								<span class="label-text-alt">
									{userDefaultPinCode
										? `Default: ${userDefaultPinCode}`
										: "For location-based matching"}
								</span>
							</div>
						</div>
					</div>

					<div class="flex justify-center items-center pt-4">
						<button
							type="button"
							class="btn btn-soft btn-block"
							on:click={handleCreatePost}
						>
							{#if loading}
								<span
									class="loading loading-infinity loading-sm"
								></span>
							{:else}
								Offer Skill
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
