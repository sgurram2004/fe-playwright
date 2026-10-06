# Function Health — Registration start

**Seed:** `tests/seed.spec.ts`

## Application Overview

Start testing on the marketing site opens membership signup at `https://my.functionhealth.com/signup`. The first screen collects account and eligibility details and blocks Continue until required fields are valid. This plan covers only that first screen.

Do not create an account, enter personal or health data, or continue into payment. Do not assert promo prices or the access-code query parameter.

## Test Scenarios

### 1. Start testing opens signup

**Steps:**

1. Open `/` while logged out.
2. Activate the first "Start testing" link.

**Expected Results:**

- The URL host is `my.functionhealth.com`.
- The path contains `/signup`.
- The email field is visible.

### 2. Empty submit shows validation

**Steps:**

1. Open signup from "Start testing".
2. Dismiss the privacy notice if it is shown.
3. Activate Continue without entering anything.

**Expected Results:**

- Email is required.
- A summary asks the visitor to fix the highlighted errors before continuing.
- No account is created.
