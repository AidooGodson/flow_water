import { db } from '$lib/db';
import { callReports } from '$lib/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

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
