import { db } from '$lib/db';
import { callReports } from '$lib/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const rows = await db
    .select({
      id: callReports.id,
      date: callReports.date,
      customerName: callReports.customerName,
      telephone: callReports.telephone,
      location: callReports.location,
      product: callReports.product,
      buyerType: callReports.buyerType,
      comments: callReports.comments,
      summary: callReports.summary,
      followUpDate: callReports.followUpDate,
      followedUpBy: callReports.followedUpBy,
      status: callReports.status,
      createdAt: callReports.createdAt,
      createdBy: callReports.createdBy,
    })
    .from(callReports)
    .orderBy(desc(callReports.date));

  return {
    reports: rows.map((r) => ({
      ...r,
      date: r.date.toISOString(),
      followUpDate: r.followUpDate?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = String(data.get('id') ?? '');
    if (!id) return fail(400, { error: 'Missing id' });

    try {
      await db.delete(callReports).where(eq(callReports.id, id));
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to delete report' });
    }
  },
};
