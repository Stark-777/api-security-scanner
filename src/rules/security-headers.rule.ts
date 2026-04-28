import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding, getHeader } from "./helpers.js";

const REQUIRED_SECURITY_HEADERS = [
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "content-security-policy"
] as const;

export class SecurityHeadersRule implements Rule {
  readonly id = "security-headers";
  readonly name = "Security Headers";
  readonly description =
    "Detects missing defensive HTTP response headers.";
  readonly severity = Severity.Medium;

  evaluate(context: RuleContext): Finding[] {
    const missingHeaders = REQUIRED_SECURITY_HEADERS.filter(
      (headerName) => getHeader(context.response.headers, headerName) === undefined
    );

    if (missingHeaders.length === 0) {
      return [];
    }

    return [
      createFinding({
        ruleId: this.id,
        title: "Response is missing recommended security headers",
        severity: this.severity,
        endpoint: context.endpoint.url,
        method: context.endpoint.method,
        description:
          "The response is missing one or more headers commonly used to harden browser-facing behavior.",
        evidence: `Missing headers: ${missingHeaders.join(", ")}`,
        risk:
          "Missing security headers can leave clients more exposed to attacks such as clickjacking, content sniffing, or weak transport guarantees.",
        remediation:
          "Add the missing security headers with values appropriate for the application and deployment environment."
      })
    ];
  }
}
