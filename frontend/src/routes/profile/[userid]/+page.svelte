<script lang="ts">
    import { getUserProfile, getPosts, updateProfilePicture } from '$lib/api';
    import { page } from '$app/stores';
    import { authStore, logout } from '$lib/auth';
    import { goto } from '$app/navigation';
    import type { Post, UserProfile } from '$lib/types';
    import ProfilePicture from '$lib/components/ProfilePicture.svelte';
    import { MailSvg, PinSvg, TasksSvg, LogoutSvg } from '$lib/components/icons';


    // This is the only code that will run.
    // It will test if the API call can finish inside a reactive block.
    $: {
        const userId = $page.params.userId;
        if (userId) {
            console.log("Reactive block triggered with userId:", userId);

            // We create a new, simple test function
            const testApiCall = async (id: string) => {
                try {
                    const numericId = Number(id);
                    if (isNaN(numericId)) {
                        console.error("User ID is not a number:", id);
                        return;
                    }
                    
                    console.log("Attempting to fetch profile for ID:", numericId);
                    const profile = await getUserProfile(numericId);
                    
                    // If we see this, the API call worked.
                    console.log("SUCCESS! Fetched profile:", profile);

                } catch (err) {
                    // If we see this, the API call failed with an error.
                    console.error("FAILED! Error fetching profile:", err);
                }
            };

            // We call the test function
            testApiCall(userId);
        }
    }
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
                        <span
                            class="loading loading-spinner loading-lg text-primary"
                        ></span>
                        <p class="mt-4 text-base-content/70">
                            Loading profile...
                        </p>
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
                        <div
                            class="flex flex-col md:flex-row items-center gap-6"
                        >
                            <div class="relative">
                                <ProfilePicture
                                    profilePicture={profile.profile_picture}
                                    name={profile.name || "User"}
                                    size="xl"
                                    editable={!profileUpdateLoading}
                                    onImageChange={handleProfilePictureChange}
                                />
                                {#if profileUpdateLoading}
                                    <div
                                        class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                                    >
                                        <span
                                            class="loading loading-spinner loading-md text-white"
                                        ></span>
                                    </div>
                                {/if}
                            </div>

                            <div class="text-center md:text-left">
                                <h1 class="card-title text-3xl mb-2">
                                    {profile.name || "User"}
                                </h1>
                                <p class="text-base-content/70 mb-2">
                                    <MailSvg />
                                    {profile.email}
                                </p>
                                {#if profile.pin_code}
                                    <p class="text-base-content/70">
                                        <PinSvg /> Pin Code: {profile.pin_code}
                                    </p>
                                {/if}
                                <p class="text-xs text-base-content/50 mt-2">
                                    Click profile picture to change
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-primary">
                            <div class="text-3xl"></div>
                        </div>
                        <div class="stat-title">Total Posts</div>
                        <div class="stat-value text-primary">
                            {userPosts.length}
                        </div>
                    </div>

                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-info">
                            <div class="text-3xl"></div>
                        </div>
                        <div class="stat-title">Skills Offered</div>
                        <div class="stat-value text-info">{offerCount}</div>
                    </div>

                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-warning">
                            <div class="text-3xl"></div>
                        </div>
                        <div class="stat-title">Help Requested</div>
                        <div class="stat-value text-warning">
                            {requestCount}
                        </div>
                    </div>

                    <div class="stat bg-base-100 rounded-box shadow">
                        <div class="stat-figure text-success">
                            <div class="text-3xl"></div>
                        </div>
                        <div class="stat-title">Completed</div>
                        <div class="stat-value text-success">
                            {completedCount}
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3 mb-6 justify-center">
                    <a href="/offer" class="btn btn-info btn-block mb-2">
                        <div class="badge badge-ghost">Offer</div>
                         New Skill
                    </a>
                    <a href="/request" class="btn btn-warning btn-block mb-2">
                        <div class="badge badge-ghost">Request</div>
                         Help
                    </a>
                    <a href="/" class="btn btn-success btn-block mb-2">
                        View Community Map
                    </a>

                    <div class="divider"></div>

                    <button class="btn btn-error btn-block" on:click={logout}>
                        <LogoutSvg /> Logout
                    </button>
                </div>

                <!-- User's Posts -->
                {#if userPosts.length > 0}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <h2 class="card-title text-2xl mb-4">
                                <TasksSvg /> My Posts
                            </h2>

                            <div class="grid gap-4">
                                {#each userPosts as post}
                                    <div class="card bg-base-200 shadow">
                                        <div class="card-body p-4">
                                            <div
                                                class="flex items-center justify-between mb-2"
                                            >
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <span
                                                        class="badge {post.post_type ===
                                                        'offer'
                                                            ? 'badge-primary'
                                                            : 'badge-secondary'}"
                                                    >
                                                        <div
                                                            class="badge badge-ghost"
                                                        >
                                                            {post.post_type ===
                                                            "offer"
                                                                ? "Offering"
                                                                : "Requesting"}
                                                        </div>
                                                    </span>
                                                    <span
                                                        class="badge badge-outline"
                                                        >{post.category}</span
                                                    >
                                                    {#if post.pin_code}
                                                        <span
                                                            class="badge badge-ghost text-xs"
                                                            ><PinSvg />
                                                            {post.pin_code}</span
                                                        >
                                                    {/if}
                                                </div>
                                                {#if post.completed}
                                                    <span
                                                        class="badge badge-success"
                                                        >Completed</span
                                                    >
                                                {/if}
                                            </div>
                                            <p class="text-sm">
                                                {post.description}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body text-center">
                            <div class="text-6xl mb-4"></div>
                            <h3 class="text-xl font-bold mb-2">No Posts Yet</h3>
                            <p class="text-base-content/70 mb-4">
                                Start sharing your skills or requesting help
                                from the community!
                            </p>
                            <div class="flex gap-3 justify-center">
                                <a href="/offer" class="btn btn-primary"
                                    >Offer a Skill</a
                                >
                                <a href="/request" class="btn btn-secondary"
                                    >Request Help</a
                                >
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{/if}
