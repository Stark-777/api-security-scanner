import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding, getHeader } from "./helpers.js";

const RATE_LIMIT_HEADERS = [
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "retry-after"
];

export class RateLimitRule implements Rule {
  readonly id = "missing-rate-limit-indicators";
  readonly name = "Missing Rate-Limit Indicators";
  readonly description =
    "Detects responses that do not expose any common rate-limit related headers.";
  readonly severity = Severity.Low;

  evaluate(context: RuleContext): Finding[] {
    const hasRateLimitIndicator = RATE_LIMIT_HEADERS.some(
      (headerName) => getHeader(context.response.headers, headerName) !== undefined
    );

    if (hasRateLimitIndicator) {
      return [];
    }

    return [
      createFinding({
        ruleId: this.id,
        title: "Response is missing common rate-limit indicators",
        severity: this.severity,
        endpoint: context.endpoint.url,
        method: context.endpoint.method,
        description:
          "The response does not include common headers that indicate rate-limit behavior to clients.",
        evidence: `Missing indicators: ${RATE_LIMIT_HEADERS.join(", ")}`,
        risk:
          "Missing rate-limit indicators can make abuse controls harder to validate and harder for clients to respect.",
        remediation:
          "Expose appropriate rate-limit headers or retry guidance when rate limiting is part of the API behavior."
      })
    ];
  }
}
