import type { Finding } from "../core/finding.js";
import type { Severity } from "../core/severity.js";
import type { HttpMethod, ProbeResult } from "../core/types.js";

export const getHeader = (
  headers: ProbeResult["response"]["headers"],
  name: string
): string | undefined => {
  const normalizedName = name.toLowerCase();
  const match = Object.entries(headers).find(
    ([headerName]) => headerName.toLowerCase() === normalizedName
  );

  return match?.[1];
};

interface CreateFindingOptions {
  ruleId: string;
  title: string;
  severity: Severity;
  endpoint: string;
  method: HttpMethod;
  description: string;
  evidence: string;
  risk: string;
  remediation: string;
}

export const createFinding = (
  options: CreateFindingOptions
): Finding => {
  return {
    ruleId: options.ruleId,
    title: options.title,
    severity: options.severity,
    endpoint: options.endpoint,
    method: options.method,
    description: options.description,
    evidence: options.evidence,
    risk: options.risk,
    remediation: options.remediation,
    timestamp: new Date().toISOString()
  };
};
