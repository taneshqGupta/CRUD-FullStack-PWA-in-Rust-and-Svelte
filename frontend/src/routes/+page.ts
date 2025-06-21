import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { PageLoad } from './$types';
import type { Todo } from '../lib/types';

export const load: PageLoad = async ({ fetch }) => {
    return {
        todos: (await fetch(`${PUBLIC_BACKEND_URL}`).then((data: { json: () => any; }) => data.json())) as Todo[]
    };
};