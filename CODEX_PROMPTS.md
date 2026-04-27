# Codex Prompts

## Prompt 1 - Bootstrap

Read PROJECT_SPEC.md and IMPLEMENTATION_PLAN.md.

Complete ONLY Phase 1 - Bootstrap.

Requirements:
- Setup Node.js + TypeScript project
- Install commander, axios, zod, vitest
- Setup eslint + prettier
- Create folder structure
- Create CLI entry point

DO NOT implement scanning logic.

At the end:
- List created files
- Provide commands to run project

---

## Prompt 2 - Core Types

Read PROJECT_SPEC.md.

Implement Phase 2 - Core Types.

Create:
- Endpoint type
- Finding type
- Severity enum
- Rule interface

DO NOT implement business logic.

---

## Prompt 3 - Config Loader

Implement Phase 3.

Requirements:
- Load config JSON
- Validate using zod
- Support env variables

Return:
- example config file

---

## Prompt 4 - HTTP Layer

Implement Phase 4.

Requirements:
- Create reusable HTTP client
- Support timeout
- Merge headers
- Redact sensitive data in logs

---

## Prompt 5 - Scanner Engine

Implement Phase 5.

Requirements:
- Accept endpoints
- Send requests
- Store responses

---

## Prompt 6 - First Rules

Implement Phase 6.

Rules:
- HTTPS enforcement
- Missing auth
- CORS
- Security headers

Each rule must:
- follow interface
- return structured findings

---

## Prompt 7 - Reporting

Implement Phase 7.

Requirements:
- Console output
- JSON report

---

## Prompt 8 - Tests

Implement Phase 8.

Requirements:
- Unit tests for rules
- Use vitest

---

## Prompt 9 - Polish

Improve:
- code readability
- error handling
- logs

---

## Prompt 10 - README

Generate README with:
- overview
- features
- usage
- examples