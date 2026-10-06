# Function Health Playwright

Logged-out pages on [functionhealth.com](https://www.functionhealth.com/) and the start of registration. Tests do not create an account or enter personal data.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

Headless is the default. After each of these commands, a fancy HTML results page opens on your machine. `npm run report` reopens it.

```bash
npm run test:one -- tests/home/home.spec.ts --grep "hero heading"
npm run test:suite -- home
npm run test:suite -- signup
npm run test:all
```

Headed runs show the browser. The same results page opens when they finish.

```bash
npm run test:one:headed -- tests/home/home.spec.ts --grep "hero heading"
npm run test:suite:headed -- home
npm run test:all:headed
```

Every test has a screenshot under `test-results/` and a browser console log. Both show on the results page. The full terminal log is `logs/latest.log`. The results page is `playwright-report/index.html`. The detailed Playwright trace report is `playwright-report/playwright/index.html`.

Suites follow the site path: `tests/home` is `/`, and `tests/signup` is `/signup`.

`npm run test:ui` is for debugging. It is not the results page.

## Layout

- `pages/` holds one class per screen. Locators and single-page actions live here.
- `workflows/` composes those pages into a journey, such as opening signup from home.
- `tests/<path>/` calls a workflow and asserts the outcome. Specs do not own locators.

## Authoring

Ask Cursor to create a test for a logged-out or registration flow. Read the plan in `specs/` before accepting generated tests. New tests go in the folder for that path, `tests/home/` or `tests/signup/`. Add locators to the page object and steps to the workflow.

If a test fails every time, ask the healer for that test name and look at the HTML results page first. If it fails only sometimes, ask to fix the flaky test.

Regenerate the planner, generator, and healer with `npx playwright init-agents` whenever `@playwright/test` is upgraded. Do not hand-edit those generated agent files.
