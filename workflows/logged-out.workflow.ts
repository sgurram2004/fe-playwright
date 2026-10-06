import type { Page } from '@playwright/test';
import { HomePage } from '../pages/home.page';

/** Logged-out browsing on the marketing site. */
export class LoggedOutWorkflow {
  readonly home: HomePage;

  constructor(page: Page) {
    this.home = new HomePage(page);
  }

  async openHome(): Promise<void> {
    await this.home.open();
  }

  async readWhatIsFunction(): Promise<void> {
    await this.home.open();
    await this.home.expandWhatIsFunction();
  }
}
