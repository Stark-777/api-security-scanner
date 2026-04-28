import type { Finding } from "../core/finding.js";
import type { Severity } from "../core/severity.js";
import type { Endpoint, ProbeResult } from "../core/types.js";

export interface RuleContext {
  endpoint: Endpoint;
  response: ProbeResult["response"];
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  evaluate(context: RuleContext): Promise<Finding[]> | Finding[];
}
