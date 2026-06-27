import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

const chainable = { from: mockFrom, where: mockWhere };

vi.mock('$lib/db', () => ({
  db: { select: mockSelect },
}));

const fakeReport = {
  id: 'r1',
  userId: 'uid',
  date: new Date('2026-06-01'),
  customerName: 'Test Corp',
  telephone: '0244000000',
  location: null,
  product: 'Bottled Water',
  buyerType: 'Bulk buyer',
  comments: null,
  summary: null,
  followUpDate: null,
  followedUpBy: 'Kofi',
  status: 'New',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'Kofi',
};

function makeEvent(id: string) {
  return { params: { id } } as any;
}

describe('GET /api/reports/[id]', () => {
  let GET: typeof import('../reports/[id]/+server').GET;

  beforeEach(async () => {
    vi.resetModules();
    mockSelect.mockReturnValue(chainable);
    mockFrom.mockReturnValue(chainable);

    ({ GET } = await import('../reports/[id]/+server'));
  });

  it('returns 200 with report data for existing id', async () => {
    mockWhere.mockResolvedValue([fakeReport]);
    const res = await GET(makeEvent('r1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('r1');
    expect(body.data.customerName).toBe('Test Corp');
  });

  it('returns 404 for unknown id', async () => {
    mockWhere.mockResolvedValue([]);
    const res = await GET(makeEvent('does-not-exist'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });
});
