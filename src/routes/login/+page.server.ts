import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  if (session) redirect(303, '/');
};

export const actions: Actions = {
  login: async ({ request, locals }) => {
    const data = await request.formData();
    const email    = String(data.get('email')    ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return fail(400, { error: 'Invalid email or password' });
    }

    redirect(303, '/');
  },

  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    redirect(303, '/login');
  }
};
