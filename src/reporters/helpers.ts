import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type {
  ScanReport,
  ScanReportMetadata,
  ScanSummary
} from "../core/types.js";

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "api-security-scanner";

export const severityOrder = [
  Severity.Critical,
  Severity.High,
  Severity.Medium,
  Severity.Low,
  Severity.Info
] as const;

export const createScanReportMetadata = (): ScanReportMetadata => {
  return {
    generatedAt: new Date().toISOString(),
    reportVersion: REPORT_VERSION,
    toolName: TOOL_NAME
  };
};

export const createEmptySeverityCounts = (): Record<string, number> => {
  return Object.fromEntries(severityOrder.map((severity) => [severity, 0]));
};

export const createScanSummary = (
  findings: Finding[],
  endpointsScanned: number
): ScanSummary => {
  const findingsBySeverity = createEmptySeverityCounts();

  for (const finding of findings) {
    findingsBySeverity[finding.severity] =
      (findingsBySeverity[finding.severity] ?? 0) + 1;
  }

  return {
    endpointsScanned,
    findingsBySeverity,
    totalFindings: findings.length
  };
};

export const createScanReport = (
  findings: Finding[],
  endpointsScanned: number
): ScanReport => {
  return {
    metadata: createScanReportMetadata(),
    summary: createScanSummary(findings, endpointsScanned),
    findings
  };
};
