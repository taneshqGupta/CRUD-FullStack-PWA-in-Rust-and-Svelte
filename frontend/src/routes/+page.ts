import type { PageLoad } from './$types';

interface Todo{
    id: number;
    descript: string;
    done: boolean;
}

export const load: PageLoad = async ({ fetch, params }) => {
    return {
        todos: (await fetch("http://0.0.0.0:8000").then((data) => data.json())) as Todo[]
    };
};