<script lang="ts">
    import type { Post } from "$lib/types";
    import { goto } from "$app/navigation";

    export let pinCode: string;
    export let posts: Post[];

    $: offerCount = posts.filter((p) => p.post_type === "offer").length;
    $: requestCount = posts.filter((p) => p.post_type === "request").length;

    function goToProfile(userId: number) {
        goto(`/profile/${userId}`);
    }
</script>

<div class="card card-compact bg-base-200 w-80 max-w-sm text-neutral-content">
    <div class="card-body text-neutral-content">
        <div
            class="flex items-center justify-between mb-3 text-neutral-content"
        >
            <div class="font-medium text-sm text-neutral-content">
                Pin Code: {pinCode}
            </div>
            <div class="font-extrabold text-md text-neutral-content">
                {offerCount} offers, {requestCount} requests
            </div>
        </div>

        <div class="space-y-3 max-h-60 overflow-y-auto text-neutral-content">
            {#each posts as post}
                <div
                    class="card card-compact bg-base-100 border border-base-300 text-neutral-content"
                >
                    <div class="card-body text-neutral-content">
                        <div
                            class="flex items-center justify-between mb-1 text-neutral-content"
                        >
                            <div class="badge badge-ghost text-neutral-content">
                                {post.post_type === "offer"
                                    ? "Offer"
                                    : "Request"}
                            </div>
                            <div class="badge badge-ghost text-neutral-content">
                                {post.category}
                            </div>
                        </div>

                        <p class="mb-1 text-neutral-content">
                            {post.description}
                        </p>

                        {#if post.user_name}
                            <div
                                class="card-actions justify-center text-neutral-content"
                            >
                                <a
                                    href="/profile/{post.user_id}"
                                    class="btn btn-soft btn-block gap-2"
                                >
                                    {#if post.profile_picture}
                                        <div
                                            class="avatar text-neutral-content"
                                        >
                                            <div
                                                class="w-8 h-8 rounded-full text-neutral-content"
                                            >
                                                <img
                                                    src={post.profile_picture}
                                                    alt={post.user_name}
                                                />
                                            </div>
                                        </div>
                                    {:else}
                                        <div
                                            class="avatar placeholder text-neutral-content"
                                        >
                                            <div
                                                class="text-neutral-content-focus text-neutral-content-content rounded-full w-4 h-4"
                                            >
                                                <span class="text-xs"
                                                    >{post.user_name
                                                        .charAt(0)
                                                        .toUpperCase()}</span
                                                >
                                            </div>
                                        </div>
                                    {/if}
                                    <span class="text-neutral-content"
                                        >By: {post.user_name}</span
                                    >
                                </a>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
