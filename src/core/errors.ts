import { redactSensitiveString } from "../utils/logger.js";

export class CliUsageError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "CliUsageError";
  }
}

export class ScanInputError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "ScanInputError";
  }
}

export class ReportOutputError extends Error {
  readonly outputPath: string;

  constructor(message: string, outputPath: string, cause?: unknown) {
    super(message, { cause });
    this.name = "ReportOutputError";
    this.outputPath = outputPath;
  }
}

export const toUserFacingErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return redactSensitiveString(error.message);
  }

  return "Scan failed with an unknown error.";
};
