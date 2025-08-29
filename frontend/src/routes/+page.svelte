<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { getCommunityPosts, getPosts, getUserProfile } from '$lib/api';
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
	let userDefaultPinCode = '';
	
	// Variables for search and stats
	let searchQuery = '';
	let stats = { totalUsers: 0, totalPosts: 0 };
	let uniqueLocations = 0;
	
	// Debounce timer for search
	let searchTimeout: ReturnType<typeof setTimeout>;

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
	
	function debounceSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			handleSearch();
		}, 300);
	}
	
	function handleSearch() {
		if (searchQuery.trim() && mapComponent) {
			// Try to search by pin code first
			const pinCodeMatch = searchQuery.match(/\d{6}/);
			if (pinCodeMatch) {
				mapComponent.focusOnPinCode(pinCodeMatch[0]);
			} else {
				// Could add location name search here in the future
				console.log('Searching for location:', searchQuery);
			}
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
	
	// Calculate stats reactively
	$: {
		stats.totalPosts = allPosts.length;
		stats.totalUsers = new Set(allPosts.map(p => p.user_id)).size;
		uniqueLocations = new Set(allPosts.map(p => p.pin_code).filter(Boolean)).size;
	}
</script>

<svelte:head>
	<title>SkillSwap - Community Skills Map</title>
	<meta name="description" content="Discover and share skills in your neighborhood with our interactive community map" />
</svelte:head>

{#if $authStore.loading}
	<div class="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-100">
		<div class="text-center">
			<span class="loading loading-spinner loading-lg text-blue-600"></span>
			<p class="mt-4 text-gray-600">Loading community map...</p>
		</div>
	</div>
{:else if $authStore.isAuthenticated}
	<!-- Full Height Map Layout -->
	<div class="h-full flex flex-col overflow-hidden">
		
		<!-- Top Controls Bar -->
		<div class="flex-none bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
			<div class="flex flex-col lg:flex-row gap-3 items-center justify-between p-4">
				<!-- Search and Navigation -->
				<div class="flex flex-wrap gap-3 items-center">
					<div class="flex gap-2 items-center">
						<input 
							class="input input-bordered input-sm bg-white shadow-md border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
							placeholder={userDefaultPinCode ? `Search pin code (default: ${userDefaultPinCode})` : "Search by pin code..."}
							bind:value={searchPinCode}
							on:keydown={(e) => e.key === 'Enter' && searchByPinCode()}
						/>
						<button 
							class="btn btn-primary btn-sm shadow-md hover:shadow-lg transition-shadow"
							on:click={searchByPinCode}
						>
							🔍
						</button>
					</div>
					
					<a href="/create" class="btn bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white btn-sm shadow-md hover:shadow-lg transition-all border-none">
						➕ Share Skill
					</a>
				</div>

				<!-- Filter Tabs -->
				<div class="tabs tabs-boxed bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
					<button 
						class="tab tab-sm {viewType === 'all' ? 'tab-active bg-blue-500 text-white' : 'hover:bg-gray-100'}"
						on:click={() => viewType = 'all'}
					>
						🌍 All ({filteredPosts.length})
					</button>
					<button 
						class="tab tab-sm {viewType === 'offers' ? 'tab-active bg-green-500 text-white' : 'hover:bg-gray-100'}"
						on:click={() => viewType = 'offers'}
					>
						💡 Skills ({offerCount})
					</button>
					<button 
						class="tab tab-sm {viewType === 'requests' ? 'tab-active bg-orange-500 text-white' : 'hover:bg-gray-100'}"
						on:click={() => viewType = 'requests'}
					>
						🙋 Requests ({requestCount})
					</button>
				</div>
			</div>
		</div>

		<!-- Full Screen Map -->
		<div class="flex-1 relative">
			{#if loading}
				<div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
					<div class="text-center">
						<span class="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
						<p class="text-gray-600">Loading community...</p>
					</div>
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
			
			<!-- Floating Stats Card -->
			{#if !loading}
				<div class="absolute top-4 right-4 z-10">
					<div class="card bg-white/90 backdrop-blur-md shadow-xl border border-white/20 compact">
						<div class="card-body p-4">
							<h3 class="card-title text-sm mb-3 text-gray-800">📊 Live Community Stats</h3>
							<div class="stats stats-vertical text-xs">
								<div class="stat p-2">
									<div class="stat-value text-sm text-blue-600 font-bold">{offerCount}</div>
									<div class="stat-desc text-gray-600">💡 Skills Available</div>
								</div>
								<div class="stat p-2">
									<div class="stat-value text-sm text-orange-600 font-bold">{requestCount}</div>
									<div class="stat-desc text-gray-600">🙋 Help Needed</div>
								</div>
								<div class="stat p-2">
									<div class="stat-value text-sm text-green-600 font-bold">{allPosts.length}</div>
									<div class="stat-desc text-gray-600">🤝 Total Posts</div>
								</div>
								<div class="stat p-2">
									<div class="stat-value text-sm text-purple-600 font-bold">{stats.totalUsers}</div>
									<div class="stat-desc text-gray-600">👥 Members</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Floating Location Info -->
			{#if selectedLocation}
				<div class="absolute bottom-4 left-4 right-4 z-10">
					<div class="alert alert-info bg-white/90 backdrop-blur-md shadow-xl border border-white/20">
						<div>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<div>
								<h3 class="font-bold text-gray-800">📍 Selected Location</h3>
								<div class="text-xs text-gray-600">
									<p>Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
									{#if selectedLocation.address}
										<p>Address: {selectedLocation.address}</p>
									{/if}
								</div>
							</div>
						</div>
						<div class="flex-none">
							<button class="btn btn-sm btn-ghost" on:click={() => selectedLocation = null}>✕</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<!-- Not Authenticated -->
	<div class="flex justify-center items-center h-full bg-gradient-to-br from-blue-50 to-purple-100">
		<div class="text-center">
			<h2 class="text-3xl font-bold mb-4 text-gray-800">Welcome to SkillSwap</h2>
			<p class="mb-6 text-gray-600">Discover and share skills in your neighborhood</p>
			<a href="/login" class="btn bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">Login to Continue</a>
		</div>
	</div>
{/if}
