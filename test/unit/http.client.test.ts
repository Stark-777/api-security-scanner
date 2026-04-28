import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "../../src/http/client.js";
import { REDACTED_VALUE, type Logger } from "../../src/utils/logger.js";

describe("http client", () => {
  it("merges default and request headers", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {
        "content-type": "application/json"
      },
      data: { ok: true }
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const logger: Logger = { info: vi.fn(), error: vi.fn() };
    const client = new HttpClient({
      axiosInstance,
      logger,
      defaultHeaders: {
        Authorization: "Bearer secret-token",
        Accept: "application/json"
      },
      timeoutMs: 4000
    });

    await client.request({
      url: "https://api.example.com/users",
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
        "X-Trace-Id": "trace-123"
      }
    });

    expect(request).toHaveBeenCalledWith({
      url: "https://api.example.com/users",
      method: "GET",
      timeout: 4000,
      data: undefined,
      headers: {
        Authorization: "Bearer secret-token",
        Accept: "application/vnd.api+json",
        "X-Trace-Id": "trace-123"
      }
    });
  });

  it("supports per-request timeout overrides", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {},
      data: null
    });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const client = new HttpClient({ axiosInstance, timeoutMs: 5000 });

    await client.request({
      url: "https://api.example.com/health",
      method: "GET",
      timeoutMs: 1500
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 1500
      })
    );
  });

  it("redacts sensitive request headers in logs", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      headers: {
        "set-cookie": "session=secret"
      },
      data: null
    });
    const info = vi.fn();
    const logger: Logger = { info, error: vi.fn() };
    const axiosInstance = { request } as unknown as AxiosInstance;
    const client = new HttpClient({ axiosInstance, logger });

    await client.request({
      url: "https://api.example.com/login",
      method: "POST",
      headers: {
        Authorization: "Bearer secret-token"
      },
      data: {
        username: "demo"
      }
    });

    expect(info).toHaveBeenNthCalledWith(1, "HTTP request", {
      url: "https://api.example.com/login",
      method: "POST",
      timeoutMs: 5000,
      headers: {
        Authorization: REDACTED_VALUE
      }
    });

    expect(info).toHaveBeenNthCalledWith(2, "HTTP response", {
      url: "https://api.example.com/login",
      method: "POST",
      status: 200,
      headers: {
        "set-cookie": REDACTED_VALUE
      }
    });
  });
});
