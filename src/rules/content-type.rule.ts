import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { Rule, RuleContext } from "./rule.js";
import { createFinding, getHeader } from "./helpers.js";

const isObjectLike = (value: unknown): boolean => {
  return value !== null && typeof value === "object";
};

export class ContentTypeRule implements Rule {
  readonly id = "content-type-validation";
  readonly name = "Content-Type Validation Issues";
  readonly description =
    "Detects missing or suspicious content-type behavior in API responses.";
  readonly severity = Severity.Medium;

  evaluate(context: RuleContext): Finding[] {
    const contentType = getHeader(context.response.headers, "content-type");
    const responseData = context.response.data;

    if (contentType === undefined) {
      return [
        createFinding({
          ruleId: this.id,
          title: "Response is missing a Content-Type header",
          severity: this.severity,
          endpoint: context.endpoint.url,
          method: context.endpoint.method,
          description:
            "The response does not include a Content-Type header.",
          evidence: "Content-Type header is absent.",
          risk:
            "Missing content-type metadata can weaken response validation expectations and create ambiguity for clients.",
          remediation:
            "Set an explicit Content-Type header for every API response."
        })
      ];
    }

    if (
      isObjectLike(responseData) &&
      !contentType.toLowerCase().includes("application/json")
    ) {
      return [
        createFinding({
          ruleId: this.id,
          title: "Structured response uses an unexpected Content-Type",
          severity: this.severity,
          endpoint: context.endpoint.url,
          method: context.endpoint.method,
          description:
            "The response body appears structured, but the content-type does not indicate JSON.",
          evidence: `Observed Content-Type: ${contentType}`,
          risk:
            "Unexpected content-type behavior can indicate inconsistent API behavior or weak response validation.",
          remediation:
            "Return a content-type that accurately reflects the response payload format."
        })
      ];
    }

    return [];
  }
}
