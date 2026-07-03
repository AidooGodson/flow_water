import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const PUBLIC_PATHS = ['/login'];

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const session = await locals.getSession();

  if (!session && !PUBLIC_PATHS.includes(url.pathname)) {
    redirect(303, '/login');
  }

  return { session };
};
