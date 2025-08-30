<script lang="ts">
	import Map from "$lib/components/Map.svelte";
	import { getCommunityPosts, getPosts, getUserProfile } from "$lib/api";
	import { authStore } from "$lib/auth";
	import { onMount } from "svelte";
	import type { Post } from "$lib/types";
	import { CATEGORIES, type Category, type PostType } from "$lib/types";
	import { goto } from "$app/navigation";
	import {
		SearchSvg,
		PinSvg,
		MembersSvg,
		CrossSvg,
	} from "$lib/components/icons";

	let allPosts: Post[] = [];
	let loading = true;
	let selectedLocation: {
		lat: number;
		lng: number;
		address?: string;
	} | null = null;
	let mapComponent: Map;

	// New robust filtering system
	let textSearch = "";
	let selectedCategories: Category[] = [];
	let categorySearch = "";
	let postTypeFilter: "both" | "offers" | "requests" = "both";
	let userNameSearch = "";
	let searchPinCode = "";
	let userDefaultPinCode = "";

	// Filtered categories for search
	$: filteredCategories = CATEGORIES.filter((category) =>
		category.toLowerCase().includes(categorySearch.toLowerCase()),
	);

	// Helper function to toggle category selection
	function toggleCategory(category: Category) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter(
				(c) => c !== category,
			);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
		// Clear search after selection for better UX
		categorySearch = "";
	}

	// Redirect to auth if not authenticated
	$: if (!$authStore.loading && !$authStore.isAuthenticated) {
		goto("/login");
	}

	onMount(async () => {
		if ($authStore.loading) {
			const unsubscribe = authStore.subscribe(async (auth) => {
				if (!auth.loading) {
					if (auth.isAuthenticated) {
						await loadAllPosts();
					}
					unsubscribe();
				}
			});
		} else if ($authStore.isAuthenticated) {
			await loadAllPosts();
		}
	});

	async function loadAllPosts() {
		try {
			loading = true;
			const [personalPosts, communityPosts, userProfile] =
				await Promise.all([
					getPosts(),
					getCommunityPosts(),
					getUserProfile().catch(() => null),
				]);

			// Set user default pin code
			if (userProfile?.pin_code) {
				userDefaultPinCode = userProfile.pin_code;
			}

			// Combine and deduplicate posts
			const seenIds = new Set<number>();
			allPosts = [];

			for (const post of [...personalPosts, ...communityPosts]) {
				if (!seenIds.has(post.id)) {
					seenIds.add(post.id);
					allPosts.push(post);
				}
			}
		} catch (error) {
			console.error("Error loading posts:", error);
			if (error instanceof Error && error.message.includes("401")) {
				goto("/login");
			}
		} finally {
			loading = false;
		}
	}

	function handleLocationSelect(lat: number, lng: number, address?: string) {
		selectedLocation = { lat, lng, address };
	}

	function searchByPinCode() {
		if (searchPinCode.trim() && mapComponent) {
			mapComponent.focusOnPinCode(searchPinCode.trim());
		}
	}

	$: filteredPosts = allPosts.filter((post) => {
		if (!post.pin_code) return false;

		if (postTypeFilter === "offers" && post.post_type !== "offer")
			return false;
		if (postTypeFilter === "requests" && post.post_type !== "request")
			return false;

		if (
			selectedCategories.length > 0 &&
			!selectedCategories.includes(post.category)
		)
			return false;

		if (
			userNameSearch.trim() &&
			post.user_name &&
			!post.user_name.toLowerCase().includes(userNameSearch.toLowerCase())
		)
			return false;

		if (textSearch.trim()) {
			const searchTerm = textSearch.toLowerCase();
			const searchableContent = [
				post.description,
				post.category,
				post.pin_code,
				post.user_name || "",
			]
				.join(" ")
				.toLowerCase();

			if (!searchableContent.includes(searchTerm)) return false;
		}

		return true;
	});

	$: offerCount = allPosts.filter(
		(p) => p.post_type === "offer" && p.pin_code,
	).length;
	$: requestCount = allPosts.filter(
		(p) => p.post_type === "request" && p.pin_code,
	).length;
	$: totalUsers = new Set(allPosts.map((p) => p.user_id)).size;
	$: uniqueLocations = new Set(
		allPosts.map((p) => p.pin_code).filter(Boolean),
	).size;
</script>

<svelte:head>
	<title>SkillSwap: Learn, Teach, Socialise</title>
	<meta
		name="description"
		content="Discover and share skills in your neighborhood with our interactive community map"
	/>
</svelte:head>

{#if $authStore.loading}
	<div class="flex justify-center items-center h-full bg-base-100">
		<span class="loading loading-infinity loading-xl"></span>
	</div>
{:else if $authStore.isAuthenticated}
	<div class="h-full flex flex-col bg-base-100">
		<div class="flex-none bg-base-100 border-b border-base-100 shadow-sm">
			<div
				class="flex flex-col lg:flex-row gap-3 items-center justify-between p-4"
			>
				<div class="flex flex-wrap gap-3 items-center">
					<label class="label" for="text-search">
						<span class="label-text text-xs">Pin Code Search</span>
					</label>
					<div class="join">
						<input
							class="input input-bordered join-item input-sm"
							placeholder="Enter 6-digit pin code"
							bind:value={searchPinCode}
							on:keydown={(e) =>
								e.key === "Enter" && searchByPinCode()}
						/>
						<button
							class="btn btn-soft join-item btn-sm"
							on:click={searchByPinCode}
						>
							<SearchSvg />
						</button>
					</div>

					<div class="flex gap-2">
						<a href="/offer" class="btn btn-soft btn-sm">
							Offer-Skill
						</a>
						<a href="/request" class="btn btn-soft btn-sm">
							Request-Help
						</a>
					</div>
				</div>

				<div
					class="flex flex-col lg:flex-row gap-3 items-start lg:items-center"
				>
					<div class="form-control">
						<label class="label" for="text-search">
							<span class="label-text text-xs"
								>Full Text Search</span
							>
						</label>
						<input
							id="text-search"
							class="input input-bordered input-sm w-64"
							placeholder="Search posts, names, categories..."
							bind:value={textSearch}
						/>
					</div>

					<div class="form-control">
						<div class="label">
							<span class="label-text text-xs"
								>Categories ({selectedCategories.length} selected)</span
							>
						</div>
						<div class="dropdown dropdown-bottom">
							<div
								role="button"
								class="btn btn-soft btn-sm"
								tabindex="0"
							>
								Categories {selectedCategories.length > 0
									? `(${selectedCategories.length})`
									: ""}
							</div>
							<div
								class="dropdown-content bg-base-100 rounded-box z-[1] w-80 p-2 shadow"
							>
								<!-- Search Input -->
								<div class="form-control mb-2">
									<input
										class="input input-bordered input-xs"
										placeholder="Search categories..."
										bind:value={categorySearch}
									/>
								</div>

								<!-- Selected Categories Display -->
								{#if selectedCategories.length > 0}
									<div class="mb-2 p-2 bg-base-200 rounded">
										<div
											class="flex items-center justify-between mb-1"
										>
											<div class="text-xs font-semibold">
												Selected:
											</div>
											<button
												class="btn btn-ghost btn-xs"
												on:click={() =>
													(selectedCategories = [])}
												>Clear All</button
											>
										</div>
										<div class="flex flex-wrap gap-1">
											{#each selectedCategories as category}
												<div
													class="badge badge-primary badge-xs"
												>
													{category}
													<button
														class="ml-1"
														on:click={() =>
															(selectedCategories =
																selectedCategories.filter(
																	(c) =>
																		c !==
																		category,
																))}>×</button
													>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Category List -->
								<ul class="menu max-h-40 overflow-y-auto">
									{#each filteredCategories as category (category)}
										<li>
											<label
												class="cursor-pointer flex items-center gap-2 text-xs"
											>
												<input
													type="checkbox"
													class="checkbox checkbox-xs"
													checked={selectedCategories.includes(
														category,
													)}
													on:change={() =>
														toggleCategory(
															category,
														)}
												/>
												<span>{category}</span>
											</label>
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

					<!-- Post Type Select -->
					<div class="form-control">
						<div class="label">
							<span class="label-text text-xs">Offer/Request</span
							>
						</div>
						<div class="dropdown dropdown-bottom">
							<div
								role="button"
								class="btn btn-soft btn-sm"
								tabindex="0"
							>
								{postTypeFilter === "both"
									? "Both"
									: postTypeFilter === "offers"
										? "Offers Only"
										: "Requests Only"}
							</div>
							<ul
								class="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow"
							>
								<li>
									<label
										class="cursor-pointer flex items-center gap-2"
									>
										<input
											type="radio"
											class="radio radio-sm"
											bind:group={postTypeFilter}
											value="both"
										/>
										<span class="text-sm">Both</span>
									</label>
								</li>
								<li>
									<label
										class="cursor-pointer flex items-center gap-2"
									>
										<input
											type="radio"
											class="radio radio-sm"
											bind:group={postTypeFilter}
											value="offers"
										/>
										<span class="text-sm">Offers Only</span>
									</label>
								</li>
								<li>
									<label
										class="cursor-pointer flex items-center gap-2"
									>
										<input
											type="radio"
											class="radio radio-sm"
											bind:group={postTypeFilter}
											value="requests"
										/>
										<span class="text-sm"
											>Requests Only</span
										>
									</label>
								</li>
							</ul>
						</div>
					</div>

					<!-- User Name Search -->
					<div class="form-control">
						<label class="label" for="user-search">
							<span class="label-text text-xs"
								>Filter by User</span
							>
						</label>
						<input
							id="user-search"
							class="input input-bordered input-sm w-48"
							placeholder="Search by user name..."
							bind:value={userNameSearch}
						/>
					</div>

					<!-- Clear Filters Button -->
					<div class="form-control">
						<div class="label">
							<span class="label-text text-xs opacity-0">.</span>
						</div>
						<button
							class="btn btn-ghost btn-sm"
							on:click={() => {
								textSearch = "";
								selectedCategories = [];
								postTypeFilter = "both";
								userNameSearch = "";
							}}
						>
							Clear Filters
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Full Screen Map -->
		<div class="flex-1 relative">
			{#if loading}
				<div
					class="absolute inset-0 flex items-center justify-center bg-base-100"
				>
					<span class="loading loading-infinity loading-xl"></span>
				</div>
			{:else}
				<Map
					bind:this={mapComponent}
					posts={filteredPosts}
					height="100%"
					onLocationSelect={handleLocationSelect}
					center={[28.6139, 77.209]}
					zoom={6}
					userPinCode={userDefaultPinCode}
				/>
			{/if}
		</div>
	</div>
{:else}
	<div></div>
{/if}
