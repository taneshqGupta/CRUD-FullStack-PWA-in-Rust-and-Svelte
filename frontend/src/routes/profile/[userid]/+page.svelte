<script lang="ts">
    import {
        getUserProfile,
        getUserPosts,
        updateProfilePicture,
    } from "$lib/api";
    import { page } from "$app/stores";
    import { authStore, logout } from "$lib/auth";
    import { goto } from "$app/navigation";
    import type { Post, UserProfile, Category } from "$lib/types";
    import { CATEGORIES } from "$lib/types";
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import {
        MailSvg,
        PinSvg,
        TasksSvg,
        LogoutSvg,
        FilterSvg,
    } from "$lib/components/icons";

    let loading = true;
    let profile: UserProfile | null = null;
    let userPosts: Post[] = [];
    let error = "";
    let profileUpdateLoading = false;

    let currentID: string | null = null;

    let textSearch = "";
    let selectedCategories: Category[] = [];
    let categorySearch = "";
    let postTypeFilter: "both" | "offers" | "requests" = "both";
    let showMobileFilters = false;

    $: isOwnProfile = $authStore.user_id === Number($page.params.userid);

    $: filteredCategories = CATEGORIES.filter((category) =>
        category.toLowerCase().includes(categorySearch.toLowerCase()),
    );

    function toggleCategory(category: Category) {
        if (selectedCategories.includes(category)) {
            selectedCategories = selectedCategories.filter(
                (c) => c !== category,
            );
        } else {
            selectedCategories = [...selectedCategories, category];
        }
        categorySearch = "";
    }

    $: {
        const userid = $page.params.userid;
        if (userid && userid !== currentID) {
            loadProfile(userid);
        }
    }

    $: if (!$authStore.loading && !$authStore.isAuthenticated) {
        goto("/login");
    }

    async function loadProfile(id: string) {
        currentID = id;
        const numericId = Number(id);
        if (isNaN(numericId)) {
            error = "Invalid User-Id in the URL";
            loading = false;
            return;
        }

        try {
            loading = true;
            error = "";
            const [profileData, postsData] = await Promise.all([
                getUserProfile(numericId),
                getUserPosts(numericId),
            ]);
            profile = profileData;
            userPosts = postsData;
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to load profile";
        } finally {
            loading = false;
        }
    }

    async function handleLogout() {
        await logout();
        goto("/login");
    }

    async function handleProfilePictureChange(file: File) {
        if (!$page.params.userid) return;
        try {
            profileUpdateLoading = true;
            error = "";
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Data = reader.result as string;
                    await updateProfilePicture(base64Data);
                    await loadProfile($page.params.userid);
                } catch (err) {
                    error =
                        err instanceof Error
                            ? err.message
                            : "Failed to update profile picture";
                } finally {
                    profileUpdateLoading = false;
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to process image";
            profileUpdateLoading = false;
        }
    }

    $: filteredPosts = userPosts.filter((post) => {
        if (postTypeFilter === "offers" && post.post_type !== "offer")
            return false;
        if (postTypeFilter === "requests" && post.post_type !== "request")
            return false;

        if (
            selectedCategories.length > 0 &&
            !selectedCategories.some((cat) => post.categories?.includes(cat))
        )
            return false;

        if (textSearch.trim()) {
            const searchTerm = textSearch.toLowerCase();
            const searchableContent = [
                post.description,
                ...(post.categories || []),
                post.pin_code || "",
                post.user_name || "",
            ]
                .join(" ")
                .toLowerCase();

            if (!searchableContent.includes(searchTerm)) return false;
        }

        return true;
    });

    $: offerCount = userPosts.filter(
        (post) => post.post_type === "offer",
    ).length;
    $: requestCount = userPosts.filter(
        (post) => post.post_type === "request",
    ).length;
</script>

<svelte:head>
    <title
        >{profile ? `${profile.name}'s Profile` : "User Profile"} - SkillSwap</title
    >
    <meta name="description" content="View a user's SkillSwap profile" />
</svelte:head>

<div class="h-full overflow-y-auto bg-base-100 p-4">
    <div class="max-w-4xl mx-auto">
        {#if loading}
            <!-- <div class="flex justify-center items-center h-full w-full">
                <span class="loading loading-infinity loading-xl"></span>
            </div> -->
            <div class="skeleton flex h-full w-full justify-center items-center shrink-0 rounded-full"></div>
        {:else if error}
            <div class="alert alert-error">
                <span>{error}</span>
            </div>
        {:else if profile}
            <div class="card bg-base-100 mb-6">
                <div class="card-body">
                    <div class="flex flex-col lg:flex-row items-center gap-6">
                        <div class="relative flex-shrink-0">
                            <ProfilePicture
                                profilePicture={profile.profile_picture}
                                name={profile.name || "User"}
                                size="xl"
                                editable={isOwnProfile && !profileUpdateLoading}
                                onImageChange={isOwnProfile
                                    ? handleProfilePictureChange
                                    : null}
                            />
                            {#if profileUpdateLoading}
                                <div
                                    class="absolute inset-0 bg-base-200 rounded-full flex items-center justify-center"
                                >
                                    <div class="skeleton flex h-full w-full justify-center items-center shrink-0 rounded-full"></div>
                                </div>
                            {/if}
                        </div>

                        <div class="text-center md:text-left">
                            <h1
                                class="card-title text-2xl mb-2 items-center justify-center lg:justify-start"
                            >
                                {profile.name || "User"}
                            </h1>
                            <p
                                class="text-base-content/70 mb-2 flex items-center justify-center lg:justify-start gap-2"
                            >
                                <MailSvg />
                                {profile.email}
                            </p>
                            {#if profile.pin_code}
                                <p
                                    class="text-base-content/70 flex items-center justify-center lg:justify-start gap-2"
                                >
                                    <PinSvg /> Pin Code: {profile.pin_code}
                                </p>
                            {/if}
                            {#if isOwnProfile}
                                <p
                                    class="text-xs text-base-content/50 flex items-center justify-center lg:justify-start mt-2"
                                >
                                    Click profile picture to change
                                </p>
                            {/if}
                            {#if isOwnProfile}
                                <div
                                    class="flex items-center justify-center lg:hidden mt-4"
                                >
                                    <button
                                        class="btn btn-soft btn-sm flex items-center justify-center"
                                        on:click={handleLogout}
                                    >
                                        <LogoutSvg /> Log-Out
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

            <div class="card bg-base-100 mb-2 w-full p-6">
                <div
                    class="flex flex-col lg:flex-row flex-wrap gap-3 justify-center w-full"
                >
                    <div class="join join-horizontal flex-1 w-full">
                        <div
                            class="badge join-item badge-soft badge-xl badge-outline font-semibold text-2xl w-full p-4"
                        >
                            {userPosts.length}
                        </div>
                        <div
                            class="badge join-item badge-soft badge-xl badge-outline font-normal text-sm w-full p-4"
                        >
                            Total Posts
                        </div>
                    </div>
                    <div class="join join-horizontal flex-1 w-full">
                        <div
                            class="badge join-item badge-soft badge-xl badge-outline font-semibold text-2xl w-full p-4"
                        >
                            {offerCount}
                        </div>
                        <div
                            class="badge join-item badge-soft badge-xl badge-outline font-normal text-sm w-full p-4"
                        >
                            Skills Offered
                        </div>
                    </div>
                    <div class="join join-horizontal flex-1 w-full">
                        <div
                            class="badge join-item badge-soft badge-xl badge-outline font-semibold text-2xl w-full p-4"
                        >
                            {requestCount}
                        </div>
                        <div
                            class="badge join-item badge-soft badge-xl badge-outline font-normal text-sm w-full p-4"
                        >
                            Help Requests
                        </div>
                    </div>
                </div>
            </div>

            {#if isOwnProfile}
                <div class="card bg-base-100 mb-2 w-full">
                    <div class="card-body w-full">
                        <div class="flex flex-wrap gap-3 justify-center w-full">
                            <a
                                href="/offer"
                                class="btn btn-soft btn-block flex-1"
                                >Offer-Skill</a
                            >
                            <a
                                href="/request"
                                class="btn btn-soft btn-block flex-1"
                                >Request-Help</a
                            >
                            <button
                                class="btn btn-soft btn-block flex-1 hidden lg:flex lg:items-center lg:justify-center gap-2"
                                on:click={handleLogout}
                            >
                                <LogoutSvg />Log-Out
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <div class="card bg-base-100 mb-6">
                <div class="card-body">
                    <div class="lg:hidden flex flex-wrap mb-4 gap-3">
                        <button
                            class="btn btn-soft btn-sm w-full gap-2 flex-1"
                            on:click={() =>
                                (showMobileFilters = !showMobileFilters)}
                        >
                            <FilterSvg />
                            {showMobileFilters ? "Hide" : "Show"} Filters
                            {#if selectedCategories.length > 0 || textSearch.trim() || postTypeFilter !== "both"}
                                <div class="badge badge-xs">
                                    {selectedCategories.length +
                                        (textSearch.trim() ? 1 : 0) +
                                        (postTypeFilter !== "both" ? 1 : 0)}
                                </div>
                            {/if}
                        </button>
                        <button
                            class="btn btn-soft btn-sm w-full gap-2 flex-1"
                            on:click={() => {
                                textSearch = "";
                                selectedCategories = [];
                                postTypeFilter = "both";
                                showMobileFilters = false;
                            }}
                            >Clear Filters
                        </button>
                    </div>

                    <!-- Filter controls -->
                    <div
                        class="space-y-4 lg:space-y-3"
                        class:hidden={!showMobileFilters}
                        class:lg:block={true}
                    >
                        <!-- Desktop layout: compact horizontal arrangement -->
                        <div class="hidden lg:block space-y-3">
                            <!-- Top row: Search and Clear button -->
                            <div class="flex items-end gap-4">
                                <!-- Text search -->
                                <div class="form-control flex-1 w-full">
                                    <label class="label py-1" for="text-search">
                                        <span class="label-text text-xs"
                                            >Search Posts</span
                                        >
                                    </label>
                                    <input
                                        id="text-search"
                                        class="input input-bordered input-sm px-4 w-full"
                                        placeholder="Search descriptions, categories..."
                                        bind:value={textSearch}
                                    />
                                </div>

                                <!-- Clear filters button -->
                                <div class="form-control">
                                    <div class="label py-1">
                                        <span
                                            class="label-text text-sm opacity-0"
                                            >.</span
                                        >
                                    </div>
                                    <button
                                        class="btn btn-soft btn-sm"
                                        on:click={() => {
                                            textSearch = "";
                                            selectedCategories = [];
                                            postTypeFilter = "both";
                                            showMobileFilters = false;
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <!-- Bottom row: Categories and Post Type side by side -->
                            <div class="flex gap-4 items-end">
                                <!-- Category filter -->
                                <div class="form-control flex-1">
                                    <div class="label py-1">
                                        <span class="label-text text-xs">
                                            Categories ({selectedCategories.length}
                                            selected)
                                        </span>
                                    </div>
                                    <div class="dropdown w-full">
                                        <div
                                            role="button"
                                            class="btn btn-soft btn-sm w-full justify-start"
                                            tabindex="0"
                                        >
                                            Categories {selectedCategories.length >
                                            0
                                                ? `(${selectedCategories.length})`
                                                : ""}
                                        </div>
                                        <div
                                            class="dropdown-content bg-base-100 rounded-box z-[1] w-80 p-2 shadow mb-2 max-h-80 overflow-y-auto"
                                        >
                                            <!-- Search Input -->
                                            <div class="form-control mb-2">
                                                <input
                                                    class="input input-bordered input-xs"
                                                    placeholder="Search categories..."
                                                    bind:value={categorySearch}
                                                />
                                            </div>

                                            {#if selectedCategories.length > 0}
                                                <div
                                                    class="mb-2 p-2 bg-base-200 rounded"
                                                >
                                                    <div
                                                        class="flex items-center justify-between mb-1"
                                                    >
                                                        <div
                                                            class="text-xs font-semibold"
                                                        >
                                                            Selected:
                                                        </div>
                                                        <button
                                                            class="btn btn-ghost btn-xs"
                                                            on:click={() =>
                                                                (selectedCategories =
                                                                    [])}
                                                            >Clear All</button
                                                        >
                                                    </div>
                                                    <div
                                                        class="flex flex-wrap gap-1"
                                                    >
                                                        {#each selectedCategories as category}
                                                            <div
                                                                class="badge badge-primary badge-xs"
                                                            >
                                                                {category}
                                                                <button
                                                                    class="ml-1"
                                                                    on:click={() =>
                                                                        (selectedCategories =
                                                                            selectedCategories.filter(
                                                                                (
                                                                                    c,
                                                                                ) =>
                                                                                    c !==
                                                                                    category,
                                                                            ))}
                                                                    >×</button
                                                                >
                                                            </div>
                                                        {/each}
                                                    </div>
                                                </div>
                                            {/if}

                                            <ul
                                                class="menu max-h-40 overflow-y-auto"
                                            >
                                                {#each filteredCategories as category (category)}
                                                    <li>
                                                        <label
                                                            class="cursor-pointer flex items-center gap-2 text-xs"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                class="checkbox checkbox-xs"
                                                                checked={selectedCategories.includes(
                                                                    category,
                                                                )}
                                                                on:change={() =>
                                                                    toggleCategory(
                                                                        category,
                                                                    )}
                                                            />
                                                            <span
                                                                >{category}</span
                                                            >
                                                        </label>
                                                    </li>
                                                {/each}
                                                {#if filteredCategories.length === 0}
                                                    <li>
                                                        <span
                                                            class="text-xs opacity-50"
                                                            >No categories found</span
                                                        >
                                                    </li>
                                                {/if}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <!-- Post type filter -->
                                <div class="form-control flex-1">
                                    <div class="label py-1">
                                        <span class="label-text text-xs"
                                            >Offers/Requests</span
                                        >
                                    </div>
                                    <div class="dropdown w-full">
                                        <div
                                            role="button"
                                            class="btn btn-soft btn-sm w-full justify-start"
                                            tabindex="0"
                                        >
                                            {postTypeFilter === "both"
                                                ? "Both"
                                                : postTypeFilter === "offers"
                                                  ? "Offers Only"
                                                  : "Requests Only"}
                                        </div>
                                        <ul
                                            class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow mb-2"
                                        >
                                            <li>
                                                <label
                                                    class="cursor-pointer flex items-center gap-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        class="radio radio-sm"
                                                        bind:group={
                                                            postTypeFilter
                                                        }
                                                        value="both"
                                                    />
                                                    <span class="text-sm"
                                                        >Both</span
                                                    >
                                                </label>
                                            </li>
                                            <li>
                                                <label
                                                    class="cursor-pointer flex items-center gap-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        class="radio radio-sm"
                                                        bind:group={
                                                            postTypeFilter
                                                        }
                                                        value="offers"
                                                    />
                                                    <span class="text-sm"
                                                        >Offers Only</span
                                                    >
                                                </label>
                                            </li>
                                            <li>
                                                <label
                                                    class="cursor-pointer flex items-center gap-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        class="radio radio-sm"
                                                        bind:group={
                                                            postTypeFilter
                                                        }
                                                        value="requests"
                                                    />
                                                    <span class="text-sm"
                                                        >Requests Only</span
                                                    >
                                                </label>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Mobile layout: vertical stacking (preserved as is) -->
                        <div class="lg:hidden space-y-4">
                            <!-- Text search -->
                            <div class="form-control">
                                <label
                                    class="label py-1"
                                    for="mobile-text-search"
                                >
                                    <span class="label-text text-xs"
                                        >Search Posts</span
                                    >
                                </label>
                                <input
                                    id="mobile-text-search"
                                    class="input input-bordered input-sm"
                                    placeholder="Search descriptions, categories..."
                                    bind:value={textSearch}
                                />
                            </div>

                            <!-- Category filter -->
                            <div class="form-control">
                                <div class="label py-1">
                                    <span class="label-text text-xs">
                                        Categories ({selectedCategories.length} selected)
                                    </span>
                                </div>
                                <div class="dropdown w-full">
                                    <div
                                        role="button"
                                        class="btn btn-soft btn-sm w-full justify-start"
                                        tabindex="0"
                                    >
                                        Categories {selectedCategories.length >
                                        0
                                            ? `(${selectedCategories.length})`
                                            : ""}
                                    </div>
                                    <div
                                        class="dropdown-content bg-base-100 rounded-box z-[1] w-full p-2 shadow mb-2 max-h-80 overflow-y-auto"
                                    >
                                        <!-- Search Input -->
                                        <div class="form-control mb-2 w-full">
                                            <input
                                                class="input input-bordered input-xs w-full"
                                                placeholder="Search categories..."
                                                bind:value={categorySearch}
                                            />
                                        </div>

                                        {#if selectedCategories.length > 0}
                                            <div
                                                class="mb-2 bg-base-200 rounded w-full"
                                            >
                                                <div
                                                    class="flex items-center justify-between mb-1"
                                                >
                                                    <div
                                                        class="text-xs font-semibold"
                                                    >
                                                        Selected:
                                                    </div>
                                                    <button
                                                        class="btn btn-ghost btn-xs"
                                                        on:click={() =>
                                                            (selectedCategories =
                                                                [])}
                                                        >Clear All</button
                                                    >
                                                </div>
                                                <div
                                                    class="flex flex-wrap gap-1"
                                                >
                                                    {#each selectedCategories as category}
                                                        <div
                                                            class="badge badge-primary badge-xs"
                                                        >
                                                            {category}
                                                            <button
                                                                class="ml-1"
                                                                on:click={() =>
                                                                    (selectedCategories =
                                                                        selectedCategories.filter(
                                                                            (
                                                                                c,
                                                                            ) =>
                                                                                c !==
                                                                                category,
                                                                        ))}
                                                                >×</button
                                                            >
                                                        </div>
                                                    {/each}
                                                </div>
                                            </div>
                                        {/if}

                                        <ul
                                            class="menu max-h-40 overflow-y-auto w-full"
                                        >
                                            {#each filteredCategories as category (category)}
                                                <li class="w-full">
                                                    <label
                                                        class="cursor-pointer flex items-center gap-2 text-xs w-full"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            class="checkbox checkbox-xs"
                                                            checked={selectedCategories.includes(
                                                                category,
                                                            )}
                                                            on:change={() =>
                                                                toggleCategory(
                                                                    category,
                                                                )}
                                                        />
                                                        <span class="w-full"
                                                            >{category}</span
                                                        >
                                                    </label>
                                                </li>
                                            {/each}
                                            {#if filteredCategories.length === 0}
                                                <li class="w-full">
                                                    <span
                                                        class="text-xs opacity-50 w-full"
                                                        >No categories found</span
                                                    >
                                                </li>
                                            {/if}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Post type filter -->
                            <div class="form-control">
                                <div class="label py-1">
                                    <span class="label-text text-xs"
                                        >Offer/Request</span
                                    >
                                </div>
                                <div class="dropdown w-full">
                                    <div
                                        role="button"
                                        class="btn btn-soft btn-sm w-full justify-start"
                                        tabindex="0"
                                    >
                                        {postTypeFilter === "both"
                                            ? "Both"
                                            : postTypeFilter === "offers"
                                              ? "Offers Only"
                                              : "Requests Only"}
                                    </div>
                                    <ul
                                        class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow mb-2"
                                    >
                                        <li>
                                            <label
                                                class="cursor-pointer flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    class="radio radio-sm"
                                                    bind:group={postTypeFilter}
                                                    value="both"
                                                />
                                                <span class="text-sm">Both</span
                                                >
                                            </label>
                                        </li>
                                        <li>
                                            <label
                                                class="cursor-pointer flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    class="radio radio-sm"
                                                    bind:group={postTypeFilter}
                                                    value="offers"
                                                />
                                                <span class="text-sm"
                                                    >Offers Only</span
                                                >
                                            </label>
                                        </li>
                                        <li>
                                            <label
                                                class="cursor-pointer flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    class="radio radio-sm"
                                                    bind:group={postTypeFilter}
                                                    value="requests"
                                                />
                                                <span class="text-sm"
                                                    >Requests Only</span
                                                >
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card bg-base-100">
                <div class="card-body">
                    <h2 class="card-title text-xl mb-4">
                        <TasksSvg />
                        {isOwnProfile ? "My Posts" : `${profile.name}'s Posts`}
                        {#if filteredPosts.length !== userPosts.length}
                            <span
                                class="text-sm text-base-content/60 font-normal"
                            >
                                ({filteredPosts.length} of {userPosts.length} shown)
                            </span>
                        {/if}
                    </h2>

                    {#if filteredPosts.length > 0}
                        <div class="space-y-4">
                            {#each filteredPosts as post}
                                <div class="card card-compact bg-base-200">
                                    <div class="card-body">
                                        <div
                                            class="flex items-center justify-between text-xs text-base-content/60 mb-2"
                                        >
                                            <div class="flex gap-2">
                                                {#if post.post_type == "offer"}
                                                    <span
                                                        class="badge badge-primary font-black"
                                                        >Offer</span
                                                    >
                                                {:else}
                                                    <span
                                                        class="badge badge-accent font-black"
                                                        >Request</span
                                                    >
                                                {/if}
                                                {#if post.pin_code}
                                                    <span
                                                        class="badge badge-outline flex items-center gap-1"
                                                    >
                                                        <PinSvg />
                                                        {post.pin_code}
                                                    </span>
                                                {/if}
                                            </div>
                                        </div>

                                        <p class="mb-3">{post.description}</p>

                                        <!-- Categories as soft small badges -->
                                        {#if post.categories && post.categories.length > 0}
                                            <div class="flex flex-wrap gap-1">
                                                {#each post.categories as category}
                                                    <div
                                                        class="badge badge-soft badge-md"
                                                    >
                                                        {category}
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else if userPosts.length > 0}
                        <div class="text-center p-8 text-base-content/60">
                            <h3 class="font-bold mb-2">
                                No Posts Match Your Filters
                            </h3>
                            <p>Try adjusting your filters to see more posts.</p>
                            <button
                                class="btn btn-soft btn-sm mt-2"
                                on:click={() => {
                                    textSearch = "";
                                    selectedCategories = [];
                                    postTypeFilter = "both";
                                    showMobileFilters = false;
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    {:else}
                        <div class="text-center p-8 text-base-content/60">
                            <h3 class="font-bold mb-2">No Posts Yet</h3>
                            <p>
                                {isOwnProfile
                                    ? "Start sharing your skills or requesting help!"
                                    : "This user has not made any posts yet."}
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
