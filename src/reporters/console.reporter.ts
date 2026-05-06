import type { Finding } from "../core/finding.js";
import type { ScanReport } from "../core/types.js";
import type { Reporter } from "./reporter.js";
import { sanitizeScanReport, severityOrder } from "./helpers.js";

export interface ConsoleReporterTarget {
  log(message?: unknown, ...optionalParams: unknown[]): void;
}

export class ConsoleReporter implements Reporter {
  constructor(
    private readonly target: ConsoleReporterTarget = console
  ) {}

  render(report: ScanReport): void {
    const sanitizedReport = sanitizeScanReport(report);

    for (const line of this.createLines(sanitizedReport)) {
      this.target.log(line);
    }
  }

  private createLines(report: ScanReport): string[] {
    const lines: string[] = [];

    lines.push("Scan Summary");
    lines.push(`Tool: ${report.metadata.toolName}`);
    lines.push(`Report version: ${report.metadata.reportVersion}`);
    lines.push(`Generated at: ${report.metadata.generatedAt}`);
    lines.push(`Endpoints scanned: ${report.summary.endpointsScanned}`);
    lines.push(`Total findings: ${report.summary.totalFindings}`);
    lines.push("Findings by severity:");

    for (const severity of severityOrder) {
      lines.push(`  ${severity}: ${report.summary.findingsBySeverity[severity] ?? 0}`);
    }

    if (report.findings.length === 0) {
      lines.push("");
      lines.push("No findings detected.");
      return lines;
    }

    for (const severity of severityOrder) {
      const findingsForSeverity = report.findings.filter(
        (finding) => finding.severity === severity
      );

      if (findingsForSeverity.length === 0) {
        continue;
      }

      lines.push("");
      lines.push(`Findings - ${severity.toUpperCase()}`);

      for (const finding of findingsForSeverity) {
        lines.push(...this.createFindingLines(finding));
      }
    }

    return lines;
  }

  private createFindingLines(finding: Finding): string[] {
    return [
      `${finding.title} [${finding.ruleId}]`,
      `${finding.method} ${finding.endpoint}`,
      `Description: ${finding.description}`,
      `Evidence: ${finding.evidence}`,
      `Risk: ${finding.risk}`,
      `Remediation: ${finding.remediation}`,
      `Timestamp: ${finding.timestamp}`
    ];
  }
}

export const createConsoleReporter = (
  target: ConsoleReporterTarget = console
): ConsoleReporter => {
  return new ConsoleReporter(target);
};
