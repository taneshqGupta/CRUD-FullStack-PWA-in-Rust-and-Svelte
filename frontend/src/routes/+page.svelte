<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<script lang="ts">
	import type { Todo } from '$lib/types';
	import { DeleteSvg, LeafSvg, NullSvg, PlusSvg, TodoSvg } from '$lib/components/icons';
	import { createTodo, updateTodo, deleteTodo, getTodos } from '$lib/api';
	import { authStore } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: { todos: Todo[] };
	let todos: Todo[] = [];
	let newTodoDescription: string = '';
	let newTodoCategory: string = '';
	let loading = true;

	// Redirect to auth if not authenticated
	$: if (!$authStore.loading && !$authStore.isAuthenticated) {
		goto('/auth');
	}

	onMount(async () => {
		// Wait for auth to be initialized
		if ($authStore.loading) {
			const unsubscribe = authStore.subscribe(async (auth) => {
				if (!auth.loading) {
					if (auth.isAuthenticated) {
						await loadTodos();
					} else {
						goto('/auth');
					}
					unsubscribe();
				}
			});
		} else if ($authStore.isAuthenticated) {
			await loadTodos();
		}
	});

	async function loadTodos() {
		try {
			loading = true;
			todos = await getTodos();
		} catch (error) {
			console.error('Error loading todos:', error);
			// If unauthorized, redirect to auth
			if (error instanceof Error && error.message.includes('401')) {
				goto('/auth');
			}
		} finally {
			loading = false;
		}
	}

	async function handleDeleteTodo(id: number) {
		try {
			await deleteTodo(id);
			todos = todos.filter((todo) => todo.id !== id);
		} catch (error) {
			console.error('Error deleting todo:', error);
		}
	}

	async function handleUpdateTodo(todoToUpdate: Todo) {
		try {
			const updatedTodo = await updateTodo(todoToUpdate);
			todos = todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t));
		} catch (error) {
			console.error('Error updating todo:', error);
		}
	}

	async function handleCreateTodo() {
		const descript = newTodoDescription.trim();
		const category = newTodoCategory.trim() || 'default';
		if (!descript) {
			console.warn('New task description cannot be empty.');
			return;
		}

		try {
			const newTodo = await createTodo(descript, category);
			todos = [...todos, newTodo];
			newTodoDescription = '';
			newTodoCategory = '';
		} catch (error) {
			console.error('Error creating todo:', error);
		}
	}
</script>

{#if $authStore.loading}
	<div class="flex justify-center items-center min-h-[200px]">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if $authStore.isAuthenticated}
	<div class="w-full p-4">
		<div>
			<fieldset
				class="fieldset bg-base-200 border-base-300 rounded-md w-full border p-4"
				aria-label="Enter a New Task"
			>
				<legend class="fieldset-legend">
					<PlusSvg />
					New Task
				</legend>
				<form on:submit|preventDefault={handleCreateTodo}>
					<input
						class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
						name="descript"
						type="text"
						placeholder="What needs to be done?"
						aria-label="What needs to be done?"
						autocomplete="off"
						bind:value={newTodoDescription}
						on:keydown={(e) => e.key === 'Enter' && handleCreateTodo()}
					/>
					<input
						class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
						name="category"
						type="text"
						placeholder="Category (optional)"
						aria-label="Category for the new task"
						autocomplete="off"
						bind:value={newTodoCategory}
						on:keydown={(e) => e.key === 'Enter' && handleCreateTodo()}
					/>
				</form>
				<p class="label text-xs mt-2 font-semibold textarea-primary">
					<LeafSvg />
					Press enter to log your task
				</p>
			</fieldset>
		</div>

		{#if loading}
			<div class="flex justify-center items-center min-h-[200px]">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else}
			<div class="w-full mt-4">
				<fieldset class="fieldset bg-base-200 border-base-300 rounded-md w-full border p-4">
					<legend class="fieldset-legend">
						<TodoSvg />
						Tasks
					</legend>

					<ul class="space-y-2" role="list" aria-label="Tasks list">
						{#each todos as todo (todo.id)}
							<li class="flex items-center justify-between p-3 bg-base-100 rounded-md border border-base-300">
								<div class="flex items-center gap-3">
									<input
										type="checkbox"
										bind:checked={todo.done}
										on:change={() => handleUpdateTodo(todo)}
										class="checkbox checkbox-primary checkbox-sm"
										aria-label="Mark task as {todo.done ? 'incomplete' : 'complete'}"
									/>
									<div class="flex flex-col">
										<span
											class="text-sm {todo.done ? 'line-through opacity-50' : ''}"
											contenteditable
											bind:textContent={todo.descript}
											spellcheck="false"
											on:blur={() => handleUpdateTodo(todo)}
										></span>
										<span class="text-xs opacity-50">{todo.category}</span>
									</div>
								</div>
								<button
									class="btn btn-ghost btn-sm"
									on:click={() => handleDeleteTodo(todo.id)}
									aria-label="delete task"
								>
									<DeleteSvg />
								</button>
							</li>
						{/each}

						{#if todos.length === 0}
							<li class="p-4 text-center" aria-label="no tasks">
								<div class="flex items-center justify-center gap-2">
									<NullSvg />
									You have no tasks
								</div>
							</li>
						{/if}
					</ul>
				</div>
			</fieldset>
		{/if}
	</div>
{/if}

<div class="w-full p-4">
	<div>
		<fieldset
			class="fieldset bg-base-200 border-base-300 rounded-md w-full border p-4"
			aria-label="Enter a New Task"
		>
			<legend class="fieldset-legend">
				<PlusSvg />
				New Task
			</legend>
			<form on:submit|preventDefault={handleCreateTodo}>
				<input
					class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
					name="descript"
					type="text"
					placeholder="What needs to be done?"
					aria-label="What needs to be done?"
					autocomplete="off"
					bind:value={newTodoDescription}
					on:keydown={(e) => e.key === 'Enter' && handleCreateTodo()}
				/>
				<input
					class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
					name="category"
					type="text"
					placeholder="Category (optional)"
					aria-label="Category for the new task"
					autocomplete="off"
					bind:value={newTodoCategory}
					on:keydown={(e) => e.key === 'Enter' && handleCreateTodo()}
				/>
			</form>
			<p class="label text-xs mt-2 font-semibold textarea-primary">
				<LeafSvg />
				Press enter to log your task
			</p>
		</fieldset>
	</div>

	<ul class="list bg-base-100 rounded-box" aria-label="tasks.">
		<li class="p-4 pb-2 text-xs tracking-wide" aria-label="your tasks">
			<div class="flex items-center gap-1">
				<TodoSvg />
				Your Tasks
			</div>
		</li>

		{#each todos as todo (todo.id)}
			<li class="list-row flex items-start p-4 justify-between" aria-label="list of your tasks">
				<div class="flex items-start m-2 flex-grow">
					<input
						class="checkbox checkbox-sm checkbox-primary mr-2 border-2"
						type="checkbox"
						aria-label="checkbox"
						bind:checked={todo.done}
						on:change={() => handleUpdateTodo(todo)}
					/>
					<div>
						<span
							class="{todo.done ? 'line-through opacity-70' : ''} 
                                w-full rounded-md bg-base-100
                                focus:outline-none"
							aria-label="description of tasks."
							contenteditable="true"
							bind:textContent={todo.descript}
							spellcheck="false"
							on:blur={() => handleUpdateTodo(todo)}
						></span>
						<span class="text-xs opacity-50">{todo.category}</span>
					</div>
				</div>
				<button
					class="btn btn-ghost btn-sm"
					on:click={() => handleDeleteTodo(todo.id)}
					aria-label="delete task"
				>
					<DeleteSvg />
				</button>
			</li>
		{/each}

		{#if todos.length === 0}
			<li class="p-4 text-center" aria-label="no tasks">
				<div class="flex items-center justify-center gap-2">
					<NullSvg />
					You have no tasks
				</div>
			</li>
		{/if}
	</ul>
</div>