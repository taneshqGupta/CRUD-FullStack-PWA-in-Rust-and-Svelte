<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<script lang="ts">
	import type { Todo } from '$lib/types';
	import { DeleteSvg, LeafSvg, NullSvg, PlusSvg, TodoSvg } from '$lib/components/icons';
	import { createTodo, updateTodo, deleteTodo } from '$lib/api';

	export let data: { todos: Todo[] };
	let todos: Todo[] = data.todos;
	let newTodoDescription: string = '';

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
		if (!descript) {
			console.warn('New task description cannot be empty.');
			return;
		}

		try {
			const newTodo = await createTodo(descript);
			todos = [...todos, newTodo];
			newTodoDescription = '';
		} catch (error) {
			console.error('Error creating todo:', error);
		}
	}
</script>

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
				/>
			</form>
			<p class="label text-xs opacity-70 mt-2">
				<LeafSvg />
				Press enter to log your task
			</p>
		</fieldset>
	</div>

	<ul class="list bg-base-100 rounded-box" aria-label="tasks.">
		<li class="p-4 pb-2 text-xs opacity-60 tracking-wide" aria-label="your tasks">
			<div class="flex items-center gap-1">
				<TodoSvg />
				Your Tasks
			</div>
		</li>

		{#each todos as todo (todo.id)}
			<li class="list-row flex items-start p-4 justify-between" aria-label="list of your tasks">
				<div class="flex items-start m-2 flex-grow">
					<input
						class="checkbox checkbox-sm mr-2"
						type="checkbox"
						aria-label="checkbox"
						bind:checked={todo.done}
						on:change={() => handleUpdateTodo(todo)}
					/>
					<span
						class="{todo.done ? 'line-through opacity-70' : ''} w-full"
						aria-label="description of tasks."
						contenteditable="true"
						bind:textContent={todo.descript}
					></span>
				</div>
				<div class="flex items-center">
					<button
						class="btn btn-ghost btn-sm"
						aria-label="update"
						on:click={() => handleUpdateTodo(todo)}
					>
						Update
					</button>
					<button
						class="btn btn-ghost btn-sm text-error flex items-center justify-center"
						aria-label="delete"
						on:click={() => handleDeleteTodo(todo.id)}
					>
						<DeleteSvg />
					</button>
				</div>
			</li>
		{/each}

		{#if !todos || todos.length === 0}
			<li class="list-row p-4 text-center text-sm opacity-60" aria-label="No Tasks">
				<NullSvg />
				No tasks added yet.
			</li>
		{/if}
	</ul>
</div>
