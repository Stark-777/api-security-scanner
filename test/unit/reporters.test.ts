import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import type { Finding } from "../../src/core/finding.js";
import { Severity } from "../../src/core/severity.js";
import { ConsoleReporter } from "../../src/reporters/console.reporter.js";
import { createScanReport } from "../../src/reporters/helpers.js";
import { JsonReporter } from "../../src/reporters/json.reporter.js";

const sampleFindings: Finding[] = [
  {
    ruleId: "https-enforced",
    title: "Endpoint does not enforce HTTPS",
    severity: Severity.High,
    endpoint: "http://api.example.com/users",
    method: "GET",
    description: "HTTP is used instead of HTTPS.",
    evidence: "Endpoint URL: http://api.example.com/users",
    risk: "Traffic can be intercepted.",
    remediation: "Redirect HTTP traffic to HTTPS.",
    timestamp: "2026-04-28T00:00:00.000Z"
  },
  {
    ruleId: "security-headers",
    title: "Response is missing recommended security headers",
    severity: Severity.Medium,
    endpoint: "https://api.example.com/users",
    method: "GET",
    description: "Response headers are incomplete.",
    evidence: "Missing headers: strict-transport-security",
    risk: "Browser hardening is reduced.",
    remediation: "Add the missing headers.",
    timestamp: "2026-04-28T00:00:00.000Z"
  }
];

describe("reporter helpers", () => {
  it("builds summary counts from findings", () => {
    const report = createScanReport(sampleFindings, 3);

    expect(report.summary).toEqual({
      endpointsScanned: 3,
      findingsBySeverity: {
        critical: 0,
        high: 1,
        medium: 1,
        low: 0,
        info: 0
      },
      totalFindings: 2
    });
  });
});

describe("ConsoleReporter", () => {
  it("prints a summary and findings grouped by severity", () => {
    const log = vi.fn();
    const reporter = new ConsoleReporter({ log });

    reporter.render(createScanReport(sampleFindings, 2));

    expect(log).toHaveBeenCalledWith("Scan Summary");
    expect(log).toHaveBeenCalledWith("Endpoints scanned: 2");
    expect(log).toHaveBeenCalledWith("Total findings: 2");
    expect(log).toHaveBeenCalledWith("Findings - HIGH");
    expect(log).toHaveBeenCalledWith("Findings - MEDIUM");
    expect(log).toHaveBeenCalledWith("Endpoint does not enforce HTTPS [https-enforced]");
    expect(log).toHaveBeenCalledWith("Response is missing recommended security headers [security-headers]");
  });

  it("prints a no-findings message when the report is clean", () => {
    const log = vi.fn();
    const reporter = new ConsoleReporter({ log });

    reporter.render(createScanReport([], 1));

    expect(log).toHaveBeenCalledWith("No findings detected.");
  });
});

describe("JsonReporter", () => {
  it("generates structured JSON output", () => {
    const reporter = new JsonReporter();
    const result = reporter.generate(createScanReport(sampleFindings, 2));

    expect(JSON.parse(result)).toMatchObject({
      summary: {
        endpointsScanned: 2,
        totalFindings: 2
      },
      findings: sampleFindings
    });
  });

  it("writes the JSON report to disk", async () => {
    const reporter = new JsonReporter();
    const tempDirectory = await mkdtemp(join(tmpdir(), "scanner-report-"));
    const filePath = join(tempDirectory, "reports", "scan-report.json");

    await reporter.write(createScanReport(sampleFindings, 2), filePath);

    const fileContents = await readFile(filePath, "utf8");

    expect(JSON.parse(fileContents)).toMatchObject({
      summary: {
        endpointsScanned: 2,
        totalFindings: 2
      },
      findings: sampleFindings
    });
  });
});
