# API Security Scanner

API Security Scanner is a TypeScript-based toolkit for checking APIs for common security misconfigurations. It includes configuration loading, a reusable HTTP client, a scanner engine, built-in security rules, and console/JSON/HTML reporting helpers.

## Overview

This project is designed for developers, QA engineers, and AppSec teams who want a lightweight starting point for automated API security checks. The current implementation focuses on:

- loading endpoint definitions from JSON config
- loading endpoint definitions from OpenAPI 3.x specs
- sending requests with a reusable HTTP client
- evaluating built-in rules against request/response data
- generating console-friendly, JSON, and HTML report output

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
  - Dangerous HTTP methods
  - Sensitive data exposure
  - Verbose error leakage
  - Missing rate-limit indicators
  - Content-Type validation issues
- Report helpers for:
  - console output
  - JSON output
  - HTML output

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
npm run scan -- --url https://httpbin.org/get --method GET
npm run scan -- --openapi examples/openapi/example-openapi.yaml
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run dev` now builds the project and runs the CLI entrypoint from `dist`.

Use `npm run scan -- ...` for the real scan workflow. Examples:

```bash
npm run scan -- --config examples/configs/quickstart.config.json
npm run scan -- --url https://httpbin.org/get --method GET
npm run scan -- --openapi examples/openapi/example-openapi.yaml
npm run scan -- --config examples/configs/quickstart.config.json --format json --output examples/reports/scan-report.json
npm run scan -- --openapi examples/openapi/example-openapi.yaml --format html --output examples/reports/scan-report.html
```

### Config format

The project includes:

- an env-based example config at [examples/configs/scanner.config.example.json](/Users/stark/src/api-security-scanner/examples/configs/scanner.config.example.json:1)
- a zero-setup quickstart config at [examples/configs/quickstart.config.json](/Users/stark/src/api-security-scanner/examples/configs/quickstart.config.json:1)

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

### Quickstart without environment variables

```bash
npm run scan -- --config examples/configs/quickstart.config.json
```

This uses public `httpbin` endpoints and does not require any env vars.

### Example with environment variables

Set the env vars first:

```bash
export API_BASE_URL=https://httpbin.org
export API_TOKEN=dummy-token
export TENANT_ID=test-tenant
```

Then run:

```bash
npm run scan -- --config examples/configs/scanner.config.example.json
```

### Example OpenAPI scan

The project includes a local OpenAPI example at [examples/openapi/example-openapi.yaml](/Users/stark/src/api-security-scanner/examples/openapi/example-openapi.yaml:1).

Run it with:

```bash
npm run scan -- --openapi examples/openapi/example-openapi.yaml
```

### Example HTML report artifact

```bash
npm run scan -- --config examples/configs/quickstart.config.json --format html --output examples/reports/scan-report.html
```

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
      "url": "${API_BASE_URL}/get",
      "method": "GET",
      "description": "Basic GET endpoint"
    },
    {
      "url": "${API_BASE_URL}/headers",
      "method": "GET",
      "headers": {
        "X-Tenant-Id": "${TENANT_ID}"
      },
      "description": "Header echo endpoint"
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
  createHtmlReporter,
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
await createHtmlReporter().write(report, "examples/reports/scan-report.html");
```

### Example console output shape

```text
Scan Summary
Tool: api-security-scanner
Endpoints scanned: 2
Total findings: 2
Findings by severity:
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
- expanded security rules
- console, JSON, and HTML reporting
- full CLI scan workflow
- OpenAPI JSON/YAML input
- Vitest unit tests

Not implemented yet:

- CI and release workflow
- hardening and product-readiness work

## Security Note

Use this project only against systems you own or are explicitly authorized to test. Findings are heuristic and should be reviewed by a human before being treated as final security conclusions.
