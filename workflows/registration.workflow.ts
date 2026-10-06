import type { Page } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SignupPage } from '../pages/signup.page';

/** Start registration from the marketing home. Stops before an account is created. */
export class RegistrationWorkflow {
  readonly home: HomePage;
  readonly signup: SignupPage;

  constructor(page: Page) {
    this.home = new HomePage(page);
    this.signup = new SignupPage(page);
  }

  async startFromHome(): Promise<void> {
    await this.home.open();
    await this.home.goToSignup();
    await this.signup.expectOpen();
  }

  async submitEmptyFromHome(): Promise<void> {
    await this.startFromHome();
    await this.signup.continueWithoutFilling();
  }
}
