<script lang="ts">
    import type { Post } from "$lib/types";

    export let pinCode: string;
    export let posts: Post[];

    $: offerCount = posts.filter((p) => p.post_type === "offer").length;
    $: requestCount = posts.filter((p) => p.post_type === "request").length;

    function goToProfile(userId: number) {
        window.location.href = `/profile/${userId}`;
    }
</script>

<div class="card card-compact bg-base-100 w-80 max-w-sm">
    <div class="card-body">
        <div class="flex items-center justify-between mb-3">
            <div class="badge badge-outline badge-sm">
                📍 Pin Code: {pinCode}
            </div>
            <div class="text-xs text-neutral">
                {offerCount} offers, {requestCount} requests
            </div>
        </div>

        <div class="space-y-3 max-h-60 overflow-y-auto">
            {#each posts as post}
                <div class="card card-compact bg-base-100 border border-base-300">
                    <div class="card-body">
                        <div class="flex items-center justify-between mb-2">
                            <div class="badge {post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'} badge-sm">
                                {post.post_type === "offer" ? "Offer" : "Request"}
                            </div>
                            <div class="badge badge-ghost badge-xs text-neutral">
                                {post.category}
                            </div>
                        </div>
                        
                        <p class="text-sm text-neutral mb-3">{post.description}</p>
                        
                        {#if post.user_name}
                            <div class="card-actions justify-end">
                                <button 
                                    class="btn btn-ghost btn-xs gap-2"
                                    on:click={() => goToProfile(post.user_id)}
                                >
                                    {#if post.profile_picture}
                                        <div class="avatar">
                                            <div class="w-4 h-4 rounded-full">
                                                <img src={post.profile_picture} alt={post.user_name} />
                                            </div>
                                        </div>
                                    {:else}
                                        <div class="avatar placeholder">
                                            <div class="bg-neutral-focus text-neutral-content rounded-full w-4 h-4">
                                                <span class="text-xs">{post.user_name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    {/if}
                                    <span class="text-neutral">{post.user_name}</span>
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
