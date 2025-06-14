import { marked } from 'marked';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function load() {
    try {
        const frontend = process.cwd();

        const readmePath = join(frontend, '..', 'README.md');

        const markdownContent = readFileSync(readmePath, 'utf8');
        const htmlContent = marked(markdownContent);

        return {
            readmeHtml: htmlContent
        };
    } catch (error) {
        console.error('Error reading README.md: ', error);
        return {
            readmeHtml: '<p>Could not load README.md.</p>'
        };
    }
}