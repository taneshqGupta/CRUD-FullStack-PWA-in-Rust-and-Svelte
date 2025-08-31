<script lang="ts">
    import { getUserProfile, getPosts, updateProfilePicture } from '$lib/api';
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

    $: isOwnProfile = $authStore.user_id === Number($page.params.userid);

    $: {
        const userid = $page.params.userid;
        if (userid && !loading) {
            loadProfile(userid);
        }
    }

    async function loadProfile(id: string) {
        const numericId = Number(id);
        if (isNaN(numericId)) {
            error = 'Invalid User-Id in the URL';
            loading = false;
            return;
        }

        try {
            loading = true;
            error = '';
            const [profileData, allPosts] = await Promise.all([
                getUserProfile(numericId),
                getPosts()
            ]);
            profile = profileData;
            userPosts = allPosts.filter(p => p.user_id === profileData.id);
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
    <title>My Profile - SkillSwap</title>
    <meta name="description" content="View and manage your SkillSwap profile" />
</svelte:head>

