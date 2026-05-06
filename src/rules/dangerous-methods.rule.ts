import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding } from "./helpers.js";

const DANGEROUS_METHODS = new Set(["PUT", "PATCH", "DELETE"]);

export class DangerousMethodsRule implements Rule {
  readonly id = "dangerous-methods";
  readonly name = "Dangerous HTTP Methods Exposed";
  readonly description =
    "Detects endpoints exposing mutating HTTP methods that may require extra security controls.";
  readonly severity = Severity.Medium;

  evaluate(context: RuleContext): Finding[] {
    if (!DANGEROUS_METHODS.has(context.endpoint.method)) {
      return [];
    }

    return [
      createFinding({
        ruleId: this.id,
        title: "Endpoint exposes a dangerous HTTP method",
        severity: this.severity,
        endpoint: context.endpoint.url,
        method: context.endpoint.method,
        description:
          "The endpoint exposes a mutating HTTP method that should be carefully protected with authentication and authorization.",
        evidence: `Observed method: ${context.endpoint.method}`,
        risk:
          "Mutating methods increase the impact of unauthorized access or misuse if protections are insufficient.",
        remediation:
          "Confirm the method is intentionally exposed and enforce strong authentication, authorization, and auditing."
      })
    ];
  }
}
