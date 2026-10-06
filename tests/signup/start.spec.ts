// spec: specs/registration-start.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Signup /signup', () => {
  test('Start testing opens signup', async ({ registration }) => {
    await registration.startFromHome();

    await expect(registration.signup.email).toBeVisible();
  });

  test('empty submit shows validation', async ({ registration }) => {
    await registration.submitEmptyFromHome();

    await expect(registration.signup.emailRequired).toBeVisible();
    await expect(registration.signup.errorSummary).toBeVisible();
  });
});
