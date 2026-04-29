import type { Finding } from "./finding.js";
import { Severity } from "./severity.js";
import type {
  Endpoint,
  HttpMethod,
  ProbeResult,
  ScanInput,
  ScanReport
} from "./types.js";
import { Scanner, type ScannerOptions } from "./scanner.js";
import { loadConfig } from "../parsers/config.parser.js";
import { ConsoleReporter } from "../reporters/console.reporter.js";
import { createScanReport } from "../reporters/helpers.js";
import { JsonReporter } from "../reporters/json.reporter.js";
import { CorsRule } from "../rules/cors.rule.js";
import { HttpsEnforcedRule } from "../rules/https-enforced.rule.js";
import { MissingAuthRule } from "../rules/missing-auth.rule.js";
import type { Rule } from "../rules/rule.js";
import { SecurityHeadersRule } from "../rules/security-headers.rule.js";
import { createLogger, type Logger } from "../utils/logger.js";

export type ReportFormat = "console" | "json";

export interface RunScanOptions {
  failOnSeverity?: Severity;
  format: ReportFormat;
  input: ScanInput;
  outputPath?: string;
}

export interface RunScanResult {
  findings: Finding[];
  probeResults: ProbeResult[];
  report: ScanReport;
  shouldFail: boolean;
}

export interface ScanRunnerOptions {
  consoleReporter?: ConsoleReporter;
  jsonReporter?: JsonReporter;
  logger?: Logger;
  rules?: Rule[];
  scannerFactory?: (options?: ScannerOptions) => Scanner;
}

const severityRank: Record<Severity, number> = {
  [Severity.Info]: 0,
  [Severity.Low]: 1,
  [Severity.Medium]: 2,
  [Severity.High]: 3,
  [Severity.Critical]: 4
};

const defaultRules = (): Rule[] => {
  return [
    new HttpsEnforcedRule(),
    new MissingAuthRule(),
    new CorsRule(),
    new SecurityHeadersRule()
  ];
};

const isSeverityBlocking = (
  findingSeverity: Severity,
  failOnSeverity?: Severity
): boolean => {
  if (failOnSeverity === undefined) {
    return false;
  }

  return severityRank[findingSeverity] >= severityRank[failOnSeverity];
};

const evaluateRules = async (
  rules: Rule[],
  probeResults: ProbeResult[]
): Promise<Finding[]> => {
  const findings: Finding[] = [];

  for (const result of probeResults) {
    for (const rule of rules) {
      const ruleFindings = await rule.evaluate({
        endpoint: result.endpoint,
        response: result.response
      });
      findings.push(...ruleFindings);
    }
  }

  return findings;
};

const normalizeSingleEndpointInput = (
  input: ScanInput["value"] & { url?: string; method?: HttpMethod }
): Endpoint[] => {
  if (input.url === undefined) {
    throw new Error("Single endpoint input requires a URL.");
  }

  try {
    new URL(input.url);
  } catch (error) {
    throw new Error(`Invalid endpoint URL: ${input.url}`, { cause: error });
  }

  return [
    {
      url: input.url,
      method: input.method ?? "GET"
    }
  ];
};

export class ScanRunner {
  private readonly consoleReporter: ConsoleReporter;
  private readonly jsonReporter: JsonReporter;
  private readonly logger: Logger;
  private readonly rules: Rule[];
  private readonly scannerFactory: (options?: ScannerOptions) => Scanner;

  constructor(options: ScanRunnerOptions = {}) {
    this.consoleReporter = options.consoleReporter ?? new ConsoleReporter();
    this.jsonReporter = options.jsonReporter ?? new JsonReporter();
    this.logger = options.logger ?? createLogger();
    this.rules = options.rules ?? defaultRules();
    this.scannerFactory = options.scannerFactory ?? ((scannerOptions) => new Scanner(scannerOptions));
  }

  async run(options: RunScanOptions): Promise<RunScanResult> {
    const { endpoints, scannerOptions } = await this.resolveScanTargets(options.input);
    const scanner = this.scannerFactory(scannerOptions);

    this.logger.info("Running scan workflow", {
      inputType: options.input.type,
      endpointCount: endpoints.length,
      format: options.format,
      failOnSeverity: options.failOnSeverity
    });

    const probeResults = await scanner.scanEndpoints(endpoints);
    const findings = await evaluateRules(this.rules, probeResults);
    const report = createScanReport(findings, probeResults.length);

    if (options.format === "console") {
      this.consoleReporter.render(report);
    } else {
      if (options.outputPath === undefined) {
        throw new Error("JSON output requires --output <path>.");
      }

      await this.jsonReporter.write(report, options.outputPath);
      this.logger.info("JSON report written", {
        outputPath: options.outputPath
      });
    }

    const shouldFail = findings.some((finding) =>
      isSeverityBlocking(finding.severity, options.failOnSeverity)
    );

    return {
      findings,
      probeResults,
      report,
      shouldFail
    };
  }

  private async resolveScanTargets(
    input: ScanInput
  ): Promise<{ endpoints: Endpoint[]; scannerOptions?: ScannerOptions }> {
    if (input.type === "config") {
      const config = await loadConfig(input.value.configPath);

      return {
        endpoints: config.endpoints,
        scannerOptions: {
          logger: this.logger,
          httpClientOptions: {
            baseUrl: config.baseUrl,
            defaultHeaders: config.defaultHeaders,
            timeoutMs: config.timeoutMs
          }
        }
      };
    }

    return {
      endpoints: normalizeSingleEndpointInput(input.value),
      scannerOptions: {
        logger: this.logger
      }
    };
  }
}

export const createScanRunner = (
  options: ScanRunnerOptions = {}
): ScanRunner => {
  return new ScanRunner(options);
};
