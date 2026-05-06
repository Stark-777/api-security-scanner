import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding } from "./helpers.js";

const VERBOSE_ERROR_PATTERNS = [
  /stack trace/i,
  /exception/i,
  /traceback/i,
  /\bat .*:\d+:\d+/,
  /syntaxerror/i,
  /referenceerror/i
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

export class VerboseErrorsRule implements Rule {
  readonly id = "verbose-errors";
  readonly name = "Verbose Error Leakage";
  readonly description =
    "Detects error responses that appear to reveal implementation details.";
  readonly severity = Severity.Medium;

  evaluate(context: RuleContext): Finding[] {
    if (context.response.status < 400) {
      return [];
    }

    const responseBody = stringifyData(context.response.data);
    const hasVerboseError = VERBOSE_ERROR_PATTERNS.some((pattern) =>
      pattern.test(responseBody)
    );

    if (!hasVerboseError) {
      return [];
    }

    return [
      createFinding({
        ruleId: this.id,
        title: "Response appears to leak verbose error details",
        severity: this.severity,
        endpoint: context.endpoint.url,
        method: context.endpoint.method,
        description:
          "The error response appears to contain stack traces, exception names, or other internal details.",
        evidence: `Observed error response body: ${responseBody.slice(0, 160)}`,
        risk:
          "Verbose errors can expose implementation details that help attackers understand internal behavior and technology choices.",
        remediation:
          "Return generic user-facing errors and keep detailed diagnostics only in protected internal logs."
      })
    ];
  }
}
