import { test, expect } from './fixtures';

test('seed', { tag: '@seed' }, async ({ loggedOut }) => {
  await loggedOut.openHome();

  await expect(loggedOut.home.primaryNav).toBeVisible();
  await expect(loggedOut.home.logIn).toBeVisible();
  await expect(loggedOut.home.startTesting).toBeVisible();
});
