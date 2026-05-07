# API Security Scanner

API Security Scanner is a TypeScript CLI for running lightweight API security checks from config files, OpenAPI specs, or a single endpoint. It was built as a practical security automation project: the kind of tool an SDET, AppSec engineer, or DevSecOps team could run locally or in CI to catch common API misconfigurations early.

The project focuses on realistic engineering concerns as much as the checks themselves: typed rule contracts, structured findings, redacted logs, CI-friendly exit codes, JSON/HTML artifacts, Docker support, and test coverage across unit and integration flows.

> Use this tool only against systems you own or are explicitly authorized to test.

## Why This Project Exists

API security work often starts with repeatable questions:

- Are endpoints reachable over plain HTTP?
- Do responses suggest missing authentication?
- Are CORS and browser-facing security headers configured safely?
- Do responses leak secrets, verbose errors, or ambiguous content types?
- Can the same checks run automatically in CI?

This scanner turns those questions into a small but complete CLI product. It is intentionally not a penetration testing framework or deep fuzzing engine. Instead, it demonstrates how quality engineering, automation, and application security can meet in a maintainable tool.

## Highlights

- **Multiple input modes:** JSON config, OpenAPI 3.x JSON/YAML, or a single URL.
- **Reusable scanner pipeline:** input parsing, request execution, rule evaluation, and reporting are separated.
- **Built-in security rules:** HTTPS, auth, CORS, security headers, dangerous methods, sensitive data, verbose errors, rate-limit indicators, and Content-Type checks.
- **Structured findings:** every issue includes severity, endpoint, evidence, risk, remediation, and timestamp.
- **Report formats:** console summaries, JSON artifacts, and self-contained HTML reports.
- **CI-ready behavior:** `--fail-on <severity>` returns non-zero exit codes for automated gates.
- **Safe output handling:** sensitive values are redacted in logs and report artifacts.
- **Product packaging:** GitHub Actions workflow, Dockerfile, release checklist, unit tests, and integration tests.

## Tech Stack

- Node.js
- TypeScript
- Commander
- Axios
- Zod
- YAML
- Vitest
- ESLint + Prettier
- Docker
- GitHub Actions

## Quick Start

```bash
git clone https://github.com/Stark-777/api-security-scanner.git
cd api-security-scanner
npm install
npm run scan -- --config examples/configs/quickstart.config.json
```

The quickstart config uses public `httpbin` endpoints and does not require environment variables.

## Usage

Scan from a config file:

```bash
npm run scan -- --config examples/configs/quickstart.config.json
```

Scan one endpoint:

```bash
npm run scan -- --url https://httpbin.org/get --method GET
```

Scan from an OpenAPI spec:

```bash
npm run scan -- --openapi examples/openapi/example-openapi.yaml
```

Generate a JSON report:

```bash
npm run scan -- --config examples/configs/quickstart.config.json --format json --output examples/reports/scan-report.json
```

Generate an HTML report:

```bash
npm run scan -- --openapi examples/openapi/example-openapi.yaml --format html --output examples/reports/scan-report.html
```

Use severity-based failure behavior for CI:

```bash
npm run scan -- --config examples/configs/quickstart.config.json --fail-on high
```

Exit code behavior:

- `0`: scan completed without findings at or above the selected `--fail-on` severity.
- `1`: runtime, config, parsing, or output error.
- `2`: scan completed and found at least one finding at or above the selected `--fail-on` severity.

## Inputs

### JSON Config

Example:

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

The config loader validates input with `zod` and resolves environment variables such as `${API_TOKEN}` before scanning.

Included examples:

- [examples/configs/quickstart.config.json](examples/configs/quickstart.config.json)
- [examples/configs/scanner.config.example.json](examples/configs/scanner.config.example.json)

### OpenAPI

The OpenAPI parser supports local OpenAPI 3.x JSON/YAML files and extracts supported methods from `paths`.

```bash
npm run scan -- --openapi examples/openapi/example-openapi.yaml
```

Included example:

- [examples/openapi/example-openapi.yaml](examples/openapi/example-openapi.yaml)

## Security Rules

| Rule | Severity | What it checks |
| --- | --- | --- |
| HTTPS enforcement | High | Endpoint URLs that use `http://` instead of `https://`. |
| Missing authentication | High | Successful responses when no auth header or API key is sent. |
| CORS misconfiguration | Medium | Wildcard origins or credentialed cross-origin access. |
| Security headers | Medium | Missing browser-facing hardening headers. |
| Dangerous methods | Medium | Potentially risky methods such as `DELETE`, `PUT`, and `PATCH`. |
| Sensitive data exposure | High | Obvious secret-like fields or values in response bodies. |
| Verbose errors | Medium | Stack traces, framework errors, or debug leakage. |
| Rate-limit indicators | Low | Missing common rate-limit headers or retry guidance. |
| Content-Type validation | Medium | Missing or ambiguous response content type. |

Each rule follows a shared interface and returns structured findings.

## Report Output

Console output is grouped by severity and includes summary counts:

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

JSON and HTML reports use the same underlying report model:

- `metadata`: tool name, report version, generated timestamp
- `summary`: endpoints scanned, total findings, findings by severity
- `findings`: structured security findings

Sensitive values are redacted before they are written to logs or report artifacts.

## CI and Docker

Run the full local verification path:

```bash
npm run ci:check
```

Run tests separately:

```bash
npm run test:unit
npm run test:integration
```

The GitHub Actions workflow runs dependency install, lint, typecheck, unit tests, integration tests, build, and a deterministic localhost smoke scan for `--fail-on` behavior.

Run the CI smoke scan after `npm run build`:

```bash
npm run ci:smoke
```

Build the Docker image:

```bash
npm run docker:build
```

Run the scanner in Docker:

```bash
docker run --rm api-security-scanner scan --config examples/configs/quickstart.config.json
```

Write a JSON report to a mounted local directory:

```bash
docker run --rm \
  -v "$(pwd)/examples/reports:/app/examples/reports" \
  api-security-scanner \
  scan --config examples/configs/quickstart.config.json --format json --output examples/reports/scan-report.json
```

## Development

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run build
```

Project structure:

```text
src/
  cli/          CLI entrypoint
  core/         scanner, runner, types, errors
  http/         reusable HTTP client
  parsers/      config and OpenAPI input parsing
  reporters/    console, JSON, HTML output
  rules/        security rule implementations
  utils/        logging and redaction helpers
test/
  unit/
  integration/
examples/
  configs/
  openapi/
  reports/
```

## Product Readiness

The current roadmap is complete through the planned product phases:

- CLI workflow
- OpenAPI input
- expanded rule coverage
- console, JSON, and HTML reports
- CI and Docker support
- hardening for error handling, timeout messaging, and redaction
- release checklist

Release guidance lives in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## Limitations

This project is a focused security automation tool, not a full AppSec platform.

Current limitations:

- no deep fuzzing
- no authenticated workflow modeling
- no OpenAPI security scheme analysis
- no SARIF output yet
- findings are heuristic and should be reviewed by a human

## Portfolio Context

This project was built to demonstrate a transition from SDET-style automation into cybersecurity and application security engineering. It shows practical experience with:

- API security testing
- secure automation design
- rule-based detection
- structured security reporting
- CI/CD security gates
- redaction and safer logging
- TypeScript CLI product engineering

The goal is not only to detect issues, but to show how security checks can be packaged into a tool that developers and QA teams can actually run.

## Security Note

Only scan systems you own or have explicit permission to test. The findings are intended to support security review, not replace manual analysis or professional judgment.
