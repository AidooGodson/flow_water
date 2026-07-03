import { vi } from 'vitest';

// Mock $env/static/private so it's available in test environments
// (the real db is always replaced by vi.mock('$lib/db') in each test file)
vi.mock('$env/static/private', () => ({
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
}));
