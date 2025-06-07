import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    const theme = cookies.get('theme') || 'valentine';

    return {
        theme,
        url: { pathname: url.pathname } 
    };
};
