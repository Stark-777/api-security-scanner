import type { Finding } from "./finding.js";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface Endpoint {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  description?: string;
}

export interface ScannerConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  endpoints: Endpoint[];
}

export interface ProbeResult {
  endpoint: Endpoint;
  response: {
    status: number;
    headers: Record<string, string>;
    data: unknown;
  };
}

export interface ScanSummary {
  endpointsScanned: number;
  findingsBySeverity: Record<string, number>;
  totalFindings: number;
}

export interface ScanReport {
  summary: ScanSummary;
  findings: Finding[];
}
