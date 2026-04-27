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
