import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SignupPage } from '../pages/signup.page';
import { FaqWorkflow } from '../workflows/faq.workflow';
import { LoggedOutWorkflow } from '../workflows/logged-out.workflow';
import { RegistrationWorkflow } from '../workflows/registration.workflow';

type AppFixtures = {
  homePage: HomePage;
  signupPage: SignupPage;
  loggedOut: LoggedOutWorkflow;
  registration: RegistrationWorkflow;
  faq: FaqWorkflow;
};

export const test = base.extend<AppFixtures>({
  page: async ({ page }, use, testInfo) => {
    const lines: string[] = [];
    page.on('console', (message) => {
      lines.push(`[${message.type()}] ${message.text()}`);
    });
    page.on('pageerror', (error) => {
      const detail = error.stack && error.stack !== error.message ? error.stack : error.message;
      lines.push(`[pageerror] ${detail}`);
    });
    await use(page);
    const output = lines.length > 0 ? lines.join('\n') : '(no browser console output)';
    await testInfo.attach('browser-console', {
      body: output,
      contentType: 'text/plain',
    });
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
  loggedOut: async ({ page }, use) => {
    await use(new LoggedOutWorkflow(page));
  },
  registration: async ({ page }, use) => {
    await use(new RegistrationWorkflow(page));
  },
  faq: async ({ page }, use) => {
    await use(new FaqWorkflow(page));
  },
});

export { expect };
