<script lang="ts">
    import { page } from '$app/stores';
    import { getUserProfile } from '$lib/api';


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

