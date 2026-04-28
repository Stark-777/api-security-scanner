import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding, getHeader } from "./helpers.js";

export class CorsRule implements Rule {
  readonly id = "cors-misconfiguration";
  readonly name = "CORS Misconfiguration";
  readonly description =
    "Detects permissive or unsafe CORS response header combinations.";
  readonly severity = Severity.Medium;

  evaluate(context: RuleContext): Finding[] {
    const allowOrigin = getHeader(
      context.response.headers,
      "access-control-allow-origin"
    );
    const allowCredentials = getHeader(
      context.response.headers,
      "access-control-allow-credentials"
    );

    if (allowOrigin === "*") {
      return [
        createFinding({
          ruleId: this.id,
          title: "CORS allows any origin",
          severity: this.severity,
          endpoint: context.endpoint.url,
          method: context.endpoint.method,
          description:
            "The response allows requests from any origin with a wildcard CORS policy.",
          evidence: "Access-Control-Allow-Origin: *",
          risk:
            "Browsers may allow untrusted origins to interact with the API in unintended ways.",
          remediation:
            "Restrict Access-Control-Allow-Origin to the specific trusted origins that need access."
        })
      ];
    }

    if (allowOrigin !== undefined && allowCredentials?.toLowerCase() === "true") {
      return [
        createFinding({
          ruleId: this.id,
          title: "CORS allows credentials across origins",
          severity: this.severity,
          endpoint: context.endpoint.url,
          method: context.endpoint.method,
          description:
            "The response enables credentialed cross-origin requests.",
          evidence: `Access-Control-Allow-Origin: ${allowOrigin}; Access-Control-Allow-Credentials: ${allowCredentials}`,
          risk:
            "Credentialed cross-origin access can expose authenticated sessions to unintended origins if the allowlist is too broad.",
          remediation:
            "Limit credentialed CORS to only the minimal trusted origins, or disable credentials if they are not required."
        })
      ];
    }

    return [];
  }
}
