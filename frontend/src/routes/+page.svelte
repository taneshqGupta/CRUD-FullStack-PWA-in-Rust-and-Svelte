<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { getCommunityPosts, getPosts, getUserProfile } from '$lib/api';
	import { authStore } from '$lib/auth';
	import { onMount } from 'svelte';
	import type { Post } from '$lib/types';
	import { goto } from '$app/navigation';
	import { SearchSvg, PinSvg, MembersSvg, CrossSvg } from '$lib/components/icons';
    import { toNamespacedPath } from 'path';

	let allPosts: Post[] = [];
	let loading = true;
	let selectedLocation: { lat: number; lng: number; address?: string } | null = null;
	let mapComponent: Map;
	let viewType: 'all' | 'offers' | 'requests' = 'all';
	let searchPinCode = '';
	let userDefaultPinCode = '';

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
			const [personalPosts, communityPosts, userProfile] = await Promise.all([
				getPosts(),
				getCommunityPosts(),
				getUserProfile().catch(() => null)
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
	$: totalUsers = new Set(allPosts.map(p => p.user_id)).size;
	$: uniqueLocations = new Set(allPosts.map(p => p.pin_code).filter(Boolean)).size;
</script>

<svelte:head>
	<title>SkillSwap: Learn, Teach, Socialise</title>
	<meta name="description" content="Discover and share skills in your neighborhood with our interactive community map" />
</svelte:head>

{#if $authStore.loading}
	<div class="flex justify-center items-center h-full bg-base-100">
		<span class="loading loading-infinity loading-xl"></span>
	</div>
{:else if $authStore.isAuthenticated}
	<div class="h-full flex flex-col bg-base-100">
		
		<div class="flex-none bg-base-100 border-b border-base-100 shadow-sm">
			<div class="flex flex-col lg:flex-row gap-3 items-center justify-between p-4">
				<div class="flex flex-wrap gap-3 items-center">
					<div class="join">
						<input 
							class="input input-bordered join-item input-sm w-64"
							placeholder={userDefaultPinCode ? `Search pin code (default: ${userDefaultPinCode})` : "Search by pin code..."}
							bind:value={searchPinCode}
							on:keydown={(e) => e.key === 'Enter' && searchByPinCode()}
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

				<div class="tabs tabs-boxed">
					<button 
						class="tab tab-sm {viewType === 'all' ? 'tab-active' : ''}"
						on:click={() => viewType = 'all'}
					>
						All ({filteredPosts.length})
					</button>
					<button 
						class="tab tab-sm {viewType === 'offers' ? 'tab-active' : ''}"
						on:click={() => viewType = 'offers'}
					>
						<div class="badge badge-ghost">Offers</div> ({offerCount})
					</button>
					<button 
						class="tab tab-sm {viewType === 'requests' ? 'tab-active' : ''}"
						on:click={() => viewType = 'requests'}
					>
						<div class="badge badge-ghost">Requests</div> ({requestCount})
					</button>
				</div>
			</div>
		</div>

		<!-- Full Screen Map -->
		<div class="flex-1 relative">
			{#if loading}
				<div class="absolute inset-0 flex items-center justify-center bg-base-100">
					<span class="loading loading-infinity loading-xl"></span>
				</div>
			{:else}
				<Map
					bind:this={mapComponent}
					posts={filteredPosts}
					height="100%"
					onLocationSelect={handleLocationSelect}
					center={[28.6139, 77.2090]} 
					zoom={6}
					userPinCode={userDefaultPinCode}
				/>
			{/if}
			
			<!-- Floating Location Info -->
			{#if selectedLocation}
				<div class="absolute bottom-4 left-4 right-4" style="z-index: 400;">
					<div class="alert alert-info shadow-lg">
						<div>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<div>
								<h3 class="font-bold"><PinSvg /> Selected Location</h3>
								<div class="text-xs">
									<p>Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
									{#if selectedLocation.address}
										<p>Address: {selectedLocation.address}</p>
									{/if}
								</div>
							</div>
						</div>
						<div class="flex-none">
							<button class="btn btn-sm btn-ghost" on:click={() => selectedLocation = null}><CrossSvg /></button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div></div>
{/if}
