# Function Health — FAQ search

**Seed:** `tests/seed.spec.ts`

## Application Overview

The public FAQ page at `https://www.functionhealth.com/faq` is available without an account. A search box labeled Search filters the questions on the page. Choosing a result opens that answer.

Do not create an account or enter personal data. Do not assert Function Day prices.

## Test Scenarios

### 1. Search for Cancel returns a readable result

**Steps:**

1. Open `/faq`.
2. Search for `Cancel`.
3. Open the first visible result.

**Expected Results:**

- At least one result is visible.
- A visible result mentions cancel.
- After the result is opened, the answer is visible and says you can cancel and rejoin at any time.
