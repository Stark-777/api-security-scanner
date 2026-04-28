import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding } from "./helpers.js";

const AUTH_HEADER_NAMES = ["authorization", "x-api-key", "api-key"];

export class MissingAuthRule implements Rule {
  readonly id = "missing-auth";
  readonly name = "Missing Authentication";
  readonly description =
    "Detects endpoints that appear accessible without authentication.";
  readonly severity = Severity.High;

  evaluate(context: RuleContext): Finding[] {
    const requestHeaders = context.endpoint.headers ?? {};
    const hasAuthHeader = Object.keys(requestHeaders).some((headerName) =>
      AUTH_HEADER_NAMES.includes(headerName.toLowerCase())
    );
    const status = context.response.status;
    const appearsAccessibleWithoutAuth = status < 400 || status === 404;

    if (hasAuthHeader || !appearsAccessibleWithoutAuth) {
      return [];
    }

    return [
      createFinding({
        ruleId: this.id,
        title: "Endpoint may allow unauthenticated access",
        severity: this.severity,
        endpoint: context.endpoint.url,
        method: context.endpoint.method,
        description:
          "The endpoint responded without an authentication header present on the request.",
        evidence: `Response status ${status} received without Authorization or API key headers.`,
        risk:
          "Sensitive API functionality may be reachable without verifying caller identity.",
        remediation:
          "Require authentication for protected endpoints and verify access tokens or API keys before serving requests."
      })
    ];
  }
}
