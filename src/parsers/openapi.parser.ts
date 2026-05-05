import { readFile } from "node:fs/promises";
import { extname } from "node:path";

import { parse as parseYaml } from "yaml";
import { z } from "zod";

import type { Endpoint, HttpMethod } from "../core/types.js";

const supportedMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS"
] as const;

const supportedOperationKeys = supportedMethods.map((method) =>
  method.toLowerCase()
) as Array<Lowercase<HttpMethod>>;

const openApiDocumentSchema = z.object({
  openapi: z.string().regex(/^3\./, "Only OpenAPI 3.x is supported."),
  servers: z.array(z.object({ url: z.string() })).optional(),
  paths: z.record(z.string(), z.record(z.string(), z.unknown()))
});

export interface OpenApiParseResult {
  baseUrl: string;
  endpoints: Endpoint[];
}

export class OpenApiLoaderError extends Error {
  readonly filePath: string;

  constructor(message: string, filePath: string, cause?: unknown) {
    super(message, { cause });
    this.name = "OpenApiLoaderError";
    this.filePath = filePath;
  }
}

const parseDocumentByExtension = (
  filePath: string,
  fileContents: string
): unknown => {
  const extension = extname(filePath).toLowerCase();

  if (extension === ".json") {
    return JSON.parse(fileContents);
  }

  if (extension === ".yaml" || extension === ".yml") {
    return parseYaml(fileContents);
  }

  throw new Error(
    `Unsupported OpenAPI file extension: ${extension || "none"}. Use .json, .yaml, or .yml.`
  );
};

const resolveBaseUrl = (
  servers: Array<{ url: string }> | undefined,
  filePath: string
): string => {
  const firstValidServer = servers?.find((server) => {
    try {
      new URL(server.url);
      return true;
    } catch {
      return false;
    }
  });

  if (firstValidServer === undefined) {
    throw new OpenApiLoaderError(
      `OpenAPI file must include at least one valid absolute server URL: ${filePath}`,
      filePath
    );
  }

  return firstValidServer.url;
};

const normalizeEndpoints = (
  baseUrl: string,
  paths: Record<string, Record<string, unknown>>
): Endpoint[] => {
  const endpoints: Endpoint[] = [];

  for (const [pathName, pathItem] of Object.entries(paths)) {
    for (const operationKey of supportedOperationKeys) {
      if (!(operationKey in pathItem)) {
        continue;
      }

      const operation = pathItem[operationKey];
      const description =
        operation !== null && typeof operation === "object"
          ? "description" in operation && typeof operation.description === "string"
            ? operation.description
            : "summary" in operation && typeof operation.summary === "string"
              ? operation.summary
              : undefined
          : undefined;

      endpoints.push({
        url: new URL(pathName, baseUrl).toString(),
        method: operationKey.toUpperCase() as HttpMethod,
        description
      });
    }
  }

  return endpoints;
};

export const loadOpenApiInput = async (
  filePath: string
): Promise<OpenApiParseResult> => {
  let fileContents: string;

  try {
    fileContents = await readFile(filePath, "utf8");
  } catch (error) {
    throw new OpenApiLoaderError(
      `Failed to read OpenAPI file: ${filePath}`,
      filePath,
      error
    );
  }

  let parsedDocument: unknown;

  try {
    parsedDocument = parseDocumentByExtension(filePath, fileContents);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse OpenAPI file.";
    throw new OpenApiLoaderError(
      `Failed to parse OpenAPI file ${filePath}: ${message}`,
      filePath,
      error
    );
  }

  let document: z.infer<typeof openApiDocumentSchema>;

  try {
    document = openApiDocumentSchema.parse(parsedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new OpenApiLoaderError(
        `OpenAPI validation failed for ${filePath}: ${error.issues
          .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
          .join("; ")}`,
        filePath,
        error
      );
    }

    throw error;
  }

  const baseUrl = resolveBaseUrl(document.servers, filePath);
  const endpoints = normalizeEndpoints(baseUrl, document.paths);

  if (endpoints.length === 0) {
    throw new OpenApiLoaderError(
      `OpenAPI file did not produce any supported endpoints: ${filePath}`,
      filePath
    );
  }

  return {
    baseUrl,
    endpoints
  };
};
