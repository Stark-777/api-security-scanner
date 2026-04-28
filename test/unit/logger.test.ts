import { describe, expect, it, vi } from "vitest";

import {
  REDACTED_VALUE,
  createLogger,
  redactHeaders,
  redactSensitiveData
} from "../../src/utils/logger.js";

describe("logger helpers", () => {
  it("redacts sensitive headers", () => {
    expect(
      redactHeaders({
        Authorization: "Bearer secret-token",
        "X-Api-Key": "top-secret",
        Accept: "application/json"
      })
    ).toEqual({
      Authorization: REDACTED_VALUE,
      "X-Api-Key": REDACTED_VALUE,
      Accept: "application/json"
    });
  });

  it("redacts nested sensitive metadata", () => {
    expect(
      redactSensitiveData({
        token: "abc123",
        profile: {
          password: "super-secret",
          name: "scanner"
        }
      })
    ).toEqual({
      token: REDACTED_VALUE,
      profile: {
        password: REDACTED_VALUE,
        name: "scanner"
      }
    });
  });

  it("logs redacted metadata", () => {
    const info = vi.fn();
    const error = vi.fn();
    const logger = createLogger({ info, error });

    logger.info("request", {
      authorization: "Bearer secret-token",
      traceId: "123"
    });

    expect(info).toHaveBeenCalledWith("request", {
      authorization: REDACTED_VALUE,
      traceId: "123"
    });
  });
});
