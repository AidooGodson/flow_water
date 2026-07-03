import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

const chainable = { from: mockFrom, where: mockWhere, orderBy: mockOrderBy };

vi.mock('$lib/db', () => ({
  db: { select: mockSelect },
}));

const fakeSalesReps = [
  { id: 'u1', name: 'Ama Darko',   email: 'ama@example.com',   role: 'sales_rep' },
  { id: 'u2', name: 'Kofi Mensah', email: 'kofi@example.com', role: 'sales_rep' },
];

describe('GET /api/users', () => {
  let GET: typeof import('../users/+server').GET;

  beforeEach(async () => {
    vi.resetModules();
    mockSelect.mockReturnValue(chainable);
    mockFrom.mockReturnValue(chainable);
    mockWhere.mockReturnValue(chainable);
    mockOrderBy.mockResolvedValue(fakeSalesReps);

    ({ GET } = await import('../users/+server'));
  });

  it('returns 200 with an array', async () => {
    const res = await GET({} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns only sales_rep users', async () => {
    const res = await GET({} as any);
    const body = await res.json();
    expect(body.data.every((u: any) => u.role === 'sales_rep')).toBe(true);
  });

  it('returns expected fields (id, name, email, role)', async () => {
    const res = await GET({} as any);
    const body = await res.json();
    const first = body.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('email');
    expect(first).toHaveProperty('role');
  });

  it('returns empty array when no sales reps exist', async () => {
    mockOrderBy.mockResolvedValue([]);
    const res = await GET({} as any);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
