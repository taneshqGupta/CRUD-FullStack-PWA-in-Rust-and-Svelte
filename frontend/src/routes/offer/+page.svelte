<script lang="ts">
    import type { PostType } from '$lib/types';
	import { createPost, getUserProfile } from '$lib/api';
	import { authStore } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let newPostDescription = '';
	let newPostCategory = '';
	const newPostType: PostType = 'offer'; // Fixed to 'offer'
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
			error = 'Please describe your skill';
			return;
		}
        
		const description = newPostDescription.trim();
		const category = newPostCategory.trim() || 'general';
		const pinCode = newPinCode.trim() || userDefaultPinCode;
		
		try {
            loading = true;
			error = '';
			
			await createPost(description, category, newPostType, pinCode);
			
			success = 'Skill offer posted successfully! Redirecting to community map...';
			
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
    <title>Offer Skill - SkillSwap</title>
	<meta name="description" content="Share your skills with the community" />
</svelte:head>

{#if $authStore.isAuthenticated}
	<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
		<div class="card w-full max-w-2xl bg-base-100 shadow-2xl">
			<div class="card-body p-8">
                <!-- Header -->
				<div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-base-content mb-2">Offer Your Skill</h1>
					<p class="text-base-content/70">Share something you're good at with your community</p>
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

					<!-- Description -->
					<div class="form-control">
						<label for="skill-description" class="label">
							<span class="label-text text-lg font-semibold">What skill can you share?</span>
						</label>
						<textarea
							id="skill-description"
							name="description"
							class="textarea textarea-bordered textarea-lg h-32"
							placeholder="e.g., I can teach guitar, help with math homework, cook Indian food, design websites..."
							bind:value={newPostDescription}
							required
						></textarea>
					</div>

					<!-- Category and Pin Code -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label for="skill-category" class="label">
								<span class="label-text font-semibold">Category</span>
							</label>
							<input
								id="skill-category"
								name="category"
								class="input input-bordered"
								type="text"
								placeholder="e.g., cooking, tech, music, sports"
								bind:value={newPostCategory}
							/>
							<div class="label">
								<span class="label-text-alt">Helps others find your skill</span>
							</div>
						</div>

						<div class="form-control">
							<label for="skill-pincode" class="label">
								<span class="label-text font-semibold">Pin Code</span>
							</label>
							<input
								id="skill-pincode"
								name="pincode"
								class="input input-bordered"
								type="text"
								placeholder={userDefaultPinCode || 'e.g., 110001'}
								bind:value={newPinCode}
								pattern="[0-9]{6}"
								title="Please enter a valid 6-digit pin code"
							/>
							<div class="label">
								<span class="label-text-alt">
									{userDefaultPinCode ? `Default: ${userDefaultPinCode}` : 'For location-based matching'}
								</span>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
						<button 
							type="submit" 
							class="btn btn-primary btn-lg w-full sm:w-auto"
							class:loading
							disabled={loading}
						>
							{#if loading}
								<span class="loading loading-spinner loading-sm"></span>
								Posting...
							{:else}
								Share My Skill
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
								<span class="badge badge-primary badge-sm">
									Offering
								</span>
								{#if newPostCategory.trim()}
									<span class="badge badge-outline badge-sm">{newPostCategory.trim()}</span>
								{/if}
								{#if newPinCode.trim() || userDefaultPinCode}
									<span class="badge badge-ghost badge-sm">Pin Code: {newPinCode.trim() || userDefaultPinCode}</span>
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
