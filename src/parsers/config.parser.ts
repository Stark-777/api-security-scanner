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
  const rawConfig = await readFile(filePath, "utf8");
  const parsedJson: unknown = JSON.parse(rawConfig);
  const resolvedConfig = resolveEnvVariables(parsedJson, env);

  return configSchema.parse(resolvedConfig);
};
