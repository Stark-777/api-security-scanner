# Product Phases

## Phase 9 - Full CLI Workflow

Goal:
Turn the current library-style implementation into a real CLI workflow.

Tasks:
- Add a `scan` command
- Support config input with `--config <file>`
- Support single endpoint input with `--url <endpoint>` and `--method <method>`
- Add `--format console|json`
- Add `--output <path>` for JSON reports
- Add `--fail-on <severity>` for CI-friendly exit codes
- Add a high-level orchestration layer that connects input loading, scanning, rules, and reporting

Done when:
- `api-security-scanner scan --config examples/configs/scanner.config.example.json` works
- findings are evaluated automatically
- console output is visible
- JSON output can be saved to disk
- runtime/config failures return a non-zero exit code

Out of scope:
- OpenAPI parsing
- HTML reports
- new rule implementations beyond current set

---

## Phase 10 - OpenAPI Input

Goal:
Add OpenAPI JSON/YAML as a supported input mode.

Tasks:
- Add OpenAPI parser support for JSON and YAML
- Extract endpoints and methods from `paths`
- Respect `servers` for base URL handling
- Introduce parser abstraction for config, OpenAPI, and single URL input
- Normalize extracted inputs into the existing scan pipeline

Done when:
- `api-security-scanner scan --openapi ./openapi.yaml` works
- endpoints from spec files are converted into normalized scan inputs
- invalid spec files fail with clear messages

Out of scope:
- deep auth semantics from OpenAPI security schemes
- remote URL fetching unless explicitly prioritized later
- full OpenAPI edge-case coverage

---

## Phase 11 - Rule Expansion

Goal:
Expand the rule set toward the v1 spec.

Tasks:
- Add dangerous HTTP methods rule
- Add sensitive data exposure rule
- Add verbose error leakage rule
- Add missing rate-limit indicators rule
- Add content-type validation issues rule
- Add unit tests for each new rule

Done when:
- new rules follow the existing `Rule` interface
- findings remain structured and consistent
- the project rule coverage is closer to `PROJECT_SPEC.md`

Out of scope:
- advanced fuzzing
- full OWASP coverage
- ML/AI-based detection

---

## Phase 12 - Reports and Artifacts

Goal:
Make the output more useful for local users and CI users.

Tasks:
- Add HTML report generation
- Improve console summary formatting
- Stabilize JSON artifact structure
- Introduce a shared reporter contract
- Introduce a unified report model for all output formats

Done when:
- one scan can produce console output
- one scan can produce JSON output
- one scan can produce HTML output

Out of scope:
- SARIF by default
- hosted dashboards
- external storage integrations

---

## Phase 13 - CI and Release

Goal:
Make the project easy to run automatically and share publicly.

Tasks:
- Add GitHub Actions workflow
- Add Docker support
- Add CI usage examples
- Add release-oriented scripts
- Validate severity-based failure mode in CI scenarios

Done when:
- the project runs in GitHub Actions
- the project can be run in a container
- repo docs include CI usage examples

Out of scope:
- package registry publishing if not explicitly needed
- multi-platform release automation beyond practical defaults

---

## Phase 14 - Hardening and Product Readiness

Goal:
Make the project stable and public-ready.

Tasks:
- Add integration tests
- Improve error taxonomy where needed
- Improve timeout and retry messaging where appropriate
- Audit redaction in CLI, logs, and reports
- Finalize docs
- Add release checklist

Done when:
- lint passes
- typecheck passes
- unit tests pass
- integration tests pass
- build passes

Out of scope:
- enterprise-grade deployment platform
- advanced remote orchestration
- multi-tenant productization
