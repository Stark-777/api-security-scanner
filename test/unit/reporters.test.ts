import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import type { Finding } from "../../src/core/finding.js";
import { Severity } from "../../src/core/severity.js";
import { ConsoleReporter } from "../../src/reporters/console.reporter.js";
import { createScanReport } from "../../src/reporters/helpers.js";
import { HtmlReporter } from "../../src/reporters/html.reporter.js";
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

    expect(report.metadata.toolName).toBe("api-security-scanner");
    expect(report.metadata.reportVersion).toBe("1.0");
    expect(report.metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
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
    expect(log).toHaveBeenCalledWith("Tool: api-security-scanner");
    expect(log).toHaveBeenCalledWith("Findings by severity:");
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

  it("redacts sensitive values in console output", () => {
    const log = vi.fn();
    const reporter = new ConsoleReporter({ log });

    reporter.render(
      createScanReport(
        [
          {
            ...sampleFindings[0],
            evidence: "Authorization: Bearer secret-token"
          }
        ],
        1
      )
    );

    expect(log).toHaveBeenCalledWith("Evidence: Authorization: Bearer [REDACTED]");
  });
});

describe("JsonReporter", () => {
  it("generates structured JSON output", () => {
    const reporter = new JsonReporter();
    const result = reporter.generate(createScanReport(sampleFindings, 2));

    expect(JSON.parse(result)).toMatchObject({
      metadata: {
        toolName: "api-security-scanner",
        reportVersion: "1.0"
      },
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
      metadata: {
        toolName: "api-security-scanner",
        reportVersion: "1.0"
      },
      summary: {
        endpointsScanned: 2,
        totalFindings: 2
      },
      findings: sampleFindings
    });
  });

  it("redacts sensitive values in generated JSON output", () => {
    const reporter = new JsonReporter();
    const result = reporter.generate(
      createScanReport(
        [
          {
            ...sampleFindings[0],
            evidence: "token=super-secret-token"
          }
        ],
        1
      )
    );

    expect(result).toContain("token=[REDACTED]");
    expect(result).not.toContain("super-secret-token");
  });
});

describe("HtmlReporter", () => {
  it("generates a self-contained HTML report", () => {
    const reporter = new HtmlReporter();
    const result = reporter.generate(createScanReport(sampleFindings, 2));

    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("API Security Scan Report");
    expect(result).toContain("<h2>HIGH</h2>");
    expect(result).toContain("api-security-scanner");
    expect(result).toContain("https-enforced");
  });

  it("writes the HTML report to disk", async () => {
    const reporter = new HtmlReporter();
    const tempDirectory = await mkdtemp(join(tmpdir(), "scanner-html-report-"));
    const filePath = join(tempDirectory, "reports", "scan-report.html");

    await reporter.write(createScanReport(sampleFindings, 2), filePath);

    const fileContents = await readFile(filePath, "utf8");

    expect(fileContents).toContain("<html lang=\"en\">");
    expect(fileContents).toContain("Response is missing recommended security headers");
  });

  it("redacts sensitive values in generated HTML output", () => {
    const reporter = new HtmlReporter();
    const result = reporter.generate(
      createScanReport(
        [
          {
            ...sampleFindings[0],
            evidence: "password=hunter2"
          }
        ],
        1
      )
    );

    expect(result).toContain("password=[REDACTED]");
    expect(result).not.toContain("hunter2");
  });
});
