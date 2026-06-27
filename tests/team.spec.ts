import { test, expect } from '@playwright/test';

test('team — shows empty state when no members', async ({ page }) => {
  await page.goto('/team');
  const emptyState = page.getByText(/No team members yet/i);
  const memberTable = page.locator('table');

  const hasMembers = await memberTable.isVisible().catch(() => false);
  if (!hasMembers) {
    await expect(emptyState).toBeVisible();
  }
});

test('team — Add Member button toggles form', async ({ page }) => {
  await page.goto('/team');
  const addBtn = page.getByRole('button', { name: /\+ Add Member/i });
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  await expect(page.getByText(/New Team Member/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
});

test('team — add member form shows validation errors on empty submit', async ({ page }) => {
  await page.goto('/team');
  await page.getByRole('button', { name: /\+ Add Member/i }).click();
  await page.getByRole('button', { name: /Add Member/i }).click();
  await expect(page.getByText(/Name is required/i)).toBeVisible();
  await expect(page.getByText(/Email is required/i)).toBeVisible();
});

test('team — add member form rejects invalid email', async ({ page }) => {
  await page.goto('/team');
  await page.getByRole('button', { name: /\+ Add Member/i }).click();
  await page.getByPlaceholder(/Kofi Mensah/i).fill('Test User');
  await page.locator('input[name="email"]').fill('not-an-email');
  await page.getByRole('button', { name: /Add Member/i }).click();
  await expect(page.getByText(/Invalid email/i)).toBeVisible();
});

test('team — successfully adds a new team member', async ({ page }) => {
  await page.goto('/team');
  await page.getByRole('button', { name: /\+ Add Member/i }).click();

  const uniqueEmail = `test+${Date.now()}@flow.test`;
  await page.getByPlaceholder(/Kofi Mensah/i).fill('Playwright User');
  await page.locator('input[name="email"]').fill(uniqueEmail);
  await page.getByRole('button', { name: /Add Member/i }).click();

  // Form closes on success
  await expect(page.getByText(/New Team Member/i)).not.toBeVisible();
  await expect(page.getByText('Playwright User')).toBeVisible();
});

test('team — remove member flow shows confirm prompt', async ({ page }) => {
  await page.goto('/team');
  const removeBtn = page.getByRole('button', { name: /Remove/i }).first();
  const hasMembers = await removeBtn.isVisible().catch(() => false);
  if (!hasMembers) {
    test.skip();
    return;
  }
  await removeBtn.click();
  await expect(page.getByText(/Remove\?/i)).toBeVisible();
  // Cancel — member should still be there
  await page.getByRole('button', { name: /No/i }).click();
  await expect(page.getByText(/Remove\?/i)).not.toBeVisible();
});
