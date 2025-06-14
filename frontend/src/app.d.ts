// https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		export interface Todo {
			id: number;
			descript: string;
			done: boolean;
		}
		
	}
}

export {};
