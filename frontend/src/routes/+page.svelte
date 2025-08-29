<script lang="ts">
	import type { Post, PostType } from '$lib/types';
	import { DeleteSvg, LeafSvg, NullSvg, PlusSvg, TodoSvg } from '$lib/components/icons';
	import { createPost, updatePost, deletePost, getPosts, getCommunityPosts, getCommunityOffers, getCommunityRequests, getUserProfile } from '$lib/api';
	import { authStore } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Map from '$lib/components/Map.svelte';

	let posts: Post[] = [];
	let communityPosts: Post[] = [];
	let newPostDescription: string = '';
	let newPostCategory: string = '';
	let newPostType: PostType = 'offer';
	let newPinCode: string = '';
	let userDefaultPinCode: string = '';
	let loading = true;
	let communityLoading = false;
	let showMyPosts = false;

	// Redirect to auth if not authenticated
	$: if (!$authStore.loading && !$authStore.isAuthenticated) {
		goto('/login');
	}

	onMount(async () => {
		// Wait for auth to be initialized
		if ($authStore.loading) {
			const unsubscribe = authStore.subscribe(async (auth) => {
				if (!auth.loading) {
					if (auth.isAuthenticated) {
						await loadPosts();
						await loadCommunityData(); // Always load community data since map is main view
					} else {
						goto('/login');
					}
					unsubscribe();
				}
			});
		} else if ($authStore.isAuthenticated) {
			await loadPosts();
			await loadCommunityData(); // Always load community data since map is main view
		}
	});

	async function loadPosts() {
		try {
			loading = true;
			posts = await getPosts();
			
			// Load user profile to get default pin code
			try {
				const userProfile = await getUserProfile();
				userDefaultPinCode = userProfile.pin_code || '';
				// Set default pin code for new posts if not already set
				if (!newPinCode && userDefaultPinCode) {
					newPinCode = userDefaultPinCode;
				}
			} catch (error) {
				console.error('Error loading user profile:', error);
			}
		} catch (error) {
			console.error('Error loading posts:', error);
			// If unauthorized, redirect to auth
			if (error instanceof Error && error.message.includes('401')) {
				goto('/login');
			}
		} finally {
			loading = false;
		}
	}

	async function loadCommunityData() {
		try {
			communityLoading = true;
			communityPosts = await getCommunityPosts(); // Always load all community posts
		} catch (error) {
			console.error('Error loading community data:', error);
		} finally {
			communityLoading = false;
		}
	}

	async function handleDeletePost(id: number) {
		try {
			await deletePost(id);
			posts = posts.filter((post) => post.id !== id);
		} catch (error) {
			console.error('Error deleting post:', error);
		}
	}

	async function handleUpdatePost(postToUpdate: Post) {
		try {
			const updatedPost = await updatePost(postToUpdate);
			posts = posts.map((p) => (p.id === updatedPost.id ? updatedPost : p));
		} catch (error) {
			console.error('Error updating post:', error);
		}
	}

	async function handleCreatePost() {
		const description = newPostDescription.trim();
		const category = newPostCategory.trim() || 'general';
		// Use provided pin code, or fall back to user's default pin code
		const pinCode = newPinCode.trim() || userDefaultPinCode;
		
		if (!description) {
			console.warn('Post description cannot be empty.');
			return;
		}

		try {
			const newPost = await createPost(description, category, newPostType, pinCode);
			posts = [...posts, newPost];
			newPostDescription = '';
			newPostCategory = '';
			// Reset pin code to user's default
			newPinCode = userDefaultPinCode;
		} catch (error) {
			console.error('Error creating post:', error);
		}
	}
</script>

{#if $authStore.loading}
	<div class="flex justify-center items-center h-screen">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if $authStore.isAuthenticated}
	<!-- Full Screen Map Layout -->
	<div class="h-screen flex relative overflow-hidden">
		<!-- Main Map Area -->
		<div class="flex-1 relative">
			<Map 
				posts={communityPosts} 
				height="100vh"
				center={[20.5937, 78.9629]}
				zoom={5}
				userPinCode={userDefaultPinCode}
			/>
			
			<!-- Floating Controls -->
			<div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
				<!-- Filter Controls -->
				<div class="card bg-base-100/95 backdrop-blur-sm shadow-lg compact">
					<div class="card-body p-3">
						<h3 class="font-bold text-sm mb-2">🎯 Filters</h3>
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text text-xs">💡 Skills Offered</span>
								<input type="checkbox" checked class="checkbox checkbox-primary checkbox-xs" />
							</label>
						</div>
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text text-xs">🙋 Help Requests</span>
								<input type="checkbox" checked class="checkbox checkbox-secondary checkbox-xs" />
							</label>
						</div>
						<input 
							type="text" 
							placeholder="Search categories..."
							class="input input-bordered input-xs mt-2"
						/>
						<input 
							type="text" 
							placeholder="Pin code filter..."
							class="input input-bordered input-xs mt-1"
						/>
					</div>
				</div>
			</div>

			<!-- Right Side Panel -->
			<div class="absolute top-4 right-4 bottom-4 w-80 z-10 flex flex-col gap-4">
				<!-- Quick Post Creation -->
				<div class="card bg-base-100/95 backdrop-blur-sm shadow-lg">
					<div class="card-body p-4">
						<h3 class="card-title text-sm mb-3">
							<PlusSvg />
							Quick Share
						</h3>
						
						<div class="form-control mb-2">
							<div class="flex gap-1">
								<label class="label cursor-pointer flex-1 bg-base-200 rounded p-2 text-xs {newPostType === 'offer' ? 'bg-primary text-primary-content' : ''}">
									<input 
										type="radio" 
										name="postType" 
										value="offer" 
										bind:group={newPostType}
										class="radio radio-xs hidden"
									>
									<span>💡 Offer</span>
								</label>
								<label class="label cursor-pointer flex-1 bg-base-200 rounded p-2 text-xs {newPostType === 'request' ? 'bg-secondary text-secondary-content' : ''}">
									<input 
										type="radio" 
										name="postType" 
										value="request" 
										bind:group={newPostType}
										class="radio radio-xs hidden"
									>
									<span>🙋 Request</span>
								</label>
							</div>
						</div>

						<textarea
							class="textarea textarea-bordered textarea-sm w-full h-16 text-xs"
							placeholder="What skill can you offer or what help do you need?"
							bind:value={newPostDescription}
							required
						></textarea>
						
						<div class="flex gap-2 mt-2">
							<input
								class="input input-bordered input-xs flex-1"
								type="text"
								placeholder="Category"
								bind:value={newPostCategory}
							/>
							<input
								class="input input-bordered input-xs w-20"
								type="text"
								placeholder={userDefaultPinCode || 'Pin'}
								bind:value={newPinCode}
							/>
						</div>
						
						<button 
							type="button" 
							class="btn btn-primary btn-sm w-full mt-2"
							on:click={handleCreatePost}
						>
							Share
						</button>
					</div>
				</div>

				<!-- Stats Card -->
				<div class="card bg-base-100/95 backdrop-blur-sm shadow-lg">
					<div class="card-body p-4">
						<h3 class="card-title text-sm">📊 Community Stats</h3>
						<div class="stats stats-vertical text-xs">
							<div class="stat p-2">
								<div class="stat-value text-sm">{communityPosts.filter(p => p.post_type === 'offer').length}</div>
								<div class="stat-desc">💡 Skills Available</div>
							</div>
							<div class="stat p-2">
								<div class="stat-value text-sm">{communityPosts.filter(p => p.post_type === 'request').length}</div>
								<div class="stat-desc">🙋 Help Needed</div>
							</div>
						</div>
					</div>
				</div>

				<!-- My Posts Toggle -->
				<button 
					class="btn btn-ghost btn-sm bg-base-100/95 backdrop-blur-sm"
					on:click={() => showMyPosts = !showMyPosts}
				>
					📝 My Posts ({posts.length})
				</button>
			</div>

			<!-- My Posts Overlay -->
			{#if showMyPosts}
				<div class="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
					<div class="card bg-base-100 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
						<div class="card-body">
							<div class="flex justify-between items-center mb-4">
								<h3 class="card-title">📝 My Posts</h3>
								<button class="btn btn-ghost btn-sm" on:click={() => showMyPosts = false}>✕</button>
							</div>
							
							<div class="space-y-2">
								{#each posts as post (post.id)}
									<div class="card bg-base-200 shadow-sm">
										<div class="card-body p-3">
											<div class="flex items-start justify-between">
												<div class="flex-1">
													<div class="flex items-center gap-2 mb-1">
														<span class="badge {post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'} badge-xs">
															{post.post_type === 'offer' ? '💡' : '🙋'}
														</span>
														<span class="badge badge-outline badge-xs">{post.category}</span>
														{#if post.pin_code}
															<span class="badge badge-ghost badge-xs">📍 {post.pin_code}</span>
														{/if}
													</div>
													<p class="text-sm">{post.description}</p>
													{#if post.completed}
														<p class="text-xs text-success mt-1">✅ Completed</p>
													{/if}
												</div>
												<div class="flex gap-1">
													<button 
														class="btn btn-ghost btn-xs" 
														on:click={() => handleUpdatePost({...post, completed: !post.completed})}
													>
														{post.completed ? '↶' : '✓'}
													</button>
													<button 
														class="btn btn-ghost btn-xs text-error" 
														on:click={() => handleDeletePost(post.id)}
													>
														<DeleteSvg />
													</button>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}