<script lang="ts">
    import type { Post } from '$lib/types';
    import { PinSvg } from './icons';
    
    export let pinCode: string;
    export let posts: Post[];
    
    $: offerCount = posts.filter(p => p.post_type === 'offer').length;
    $: requestCount = posts.filter(p => p.post_type === 'request').length;
</script>

<div class="p-3 max-w-sm">
    <div class="flex items-center gap-2 mb-3">
        <span class="badge badge-outline badge-sm">
            <div class="inline-flex items-center gap-1">
                <PinSvg />
                Pin Code: {pinCode}
            </div>
        </span>
        <span class="text-xs">{offerCount} offers, {requestCount} requests</span>
    </div>
    
    <div class="space-y-2 max-h-60 overflow-y-auto">
        {#each posts as post}
            <div class="border border-base-300 rounded-lg p-2">
                <div class="flex items-center gap-2 mb-1">
                    <span class="badge {post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'} badge-xs">
                        <div class="badge badge-ghost">
                            {post.post_type === 'offer' ? 'Offer' : 'Request'}
                        </div>
                    </span>
                    <span class="text-xs font-medium">{post.category}</span>
                </div>
                <p class="text-sm">{post.description}</p>
                {#if post.user_name}
                    <p class="text-xs opacity-70 mt-1">By: {post.user_name}</p>
                {/if}
            </div>
        {/each}
    </div>
</div>
