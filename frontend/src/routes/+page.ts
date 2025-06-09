import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { PageLoad } from './$types';

interface Todo{
    id: number;
    descript: string;
    done: boolean;
}

export const load: PageLoad = async ({ fetch, params }) => {
    return {
        todos: (await fetch(`${PUBLIC_BACKEND_URL}`).then((data) => data.json())) as Todo[]
    };
};