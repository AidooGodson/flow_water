import { db } from '$lib/db';
import { callReports, users } from '$lib/schema';
import { eq, desc } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const VALID_PRODUCTS = ['Bottled Water', 'Sachet Water', 'Dispenser'];
const VALID_BUYER_TYPES = ['Bulk buyer', 'Medium scale', 'Small scale'];

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await locals.getSession();
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

  const userId = url.searchParams.get('userId');

  if (!userId) {
    return json({ error: 'userId is required' }, { status: 400 });
  }

  const rows = await db
    .select({
      id: callReports.id,
      userId: callReports.userId,
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
      userName: users.name,
      userEmail: users.email,
    })
    .from(callReports)
    .leftJoin(users, eq(callReports.userId, users.id))
    .where(eq(callReports.userId, userId))
    .orderBy(desc(callReports.createdAt));

  return json({ data: rows });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const userId   = String(body.userId   ?? '').trim();
  const date     = String(body.date     ?? '').trim();
  const customerName = String(body.customerName ?? '').trim();
  const telephone    = String(body.telephone    ?? '').trim();
  const location     = String(body.location     ?? '').trim() || null;
  const product      = String(body.product      ?? '').trim();
  const buyerType    = String(body.buyerType    ?? '').trim();
  const comments     = String(body.comments     ?? '').trim() || null;
  const summary      = String(body.summary      ?? '').trim() || null;
  const followUpDate = String(body.followUpDate ?? '').trim() || null;

  const errors: Record<string, string> = {};
  if (!userId)       errors.userId       = 'userId is required';
  if (!date)         errors.date         = 'date is required';
  if (!customerName) errors.customerName = 'customerName is required';
  if (!telephone)    errors.telephone    = 'telephone is required';
  if (!product)      errors.product      = 'product is required';
  if (!buyerType)    errors.buyerType    = 'buyerType is required';

  if (product && !product.split(', ').every((p) => VALID_PRODUCTS.includes(p))) {
    errors.product = 'Invalid product';
  }
  if (buyerType && !VALID_BUYER_TYPES.includes(buyerType)) {
    errors.buyerType = 'Invalid buyerType';
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  const [rep] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
  if (!rep) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const now = new Date();
  const report = {
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
  };

  await db.insert(callReports).values(report);

  return json({ data: report }, { status: 201 });
};
