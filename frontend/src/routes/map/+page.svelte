<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { getCommunityPosts, getPosts } from '$lib/api';
	import { authStore } from '$lib/auth';
	import { onMount } from 'svelte';
	import type { Post } from '$lib/types';
	import { goto } from '$app/navigation';

	let allPosts: Post[] = [];
	let loading = true;
	let selectedLocation: { lat: number; lng: number; address?: string } | null = null;
	let mapComponent: Map;
	let viewType: 'all' | 'offers' | 'requests' = 'all';
	let searchPinCode = '';

	// Redirect to auth if not authenticated
	$: if (!$authStore.loading && !$authStore.isAuthenticated) {
		goto('/login');
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
			const [personalPosts, communityPosts] = await Promise.all([
				getPosts(),
				getCommunityPosts()
			]);
			
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
			console.error('Error loading posts:', error);
			if (error instanceof Error && error.message.includes('401')) {
				goto('/login');
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

	$: filteredPosts = allPosts.filter(post => {
		if (!post.pin_code) return false;
		
		if (viewType === 'offers') return post.post_type === 'offer';
		if (viewType === 'requests') return post.post_type === 'request';
		return true;
	});

	$: offerCount = allPosts.filter(p => p.post_type === 'offer' && p.pin_code).length;
	$: requestCount = allPosts.filter(p => p.post_type === 'request' && p.pin_code).length;
</script>

<svelte:head>
	<title>Community Map - SkillShare</title>
	<meta name="description" content="Discover skills and help requests in your neighborhood on our interactive map" />
</svelte:head>

{#if $authStore.loading}
	<div class="flex justify-center items-center min-h-[400px]">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if $authStore.isAuthenticated}
	<div class="w-full space-y-6">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-3xl font-bold text-primary mb-2">🗺️ Community Skill Map</h1>
			<p class="text-base-content/70">Discover local skills and help requests in your area</p>
		</div>

		<!-- Search and Filters -->
		<div class="card bg-base-200 shadow-lg">
			<div class="card-body">
				<div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
					<!-- Pin Code Search -->
					<div class="flex gap-2 items-center">
						<input 
							class="input input-bordered input-sm"
							placeholder="Search by pin code..."
							bind:value={searchPinCode}
							on:keydown={(e) => e.key === 'Enter' && searchByPinCode()}
						/>
						<button 
							class="btn btn-primary btn-sm"
							on:click={searchByPinCode}
						>
							🔍
						</button>
					</div>

					<!-- View Type Filters -->
					<div class="flex gap-2">
						<button 
							class="btn btn-sm {viewType === 'all' ? 'btn-primary' : 'btn-outline'}"
							on:click={() => viewType = 'all'}
						>
							All ({filteredPosts.length})
						</button>
						<button 
							class="btn btn-sm {viewType === 'offers' ? 'btn-primary' : 'btn-outline'}"
							on:click={() => viewType = 'offers'}
						>
							💡 Skills ({offerCount})
						</button>
						<button 
							class="btn btn-sm {viewType === 'requests' ? 'btn-secondary' : 'btn-outline'}"
							on:click={() => viewType = 'requests'}
						>
							🙋 Help Needed ({requestCount})
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Map -->
		<div class="card bg-base-100 shadow-lg">
			<div class="card-body p-0">
				{#if loading}
					<div class="flex justify-center items-center h-96">
						<div class="text-center">
							<span class="loading loading-spinner loading-lg mb-4"></span>
							<p>Loading community posts...</p>
						</div>
					</div>
				{:else}
					<Map
						bind:this={mapComponent}
						posts={filteredPosts}
						height="500px"
						onLocationSelect={handleLocationSelect}
						center={[28.6139, 77.2090]} 
						zoom={6}
					/>
				{/if}
			</div>
		</div>

		<!-- Selected Location Info -->
		{#if selectedLocation}
			<div class="alert alert-info shadow-lg">
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<div>
						<h3 class="font-bold">Selected Location</h3>
						<div class="text-xs">
							<p>📍 Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
							{#if selectedLocation.address}
								<p>🏠 Address: {selectedLocation.address}</p>
							{/if}
						</div>
					</div>
				</div>
				<div class="flex-none">
					<button class="btn btn-sm" on:click={() => selectedLocation = null}>Close</button>
				</div>
			</div>
		{/if}

		<!-- Map Legend -->
		<div class="card bg-base-200 shadow-lg">
			<div class="card-body">
				<h3 class="card-title text-lg">Map Legend</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="flex items-center gap-3">
						<div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-sm">💡</div>
						<span>Skills Available - People offering help and services</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-white text-sm">🙋</div>
						<span>Help Needed - People requesting assistance</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm">📍</div>
						<span>Click anywhere on the map to see location details</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-6 h-6 rounded-full bg-info flex items-center justify-center text-white text-sm">🔍</div>
						<span>Search by pin code to quickly find your area</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="card bg-base-200 shadow-lg">
			<div class="card-body">
				<h3 class="card-title text-lg">Quick Actions</h3>
				<div class="flex flex-wrap gap-2">
					<a href="/" class="btn btn-primary btn-sm">
						➕ Create New Post
					</a>
					<a href="/" class="btn btn-outline btn-sm">
						📋 View All Posts
					</a>
					<button 
						class="btn btn-outline btn-sm"
						on:click={() => {
							if (navigator.geolocation) {
								navigator.geolocation.getCurrentPosition((position) => {
									const { latitude, longitude } = position.coords;
									if (mapComponent) {
										mapComponent.focusOnPinCode(''); // This will center on user location
									}
								});
							}
						}}
					>
						📍 My Location
					</button>
				</div>
			</div>
		</div>

		<!-- Stats -->
		{#if !loading}
			<div class="stats stats-vertical lg:stats-horizontal shadow w-full">
				<div class="stat">
					<div class="stat-figure text-primary">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
						</svg>
					</div>
					<div class="stat-title">Skills Available</div>
					<div class="stat-value text-primary">{offerCount}</div>
					<div class="stat-desc">People ready to help</div>
				</div>
				
				<div class="stat">
					<div class="stat-figure text-secondary">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
						</svg>
					</div>
					<div class="stat-title">Help Requests</div>
					<div class="stat-value text-secondary">{requestCount}</div>
					<div class="stat-desc">People needing assistance</div>
				</div>
				
				<div class="stat">
					<div class="stat-figure text-success">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
					<div class="stat-title">Total Posts</div>
					<div class="stat-value text-success">{allPosts.length}</div>
					<div class="stat-desc">Community connections</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
