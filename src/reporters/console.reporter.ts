import { Severity } from "../core/severity.js";
import type { Finding } from "../core/finding.js";
import type { ScanReport } from "../core/types.js";

const severityOrder = [
  Severity.Critical,
  Severity.High,
  Severity.Medium,
  Severity.Low,
  Severity.Info
] as const;

export interface ConsoleReporterTarget {
  log(message?: unknown, ...optionalParams: unknown[]): void;
}

export class ConsoleReporter {
  constructor(
    private readonly target: ConsoleReporterTarget = console
  ) {}

  render(report: ScanReport): void {
    this.target.log("Scan Summary");
    this.target.log(`Endpoints scanned: ${report.summary.endpointsScanned}`);
    this.target.log(`Total findings: ${report.summary.totalFindings}`);

    for (const severity of severityOrder) {
      this.target.log(
        `${severity}: ${report.summary.findingsBySeverity[severity] ?? 0}`
      );
    }

    if (report.findings.length === 0) {
      this.target.log("No findings detected.");
      return;
    }

    for (const severity of severityOrder) {
      const findingsForSeverity = report.findings.filter(
        (finding) => finding.severity === severity
      );

      if (findingsForSeverity.length === 0) {
        continue;
      }

      this.target.log("");
      this.target.log(`Findings - ${severity.toUpperCase()}`);

      for (const finding of findingsForSeverity) {
        this.logFinding(finding);
      }
    }
  }

  private logFinding(finding: Finding): void {
    this.target.log(`${finding.title} [${finding.ruleId}]`);
    this.target.log(`${finding.method} ${finding.endpoint}`);
    this.target.log(`Description: ${finding.description}`);
    this.target.log(`Evidence: ${finding.evidence}`);
    this.target.log(`Risk: ${finding.risk}`);
    this.target.log(`Remediation: ${finding.remediation}`);
    this.target.log(`Timestamp: ${finding.timestamp}`);
  }
}

export const createConsoleReporter = (
  target: ConsoleReporterTarget = console
): ConsoleReporter => {
  return new ConsoleReporter(target);
};
