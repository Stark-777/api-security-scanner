# Product Roadmap

## Vision

API Security Scanner should become a practical CLI product that developers, QA engineers, and AppSec teams can run locally or in CI to quickly identify common API security misconfigurations and generate useful artifacts.

The product should be:

- simple to run
- easy to integrate into CI/CD
- safe by default
- extensible for future rule packs and input sources

---

## Current State

Completed so far:

- TypeScript project bootstrap
- core domain types
- JSON config loading with env variable support
- reusable HTTP client
- scanner engine for endpoint probing
- initial security rules
- console and JSON reporting helpers
- unit test coverage for existing rules and core helpers
- improved diagnostics and log redaction

Current limitation:

- the project is still primarily a library/toolkit
- there is no full end-to-end CLI workflow for real scans
- OpenAPI input is not implemented yet
- HTML reports, CI packaging, and product hardening are still pending

---

## MVP Definition

The next usable product milestone is a **CLI MVP**.

CLI MVP means:

- one command can run a scan from config input
- one command can run a single-endpoint scan
- findings are evaluated automatically
- console output is human-readable
- JSON output can be written to disk
- CLI can return non-zero exit codes for CI usage

Target example:

```bash
api-security-scanner scan --config examples/configs/scanner.config.example.json
```

---

## Product Stages

### Stage 1 - CLI MVP

Primary goal:

- turn the current modules into a complete user-facing CLI flow

Includes:

- `scan` command
- config input
- single URL input
- console and JSON output
- severity-based failure behavior

---

### Stage 2 - OpenAPI Expansion

Primary goal:

- support OpenAPI JSON/YAML as a first-class input source

Includes:

- OpenAPI parsing
- endpoint extraction
- server/base URL handling
- normalized input pipeline

---

### Stage 3 - Coverage Expansion

Primary goal:

- expand the rule set to better match the project spec

Includes:

- dangerous methods
- sensitive data exposure
- verbose error leakage
- rate-limit indicators
- content-type validation checks

---

### Stage 4 - Artifact and CI Readiness

Primary goal:

- make the output and packaging suitable for engineering teams and CI pipelines

Includes:

- HTML reports
- improved console summary
- stable JSON artifacts
- GitHub Actions
- Docker support

---

### Stage 5 - Product Hardening

Primary goal:

- make the project stable enough for public use and continued iteration

Includes:

- integration tests
- release checklist
- stronger error taxonomy
- redaction audit
- docs cleanup

---

## What Counts as a Full Product

The project should be considered a fuller product when it has all of the following:

- a real CLI workflow
- support for config and OpenAPI inputs
- meaningful rule coverage
- console, JSON, and HTML outputs
- CI-ready execution and failure behavior
- integration tests
- stable docs and release guidance

---

## Success Criteria

The roadmap is successful when:

- each next phase can be implemented independently in one focused session
- every phase has explicit acceptance criteria
- the product becomes usable before it becomes feature-heavy
- CLI workflow lands before OpenAPI expansion
- OpenAPI support lands before CI/release packaging

---

## Defaults for the Next Steps

- Primary priority: CLI MVP
- Next major capability after CLI: OpenAPI support
- Delivery style: many small phases, each with a copy-paste prompt
- Stack remains: Node.js, TypeScript, commander, axios, zod, vitest
- SARIF is not part of the immediate required roadmap unless elevated later
