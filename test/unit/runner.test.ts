import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";

import { ScanRunner } from "../../src/core/runner.js";
import type { ReportOutputError } from "../../src/core/errors.js";
import { Scanner } from "../../src/core/scanner.js";
import { Severity } from "../../src/core/severity.js";
import { HttpClient } from "../../src/http/client.js";
import { ConsoleReporter } from "../../src/reporters/console.reporter.js";
import { HtmlReporter } from "../../src/reporters/html.reporter.js";
import { JsonReporter } from "../../src/reporters/json.reporter.js";
import type { Logger } from "../../src/utils/logger.js";

const createLogger = (): Logger => {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
};

const createScannerFactory = (axiosInstance: AxiosInstance) => {
  return (scannerOptions?: {
    logger?: Logger;
    httpClientOptions?: {
      baseUrl?: string;
      defaultHeaders?: Record<string, string>;
      timeoutMs?: number;
    };
  }): Scanner => {
    return new Scanner({
      logger: scannerOptions?.logger,
      httpClient: new HttpClient({
        axiosInstance,
        logger: scannerOptions?.logger,
        baseUrl: scannerOptions?.httpClientOptions?.baseUrl,
        defaultHeaders: scannerOptions?.httpClientOptions?.defaultHeaders,
        timeoutMs: scannerOptions?.httpClientOptions?.timeoutMs
      })
    });
  };
};

describe("scan runner", () => {
  it("runs a single endpoint scan and renders console output", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {
        "access-control-allow-origin": "*"
      },
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const reporterTarget = { log: vi.fn() };
    const runner = new ScanRunner({
      logger: createLogger(),
      consoleReporter: new ConsoleReporter(reporterTarget),
      scannerFactory: createScannerFactory(axiosInstance)
    });

    const result = await runner.run({
      input: {
        type: "single-endpoint",
        value: {
          url: "http://api.example.com/users",
          method: "GET"
        }
      },
      format: "console"
    });

    expect(result.report.summary.endpointsScanned).toBe(1);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(reporterTarget.log).toHaveBeenCalledWith("Scan Summary");
    expect(result.report.metadata.toolName).toBe("api-security-scanner");
  });

  it("writes a JSON report when requested", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "scan-runner-"));
    const outputPath = join(tempDirectory, "report.json");
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const reporterWrite = vi.spyOn(JsonReporter.prototype, "write");
    const runner = new ScanRunner({
      logger: createLogger(),
      jsonReporter: new JsonReporter(),
      scannerFactory: createScannerFactory(axiosInstance)
    });

    await runner.run({
      input: {
        type: "single-endpoint",
        value: {
          url: "https://api.example.com/health",
          method: "GET"
        }
      },
      format: "json",
      outputPath
    });

    expect(reporterWrite).toHaveBeenCalled();
    reporterWrite.mockRestore();
  });

  it("writes an HTML report when requested", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "scan-runner-html-"));
    const outputPath = join(tempDirectory, "report.html");
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const reporterWrite = vi.spyOn(HtmlReporter.prototype, "write");
    const runner = new ScanRunner({
      logger: createLogger(),
      htmlReporter: new HtmlReporter(),
      scannerFactory: createScannerFactory(axiosInstance)
    });

    await runner.run({
      input: {
        type: "single-endpoint",
        value: {
          url: "https://api.example.com/health",
          method: "GET"
        }
      },
      format: "html",
      outputPath
    });

    expect(reporterWrite).toHaveBeenCalled();
    reporterWrite.mockRestore();
  });

  it("wraps report write failures with output context", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const runner = new ScanRunner({
      logger: createLogger(),
      jsonReporter: {
        render: vi.fn(),
        generate: vi.fn(),
        write: vi.fn().mockRejectedValue(new Error("disk full"))
      } as unknown as JsonReporter,
      scannerFactory: createScannerFactory(axiosInstance)
    });

    await expect(
      runner.run({
        input: {
          type: "single-endpoint",
          value: {
            url: "https://api.example.com/health",
            method: "GET"
          }
        },
        format: "json",
        outputPath: "reports/out.json"
      })
    ).rejects.toMatchObject<ReportOutputError>({
      name: "ReportOutputError",
      outputPath: "reports/out.json",
      message: "Failed to write JSON report to reports/out.json"
    });
  });

  it("uses fail-on severity to mark the run as failed", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const runner = new ScanRunner({
      logger: createLogger(),
      scannerFactory: createScannerFactory(axiosInstance)
    });

    const result = await runner.run({
      input: {
        type: "single-endpoint",
        value: {
          url: "http://api.example.com/health",
          method: "GET"
        }
      },
      format: "console",
      failOnSeverity: Severity.High
    });

    expect(result.shouldFail).toBe(true);
  });

  it("loads config input and uses config http client options", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "scan-config-"));
    const configPath = join(tempDirectory, "config.json");

    await writeFile(
      configPath,
      JSON.stringify({
        baseUrl: "https://api.example.com",
        defaultHeaders: {
          Authorization: "Bearer test-token"
        },
        timeoutMs: 1234,
        endpoints: [
          {
            url: "https://api.example.com/health",
            method: "GET"
          }
        ]
      })
    );

    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const runner = new ScanRunner({
      logger: createLogger(),
      scannerFactory: createScannerFactory(axiosInstance)
    });

    await runner.run({
      input: {
        type: "config",
        value: {
          configPath
        }
      },
      format: "console"
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 1234,
        headers: expect.objectContaining({
          Authorization: "Bearer test-token"
        })
      })
    );
  });

  it("loads openapi input and scans extracted endpoints", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "scan-openapi-"));
    const openApiPath = join(tempDirectory, "openapi.json");

    await writeFile(
      openApiPath,
      JSON.stringify({
        openapi: "3.0.3",
        servers: [{ url: "https://api.example.com" }],
        paths: {
          "/users": {
            get: {
              summary: "List users"
            }
          }
        }
      })
    );

    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const runner = new ScanRunner({
      logger: createLogger(),
      scannerFactory: createScannerFactory(axiosInstance)
    });

    const result = await runner.run({
      input: {
        type: "openapi",
        value: {
          filePath: openApiPath
        }
      },
      format: "console"
    });

    expect(result.report.summary.endpointsScanned).toBe(1);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://api.example.com/users",
        method: "GET"
      })
    );
  });
});
