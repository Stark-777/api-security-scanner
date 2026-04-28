# Phase 12 - Reports and Artifacts

## Goal

Make report output more useful for both local usage and CI artifact usage.

## User-facing Outcome

A user can produce console, JSON, and HTML outputs from the same scan run.

## Implementation Scope

This phase extends reporting only. It should not add major new scan inputs or new rule families.

Required output formats:

- console
- JSON
- HTML

## Required Code Changes

- Introduce a shared reporter contract
- Introduce a unified report model for all output formats
- Add HTML reporter
- Improve console summary formatting
- Stabilize JSON artifact structure
- Reuse the same `ScanReport` shape across reporters

## CLI / API / File Changes

Required output behavior:

- console output should remain readable and grouped
- JSON output should remain machine-friendly and stable
- HTML output should be self-contained and easy to open locally

Artifact naming defaults:

- if output paths are explicitly provided, use them
- if default naming is introduced, keep it deterministic and documented

Console summary structure:

- endpoints scanned
- total findings
- findings by severity
- grouped findings section

HTML report scope:

- summary section
- grouped findings
- basic styling for readability
- no external hosting or dashboard behavior

## Tests

- tests for console reporter formatting behavior
- tests for JSON reporter stability
- tests for HTML report generation
- file-writing tests for artifact outputs

## Acceptance Criteria

- one scan can produce console output
- one scan can produce JSON output
- one scan can produce HTML output
- all outputs use the same underlying report model
- tests pass

## Non-goals

- SARIF by default
- dashboards
- database-backed report storage
- external report publishing

## Prompt for Execution

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- this file

Implement ONLY Phase 12 - Reports and Artifacts.

Requirements:
- Add HTML reporting
- Improve console summary formatting
- Stabilize JSON artifact output
- Add a shared reporter contract
- Use a unified report model for all outputs

Do NOT add SARIF in this phase.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary
