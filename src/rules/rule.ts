import type { Finding } from "../core/finding.js";
import type { Severity } from "../core/severity.js";
import type { Endpoint } from "../core/types.js";

export interface RuleContext {
  endpoint: Endpoint;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  evaluate(context: RuleContext): Promise<Finding[]> | Finding[];
}
