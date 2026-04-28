# Phase 11 - Rule Expansion

## Goal

Expand the initial rule set toward the v1 project spec.

## User-facing Outcome

A scan produces a broader and more useful set of findings covering more common API security issues.

## Implementation Scope

This phase adds new rules only. It should not redesign the scanner pipeline, CLI, or reporting formats.

New rules to add:

- dangerous HTTP methods exposed
- sensitive data exposure
- verbose error leakage
- missing rate-limit indicators
- content-type validation issues

## Required Code Changes

- Add one rule implementation per new rule
- Ensure all rules implement the current `Rule` interface
- Reuse current finding creation patterns
- Keep output findings backward-compatible with the current structure
- Add unit tests for each rule

## CLI / API / File Changes

Rule interface expectations:

- each rule has `id`, `name`, `description`, `severity`
- each rule returns structured `Finding[]`
- each rule remains safe to run inside the existing evaluation pipeline

Expected evidence style:

- evidence should be concise and directly tied to the observed response/request data
- evidence should be suitable for console and JSON output

Severity defaults:

- dangerous HTTP methods exposed: medium
- sensitive data exposure: high
- verbose error leakage: medium
- missing rate-limit indicators: low
- content-type validation issues: medium

Minimum heuristics:

- dangerous methods: flag exposed `PUT`, `DELETE`, `PATCH`, or other risky methods where appropriate
- sensitive data exposure: basic pattern matching for secrets, tokens, keys, or high-risk fields
- verbose error leakage: detect stack traces or overly detailed error bodies
- missing rate-limit indicators: detect absence of common rate-limit headers
- content-type validation issues: detect unexpected or missing content-type behavior

## Tests

- positive and negative tests for every new rule
- structured finding assertions for every rule
- severity and evidence assertions where meaningful

## Acceptance Criteria

- all new rules are implemented
- all new rules are unit tested
- findings remain structured and consistent
- existing scan/report flow still works

## Non-goals

- new reporting formats
- scanner pipeline redesign
- AI-based rule evaluation
- deep fuzzing or active exploitation

## Prompt for Execution

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- this file

Implement ONLY Phase 11 - Rule Expansion.

Requirements:
- Add dangerous HTTP methods exposed rule
- Add sensitive data exposure rule
- Add verbose error leakage rule
- Add missing rate-limit indicators rule
- Add content-type validation issues rule
- Ensure all rules follow the existing `Rule` interface
- Add unit tests for each new rule

Do NOT redesign reporting in this phase.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary
