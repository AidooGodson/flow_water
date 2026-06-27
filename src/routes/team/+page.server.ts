import { db } from '$lib/db';
import { users } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const members = await db.select().from(users).orderBy(users.createdAt);
  return { members };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const name  = String(data.get('name')  ?? '').trim();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const role  = String(data.get('role')  ?? 'sales_rep').trim() as 'manager' | 'sales_rep';

    const errors: Record<string, string> = {};
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
    if (!['manager', 'sales_rep'].includes(role)) errors.role = 'Invalid role';

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors: errors as Record<string, string>, values: { name, email, role } });
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return fail(400, {
        errors: { email: 'A user with this email already exists' } as Record<string, string>,
        values: { name, email, role },
      });
    }

    const now = new Date();
    try {
      await db.insert(users).values({ id: crypto.randomUUID(), name, email, role, createdAt: now, updatedAt: now });
    } catch {
      return fail(500, {
        errors: { serverError: 'Failed to create user. Please try again.' } as Record<string, string>,
        values: { name, email, role },
      });
    }

    return { success: true };
  },

  remove: async ({ request }) => {
    const data = await request.formData();
    const id = String(data.get('id') ?? '').trim();
    if (!id) return fail(400, { errors: { serverError: 'Missing user ID' } as Record<string, string> });

    try {
      await db.delete(users).where(eq(users.id, id));
    } catch {
      return fail(500, { errors: { serverError: 'Failed to remove user.' } as Record<string, string> });
    }

    return { success: true };
  },
};
