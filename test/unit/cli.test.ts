import { afterEach, describe, expect, it, vi } from "vitest";

import { createCli } from "../../src/cli/index.js";
import { Severity } from "../../src/core/severity.js";
import type { RunScanResult, ScanRunner } from "../../src/core/runner.js";

const createRunResult = (
  overrides: Partial<RunScanResult> = {}
): RunScanResult => {
  return {
    findings: [],
    probeResults: [],
    report: {
      metadata: {
        generatedAt: "2026-05-05T00:00:00.000Z",
        reportVersion: "1.0",
        toolName: "api-security-scanner"
      },
      summary: {
        endpointsScanned: 1,
        findingsBySeverity: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0
        },
        totalFindings: 0
      },
      findings: []
    },
    shouldFail: false,
    ...overrides
  };
};

afterEach(() => {
  process.exitCode = 0;
});

describe("cli scan command", () => {
  it("runs config scans through the runner", async () => {
    const run = vi.fn().mockResolvedValue(createRunResult());
    const program = createCli({
      runner: { run } as unknown as ScanRunner,
      io: { log: vi.fn(), error: vi.fn() }
    });

    await program.parseAsync(
      ["scan", "--config", "examples/configs/scanner.config.example.json"],
      { from: "user" }
    );

    expect(run).toHaveBeenCalledWith({
      input: {
        type: "config",
        value: {
          configPath: "examples/configs/scanner.config.example.json"
        }
      },
      format: "console",
      outputPath: undefined,
      failOnSeverity: undefined
    });
  });

  it("runs single endpoint scans with method and fail-on options", async () => {
    const run = vi.fn().mockResolvedValue(
      createRunResult({
        shouldFail: true
      })
    );
    const program = createCli({
      runner: { run } as unknown as ScanRunner,
      io: { log: vi.fn(), error: vi.fn() }
    });

    await program.parseAsync(
      [
        "scan",
        "--url",
        "https://api.example.com/users",
        "--method",
        "POST",
        "--fail-on",
        Severity.High
      ],
      { from: "user" }
    );

    expect(run).toHaveBeenCalledWith({
      input: {
        type: "single-endpoint",
        value: {
          url: "https://api.example.com/users",
          method: "POST"
        }
      },
      format: "console",
      outputPath: undefined,
      failOnSeverity: Severity.High
    });
    expect(process.exitCode).toBe(2);
  });

  it("requires an output path for json format", async () => {
    const error = vi.fn();
    const program = createCli({
      runner: { run: vi.fn() } as unknown as ScanRunner,
      io: { log: vi.fn(), error }
    });

    await program.parseAsync(
      ["scan", "--url", "https://api.example.com/users", "--format", "json"],
      { from: "user" }
    );

    expect(error).toHaveBeenCalledWith("JSON output requires --output <path>.");
    expect(process.exitCode).toBe(1);
  });

  it("requires an output path for html format", async () => {
    const error = vi.fn();
    const program = createCli({
      runner: { run: vi.fn() } as unknown as ScanRunner,
      io: { log: vi.fn(), error }
    });

    await program.parseAsync(
      ["scan", "--url", "https://api.example.com/users", "--format", "html"],
      { from: "user" }
    );

    expect(error).toHaveBeenCalledWith("HTML output requires --output <path>.");
    expect(process.exitCode).toBe(1);
  });

  it("rejects conflicting input modes", async () => {
    const error = vi.fn();
    const program = createCli({
      runner: { run: vi.fn() } as unknown as ScanRunner,
      io: { log: vi.fn(), error }
    });

    await program.parseAsync(
      [
        "scan",
        "--config",
        "config.json",
        "--url",
        "https://api.example.com/users"
      ],
      { from: "user" }
    );

    expect(error).toHaveBeenCalledWith(
      "Provide exactly one input mode: --config <file>, --openapi <file>, or --url <endpoint>."
    );
    expect(process.exitCode).toBe(1);
  });

  it("routes openapi input through the runner", async () => {
    const run = vi.fn().mockResolvedValue(createRunResult());
    const program = createCli({
      runner: { run } as unknown as ScanRunner,
      io: { log: vi.fn(), error: vi.fn() }
    });

    await program.parseAsync(["scan", "--openapi", "./openapi.yaml"], {
      from: "user"
    });

    expect(run).toHaveBeenCalledWith({
      input: {
        type: "openapi",
        value: {
          filePath: "./openapi.yaml"
        }
      },
      format: "console",
      outputPath: undefined,
      failOnSeverity: undefined
    });
  });

  it("logs html output paths after a successful run", async () => {
    const log = vi.fn();
    const run = vi.fn().mockResolvedValue(createRunResult());
    const program = createCli({
      runner: { run } as unknown as ScanRunner,
      io: { log, error: vi.fn() }
    });

    await program.parseAsync(
      [
        "scan",
        "--url",
        "https://api.example.com/users",
        "--format",
        "html",
        "--output",
        "reports/scan-report.html"
      ],
      { from: "user" }
    );

    expect(log).toHaveBeenCalledWith(
      "HTML report written to reports/scan-report.html"
    );
  });
});
