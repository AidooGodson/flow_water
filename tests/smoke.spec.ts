import { test, expect } from '@playwright/test';

const pages = [
  { path: '/',            title: 'FLOW Natural Mineral Water — Call Report System', heading: /FLOW Natural Mineral Water/i },
  { path: '/dashboard',   title: 'Manager Dashboard',                                heading: /Manager Dashboard/i },
  { path: '/reports',     title: 'All Reports',                                      heading: /All Call Reports/i },
  { path: '/call-report', title: 'Add Call Report',                                  heading: /Add New Call Report/i },
  { path: '/team',        title: 'Team',                                             heading: /Team Members/i },
];

for (const { path, title, heading } of pages) {
  test(`${path} — loads with 200 and correct title`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(title, 'i'));
  });

  test(`${path} — page header is visible`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1').first()).toContainText(heading);
  });
}

test('/ — navbar renders with navigation links', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();
});

test('/ — quick actions links are present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Add New Call Report/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /View All Reports/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Manager Dashboard/i })).toBeVisible();
});
