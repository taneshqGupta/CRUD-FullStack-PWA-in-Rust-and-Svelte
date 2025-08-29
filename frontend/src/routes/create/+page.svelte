<script lang="ts">
    import type { PostType } from '$lib/types';
	import { createPost, getUserProfile } from '$lib/api';
	import { authStore } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let newPostDescription = '';
	let newPostCategory = '';
	let newPostType: PostType = 'offer';
	let newPinCode = '';
	let userDefaultPinCode = '';
	let loading = false;
	let success = '';
	let error = '';

	// Redirect to auth if not authenticated
	$: if (!$authStore.loading && !$authStore.isAuthenticated) {
		goto('/login');
	}

	onMount(async () => {
        if ($authStore.isAuthenticated) {
			try {
                const userProfile = await getUserProfile();
				userDefaultPinCode = userProfile.pin_code || '';
				newPinCode = userDefaultPinCode;
			} catch (error) {
                console.error('Error loading user profile:', error);
			}
		}
	});

	async function handleCreatePost() {
		if (!newPostDescription.trim()) {
			error = 'Please describe your skill or request';
			return;
		}
        
		const description = newPostDescription.trim();
		const category = newPostCategory.trim() || 'general';
		const pinCode = newPinCode.trim() || userDefaultPinCode;
		
		try {
            loading = true;
			error = '';
			
			await createPost(description, category, newPostType, pinCode);
			
			success = 'Post created successfully! Redirecting to community map...';
			
			// Reset form
			newPostDescription = '';
			newPostCategory = '';
			newPinCode = userDefaultPinCode;
			
			// Redirect to main page after success
			setTimeout(() => goto('/'), 1500);
			
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create post';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
    <title>Share Skill - SkillSwap</title>
	<meta name="description" content="Share your skills or request help from your community" />
</svelte:head>

{#if $authStore.isAuthenticated}
	<div class="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 overflow-y-auto">
		<div class="card w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20">
			<div class="card-body p-8">
                <!-- Header -->
				<div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">✨ Share with Community</h1>
					<p class="text-gray-600">What would you like to offer or request?</p>
				</div>
                
				<!-- Success/Error Messages -->
				{#if success}
					<div class="alert alert-success mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{success}</span>
					</div>
				{/if}
                
				{#if error}
					<div class="alert alert-error mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{error}</span>
					</div>
				{/if}
                
				<form on:submit|preventDefault={handleCreatePost} class="space-y-6">
					<!-- Post Type Selection -->
					<div class="form-control">
                        <label class="label">
                            <span class="label-text text-lg font-semibold">What would you like to do?</span>
						</label>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label class="cursor-pointer">
								<input 
                                type="radio" 
                                name="postType" 
									value="offer" 
									bind:group={newPostType}
									class="radio radio-primary hidden"
                                    />
                                    <div class="card border-2 transition-all duration-200 shadow-lg hover:shadow-xl {newPostType === 'offer' ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300'}">
									<div class="card-body items-center text-center p-6">
                                        <div class="text-4xl mb-2">💡</div>
										<h3 class="card-title text-green-700 font-bold">Offer a Skill</h3>
										<p class="text-sm text-gray-600">Share something you're good at</p>
									</div>
								</div>
							</label>
							
							<label class="cursor-pointer">
								<input 
									type="radio" 
									name="postType" 
									value="request" 
									bind:group={newPostType}
									class="radio radio-secondary hidden"
								/>
								<div class="card border-2 transition-all duration-200 shadow-lg hover:shadow-xl {newPostType === 'request' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}">
									<div class="card-body items-center text-center p-6">
										<div class="text-4xl mb-2">🙋</div>
										<h3 class="card-title text-orange-700 font-bold">Request Help</h3>
										<p class="text-sm text-gray-600">Ask for assistance with something</p>
									</div>
								</div>
							</label>
						</div>
					</div>

					<!-- Description -->
					<div class="form-control">
						<label class="label">
							<span class="label-text text-lg font-semibold">
								{newPostType === 'offer' ? 'What skill can you share?' : 'What do you need help with?'}
							</span>
						</label>
						<textarea
							class="textarea textarea-bordered textarea-lg h-32"
							placeholder={newPostType === 'offer' 
								? 'e.g., I can teach guitar, help with math homework, cook Indian food...' 
								: 'e.g., I need help moving furniture, learning Spanish, fixing my computer...'}
							bind:value={newPostDescription}
							required
						></textarea>
					</div>

					<!-- Category and Pin Code -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Category</span>
							</label>
							<input
								class="input input-bordered"
								type="text"
								placeholder="e.g., cooking, tech, music, sports"
								bind:value={newPostCategory}
							/>
							<label class="label">
								<span class="label-text-alt">Helps others find your post</span>
							</label>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text font-semibold">Pin Code</span>
							</label>
							<input
								class="input input-bordered"
								type="text"
								placeholder={userDefaultPinCode || 'e.g., 110001'}
								bind:value={newPinCode}
								pattern="[0-9]{6}"
								title="Please enter a valid 6-digit pin code"
							/>
							<label class="label">
								<span class="label-text-alt">
									{userDefaultPinCode ? `Default: ${userDefaultPinCode}` : 'For location-based matching'}
								</span>
							</label>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
						<button 
							type="submit" 
							class="btn btn-primary btn-lg w-full sm:w-auto"
							disabled={loading}
						>
							{#if loading}
								<span class="loading loading-spinner loading-sm"></span>
							{:else}
								{newPostType === 'offer' ? '💡 Share Skill' : '🙋 Request Help'}
							{/if}
						</button>
						
						<a href="/" class="btn btn-ghost w-full sm:w-auto">
							Cancel
						</a>
					</div>
				</form>

				<!-- Preview -->
				{#if newPostDescription.trim()}
					<div class="divider">Preview</div>
					<div class="card bg-base-200 shadow-sm">
						<div class="card-body p-4">
							<div class="flex items-center gap-2 mb-2">
								<span class="badge {newPostType === 'offer' ? 'badge-primary' : 'badge-secondary'} badge-sm">
									{newPostType === 'offer' ? '💡 Offering' : '🙋 Requesting'}
								</span>
								{#if newPostCategory.trim()}
									<span class="badge badge-outline badge-sm">{newPostCategory.trim()}</span>
								{/if}
								{#if newPinCode.trim() || userDefaultPinCode}
									<span class="badge badge-ghost badge-sm">📍 {newPinCode.trim() || userDefaultPinCode}</span>
								{/if}
							</div>
							<p class="text-sm">{newPostDescription.trim()}</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
