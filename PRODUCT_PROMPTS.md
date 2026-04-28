# Product Prompts

## Prompt 11 - Full CLI Workflow

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- `docs/phases/phase-09-cli-workflow.md`

Implement ONLY Phase 9 - Full CLI Workflow.

Requirements:
- Add a real `scan` command
- Support `--config <file>`
- Support `--url <endpoint>`
- Support `--method <method>` for single endpoint mode
- Support `--format console|json`
- Support `--output <path>` for JSON reports
- Support `--fail-on <severity>`
- Add the orchestration layer that connects input loading, scanning, rules, and reporting

Do NOT implement OpenAPI parsing in this phase.
Do NOT add HTML reporting in this phase.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary

---

## Prompt 12 - OpenAPI Input

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- `docs/phases/phase-10-openapi-input.md`

Implement ONLY Phase 10 - OpenAPI Input.

Requirements:
- Support OpenAPI JSON input
- Support OpenAPI YAML input
- Extract endpoints and methods from `paths`
- Respect `servers` for base URL handling
- Normalize OpenAPI-derived inputs into the existing scan pipeline

Do NOT add remote OpenAPI URL fetching unless already required by the phase spec.
Do NOT implement deep auth semantics from OpenAPI security schemes.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary

---

## Prompt 13 - Rule Expansion

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- `docs/phases/phase-11-rule-expansion.md`

Implement ONLY Phase 11 - Rule Expansion.

Requirements:
- Add dangerous HTTP methods exposed rule
- Add sensitive data exposure rule
- Add verbose error leakage rule
- Add missing rate-limit indicators rule
- Add content-type validation issues rule
- Ensure all rules follow the existing `Rule` interface
- Add unit tests for each new rule

Do NOT change the reporting formats in this phase.
Do NOT change the CLI workflow unless required to wire the new rules in.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary

---

## Prompt 14 - Reports and Artifacts

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- `docs/phases/phase-12-reports-artifacts.md`

Implement ONLY Phase 12 - Reports and Artifacts.

Requirements:
- Add HTML reporting
- Improve console summary formatting
- Stabilize JSON report artifacts
- Add a shared reporter contract
- Use a unified report model for all output formats

Do NOT add SARIF in this phase.
Do NOT implement CI workflow changes in this phase.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary

---

## Prompt 15 - CI and Release

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- `docs/phases/phase-13-ci-release.md`

Implement ONLY Phase 13 - CI and Release.

Requirements:
- Add GitHub Actions workflow
- Add Docker support
- Add CI usage examples
- Add publish-ready or release-ready scripts where needed
- Validate severity-based failure behavior in CI-oriented flows

Do NOT add new scanning rules in this phase.
Do NOT expand OpenAPI support in this phase.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary

---

## Prompt 16 - Hardening

Read:
- `PROJECT_SPEC.md`
- `README.md`
- `PRODUCT_PHASES.md`
- `docs/phases/phase-14-hardening.md`

Implement ONLY Phase 14 - Hardening and Product Readiness.

Requirements:
- Add integration tests
- Improve error taxonomy where needed
- Improve timeout/retry messaging where appropriate
- Audit redaction across CLI, logs, and report outputs
- Finalize documentation
- Add release checklist

Do NOT introduce major new product features in this phase.
Focus on stability, safety, and release readiness.

At the end:
- list changed files
- provide commands to test
- provide a short verification summary
