import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";

import { Scanner } from "../../src/core/scanner.js";
import { HttpClient } from "../../src/http/client.js";
import type { Logger } from "../../src/utils/logger.js";

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
    const logger: Logger = { info: vi.fn(), error: vi.fn() };
    const httpClient = new HttpClient({ axiosInstance, logger });
    const scanner = new Scanner({ httpClient });

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
        logger: { info: vi.fn(), error: vi.fn() }
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
});
