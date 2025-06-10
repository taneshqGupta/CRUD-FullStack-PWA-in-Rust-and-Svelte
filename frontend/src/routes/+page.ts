import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { PageLoad } from './$types';
import type { Todo } from './Todo';

export const load: PageLoad = async ({ fetch, params }) => {
    return {
        todos: (await fetch(`${PUBLIC_BACKEND_URL}`).then((data) => data.json())) as Todo[]
    };
};