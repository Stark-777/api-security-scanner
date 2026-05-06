# Release Checklist

Use this checklist before tagging or publicly sharing a new version of `api-security-scanner`.

## Verification

- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run test:unit`
- Run `npm run test:integration`
- Run `npm run build`
- Run `npm run ci:check`

## CLI Smoke Tests

- Run `npm run scan -- --config examples/configs/quickstart.config.json`
- Run `npm run scan -- --config examples/configs/quickstart.config.json --format json --output examples/reports/scan-report.json`
- Run `npm run scan -- --openapi examples/openapi/example-openapi.yaml --format html --output examples/reports/scan-report.html`
- Run `npm run scan -- --config examples/configs/quickstart.config.json --fail-on high` and confirm exit code `2`

## Security and Output Review

- Confirm sensitive values are redacted in logs
- Confirm sensitive values are redacted in JSON and HTML report artifacts
- Confirm actionable timeout messaging is visible for timeout failures
- Confirm example configs and commands in `README.md` still work

## Packaging

- Build the Docker image with `npm run docker:build`
- Run `docker run --rm api-security-scanner`
- Run `docker run --rm api-security-scanner scan --config examples/configs/quickstart.config.json`

## Repository Hygiene

- Confirm generated local artifacts are not unintentionally staged
- Confirm scratch files are not included in the release commit
- Review `git status`
- Review the final diff before pushing
