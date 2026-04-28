import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";

import { Scanner } from "../../src/core/scanner.js";
import { HttpClient } from "../../src/http/client.js";
import type { Logger } from "../../src/utils/logger.js";

const createLogger = (): Logger => {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
};

describe("scanner", () => {
  it("accepts endpoints and sends requests for each one", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        headers: {
          "content-type": "application/json"
        },
        data: { ok: true }
      })
      .mockResolvedValueOnce({
        status: 204,
        headers: {},
        data: null
      });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const logger = createLogger();
    const httpClient = new HttpClient({ axiosInstance, logger });
    const scanner = new Scanner({ httpClient, logger });

    const results = await scanner.scanEndpoints([
      {
        url: "https://api.example.com/health",
        method: "GET"
      },
      {
        url: "https://api.example.com/logout",
        method: "POST",
        headers: {
          Authorization: "Bearer secret-token"
        }
      }
    ]);

    expect(request).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledWith("Scanner started", {
      endpointsScanned: 2
    });
    expect(logger.info).toHaveBeenCalledWith("Scanner completed", {
      endpointsScanned: 2,
      responsesCollected: 2
    });
    expect(results).toEqual([
      {
        endpoint: {
          url: "https://api.example.com/health",
          method: "GET"
        },
        response: {
          status: 200,
          headers: {
            "content-type": "application/json"
          },
          data: { ok: true }
        }
      },
      {
        endpoint: {
          url: "https://api.example.com/logout",
          method: "POST",
          headers: {
            Authorization: "Bearer secret-token"
          }
        },
        response: {
          status: 204,
          headers: {},
          data: null
        }
      }
    ]);
  });

  it("stores responses in endpoint order", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: "/v1/jobs/1"
        },
        data: { id: 1 }
      })
      .mockResolvedValueOnce({
        status: 202,
        headers: {
          location: "/v1/jobs/2"
        },
        data: { id: 2 }
      });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const scanner = new Scanner({
      httpClient: new HttpClient({
        axiosInstance,
        logger: createLogger()
      })
    });

    const results = await scanner.scanEndpoints([
      {
        url: "https://api.example.com/v1/jobs",
        method: "POST",
        body: {
          name: "first"
        }
      },
      {
        url: "https://api.example.com/v1/jobs",
        method: "POST",
        body: {
          name: "second"
        }
      }
    ]);

    expect(results.map((result) => result.response.status)).toEqual([201, 202]);
  });

  it("logs endpoint failures before rethrowing", async () => {
    const error = new Error("network unavailable");
    const logger = createLogger();
    const request = vi.fn().mockRejectedValue(error);
    const axiosInstance = { request } as unknown as AxiosInstance;
    const scanner = new Scanner({
      logger,
      httpClient: new HttpClient({
        axiosInstance,
        logger
      })
    });

    await expect(
      scanner.scanEndpoints([
        {
          url: "https://api.example.com/health",
          method: "GET"
        }
      ])
    ).rejects.toThrow("HTTP request failed for GET https://api.example.com/health");

    expect(logger.error).toHaveBeenCalledWith("Endpoint scan failed", {
      url: "https://api.example.com/health",
      method: "GET",
      error: expect.objectContaining({
        name: "HttpClientError",
        message: "HTTP request failed for GET https://api.example.com/health"
      })
    });
  });
});
