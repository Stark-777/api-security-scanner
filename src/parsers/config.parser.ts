import { readFile } from "node:fs/promises";

import { z } from "zod";

import type { ScannerConfig } from "../core/types.js";

const httpMethodSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS"
]);

const endpointSchema = z.object({
  url: z.url(),
  method: httpMethodSchema,
  headers: z.record(z.string(), z.string()).optional(),
  body: z.unknown().optional(),
  description: z.string().min(1).optional()
});

export const configSchema = z.object({
  baseUrl: z.url().optional(),
  defaultHeaders: z.record(z.string(), z.string()).optional(),
  timeoutMs: z.number().int().positive().optional(),
  endpoints: z.array(endpointSchema).min(1)
});

export class ConfigLoaderError extends Error {
  readonly filePath: string;

  constructor(message: string, filePath: string, cause?: unknown) {
    super(message, { cause });
    this.name = "ConfigLoaderError";
    this.filePath = filePath;
  }
}

const envVariablePattern = /\$\{([A-Z0-9_]+)\}/g;

const resolveString = (
  value: string,
  env: NodeJS.ProcessEnv
): string => {
  return value.replace(envVariablePattern, (_match, variableName: string) => {
    const resolvedValue = env[variableName];

    if (resolvedValue === undefined) {
      throw new Error(`Missing environment variable: ${variableName}`);
    }

    return resolvedValue;
  });
};

export const resolveEnvVariables = <T>(
  value: T,
  env: NodeJS.ProcessEnv = process.env
): T => {
  if (typeof value === "string") {
    return resolveString(value, env) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveEnvVariables(entry, env)) as T;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).map(([key, entryValue]) => [
      key,
      resolveEnvVariables(entryValue, env)
    ]);

    return Object.fromEntries(entries) as T;
  }

  return value;
};

export const loadConfig = async (
  filePath: string,
  env: NodeJS.ProcessEnv = process.env
): Promise<ScannerConfig> => {
  let rawConfig: string;

  try {
    rawConfig = await readFile(filePath, "utf8");
  } catch (error) {
    throw new ConfigLoaderError(
      `Failed to read config file: ${filePath}`,
      filePath,
      error
    );
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawConfig);
  } catch (error) {
    throw new ConfigLoaderError(
      `Invalid JSON in config file: ${filePath}`,
      filePath,
      error
    );
  }

  let resolvedConfig: unknown;

  try {
    resolvedConfig = resolveEnvVariables(parsedJson, env);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resolve environment variables";
    throw new ConfigLoaderError(
      `Config environment resolution failed for ${filePath}: ${message}`,
      filePath,
      error
    );
  }

  try {
    return configSchema.parse(resolvedConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ConfigLoaderError(
        `Config validation failed for ${filePath}: ${error.issues
          .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
          .join("; ")}`,
        filePath,
        error
      );
    }

    throw error;
  }
};
