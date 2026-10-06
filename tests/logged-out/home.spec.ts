// spec: specs/logged-out-home.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Logged-out home', () => {
  test('header and hero heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Less stuff. More healthy years.' }),
    ).toBeVisible();
  });

  test('What is Function FAQ expands', async ({ page }) => {
    await page.goto('/');

    const question = page.getByText('What is Function?', { exact: true });
    const answer = page.getByText(
      'Function is a membership that gives you access to 160+ lab tests',
    );

    await question.click();
    await expect(answer).toBeVisible();
  });

  test('footer Login is visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });
});
