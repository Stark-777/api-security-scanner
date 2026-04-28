# Phase 13 - CI and Release

## Goal

Make the project easy to run in automation and easier to share publicly.

## User-facing Outcome

The scanner can run in GitHub Actions and in Docker with documented examples.

## Implementation Scope

This phase focuses on automation and packaging, not on major new scanning capabilities.

## Required Code Changes

- Add GitHub Actions workflow
- Add Dockerfile
- Add CI usage examples to README
- Add release-ready scripts if needed
- Ensure severity-based failure mode works in CI usage patterns

## CLI / API / File Changes

Required deliverables:

- `.github/workflows/ci.yml`
- `Dockerfile`
- README examples for CI and Docker usage

GitHub Actions behavior:

- install dependencies
- run lint
- run typecheck
- run tests
- run build
- optionally include a scan example if practical and deterministic

Docker workflow:

- build the scanner into a runnable image
- document the basic invocation pattern

Example CI command:

- should use the real `scan` CLI path
- should demonstrate non-zero behavior with `--fail-on`

## Tests

- validate workflow structure
- verify Docker build smoke path where practical
- ensure documented commands match package scripts and CLI shape

## Acceptance Criteria

- project runs in GitHub Actions
- project can be built/run in Docker
- docs include CI usage examples
- CI-friendly fail behavior is documented and usable

## Non-goals

- package registry publishing unless explicitly needed
- advanced multi-stage release orchestration
- cloud-hosted control plane features

## Prompt for Execution

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- this file

Implement ONLY Phase 13 - CI and Release.

Requirements:
- Add GitHub Actions workflow
- Add Docker support
- Add CI usage examples
- Add release-ready scripts where needed
- Ensure severity-based failure behavior is practical for CI

Do NOT add new scanning features in this phase.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary
