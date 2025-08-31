// In: src/routes/profile/[userid]/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
    // This line will intentionally crash the page if this file is running.
    throw new Error("SUCCESS: This proves the +layout.server.ts file IS running.");
};