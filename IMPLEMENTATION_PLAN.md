# Implementation Plan

## Phase 1 - Bootstrap

Goal:
Create basic project setup.

Tasks:
- Initialize Node.js project
- Setup TypeScript
- Install dependencies:
  - commander
  - axios
  - zod
  - vitest
- Setup eslint + prettier
- Create basic folder structure
- Add CLI entry point

Done when:
- Project runs with `npm run dev`
- CLI command prints "scanner started"

---

## Phase 2 - Core Types

Goal:
Define data models.

Tasks:
- Create types:
  - Endpoint
  - Finding
  - Severity
  - ScannerConfig
  - ProbeResult
- Create rule interface

Done when:
- All types compile without errors

---

## Phase 3 - Config Loader

Goal:
Load and validate config.

Tasks:
- Implement config loader
- Validate using zod
- Support env variables

Done when:
- Config file loads successfully

---

## Phase 4 - HTTP Layer

Goal:
Standardize API requests.

Tasks:
- Create HTTP client wrapper
- Add timeout support
- Add header merging
- Add safe logging

Done when:
- Requests can be made reliably

---

## Phase 5 - Basic Scanner Engine

Goal:
Scan endpoints.

Tasks:
- Normalize endpoints
- Send basic requests
- Collect responses

Done when:
- Scanner hits endpoints and logs results

---

## Phase 6 - First Rules

Goal:
Implement initial rules.

Rules:
1. HTTPS enforcement
2. Missing auth
3. CORS misconfiguration
4. Security headers

Done when:
- Findings are generated

---

## Phase 7 - Reporting

Goal:
Output results.

Tasks:
- Console reporter
- JSON reporter

Done when:
- Results are visible and saved

---

## Phase 8 - Testing

Goal:
Ensure reliability.

Tasks:
- Unit tests for rules
- Basic integration test

Done when:
- Tests pass

---

## Phase 9 - Polish

Goal:
Make project presentable.

Tasks:
- Improve logs
- Improve messages
- Clean code

Done when:
- Code is readable and stable

---

## Phase 10 - README & Release

Goal:
Prepare for GitHub.

Tasks:
- Write README
- Add usage examples
- Add screenshots

Done when:
- Repo is shareable