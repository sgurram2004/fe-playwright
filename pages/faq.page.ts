import type { Locator, Page } from '@playwright/test';

/** Public FAQ page at `/faq`. */
export class FaqPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1, name: 'FAQs' });
  }

  get search(): Locator {
    return this.page.getByRole('searchbox', { name: 'Search' });
  }

  get results(): Locator {
    return this.page.locator('summary');
  }

  get openedAnswer(): Locator {
    return this.page.locator('details[open]');
  }

  async open(): Promise<void> {
    await this.page.goto('/faq');
  }

  async searchFor(query: string): Promise<void> {
    await this.search.fill(query);
  }

  async openResult(result: Locator): Promise<void> {
    await result.click();
  }
}
