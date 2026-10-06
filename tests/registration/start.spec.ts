// spec: specs/registration-start.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Registration start', () => {
  test('Start testing opens signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start testing' }).first().click();

    await expect(page).toHaveURL(/https:\/\/my\.functionhealth\.com\/signup/);
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  });

  test('empty submit shows validation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start testing' }).first().click();
    await expect(page).toHaveURL(/https:\/\/my\.functionhealth\.com\/signup/);

    const privacyNotice = page.getByRole('button', { name: 'I understand' });
    if (await privacyNotice.isVisible()) {
      await privacyNotice.click();
    }

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(
      page.getByText('Please fix the highlighted errors before continuing.'),
    ).toBeVisible();
  });
});
