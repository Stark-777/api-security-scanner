# Phase 9 - Full CLI Workflow

## Goal

Turn the current module set into a real, runnable CLI workflow.

## User-facing Outcome

A user can run the scanner from the command line with config input or a single endpoint input and get findings in console or JSON form.

Expected happy-path command:

```bash
api-security-scanner scan --config examples/configs/scanner.config.example.json
```

## Implementation Scope

This phase must introduce a production-style CLI path that orchestrates:

- input resolution
- endpoint normalization
- scanner execution
- rule execution
- report generation
- exit code handling

Supported input modes in this phase:

- `--config <file>`
- `--url <endpoint>` with `--method <method>`

Future-ready flag:

- `--openapi <file-or-url>` may exist only as a stub or explicit unsupported path in this phase

Supported output modes in this phase:

- `--format console`
- `--format json`
- `--output <path>` for JSON files

## Required Code Changes

- Extend the CLI entrypoint to include a `scan` command
- Add a high-level runner/service that takes normalized scan input and returns a `ScanReport`
- Reuse existing config loader, HTTP client, scanner, rules, and reporters
- Add severity-threshold evaluation for CI failure behavior
- Add clear CLI-facing runtime/config error messages

## CLI / API / File Changes

Required CLI surface:

- `api-security-scanner scan --config <file>`
- `api-security-scanner scan --url <url> --method GET`
- `--format console|json`
- `--output <path>`
- `--fail-on info|low|medium|high|critical`

Expected exit behavior:

- `0` when scan succeeds and no findings meet the fail threshold
- non-zero when config/runtime errors occur
- non-zero when findings meet or exceed `--fail-on`

JSON output path rules:

- `--output` is required only for `--format json`
- if `--format console`, output path is ignored or rejected consistently
- parent directories should be created if needed

## Tests

- unit tests for CLI arg parsing
- tests for `--config` happy path
- tests for single URL happy path
- tests for invalid config path
- tests for invalid flag combinations
- tests for JSON output writing
- tests for fail-on severity behavior

## Acceptance Criteria

- a single command can run the full flow from input to report
- config input works
- single URL input works
- console output works
- JSON output works
- fail-on behavior works
- all new tests pass

## Non-goals

- real OpenAPI parsing
- HTML reports
- additional rule families
- CI workflow changes

## Prompt for Execution

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- this file

Implement ONLY Phase 9 - Full CLI Workflow.

Requirements:
- Add the real `scan` command
- Support `--config <file>`
- Support `--url <endpoint>`
- Support `--method <method>`
- Support `--format console|json`
- Support `--output <path>` for JSON
- Support `--fail-on <severity>`
- Add orchestration that connects input loading, scanning, rules, and reporting

Do NOT implement real OpenAPI parsing in this phase.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary
