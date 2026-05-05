import type { Endpoint, ScanInput } from "../core/types.js";
import { loadConfig } from "./config.parser.js";
import { loadOpenApiInput } from "./openapi.parser.js";

export interface ResolvedScanInput {
  endpoints: Endpoint[];
  httpClientOptions?: {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
    timeoutMs?: number;
  };
}

const validateSingleEndpointUrl = (url: string): void => {
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid endpoint URL: ${url}`, { cause: error });
  }
};

export const resolveScanInput = async (
  input: ScanInput
): Promise<ResolvedScanInput> => {
  if (input.type === "config") {
    const config = await loadConfig(input.value.configPath);

    return {
      endpoints: config.endpoints,
      httpClientOptions: {
        baseUrl: config.baseUrl,
        defaultHeaders: config.defaultHeaders,
        timeoutMs: config.timeoutMs
      }
    };
  }

  if (input.type === "openapi") {
    const parsedOpenApi = await loadOpenApiInput(input.value.filePath);

    return {
      endpoints: parsedOpenApi.endpoints
    };
  }

  validateSingleEndpointUrl(input.value.url);

  return {
    endpoints: [
      {
        url: input.value.url,
        method: input.value.method
      }
    ]
  };
};
