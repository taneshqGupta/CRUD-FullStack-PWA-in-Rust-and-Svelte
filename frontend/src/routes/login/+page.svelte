<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<script lang="ts">
	import { login, register } from '$lib/api';
	import { goto } from '$app/navigation';
	import { TasksSvg } from '$lib/components/icons';
	import { setAuthenticated, authStore } from '$lib/auth';

	let isLogin = true;
	let email = '';
	let password = '';
	let name = '';
	let loading = false;
	let error = '';
	let success = '';

	// Redirect to home if already authenticated
	$: if ($authStore.isAuthenticated) {
		goto('/');
	}

	async function handleSubmit() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		if (!isLogin && !name) {
			error = 'Please enter your name';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters long';
			return;
		}

		loading = true;
		error = '';
		success = '';

		try {
			if (isLogin) {
				const response = await login(email, password);
				if (response.success && response.user_id) {
					success = 'Login successful! Redirecting...';
					setAuthenticated(response.user_id);
					setTimeout(() => goto('/'), 1000);
				} else {
					error = response.message;
				}
			} else {
				const response = await register(email, password, name);
				if (response.success && response.user_id) {
					success = 'Registration successful! Redirecting...';
					setAuthenticated(response.user_id);
					setTimeout(() => goto('/'), 1000);
				} else {
					error = response.message;
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}

	function toggleMode() {
		isLogin = !isLogin;
		error = '';
		success = '';
		name = ''; // Clear name when switching modes
	}
</script>

<svelte:head>
	<title>{isLogin ? 'Login' : 'Register'} - Tasks</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-100 p-4">
	<div class="card w-full max-w-md bg-base-200 shadow-xl">
		<div class="card-body">
			<div class="text-center mb-6">
				<h1 class="flex items-center justify-center gap-2 text-2xl font-bold mb-2">
					<TasksSvg />
					Tasks
				</h1>
				<h2 class="text-xl">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
				<p class="text-sm opacity-70">
					{isLogin ? 'Sign in to your account' : 'Sign up to get started'}
				</p>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				{#if !isLogin}
					<div class="form-control">
						<label class="label" for="name">
							<span class="label-text">Name</span>
						</label>
						<input
							id="name"
							type="text"
							placeholder="Enter your name"
							class="input input-bordered w-full"
							bind:value={name}
							disabled={loading}
							required
						/>
					</div>
				{/if}

				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						id="email"
						type="email"
						placeholder="Enter your email"
						class="input input-bordered w-full"
						bind:value={email}
						disabled={loading}
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						placeholder="Enter your password"
						class="input input-bordered w-full"
						bind:value={password}
						disabled={loading}
						required
						minlength="6"
					/>
				</div>

				{#if error}
					<div class="alert alert-error">
						<span>{error}</span>
					</div>
				{/if}

				{#if success}
					<div class="alert alert-success">
						<span>{success}</span>
					</div>
				{/if}

				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
							{isLogin ? 'Signing In...' : 'Creating Account...'}
						{:else}
							{isLogin ? 'Sign In' : 'Create Account'}
						{/if}
					</button>
				</div>
			</form>

			<div class="divider">OR</div>

			<div class="text-center">
				<p class="text-sm">
					{isLogin ? "Don't have an account?" : 'Already have an account?'}
					<button 
						class="btn btn-link btn-sm p-0 ml-1" 
						on:click={toggleMode}
						disabled={loading}
					>
						{isLogin ? 'Sign Up' : 'Sign In'}
					</button>
				</p>
			</div>
		</div>
	</div>
</div>
