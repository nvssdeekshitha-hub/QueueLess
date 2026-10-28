# QueueLess Automated Testing Guide

This document outlines the testing strategy, test suites, architecture, and verification instructions for **QueueLess**.

---

## 1. Testing Framework & Philosophy

The automated test suite uses **Vitest** paired with **Supertest** for high-speed, native ES Module HTTP API testing. 

To ensure complete test isolation without requiring a global MongoDB daemon or network access to MongoDB Atlas:
- In-memory database testing is provided by `mongodb-memory-server`.
- Each test runs against an ephemeral in-memory database instance.
- Before each test case, collections are wiped clean to ensure zero cross-test interference.
- Destructive tests are never executed against production databases.

---

## 2. Test Suite Breakdown

### 2.1 Authentication & Session Suite (`server/tests/auth.test.js`)
- ✅ Registers a new student user and verifies password hashing in MongoDB.
- ✅ Rejects registrations missing required fields or with weak passwords.
- ✅ Rejects registration with duplicate email addresses (`HTTP 409 Conflict`).
- ✅ Validates user login and session cookie creation (`queueless.sid`).
- ✅ Rejects invalid login attempts with incorrect passwords (`HTTP 401 Unauthorized`).
- ✅ Rejects access to protected endpoints (`/api/auth/me`) when unauthenticated.

### 2.2 Services & RBAC Suite (`server/tests/services.test.js`)
- ✅ Allows public, unauthenticated access to browse active campus services.
- ✅ Blocks regular student users from creating services (`HTTP 403 Forbidden`).
- ✅ Authorizes administrators to create and update services and configure capacities.

### 2.3 Queue & Workflow Suite (`server/tests/queue.test.js`)
- ✅ Books an appointment and issues sequential tokens (`REC-001`, `REC-002`) and valid booking references.
- ✅ **Concurrency Safety:** Rejects bookings exceeding slot capacity with `HTTP 409 Conflict`.
- ✅ Accurately calculates queue position and dynamic waiting time.
- ✅ Simulates staff actions: calling next token, starting service, and marking completion.
- ✅ Enforces valid state machine transitions, rejecting illegal jumps (e.g., completed to waiting).

---

## 3. Running the Test Suite

From the project root:
```powershell
npm test
```

Or from the server directory:
```powershell
cd server
npm test
```

### Running Specific Test Suites:
```powershell
npx vitest run tests/auth.test.js
npx vitest run tests/services.test.js
npx vitest run tests/queue.test.js
```
