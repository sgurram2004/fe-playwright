# Function Health Playwright

Logged-out pages on [functionhealth.com](https://www.functionhealth.com/) and the start of registration. Tests do not create an account or enter personal data.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

Every run saves a screenshot for each test and writes an HTML dashboard to `playwright-report/`. On your machine the dashboard opens when the run finishes. `npm run report` opens the last dashboard again.

```bash
npm run test:one -- tests/logged-out/home.spec.ts --grep "hero heading"
npm run test:suite -- logged-out
npm run test:all
npm run report
```

`npm run test:ui` is for debugging. It is not the results dashboard.

## Authoring

Ask Cursor to create a test for a logged-out or registration flow. Read the plan in `specs/` before accepting generated tests. New tests go in the matching suite folder, `tests/logged-out/` or `tests/registration/`.

If a test fails every time, ask the healer for that test name and look at the dashboard screenshot first. If it fails only sometimes, ask to fix the flaky test.

Regenerate the planner, generator, and healer with `npx playwright init-agents` whenever `@playwright/test` is upgraded. Do not hand-edit those generated agent files.
