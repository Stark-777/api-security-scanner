import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponseHeaders
} from "axios";

import type { HttpMethod } from "../core/types.js";
import {
  createLogger,
  redactHeaders,
  type Logger
} from "../utils/logger.js";

export interface HttpClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  axiosInstance?: AxiosInstance;
  logger?: Logger;
}

export interface HttpRequestOptions {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  data?: unknown;
  timeoutMs?: number;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  data: unknown;
}

export class HttpClientError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly timeoutMs?: number;
  readonly url: string;
  readonly method: HttpMethod;

  constructor(options: {
    message: string;
    url: string;
    method: HttpMethod;
    code?: string;
    status?: number;
    timeoutMs?: number;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "HttpClientError";
    this.code = options.code;
    this.status = options.status;
    this.timeoutMs = options.timeoutMs;
    this.url = options.url;
    this.method = options.method;
  }
}

const normalizeHeaders = (
  headers: AxiosResponseHeaders | Record<string, unknown> | undefined
): Record<string, string> => {
  if (headers === undefined) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, String(value)])
  );
};

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeoutMs: number;
  private readonly logger: Logger;

  constructor(options: HttpClientOptions = {}) {
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.defaultTimeoutMs = options.timeoutMs ?? 5000;
    this.logger = options.logger ?? createLogger();
    this.axiosInstance =
      options.axiosInstance ??
      axios.create({
        baseURL: options.baseUrl,
        timeout: this.defaultTimeoutMs
      });
  }

  mergeHeaders(
    headers: Record<string, string> = {}
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...headers
    };
  }

  async request(options: HttpRequestOptions): Promise<HttpResponse> {
    const headers = this.mergeHeaders(options.headers);
    const timeout = options.timeoutMs ?? this.defaultTimeoutMs;

    this.logger.info("HTTP request", {
      url: options.url,
      method: options.method,
      timeoutMs: timeout,
      headers: redactHeaders(headers)
    });

    try {
      const response = await this.axiosInstance.request({
        url: options.url,
        method: options.method,
        headers,
        data: options.data,
        timeout
      });

      const responseHeaders = normalizeHeaders(response.headers);

      this.logger.info("HTTP response", {
        url: options.url,
        method: options.method,
        status: response.status,
        headers: redactHeaders(responseHeaders)
      });

      return {
        status: response.status,
        headers: responseHeaders,
        data: response.data
      };
    } catch (error) {
      throw this.handleRequestError(error, options, headers, timeout);
    }
  }

  private handleRequestError(
    error: unknown,
    options: HttpRequestOptions,
    headers: Record<string, string>,
    timeout: number
  ): HttpClientError {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const responseHeaders = normalizeHeaders(error.response?.headers);
      const message = this.createErrorMessage({
        url: options.url,
        method: options.method,
        status,
        code: error.code,
        timeout
      });

      this.logger.error("HTTP request failed", {
        url: options.url,
        method: options.method,
        timeoutMs: timeout,
        status,
        code: error.code,
        headers: redactHeaders(headers),
        responseHeaders: redactHeaders(responseHeaders),
        message: error.message
      });

      return new HttpClientError({
        message,
        url: options.url,
        method: options.method,
        code: error.code,
        status,
        timeoutMs: timeout,
        cause: error
      });
    }

    this.logger.error("HTTP request failed", {
      url: options.url,
      method: options.method,
      timeoutMs: timeout,
      headers: redactHeaders(headers),
      error
    });

    return new HttpClientError({
      message: `HTTP request failed for ${options.method} ${options.url}`,
      url: options.url,
      method: options.method,
      timeoutMs: timeout,
      cause: error
    });
  }

  private createErrorMessage(options: {
    url: string;
    method: HttpMethod;
    status?: number;
    code?: string;
    timeout: number;
  }): string {
    if (options.code === "ECONNABORTED") {
      return `HTTP request timed out for ${options.method} ${options.url} after ${options.timeout}ms. Consider increasing timeoutMs or checking API availability.`;
    }

    if (options.code === "ENOTFOUND" || options.code === "EAI_AGAIN") {
      return `HTTP request failed for ${options.method} ${options.url} because the host could not be resolved. Check the hostname and your network or DNS configuration.`;
    }

    if (options.code === "ECONNREFUSED") {
      return `HTTP request failed for ${options.method} ${options.url} because the connection was refused. Confirm that the API is running and reachable.`;
    }

    if (options.status !== undefined) {
      return `HTTP request failed for ${options.method} ${options.url} with status ${options.status}`;
    }

    return `HTTP request failed for ${options.method} ${options.url}`;
  }
}

export const createHttpClient = (
  options: HttpClientOptions = {}
): HttpClient => {
  return new HttpClient(options);
};
