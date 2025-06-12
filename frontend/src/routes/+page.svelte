<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<script lang="ts">
	import { PUBLIC_BACKEND_URL } from "$env/static/public";
	import type { Todo } from './Todo';
    import type { PageData } from "./$types";

    export let data: PageData;
    let todos: Todo[] = data.todos;
    let newTodoDescription: string = ''; // State to hold the new task description
  
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

<div class="w-full max-w-md p-4">

	<div>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
			<legend class="fieldset-legend">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                New Task
            </legend>
			<form on:submit|preventDefault={handleCreateTodo}>
				<input
					class="w-full p-2 border border-base-300 rounded-md bg-base-100 focus:outline-none focus:ring-1 focus:ring-primary my-2"
					name="descript"
					type="text"
					placeholder="What needs to be done?"
					autocomplete="off"
					bind:value={newTodoDescription} 
				/>
			</form>
			<p class="label text-xs opacity-70 mt-2">Press enter to log your task</p>
		</fieldset>
	</div>

    <ul class="list bg-base-100 rounded-box">
        
        
        <!-- <li class="p-4 pb-2 text-xs opacity-60 tracking-wide"> -->
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-todo-icon lucide-list-todo"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
                Your Tasks
            </div>
        <!-- </li> -->
        
        {#each todos as todo (todo.id)} 
            <li class="list-row flex items-start justify-between p-4">
                <div class="flex items-start gap-2">
                    <input 
                        class="checkbox checkbox-sm" 
                        type="checkbox" 
                        bind:checked={todo.done} 
                        on:change={() => updateTodo(todo)}
                    />
                    <span class="{todo.done ? 'line-through opacity-70' : ''}">{todo.descript}</span>
                </div>
                <button 
                    class="btn btn-ghost btn-sm text-error" 
                    on:click={() => deleteTodo(todo.id)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    <!-- Delete -->
                </button>
            </li>
        {/each}

        {#if !todos || todos.length === 0}
            <li class="list-row p-4 text-center text-sm opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-slash-icon lucide-circle-slash"><circle cx="12" cy="12" r="10"/><line x1="9" x2="15" y1="15" y2="9"/></svg>    
                No tasks added yet.
            </li>
        {/if}
        
    </ul>
  </div>


