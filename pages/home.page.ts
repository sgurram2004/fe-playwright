import type { Locator, Page } from '@playwright/test';

/** Marketing home at `/`. */
export class HomePage {
  constructor(private readonly page: Page) {}

  get primaryNav(): Locator {
    return this.page.getByRole('navigation', { name: 'Primary' });
  }

  get logIn(): Locator {
    return this.page.getByRole('link', { name: 'Log in' });
  }

  get startTesting(): Locator {
    return this.page.getByRole('link', { name: 'Start testing' }).first();
  }

  get heroHeading(): Locator {
    return this.page.getByRole('heading', {
      level: 1,
      name: 'Less stuff. More healthy years.',
    });
  }

  get whatIsFunction(): Locator {
    return this.page.getByText('What is Function?', { exact: true });
  }

  get whatIsFunctionAnswer(): Locator {
    return this.page.getByText(
      'Function is a membership that gives you access to 160+ lab tests',
    );
  }

  get footerLogin(): Locator {
    return this.page.getByRole('link', { name: 'Login' });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async goToSignup(): Promise<void> {
    await this.startTesting.click();
  }

  async expandWhatIsFunction(): Promise<void> {
    await this.whatIsFunction.click();
  }
}
