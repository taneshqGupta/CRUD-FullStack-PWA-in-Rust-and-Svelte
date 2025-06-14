// src/routes/about/+page.server.ts
import { marked } from 'marked';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function load() {
    try {
        const svelteKitAppRoot = process.cwd();
        console.log('SvelteKit App Root (process.cwd()):', svelteKitAppRoot); // <--- ADD THIS LINE

        const readmePath = join(svelteKitAppRoot, '..', 'README.md');
        console.log('Calculated README Path:', readmePath); // <--- ADD THIS LINE

        const markdownContent = readFileSync(readmePath, 'utf8');
        const htmlContent = marked(markdownContent);

        return {
            readmeHtml: htmlContent
        };
    } catch (error) {
        console.error('Error reading README.md:', error);
        console.error('Full error details:', error.message); // <--- ADD THIS LINE for more info
        return {
            readmeHtml: '<p>Could not load README.md.</p>'
        };
    }
}