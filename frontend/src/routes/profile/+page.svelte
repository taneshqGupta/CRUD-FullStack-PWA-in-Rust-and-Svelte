<script lang="ts">
    import { getUserProfile, getPosts, updateProfilePicture } from '$lib/api';
    import { authStore, logout } from '$lib/auth';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { Post } from '$lib/types';
    import ProfilePicture from '$lib/components/ProfilePicture.svelte';

    let loading = true;
    let profile: any = null;
    let userPosts: Post[] = [];
    let error = '';
    let profileUpdateLoading = false;

    // Redirect to auth if not authenticated
    $: if (!$authStore.loading && !$authStore.isAuthenticated) {
        goto('/login');
    }

    onMount(async () => {
        if ($authStore.isAuthenticated) {
            await loadProfile();
        }
    });

    async function loadProfile() {
        try {
            loading = true;
            const [profileData, posts] = await Promise.all([
                getUserProfile(),
                getPosts()
            ]);
            profile = profileData;
            userPosts = posts;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load profile';
        } finally {
            loading = false;
        }
    }

    async function handleLogout() {
        await logout();
        goto('/login');
    }

    async function handleProfilePictureChange(file: File) {
        try {
            profileUpdateLoading = true;
            error = '';
            
            // Convert to base64
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Data = reader.result as string;
                    await updateProfilePicture(base64Data);
                    
                    // Reload profile to get updated picture
                    await loadProfile();
                } catch (err) {
                    error = err instanceof Error ? err.message : 'Failed to update profile picture';
                } finally {
                    profileUpdateLoading = false;
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to process image';
            profileUpdateLoading = false;
        }
    }

    $: offerCount = userPosts.filter(post => post.post_type === 'offer').length;
    $: requestCount = userPosts.filter(post => post.post_type === 'request').length;
    $: completedCount = userPosts.filter(post => post.completed).length;
</script>

<svelte:head>
    <title>My Profile - SkillSwap</title>
    <meta name="description" content="View and manage your SkillSwap profile" />
</svelte:head>

{#if $authStore.isAuthenticated}
    <div class="min-h-screen bg-base-200 p-4">
        <div class="max-w-4xl mx-auto">
            
            {#if loading}
                <div class="flex justify-center items-center h-64">
                    <div class="text-center">
                        <span class="loading loading-spinner loading-lg text-primary"></span>
                        <p class="mt-4 text-base-content/70">Loading profile...</p>
                    </div>
                </div>
            {:else if error}
                <div class="alert alert-error">
                    <span>{error}</span>
                </div>
            {:else if profile}
                <!-- Profile Header -->
                <div class="card bg-base-100 shadow-xl mb-6">
                    <div class="card-body">
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="relative">
                                <ProfilePicture 
                                    profilePicture={profile.profile_picture}
                                    name={profile.name || 'User'}
                                    size="xl"
                                    editable={!profileUpdateLoading}
                                    onImageChange={handleProfilePictureChange}
                                />
                                {#if profileUpdateLoading}
                                    <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                        <span class="loading loading-spinner loading-md text-white"></span>
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="text-center md:text-left">
                                <h1 class="card-title text-3xl mb-2">{profile.name || 'User'}</h1>
                                <p class="text-base-content/70 mb-2">📧 {profile.email}</p>
                                {#if profile.pin_code}
                                    <p class="text-base-content/70">📍 Pin Code: {profile.pin_code}</p>
                                {/if}
                                <p class="text-xs text-base-content/50 mt-2">Click profile picture to change</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-primary">
                            <div class="text-3xl">📊</div>
                        </div>
                        <div class="stat-title">Total Posts</div>
                        <div class="stat-value text-primary">{userPosts.length}</div>
                    </div>
                    
                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-info">
                            <div class="text-3xl">💡</div>
                        </div>
                        <div class="stat-title">Skills Offered</div>
                        <div class="stat-value text-info">{offerCount}</div>
                    </div>
                    
                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-warning">
                            <div class="text-3xl">🙋</div>
                        </div>
                        <div class="stat-title">Help Requested</div>
                        <div class="stat-value text-warning">{requestCount}</div>
                    </div>
                    
                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-success">
                            <div class="text-3xl">✅</div>
                        </div>
                        <div class="stat-title">Completed</div>
                        <div class="stat-value text-success">{completedCount}</div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3 mb-6 justify-center">
                    <a href="/offer" class="btn btn-primary">
                        💡 Offer New Skill
                    </a>
                    <a href="/request" class="btn btn-secondary">
                        🙋 Request Help
                    </a>
                    <a href="/" class="btn btn-ghost">
                        🗺️ View Community Map
                    </a>
                    <button 
                        class="btn btn-error btn-outline"
                        on:click={handleLogout}
                    >
                        🚪 Logout
                    </button>
                </div>

                <!-- User's Posts -->
                {#if userPosts.length > 0}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <h2 class="card-title text-2xl mb-4">📝 My Posts</h2>
                            
                            <div class="grid gap-4">
                                {#each userPosts as post}
                                    <div class="card bg-base-200 shadow">
                                        <div class="card-body p-4">
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="flex items-center gap-2">
                                                    <span class="badge {post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'}">
                                                        {post.post_type === 'offer' ? '💡 Offering' : '🙋 Requesting'}
                                                    </span>
                                                    <span class="badge badge-outline">{post.category}</span>
                                                    {#if post.pin_code}
                                                        <span class="badge badge-ghost text-xs">📍 {post.pin_code}</span>
                                                    {/if}
                                                </div>
                                                {#if post.completed}
                                                    <span class="badge badge-success">✅ Completed</span>
                                                {/if}
                                            </div>
                                            <p class="text-sm">{post.description}</p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body text-center">
                            <div class="text-6xl mb-4">📝</div>
                            <h3 class="text-xl font-bold mb-2">No Posts Yet</h3>
                            <p class="text-base-content/70 mb-4">Start sharing your skills or requesting help from the community!</p>
                            <div class="flex gap-3 justify-center">
                                <a href="/offer" class="btn btn-primary">Offer a Skill</a>
                                <a href="/request" class="btn btn-secondary">Request Help</a>
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{/if}
