# API Security Scanner - Project Specification

## Overview

API Security Scanner is a CLI tool designed to analyze API endpoints and OpenAPI specifications to detect common security misconfigurations and insecure patterns.

The tool is intended for developers, QA engineers, and security engineers to perform quick security checks locally or in CI pipelines.

---

## Goals

- Provide fast security checks for APIs
- Detect common misconfigurations
- Generate clear and actionable reports
- Be easy to run locally and integrate into CI/CD

---

## Non-Goals (v1)

- Full penetration testing tool
- Deep fuzzing engine
- Complete OWASP coverage

---

## Target Users

- Backend Developers
- QA / SDET
- AppSec Engineers
- DevSecOps Engineers

---

## Tech Stack

- Node.js
- TypeScript
- CLI: commander
- HTTP: axios
- Validation: zod
- Testing: vitest

---

## Core Features (v1)

### Input Methods

1. OpenAPI file (JSON/YAML)
2. Config file with endpoints
3. Single endpoint scan

---

### Security Checks (v1)

1. HTTPS enforcement
2. Missing authentication
3. CORS misconfiguration
4. Security headers missing
5. Dangerous HTTP methods exposed
6. Sensitive data exposure (basic pattern matching)
7. Verbose error leakage
8. Missing rate-limit indicators
9. Content-Type validation issues

---

## Output

### Console Output
- Summary
- Findings grouped by severity

### JSON Report
- Structured findings

### HTML Report
- Human-readable report

---

## Finding Structure

Each finding must include:

- rule_id
- title
- severity (critical, high, medium, low)
- endpoint
- method
- description
- evidence
- risk
- remediation
- timestamp

---

## Severity Levels

- Critical
- High
- Medium
- Low
- Info

---

## Project Structure

```text
api-security-scanner/
├── src/
│   ├── cli/
│   │   └── index.ts
│   ├── core/
│   │   ├── scanner.ts
│   │   ├── types.ts
│   │   ├── finding.ts
│   │   └── severity.ts
│   ├── rules/
│   │   ├── https-enforced.rule.ts
│   │   ├── missing-auth.rule.ts
│   │   ├── cors.rule.ts
│   │   └── security-headers.rule.ts
│   ├── http/
│   │   └── client.ts
│   ├── reporters/
│   │   ├── console.reporter.ts
│   │   └── json.reporter.ts
│   ├── parsers/
│   │   └── config.parser.ts
│   ├── utils/
│   │   └── logger.ts
│   └── index.ts
├── test/
│   ├── unit/
│   └── integration/
├── examples/
│   ├── configs/
│   └── reports/
├── .github/
│   └── workflows/
│       └── ci.yml
├── PROJECT_SPEC.md
├── IMPLEMENTATION_PLAN.md
├── CODEX_PROMPTS.md
├── README.md
├── package.json
├── tsconfig.json
└── .gitignore


---

## Coding Standards

- TypeScript only
- Strong typing required
- No hardcoded secrets
- Clean modular structure
- Reusable rule engine

---

## Rule Engine Requirements

Each rule must follow a common interface:

- id
- name
- description
- severity
- evaluate(context) → findings[]

---

## Security Considerations

- Do not log sensitive data
- Redact tokens from output
- Tool must only be used on authorized systems

---

## Definition of Done (v1)

- CLI works
- At least 4 security rules implemented
- JSON report works
- Console output works
- Unit tests exist for rules
- Project runs locally without errors
- README is present and clear

---

## Future Roadmap (not for v1)

- OpenAPI auth awareness
- SARIF output
- GitHub integration
- Docker support
- AI-based analysis