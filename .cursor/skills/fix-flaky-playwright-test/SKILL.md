---
name: fix-flaky-playwright-test
description: Reproduces an intermittent Playwright failure, classifies the cause from the trace, and fixes the test with stable locators and web-first assertions. Use when a manual QA says a test is flaky or intermittent.
---

1. If the test fails every time, send it to the healer agent instead of this skill.
2. Reproduce with npx playwright test <file> --repeat-each=10 --retries=0
3. Read the trace and classify: timing, animation, duplicate locators, promo copy, network, or a real product bug.
4. Fix the test with web-first assertions and a stable role locator. No waitForTimeout. No promo-price assertion ($295, $365, FUNCTIONDAY26). Do not delete an assertion to force a pass. If the product is wrong, say so and leave the test failing.
5. Rerun --repeat-each=10 and report the pass count.
