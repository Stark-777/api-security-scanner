import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding } from "./helpers.js";

const SENSITIVE_DATA_PATTERNS: Array<{
  label: string;
  pattern: RegExp;
}> = [
  { label: "password", pattern: /\bpassword\b/i },
  { label: "secret", pattern: /\bsecret\b/i },
  { label: "token", pattern: /\btoken\b/i },
  { label: "api key", pattern: /\bapi[_ -]?key\b/i },
  { label: "authorization", pattern: /\bauthorization\b/i }
];

const stringifyData = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export class SensitiveDataExposureRule implements Rule {
  readonly id = "sensitive-data-exposure";
  readonly name = "Sensitive Data Exposure";
  readonly description =
    "Detects obvious sensitive data patterns in API responses.";
  readonly severity = Severity.High;

  evaluate(context: RuleContext): Finding[] {
    const serializedData = stringifyData(context.response.data);
    const match = SENSITIVE_DATA_PATTERNS.find(({ pattern }) =>
      pattern.test(serializedData)
    );

    if (match === undefined) {
      return [];
    }

    return [
      createFinding({
        ruleId: this.id,
        title: "Response may expose sensitive data",
        severity: this.severity,
        endpoint: context.endpoint.url,
        method: context.endpoint.method,
        description:
          "The response body appears to contain a field or value that resembles sensitive data.",
        evidence: `Matched sensitive pattern: ${match.label}`,
        risk:
          "Sensitive response data can leak credentials, secrets, or other privileged values to unintended clients.",
        remediation:
          "Remove, redact, or mask sensitive fields before returning the response to clients."
      })
    ];
  }
}
