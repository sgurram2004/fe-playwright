// spec: specs/faq-search.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('FAQ /faq', () => {
  test('search for Cancel shows a result that can be opened', async ({ faq }) => {
    await faq.search('Cancel');

    const matches = faq.faq.results.filter({ hasText: /cancel/i });
    await expect(matches.first()).toBeVisible();
    expect(await matches.count()).toBeGreaterThan(0);

    await faq.openFirstResult();

    await expect(faq.faq.openedAnswer).toBeVisible();
    await expect(faq.faq.openedAnswer).toContainText('you can cancel and rejoin at any time');
  });
});
