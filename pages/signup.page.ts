import { expect, type Locator, type Page } from '@playwright/test';

/** Signup at `my.functionhealth.com/signup`. Do not submit an account. */
export class SignupPage {
  constructor(private readonly page: Page) {}

  get email(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get continueButton(): Locator {
    return this.page.getByRole('button', { name: 'Continue', exact: true });
  }

  get emailRequired(): Locator {
    return this.page.getByText('Email is required');
  }

  get errorSummary(): Locator {
    return this.page.getByText('Please fix the highlighted errors before continuing.');
  }

  async expectOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/https:\/\/my\.functionhealth\.com\/signup/);
    await expect(this.email).toBeVisible();
  }

  async dismissPrivacyNoticeIfShown(): Promise<void> {
    const notice = this.page.getByRole('button', { name: 'I understand' });
    if (await notice.isVisible()) {
      await notice.click();
    }
  }

  async continueWithoutFilling(): Promise<void> {
    await this.dismissPrivacyNoticeIfShown();
    await this.continueButton.click();
  }
}
