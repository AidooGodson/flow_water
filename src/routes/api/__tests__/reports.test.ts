import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── DB mock ──────────────────────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockLeftJoin = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();

const chainable = {
  from: mockFrom,
  leftJoin: mockLeftJoin,
  where: mockWhere,
  orderBy: mockOrderBy,
};

vi.mock('$lib/db', () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────
const USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const fakeReport = {
  id: 'r1',
  userId: USER_ID,
  date: new Date('2026-06-01'),
  customerName: 'Test Corp',
  telephone: '0244000000',
  location: 'Accra',
  product: 'Bottled Water',
  buyerType: 'Bulk buyer',
  comments: null,
  summary: null,
  followUpDate: null,
  followedUpBy: 'Kofi',
  status: 'New',
  createdAt: new Date(),
  createdBy: 'Kofi',
  userName: 'Kofi Mensah',
  userEmail: 'kofi@example.com',
};

const fakeUser = { id: USER_ID, name: 'Kofi Mensah' };

// Builds a minimal RequestEvent-like object for the GET handler
function makeGetEvent(searchParams: Record<string, string>) {
  const url = new URL('http://localhost/api/reports');
  Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  return { url } as any;
}

// Builds a minimal RequestEvent-like object for the POST handler
function makePostEvent(body: unknown) {
  return {
    request: new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  } as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('GET /api/reports', () => {
  let GET: typeof import('../reports/+server').GET;

  beforeEach(async () => {
    vi.resetModules();
    // Reset mock chain
    mockSelect.mockReturnValue(chainable);
    mockFrom.mockReturnValue(chainable);
    mockLeftJoin.mockReturnValue(chainable);
    mockWhere.mockReturnValue(chainable);
    mockOrderBy.mockResolvedValue([fakeReport]);

    ({ GET } = await import('../reports/+server'));
  });

  it('returns 400 when userId is missing', async () => {
    const res = await GET(makeGetEvent({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/userId/i);
  });

  it('returns 200 with enriched report array for valid userId', async () => {
    const res = await GET(makeGetEvent({ userId: USER_ID }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0].userName).toBe('Kofi Mensah');
  });

  it('returns empty array when user has no reports', async () => {
    mockOrderBy.mockResolvedValue([]);
    const res = await GET(makeGetEvent({ userId: USER_ID }));
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});

describe('POST /api/reports', () => {
  let POST: typeof import('../reports/+server').POST;

  const validPayload = {
    userId: USER_ID,
    date: '2026-06-01',
    customerName: 'Test Corp',
    telephone: '0244000000',
    product: 'Bottled Water',
    buyerType: 'Bulk buyer',
  };

  beforeEach(async () => {
    vi.resetModules();
    // user lookup returns a rep
    mockSelect.mockReturnValue(chainable);
    mockFrom.mockReturnValue(chainable);
    mockLeftJoin.mockReturnValue(chainable);
    mockWhere.mockResolvedValue([fakeUser]);
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue([]);

    ({ POST } = await import('../reports/+server'));
  });

  it('returns 400 for invalid JSON body', async () => {
    const event = {
      request: new Request('http://localhost/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      }),
    } as any;
    const res = await POST(event);
    expect(res.status).toBe(400);
  });

  it('returns 400 with field errors when required fields are missing', async () => {
    const res = await POST(makePostEvent({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toBeDefined();
    expect(body.errors.userId).toBeDefined();
    expect(body.errors.date).toBeDefined();
    expect(body.errors.customerName).toBeDefined();
    expect(body.errors.telephone).toBeDefined();
  });

  it('returns 400 when product is invalid', async () => {
    const res = await POST(makePostEvent({ ...validPayload, product: 'Fake Product' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.product).toBeDefined();
  });

  it('returns 400 when buyerType is invalid', async () => {
    const res = await POST(makePostEvent({ ...validPayload, buyerType: 'Giant corp' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.buyerType).toBeDefined();
  });

  it('returns 404 when userId does not exist in users table', async () => {
    mockWhere.mockResolvedValue([]); // user not found
    const res = await POST(makePostEvent(validPayload));
    expect(res.status).toBe(404);
  });

  it('returns 201 with report data on valid payload', async () => {
    // user lookup returns a rep; insert succeeds
    mockWhere.mockResolvedValue([fakeUser]);
    const res = await POST(makePostEvent(validPayload));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.customerName).toBe('Test Corp');
    expect(body.data.status).toBe('New');
    expect(body.data.id).toBeDefined();
  });

  it('returns 201 and accepts multiple products separated by comma', async () => {
    mockWhere.mockResolvedValue([fakeUser]);
    const res = await POST(makePostEvent({ ...validPayload, product: 'Bottled Water, Dispenser' }));
    expect(res.status).toBe(201);
  });
});
