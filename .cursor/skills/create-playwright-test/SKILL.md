---
name: create-playwright-test
description: Plans a logged-out Function Health flow and generates a Playwright test from the accepted spec. Use when a manual QA asks for a new test, to add a test, or to cover logged-out browsing or the start of registration.
---

1. Restate the flow in plain language and refuse anything outside logged-out browsing of https://www.functionhealth.com or the start of registration on https://my.functionhealth.com/signup.
2. Use the Playwright planner agent definition installed in this repo, with tests/seed.spec.ts as the seed. Write specs/<feature>.md with steps and expected results.
3. Stop and show the plan. Generate only after the QA person accepts it, or when they already said to generate in the same request.
4. Use the generator agent. New tests must comment the spec and seed paths (`// spec: specs/<feature>.md` and `// seed: tests/seed.spec.ts`), import { test, expect } from the repo fixtures, and live in tests/<path>/<name>.spec.ts where `<path>` matches the site path (`home` for `/`, `signup` for `/signup`, `faq` for `/faq`). Put locators and single-page actions in pages/. Put the journey in workflows/. The spec calls the workflow fixture and does not repeat locators.
5. Run the new file with npm run test:one. If it fails consistently, use the healer agent for that test name, then rerun.
6. Tell QA what was planned, what file was added, and that no account was submitted.
