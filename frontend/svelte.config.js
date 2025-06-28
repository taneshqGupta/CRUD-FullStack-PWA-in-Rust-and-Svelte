import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		paths: {
            base: process.env.NODE_ENV === 'production' ? '/rust-svelte-tasks' : '', // Set base path for production
        },
	}
};

export default config;
