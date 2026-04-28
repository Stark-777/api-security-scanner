# Phase 10 - OpenAPI Input

## Goal

Add OpenAPI JSON/YAML as a supported input source for the scanner.

## User-facing Outcome

A user can run the scanner against an OpenAPI spec file instead of only a config JSON file.

Expected happy-path command:

```bash
api-security-scanner scan --openapi ./openapi.yaml
```

## Implementation Scope

This phase must add a parser path that converts OpenAPI specs into normalized endpoints consumed by the existing scan pipeline.

Supported inputs:

- OpenAPI 3.x JSON files
- OpenAPI 3.x YAML files

Local file support is required.
Remote URL support is not required in this phase.

## Required Code Changes

- Add parser abstraction for scan input sources
- Add OpenAPI parser implementation
- Add YAML parsing support
- Extract endpoints and methods from `paths`
- Resolve base URL from `servers` when available
- Normalize OpenAPI-derived endpoints into the existing scanner pipeline
- Produce clear validation/parsing errors for malformed or unsupported specs

## CLI / API / File Changes

Required CLI behavior:

- support `--openapi <file>`
- reject invalid combinations cleanly if multiple input modes are provided

Required parser behavior:

- support JSON and YAML file extensions
- prefer the first usable server URL when multiple `servers` are present
- ignore unsupported operations cleanly rather than crashing

Endpoint extraction rules:

- extract one normalized endpoint per supported method under each path
- methods should map to the existing `HttpMethod` type where possible
- preserve enough metadata for scan execution

## Tests

- tests for OpenAPI JSON parsing
- tests for OpenAPI YAML parsing
- tests for `paths` to endpoints extraction
- tests for `servers` base URL handling
- tests for malformed spec files
- tests for unsupported or partial spec sections

## Acceptance Criteria

- local OpenAPI JSON input works
- local OpenAPI YAML input works
- extracted endpoints run through the existing scan pipeline
- malformed specs fail with clear messages
- all new tests pass

## Non-goals

- remote OpenAPI URL fetching
- deep security-scheme semantics
- OpenAPI 2.0 support unless explicitly added
- exhaustive support for all OpenAPI edge cases

## Prompt for Execution

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- this file

Implement ONLY Phase 10 - OpenAPI Input.

Requirements:
- Support OpenAPI 3.x JSON files
- Support OpenAPI 3.x YAML files
- Extract endpoints and methods from `paths`
- Respect `servers` for base URL handling
- Normalize the result into the existing scan pipeline

Do NOT add remote URL fetching in this phase.
Do NOT implement deep auth semantics.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary
