import type { Endpoint, ProbeResult } from "./types.js";
import {
  createHttpClient,
  type HttpClientOptions
} from "../http/client.js";
import type { HttpClient } from "../http/client.js";

export interface ScannerOptions {
  httpClient?: HttpClient;
  httpClientOptions?: HttpClientOptions;
}

export class Scanner {
  private readonly httpClient: HttpClient;

  constructor(options: ScannerOptions = {}) {
    this.httpClient =
      options.httpClient ?? createHttpClient(options.httpClientOptions);
  }

  async scanEndpoints(endpoints: Endpoint[]): Promise<ProbeResult[]> {
    const results: ProbeResult[] = [];

    for (const endpoint of endpoints) {
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
    }

    return results;
  }
}

export const createScanner = (options: ScannerOptions = {}): Scanner => {
  return new Scanner(options);
};
