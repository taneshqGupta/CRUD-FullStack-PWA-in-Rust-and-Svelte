<script lang="ts">
    import { getUserProfile, getUserPosts, getMyPosts, updateProfilePicture } from '$lib/api';
    import { page } from '$app/stores';
    import { authStore, logout } from '$lib/auth';
    import { goto } from '$app/navigation';
    import type { Post, UserProfile } from '$lib/types';
    import ProfilePicture from '$lib/components/ProfilePicture.svelte';
    import { MailSvg, PinSvg, TasksSvg, LogoutSvg } from '$lib/components/icons';

    let loading = true;
    let profile: UserProfile | null = null;
    let userPosts: Post[] = [];
    let error = '';
    let profileUpdateLoading = false;

    let currentID: string | null = null;
    
    $: isOwnProfile = $authStore.user_id === Number($page.params.userid);

    $: {
        const userid = $page.params.userid;
        if (userid && userid !== currentID) {
            loadProfile(userid);
        }
    }

    $: if (!$authStore.loading && !$authStore.isAuthenticated) {
        goto('/login');
    }

    async function loadProfile(id: string) {
        currentID = id;
        const numericId = Number(id);
        if (isNaN(numericId)) {
            error = 'Invalid User-Id in the URL';
            loading = false;
            return;
        }

        try {
            loading = true;
            error = '';
            const [profileData, postsData] = await Promise.all([
                getUserProfile(numericId),
                getUserPosts(numericId)
            ]);
            profile = profileData;
            userPosts = postsData;
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
        if (!$page.params.userid) return;
        try {
            profileUpdateLoading = true;
            error = '';
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Data = reader.result as string;
                    await updateProfilePicture(base64Data);
                    await loadProfile($page.params.userid);
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
    <title>{profile ? `${profile.name}'s Profile` : 'User Profile'} - SkillSwap</title>
    <meta name="description" content="View a user's SkillSwap profile" />
</svelte:head>

<div class="h-full overflow-y-auto bg-base-100 p-4">
    <div class="max-w-4xl mx-auto">
        
        {#if loading}
            <div class="flex justify-center items-center h-full w-full">
                <span class="loading loading-infinity loading-xl"></span>
            </div>
        {:else if error}
            <div class="alert alert-error">
                <span>{error}</span>
            </div>
        {:else if profile}
            <div class="card bg-base-100 shadow-xl mb-6">
                <div class="card-body">
                    <div class="flex flex-col md:flex-row items-center gap-6">
                        <div class="relative">
                            <ProfilePicture 
                                profilePicture={profile.profile_picture}
                                name={profile.name || 'User'}
                                size="xl"
                                editable={isOwnProfile && !profileUpdateLoading}
                                onImageChange={isOwnProfile ? handleProfilePictureChange : null}
                            />
                            {#if profileUpdateLoading}
                                <div class="absolute inset-0 bg-primary-content bg-opacity-50 rounded-full flex items-center justify-center">
                                    <span class="loading loading-infinity loading-md"></span>
                                </div>
                            {/if}
                        </div>
                        
                        <div class="text-center md:text-left">
                            <h1 class="card-title text-3xl mb-2">{profile.name || 'User'}</h1>
                            <p class="text-base-content/70 mb-2 flex items-center justify-center md:justify-start gap-2"><MailSvg /> {profile.email}</p>
                            {#if profile.pin_code}
                                <p class="text-base-content/70 flex items-center justify-center md:justify-start gap-2"><PinSvg /> Pin Code: {profile.pin_code}</p>
                            {/if}
                            {#if isOwnProfile}
                                <p class="text-xs text-base-content/50 mt-2">Click profile picture to change</p>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Total Posts</div>
                    <div class="stat-value text-primary">{userPosts.length}</div>
                </div>
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Skills Offered</div>
                    <div class="stat-value text-info">{offerCount}</div>
                </div>
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Help Requested</div>
                    <div class="stat-value text-warning">{requestCount}</div>
                </div>
            </div>

            {#if isOwnProfile}
                <div class="card bg-base-100 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">Actions</h2>
                        <div class="flex flex-wrap gap-3 justify-center">
                            <a href="/offer" class="btn btn-info flex-1">Offer New Skill</a>
                            <a href="/request" class="btn btn-warning flex-1">Request Help</a>
                            <button class="btn btn-error flex-1" on:click={handleLogout}>
                                <LogoutSvg /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title text-2xl mb-4"><TasksSvg /> {isOwnProfile ? 'My Posts' : `${profile.name}'s Posts`}</h2>
                    
                    {#if userPosts.length > 0}
                        <div class="space-y-4">
                            {#each userPosts as post}
                                <div class="card card-compact bg-base-200">
                                    <div class="card-body">
                                        <div class="flex items-center justify-between text-xs text-base-content/60 mb-2">
                                            <span class="badge {post.post_type === 'offer' ? 'badge-info' : 'badge-warning'} badge-outline">{post.post_type}</span>
                                            <span class="badge badge-ghost">{post.category}</span>
                                        </div>
                                        <p>{post.description}</p>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-center p-8 text-base-content/60">
                            <h3 class="font-bold mb-2">No Posts Yet</h3>
                            <p>{isOwnProfile ? 'Start sharing your skills or requesting help!' : 'This user has not made any posts yet.'}</p>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>