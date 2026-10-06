# Function Health — Logged-out Home

**Seed:** `tests/seed.spec.ts`

## Application Overview

The public marketing site at `https://www.functionhealth.com/` is available without an account. The header exposes primary navigation, Log in, and Start testing. The page explains the membership and includes a frequently asked questions section. Footer links include Login.

Do not assert Function Day prices or promo codes. Those change independently of the logged-out layout.

## Test Scenarios

### 1. Header and hero

**Steps:**

1. Open `/`.

**Expected Results:**

- A navigation named Primary is visible.
- The hero heading reads "Less stuff. More healthy years."

### 2. FAQ expands

**Steps:**

1. Open `/`.
2. Activate the "What is Function?" question.

**Expected Results:**

- The answer is visible and states that Function is a membership that gives you access to 160+ lab tests.

### 3. Footer login

**Steps:**

1. Open `/`.

**Expected Results:**

- A footer link named Login is visible.
