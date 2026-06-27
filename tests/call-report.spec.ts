import { test, expect } from '@playwright/test';

test('call-report — form renders all 5 sections', async ({ page }) => {
  await page.goto('/call-report');
  await expect(page.getByText(/Section 1/i)).toBeVisible();
  await expect(page.getByText(/Section 2/i)).toBeVisible();
  await expect(page.getByText(/Section 3/i)).toBeVisible();
  await expect(page.getByText(/Section 4/i)).toBeVisible();
  await expect(page.getByText(/Section 5/i)).toBeVisible();
});

test('call-report — submit without required fields shows inline errors', async ({ page }) => {
  await page.goto('/call-report');

  // Clear the date field (it defaults to today)
  await page.locator('input[name="date"]').fill('');

  await page.getByRole('button', { name: /Save Report/i }).click();

  // At least some field errors should appear
  const errors = page.locator('.text-brand-red').filter({ hasText: /required/i });
  await expect(errors.first()).toBeVisible();
});

test('call-report — shows "no sales reps" message when team is empty', async ({ page }) => {
  await page.goto('/call-report');
  const noRepsMsg = page.getByText(/No sales reps found/i);
  const dropdown = page.locator('select').last();
  const hasDropdown = await dropdown.isVisible().catch(() => false);
  if (!hasDropdown) {
    await expect(noRepsMsg).toBeVisible();
  }
});

test('call-report — Clear Form button resets product selections', async ({ page }) => {
  await page.goto('/call-report');
  // Select a product
  const bottledWater = page.getByText('Bottled Water').locator('..');
  await bottledWater.click();

  await page.getByRole('button', { name: /Clear Form/i }).click();

  // After clear, the checkbox for Bottled Water should be unchecked
  const checkbox = page.locator('input[type="checkbox"]').first();
  await expect(checkbox).not.toBeChecked();
});

test('call-report — date field defaults to today', async ({ page }) => {
  await page.goto('/call-report');
  const today = new Date().toISOString().split('T')[0];
  const dateInput = page.locator('input[name="date"]');
  await expect(dateInput).toHaveValue(today);
});
