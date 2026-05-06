import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { AxiosInstance } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createCli } from "../../src/cli/index.js";
import { ScanRunner } from "../../src/core/runner.js";
import { Scanner } from "../../src/core/scanner.js";
import { HttpClient } from "../../src/http/client.js";
import type { Logger } from "../../src/utils/logger.js";

const createLogger = (): Logger => {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
};

afterEach(() => {
  process.exitCode = 0;
});

describe("cli integration-like scan flow", () => {
  it("loads config input and writes a JSON report", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "cli-scan-"));
    const configPath = join(tempDirectory, "config.json");
    const outputPath = join(tempDirectory, "report.json");

    await writeFile(
      configPath,
      JSON.stringify({
        endpoints: [
          {
            url: "http://api.example.com/users",
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
    const logger = createLogger();
    const runner = new ScanRunner({
      logger,
      scannerFactory: (scannerOptions) =>
        new Scanner({
          logger: scannerOptions?.logger,
          httpClient: new HttpClient({
            axiosInstance,
            logger: scannerOptions?.logger,
            baseUrl: scannerOptions?.httpClientOptions?.baseUrl,
            defaultHeaders: scannerOptions?.httpClientOptions?.defaultHeaders,
            timeoutMs: scannerOptions?.httpClientOptions?.timeoutMs
          })
        })
    });
    const log = vi.fn();
    const error = vi.fn();
    const program = createCli({
      runner,
      io: { log, error }
    });

    await program.parseAsync(
      ["scan", "--config", configPath, "--format", "json", "--output", outputPath],
      { from: "user" }
    );

    const report = JSON.parse(await readFile(outputPath, "utf8"));

    expect(report.summary.endpointsScanned).toBe(1);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.findings.map((finding: { ruleId: string }) => finding.ruleId)).toEqual(
      expect.arrayContaining([
        "https-enforced",
        "missing-auth",
        "missing-rate-limit-indicators",
        "content-type-validation"
      ])
    );
    expect(log).toHaveBeenCalledWith(`JSON report written to ${outputPath}`);
    expect(error).not.toHaveBeenCalled();
  });

  it("loads local openapi input and writes a JSON report", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "cli-openapi-"));
    const openApiPath = join(tempDirectory, "openapi.yaml");
    const outputPath = join(tempDirectory, "report.json");

    await writeFile(
      openApiPath,
      `
openapi: 3.0.3
servers:
  - url: https://api.example.com
paths:
  /users:
    get:
      summary: List users
`
    );

    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const logger = createLogger();
    const runner = new ScanRunner({
      logger,
      scannerFactory: (scannerOptions) =>
        new Scanner({
          logger: scannerOptions?.logger,
          httpClient: new HttpClient({
            axiosInstance,
            logger: scannerOptions?.logger,
            baseUrl: scannerOptions?.httpClientOptions?.baseUrl,
            defaultHeaders: scannerOptions?.httpClientOptions?.defaultHeaders,
            timeoutMs: scannerOptions?.httpClientOptions?.timeoutMs
          })
        })
    });
    const log = vi.fn();
    const error = vi.fn();
    const program = createCli({
      runner,
      io: { log, error }
    });

    await program.parseAsync(
      ["scan", "--openapi", openApiPath, "--format", "json", "--output", outputPath],
      { from: "user" }
    );

    const report = JSON.parse(await readFile(outputPath, "utf8"));

    expect(report.summary.endpointsScanned).toBe(1);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.findings.map((finding: { ruleId: string }) => finding.ruleId)).toEqual(
      expect.arrayContaining([
        "missing-auth",
        "missing-rate-limit-indicators",
        "content-type-validation"
      ])
    );
    expect(log).toHaveBeenCalledWith(`JSON report written to ${outputPath}`);
    expect(error).not.toHaveBeenCalled();
  });
});
