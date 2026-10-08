import type { Page } from '@playwright/test';
import { FaqPage } from '../pages/faq.page';

/** Search the public FAQ and open a result. */
export class FaqWorkflow {
  readonly faq: FaqPage;

  constructor(page: Page) {
    this.faq = new FaqPage(page);
  }

  async search(query: string): Promise<void> {
    await this.faq.open();
    await this.faq.searchFor(query);
  }

  async openFirstResult(): Promise<void> {
    await this.faq.openResult(this.faq.results.first());
  }
}
