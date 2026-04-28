import type { Endpoint, ProbeResult } from "./types.js";
import {
  createHttpClient,
  type HttpClientOptions
} from "../http/client.js";
import type { HttpClient } from "../http/client.js";
import { createLogger, type Logger } from "../utils/logger.js";

export interface ScannerOptions {
  httpClient?: HttpClient;
  httpClientOptions?: HttpClientOptions;
  logger?: Logger;
}

export class Scanner {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  constructor(options: ScannerOptions = {}) {
    this.logger = options.logger ?? createLogger();
    this.httpClient =
      options.httpClient ?? createHttpClient(options.httpClientOptions);
  }

  async scanEndpoints(endpoints: Endpoint[]): Promise<ProbeResult[]> {
    this.logger.info("Scanner started", {
      endpointsScanned: endpoints.length
    });

    const results: ProbeResult[] = [];

    for (const endpoint of endpoints) {
      this.logger.info("Scanning endpoint", {
        url: endpoint.url,
        method: endpoint.method
      });

      try {
        const response = await this.httpClient.request({
          url: endpoint.url,
          method: endpoint.method,
          headers: endpoint.headers,
          data: endpoint.body
        });

        results.push({
          endpoint,
          response
        });
      } catch (error) {
        this.logger.error("Endpoint scan failed", {
          url: endpoint.url,
          method: endpoint.method,
          error
        });

        throw error;
      }
    }

    this.logger.info("Scanner completed", {
      endpointsScanned: endpoints.length,
      responsesCollected: results.length
    });

    return results;
  }
}

export const createScanner = (options: ScannerOptions = {}): Scanner => {
  return new Scanner(options);
};
