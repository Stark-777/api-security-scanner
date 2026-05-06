import { describe, expect, it, vi } from "vitest";

import {
  REDACTED_VALUE,
  createLogger,
  redactHeaders,
  redactSensitiveData,
  redactSensitiveString
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

  it("redacts sensitive values embedded in strings", () => {
    expect(
      redactSensitiveString(
        "Authorization: Bearer secret-token?token=abc123&password=hunter2"
      )
    ).toBe(
      "Authorization: Bearer [REDACTED]?token=[REDACTED]&password=[REDACTED]"
    );
  });

  it("logs redacted metadata", () => {
    const info = vi.fn();
    const warn = vi.fn();
    const error = vi.fn();
    const logger = createLogger({ info, warn, error });

    logger.info("request", {
      authorization: "Bearer secret-token",
      traceId: "123"
    });

    expect(info).toHaveBeenCalledWith("request", {
      authorization: REDACTED_VALUE,
      traceId: "123"
    });
  });

  it("supports warn logging with redaction", () => {
    const info = vi.fn();
    const warn = vi.fn();
    const error = vi.fn();
    const logger = createLogger({ info, warn, error });

    logger.warn("warning", {
      apiKey: "super-secret",
      operation: "scan"
    });

    expect(warn).toHaveBeenCalledWith("warning", {
      apiKey: REDACTED_VALUE,
      operation: "scan"
    });
  });
});
