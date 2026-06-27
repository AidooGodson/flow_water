import { db } from '$lib/db';
import { callReports } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const [report] = await db
    .select()
    .from(callReports)
    .where(eq(callReports.id, params.id));

  if (!report) {
    return json({ error: 'Report not found' }, { status: 404 });
  }

  return json({ data: report });
};
