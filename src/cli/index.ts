#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { Command, Option } from "commander";

import {
  createScanRunner,
  type RunScanOptions,
  type ScanRunner
} from "../core/runner.js";
import { Severity } from "../core/severity.js";
import type { HttpMethod, ScanInput } from "../core/types.js";

interface CliDependencies {
  error(message?: unknown, ...optionalParams: unknown[]): void;
  log(message?: unknown, ...optionalParams: unknown[]): void;
}

export interface CreateCliOptions {
  runner?: ScanRunner;
  io?: CliDependencies;
}

interface ScanCommandOptions {
  config?: string;
  failOn?: Severity;
  format?: "console" | "json";
  method?: HttpMethod;
  openapi?: string;
  output?: string;
  url?: string;
}

const severityChoices = Object.values(Severity);
const methodChoices: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS"
];

const resolveInput = (options: ScanCommandOptions): ScanInput => {
  const inputModes = [
    options.config !== undefined,
    options.openapi !== undefined,
    options.url !== undefined
  ].filter(Boolean);

  if (inputModes.length !== 1) {
    throw new Error(
      "Provide exactly one input mode: --config <file>, --openapi <file>, or --url <endpoint>."
    );
  }

  if (options.config !== undefined) {
    return {
      type: "config",
      value: {
        configPath: options.config
      }
    };
  }

  if (options.openapi !== undefined) {
    return {
      type: "openapi",
      value: {
        filePath: options.openapi
      }
    };
  }

  return {
    type: "single-endpoint",
    value: {
      url: options.url as string,
      method: options.method ?? "GET"
    }
  };
};

const validateOutputOptions = (options: ScanCommandOptions): void => {
  if (options.format === "json" && options.output === undefined) {
    throw new Error("JSON output requires --output <path>.");
  }

  if (options.format !== "json" && options.output !== undefined) {
    throw new Error("--output can only be used with --format json.");
  }
};

export const createCli = (options: CreateCliOptions = {}): Command => {
  const program = new Command();
  const runner = options.runner ?? createScanRunner();
  const io = options.io ?? console;

  program
    .name("api-security-scanner")
    .description("CLI for scanning APIs for common security misconfigurations")
    .version("0.1.0");

  program
    .command("scan")
    .description("Scan API endpoints from config or a single URL")
    .option("--config <file>", "Path to a JSON config file")
    .option("--openapi <file>", "Path to an OpenAPI 3.x JSON or YAML file")
    .option("--url <endpoint>", "Single endpoint URL to scan")
    .addOption(
      new Option("--method <method>", "HTTP method for single endpoint mode")
        .choices(methodChoices)
        .default("GET")
    )
    .addOption(
      new Option("--format <format>", "Report format")
        .choices(["console", "json"])
        .default("console")
    )
    .option("--output <path>", "Output file path for JSON reports")
    .addOption(
      new Option("--fail-on <severity>", "Fail when findings meet or exceed this severity").choices(
        severityChoices
      )
    )
    .action(async (commandOptions: ScanCommandOptions) => {
      try {
        validateOutputOptions(commandOptions);

        const runOptions: RunScanOptions = {
          input: resolveInput(commandOptions),
          format: (commandOptions.format ?? "console") as RunScanOptions["format"],
          outputPath: commandOptions.output,
          failOnSeverity: commandOptions.failOn
        };

        const result = await runner.run(runOptions);

        if (runOptions.format === "json" && commandOptions.output !== undefined) {
          io.log(`JSON report written to ${commandOptions.output}`);
        }

        if (result.shouldFail) {
          process.exitCode = 2;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Scan failed with an unknown error.";
        io.error(message);
        process.exitCode = 1;
      }
    });

  program.showHelpAfterError();
  program.exitOverride();

  return program;
};

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  const program = createCli();
  program.parseAsync(process.argv).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "commander.executeSubCommandAsync") {
      return;
    }

    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "commander.helpDisplayed" ||
        error.code === "commander.version" ||
        error.code === "commander.executeSubCommandAsync")
    ) {
      return;
    }

    process.exitCode = 1;
  });
}
