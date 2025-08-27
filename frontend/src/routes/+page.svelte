<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<script lang="ts">
	import type { Post, PostType } from '$lib/types';
	import { DeleteSvg, LeafSvg, NullSvg, PlusSvg, TodoSvg } from '$lib/components/icons';
	import { createPost, updatePost, deletePost, getPosts, getCommunityPosts, getCommunityOffers, getCommunityRequests } from '$lib/api';
	import { authStore } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let posts: Post[] = [];
	let communityPosts: Post[] = [];
	let newPostDescription: string = '';
	let newPostCategory: string = '';
	let newPostType: PostType = 'offer';
	let newPinCode: string = '';
	let loading = true;
	let communityLoading = false;
	let currentView: 'personal' | 'community' | 'offers' | 'requests' = 'personal';

	// Redirect to auth if not authenticated
	$: if (!$authStore.loading && !$authStore.isAuthenticated) {
		goto('/auth');
	}

	onMount(async () => {
		// Wait for auth to be initialized
		if ($authStore.loading) {
			const unsubscribe = authStore.subscribe(async (auth) => {
				if (!auth.loading) {
					if (auth.isAuthenticated) {
						await loadPosts();
					} else {
						goto('/auth');
					}
					unsubscribe();
				}
			});
		} else if ($authStore.isAuthenticated) {
			await loadPosts();
		}
	});

	async function loadPosts() {
		try {
			loading = true;
			posts = await getPosts();
		} catch (error) {
			console.error('Error loading posts:', error);
			// If unauthorized, redirect to auth
			if (error instanceof Error && error.message.includes('401')) {
				goto('/auth');
			}
		} finally {
			loading = false;
		}
	}

	async function loadCommunityData() {
		try {
			communityLoading = true;
			if (currentView === 'community') {
				communityPosts = await getCommunityPosts();
			} else if (currentView === 'offers') {
				communityPosts = await getCommunityOffers();
			} else if (currentView === 'requests') {
				communityPosts = await getCommunityRequests();
			}
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
		const pinCode = newPinCode.trim();
		
		if (!description) {
			console.warn('Post description cannot be empty.');
			return;
		}

		try {
			const newPost = await createPost(description, category, newPostType, pinCode);
			posts = [...posts, newPost];
			newPostDescription = '';
			newPostCategory = '';
			newPinCode = '';
		} catch (error) {
			console.error('Error creating post:', error);
		}
	}

	async function switchView(view: 'personal' | 'community' | 'offers' | 'requests') {
		currentView = view;
		if (view !== 'personal') {
			await loadCommunityData();
		}
	}
</script>

{#if $authStore.loading}
	<div class="flex justify-center items-center min-h-[200px]">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if $authStore.isAuthenticated}
	<div class="w-full p-4">
		<!-- Navigation Tabs -->
		<div class="tabs tabs-boxed mb-4 bg-base-200">
			<button 
				class="tab {currentView === 'personal' ? 'tab-active' : ''}"
				on:click={() => switchView('personal')}
			>
				My Posts
			</button>
			<button 
				class="tab {currentView === 'community' ? 'tab-active' : ''}"
				on:click={() => switchView('community')}
			>
				Community
			</button>
			<button 
				class="tab {currentView === 'offers' ? 'tab-active' : ''}"
				on:click={() => switchView('offers')}
			>
				Skills Offered
			</button>
			<button 
				class="tab {currentView === 'requests' ? 'tab-active' : ''}"
				on:click={() => switchView('requests')}
			>
				Help Needed
			</button>
		</div>

		{#if currentView === 'personal'}
			<!-- Create New Post Form -->
			<div>
				<fieldset
					class="fieldset bg-base-200 border-base-300 rounded-md w-full border p-4"
					aria-label="Create a New Post"
				>
					<legend class="fieldset-legend">
						<PlusSvg />
						Share a Skill or Request Help
					</legend>
					<form on:submit|preventDefault={handleCreatePost}>
						<!-- Post Type Selection -->
						<div class="flex gap-4 mb-4">
							<label class="label cursor-pointer">
								<input 
									type="radio" 
									name="postType" 
									value="offer" 
									bind:group={newPostType}
									class="radio radio-primary"
								>
								<span class="label-text ml-2">💡 I can offer this skill</span>
							</label>
							<label class="label cursor-pointer">
								<input 
									type="radio" 
									name="postType" 
									value="request" 
									bind:group={newPostType}
									class="radio radio-secondary"
								>
								<span class="label-text ml-2">🙋 I need help with this</span>
							</label>
						</div>

						<input
							class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
							name="description"
							type="text"
							placeholder={newPostType === 'offer' ? 'What skill can you share?' : 'What do you need help with?'}
							aria-label="Post description"
							autocomplete="off"
							bind:value={newPostDescription}
							on:keydown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									handleCreatePost();
								}
							}}
						/>
						<input
							class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
							name="category"
							type="text"
							placeholder="Category (e.g., cooking, gardening, tech support)"
							aria-label="Category for the post"
							autocomplete="off"
							bind:value={newPostCategory}
							on:keydown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									handleCreatePost();
								}
							}}
						/>
						<input
							class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
							name="pincode"
							type="text"
							placeholder="Your pin code (optional, for local connections)"
							aria-label="Pin code for location"
							autocomplete="off"
							bind:value={newPinCode}
							on:keydown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									handleCreatePost();
								}
							}}
						/>
					</form>
					<p class="label text-xs mt-2 font-semibold textarea-primary">
						<LeafSvg />
						Press enter to share your {newPostType === 'offer' ? 'skill offer' : 'help request'}
					</p>
				</fieldset>
			</div>

		{#if loading}
			<div class="flex justify-center items-center min-h-[200px]">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else}
			<div class="w-full mt-4">
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-md w-full border p-4">
					<legend class="fieldset-legend">
						<TodoSvg />
						Your Posts
					</legend>

					<ul class="space-y-2" role="list" aria-label="Your posts list">
						{#each posts as post (post.id)}
							<li class="flex items-center justify-between p-3 bg-base-100 rounded-md border border-base-300">
								<div class="flex items-center gap-3 flex-1">
									<input
										type="checkbox"
										bind:checked={post.completed}
										on:change={() => handleUpdatePost(post)}
										class="checkbox checkbox-primary checkbox-sm"
										aria-label="Mark post as {post.completed ? 'incomplete' : 'complete'}"
									/>
									<div class="flex flex-col flex-1">
										<div class="flex items-center gap-2 mb-1">
											<span class="badge badge-sm {post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'}">
												{post.post_type === 'offer' ? '💡 Offering' : '🙋 Requesting'}
											</span>
											{#if post.pin_code}
												<span class="badge badge-outline badge-sm">📍 {post.pin_code}</span>
											{/if}
										</div>
										<span
											class="text-sm {post.completed ? 'line-through opacity-50' : ''}"
											contenteditable
											bind:textContent={post.description}
											spellcheck="false"
											on:blur={() => handleUpdatePost(post)}
										></span>
										<div class="flex gap-2 mt-1">
											<span class="text-xs opacity-50">Category: {post.category}</span>
											{#if post.user_name}
												<span class="text-xs opacity-50">• By: {post.user_name}</span>
											{/if}
										</div>
									</div>
								</div>
								<button
									class="btn btn-ghost btn-sm"
									on:click={() => handleDeletePost(post.id)}
									aria-label="delete post"
								>
									<DeleteSvg />
								</button>
							</li>
						{/each}

						{#if posts.length === 0}
							<li class="p-4 text-center" aria-label="no posts">
								<div class="flex items-center justify-center gap-2">
									<NullSvg />
									You haven't shared any skills or requests yet
								</div>
							</li>
						{/if}
					</ul>
				</fieldset>
			</div>
		{/if}

		{:else}
			<!-- Community Views -->
			<div class="w-full">
				{#if communityLoading}
					<div class="flex justify-center items-center min-h-[200px]">
						<span class="loading loading-spinner loading-lg"></span>
					</div>
				{:else}
					<fieldset class="fieldset bg-base-200 border-base-300 rounded-md w-full border p-4">
						<legend class="fieldset-legend">
							<TodoSvg />
							{#if currentView === 'community'}
								Community Posts
							{:else if currentView === 'offers'}
								Skills Available in Your Community
							{:else if currentView === 'requests'}
								Neighbors Who Need Help
							{/if}
						</legend>

						<ul class="space-y-3" role="list" aria-label="Community posts list">
							{#each communityPosts as post (post.id)}
								<li class="p-4 bg-base-100 rounded-md border border-base-300">
									<div class="flex flex-col gap-2">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="badge {post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'}">
												{post.post_type === 'offer' ? '💡 Offering' : '🙋 Requesting'}
											</span>
											{#if post.pin_code}
												<span class="badge badge-outline">📍 {post.pin_code}</span>
											{/if}
											<span class="badge badge-ghost">{post.category}</span>
											{#if post.completed}
												<span class="badge badge-success">✅ Completed</span>
											{/if}
										</div>
										<p class="text-sm {post.completed ? 'line-through opacity-50' : ''}">{post.description}</p>
										{#if post.user_name}
											<p class="text-xs opacity-70">Shared by: <strong>{post.user_name}</strong></p>
										{/if}
									</div>
								</li>
							{/each}

							{#if communityPosts.length === 0}
								<li class="p-4 text-center" aria-label="no community posts">
									<div class="flex items-center justify-center gap-2">
										<NullSvg />
										{#if currentView === 'community'}
											No community posts yet
										{:else if currentView === 'offers'}
											No skills being offered in your area yet
										{:else if currentView === 'requests'}
											No help requests in your area yet
										{/if}
									</div>
								</li>
							{/if}
						</ul>
					</fieldset>
				{/if}
			</div>
		{/if}
	</div>
{/if}