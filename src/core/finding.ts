import type { HttpMethod } from "./types.js";
import type { Severity } from "./severity.js";

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  endpoint: string;
  method: HttpMethod;
  description: string;
  evidence: string;
  risk: string;
  remediation: string;
  timestamp: string;
}
