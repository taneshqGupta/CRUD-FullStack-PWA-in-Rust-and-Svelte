<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<script lang="ts">
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import type { Todo } from './../types.ts';
    import type { PageData } from './$types';
	import { DeleteSvg, LeafSvg, NullSvg, PlusSvg, TodoSvg } from '$lib/components/icons';

    export let data: PageData;
    let todos: Todo[] = data.todos;
    let newTodoDescription: string = ''; 
  
    async function deleteTodo(id: number) {
        try {
            const response = await fetch(`${PUBLIC_BACKEND_URL}delete/${id}`, { 
                method: "POST",
				credentials: "include"
            });
            
            if (response.ok) {
                todos = todos.filter((todo) => todo.id !== id);
            } else {
                const errorData = await response.json();
                console.error('Failed to delete todo:', errorData.message || response.statusText);
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }
  
    async function updateTodo(todoToUpdate: Todo) {
        try {
            const response = await fetch(`${PUBLIC_BACKEND_URL}update`, {
                method: "POST",
				credentials: "include", 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(todoToUpdate) 
            });

            if (response.ok) {
                const updatedTodoFromServer: Todo = await response.json(); 
                todos = todos.map(t => t.id === updatedTodoFromServer.id ? updatedTodoFromServer : t);
            } else {
                const errorData = await response.json();
                console.error('Failed to update todo:', errorData.message || response.statusText);
            }
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
            const formData = new URLSearchParams();
            formData.append('descript', descript);

            const response = await fetch(`${PUBLIC_BACKEND_URL}create`, {
                method: "POST",
				credentials: "include",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                body: formData.toString() 
            });

            if (response.ok) {
                const newTodo: Todo = await response.json();
                todos = [...todos, newTodo]; 
                newTodoDescription = ''; 
            } else {
                const errorData = await response.json();
                console.error('Failed to create todo:', errorData.message || response.statusText);
            }
        } catch (error) {
            console.error('Error creating todo:', error);
        }
    }
</script>

<div class="w-full p-4">

	<div>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-md w-full border p-4" aria-label="Enter a New Task">
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
                <input
                    class="checkbox checkbox-sm" 
                    type="checkbox" 
                    aria-label="checkbox"
                    bind:checked={todo.done} 
                    on:change={() => updateTodo(todo)}
                />
                <span class="{todo.done ? 'line-through opacity-70' : ''}" aria-label="description of tasks.">{todo.descript}</span>
                <button 
                    class="btn btn-ghost btn-sm text-error flex items-center justify-center" 
                    aria-label="delete"
                    on:click={() => deleteTodo(todo.id)}
                >
                    <DeleteSvg />
                </button>
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

