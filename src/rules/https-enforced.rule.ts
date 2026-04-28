import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding } from "./helpers.js";

export class HttpsEnforcedRule implements Rule {
  readonly id = "https-enforced";
  readonly name = "HTTPS Enforcement";
  readonly description =
    "Detects endpoints that are configured to use insecure HTTP transport.";
  readonly severity = Severity.High;

  evaluate(context: RuleContext): Finding[] {
    if (context.endpoint.url.startsWith("https://")) {
      return [];
    }

    return [
      createFinding({
        ruleId: this.id,
        title: "Endpoint does not enforce HTTPS",
        severity: this.severity,
        endpoint: context.endpoint.url,
        method: context.endpoint.method,
        description:
          "The endpoint URL uses HTTP instead of HTTPS, which weakens transport security.",
        evidence: `Endpoint URL: ${context.endpoint.url}`,
        risk: "Traffic may be intercepted or modified in transit.",
        remediation:
          "Serve the endpoint over HTTPS and redirect any HTTP traffic to HTTPS."
      })
    ];
  }
}
