// spec: specs/logged-out-home.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Home /', () => {
  test('header and hero heading', async ({ loggedOut }) => {
    await loggedOut.openHome();

    await expect(loggedOut.home.primaryNav).toBeVisible();
    await expect(loggedOut.home.heroHeading).toBeVisible();
  });

  test('What is Function FAQ expands', async ({ loggedOut }) => {
    await loggedOut.readWhatIsFunction();

    await expect(loggedOut.home.whatIsFunctionAnswer).toBeVisible();
  });

  test('footer Login is visible', async ({ loggedOut }) => {
    await loggedOut.openHome();

    await expect(loggedOut.home.footerLogin).toBeVisible();
  });
});
