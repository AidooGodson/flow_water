import { db } from '$lib/db';
import { callReports, users } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const VALID_PRODUCTS = ['Bottled Water', 'Sachet Water', 'Dispenser'];
const VALID_BUYER_TYPES = ['Bulk buyer', 'Medium scale', 'Small scale'];

function isValidDate(v: string): boolean {
  return !isNaN(new Date(v).getTime());
}

export const load: PageServerLoad = async () => {
  const salesReps = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, 'sales_rep'))
    .orderBy(users.name);

  return { salesReps };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    const userId = String(data.get('userId') ?? '').trim() || null;
    const date = String(data.get('date') ?? '').trim();
    const customerName = String(data.get('customerName') ?? '').trim();
    const telephone = String(data.get('telephone') ?? '').trim();
    const location = String(data.get('location') ?? '').trim() || null;
    const product = String(data.get('product') ?? '').trim();
    const buyerType = String(data.get('buyerType') ?? '').trim();
    const comments = String(data.get('comments') ?? '').trim() || null;
    const summary = String(data.get('summary') ?? '').trim() || null;
    const followUpDate = String(data.get('followUpDate') ?? '').trim() || null;

    const errors: Record<string, string> = {};
    if (!userId) errors.userId = 'Select a sales rep';
    if (!date) errors.date = 'Date is required';
    else if (!isValidDate(date)) errors.date = 'Invalid date format';
    if (!customerName) errors.customerName = 'Customer name is required';
    if (!telephone) errors.telephone = 'Telephone number is required';
    if (!product) errors.products = 'Select at least one product';
    if (!buyerType) errors.buyerType = 'Buyer type is required';
    if (followUpDate && !isValidDate(followUpDate)) errors.followUpDate = 'Invalid date';

    if (product && !product.split(', ').every((p) => VALID_PRODUCTS.includes(p))) {
      errors.products = 'Invalid product selection';
    }
    if (buyerType && !VALID_BUYER_TYPES.includes(buyerType)) {
      errors.buyerType = 'Invalid buyer type';
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors: errors as Record<string, string>,
        values: { userId, date, customerName, telephone, location, product, buyerType, comments, summary, followUpDate },
      });
    }

    // Resolve the rep's display name from the DB
    const [rep] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId!));
    if (!rep) {
      return fail(400, {
        errors: { userId: 'Sales rep not found' },
        values: { userId, date, customerName, telephone, location, product, buyerType, comments, summary, followUpDate },
      });
    }

    const now = new Date();
    try {
      await db.insert(callReports).values({
        id: crypto.randomUUID(),
        userId,
        date: new Date(date),
        customerName,
        telephone,
        location,
        product,
        buyerType,
        comments,
        summary,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followedUpBy: rep.name,
        createdBy: rep.name,
        status: 'New',
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      return fail(500, {
        errors: { serverError: 'Failed to save report. Please try again.' } as Record<string, string>,
        values: { userId, date, customerName, telephone, location, product, buyerType, comments, summary, followUpDate },
      });
    }

    redirect(303, '/reports');
  },
};
