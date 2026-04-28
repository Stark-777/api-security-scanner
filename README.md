# API Security Scanner

API Security Scanner is a TypeScript-based toolkit for checking APIs for common security misconfigurations. It includes configuration loading, a reusable HTTP client, a basic scanner engine, a first set of security rules, and console/JSON reporting helpers.

## Overview

This project is designed for developers, QA engineers, and AppSec teams who want a lightweight starting point for automated API security checks. The current implementation focuses on:

- loading endpoint definitions from JSON config
- sending requests with a reusable HTTP client
- evaluating a first set of rules against request/response data
- generating console-friendly and JSON report output

The project is intended for authorized testing only.

## Features

- Node.js + TypeScript project with ESLint, Prettier, and Vitest
- JSON config loading with `zod` validation
- Environment variable substitution in config values such as `${API_TOKEN}`
- Reusable HTTP client with timeout support and merged headers
- Redacted logging for sensitive values such as tokens, cookies, passwords, and API keys
- Basic scanner engine that accepts endpoints, sends requests, and stores responses
- Built-in security rules:
  - HTTPS enforcement
  - Missing authentication
  - CORS misconfiguration
  - Missing security headers
- Report helpers for:
  - console output
  - JSON output

## Installation

```bash
git clone https://github.com/Stark-777/api-security-scanner.git
cd api-security-scanner
npm install
```

## Usage

### Development commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run dev` currently starts the CLI bootstrap entry point and prints:

```text
scanner started
```

### Config format

The project includes an example config at [examples/configs/scanner.config.example.json](/Users/stark/src/api-security-scanner/examples/configs/scanner.config.example.json:1).

Required shape:

- `endpoints`: array of endpoint definitions

Optional fields:

- `baseUrl`
- `defaultHeaders`
- `timeoutMs`

Each endpoint can include:

- `url`
- `method`
- `headers`
- `body`
- `description`

## Examples

### Example config

```json
{
  "baseUrl": "${API_BASE_URL}",
  "defaultHeaders": {
    "Authorization": "Bearer ${API_TOKEN}",
    "X-Client": "api-security-scanner"
  },
  "timeoutMs": 5000,
  "endpoints": [
    {
      "url": "${API_BASE_URL}/health",
      "method": "GET",
      "description": "Health check endpoint"
    },
    {
      "url": "${API_BASE_URL}/v1/users",
      "method": "GET",
      "headers": {
        "X-Tenant-Id": "${TENANT_ID}"
      },
      "description": "List users"
    }
  ]
}
```

### Load config

```ts
import { loadConfig } from "api-security-scanner";

const config = await loadConfig("examples/configs/scanner.config.example.json");
```

### Scan endpoints

```ts
import { createScanner, loadConfig } from "api-security-scanner";

const config = await loadConfig("examples/configs/scanner.config.example.json");
const scanner = createScanner({
  httpClientOptions: {
    baseUrl: config.baseUrl,
    defaultHeaders: config.defaultHeaders,
    timeoutMs: config.timeoutMs
  }
});

const probeResults = await scanner.scanEndpoints(config.endpoints);
```

### Run rules and create a report

```ts
import {
  CorsRule,
  HttpsEnforcedRule,
  MissingAuthRule,
  SecurityHeadersRule,
  createConsoleReporter,
  createJsonReporter,
  createScanReport
} from "api-security-scanner";

const rules = [
  new HttpsEnforcedRule(),
  new MissingAuthRule(),
  new CorsRule(),
  new SecurityHeadersRule()
];

const findings = probeResults.flatMap((result) =>
  rules.flatMap((rule) =>
    rule.evaluate({
      endpoint: result.endpoint,
      response: result.response
    })
  )
);

const report = createScanReport(findings, probeResults.length);

createConsoleReporter().render(report);
await createJsonReporter().write(report, "examples/reports/scan-report.json");
```

### Example console output shape

```text
Scan Summary
Endpoints scanned: 2
Total findings: 2
critical: 0
high: 1
medium: 1
low: 0
info: 0
```

## Current Status

Implemented so far:

- bootstrap and CLI entry point
- core types and scanner model
- config loader with env support
- reusable HTTP client
- initial security rules
- console and JSON reporting
- Vitest unit tests

Not implemented yet:

- HTML reporting
- full CLI scan workflow
- OpenAPI parsing
- broader rule coverage

## Security Note

Use this project only against systems you own or are explicitly authorized to test. Findings are heuristic and should be reviewed by a human before being treated as final security conclusions.
