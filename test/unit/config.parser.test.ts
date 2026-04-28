import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  configSchema,
  loadConfig,
  resolveEnvVariables
} from "../../src/parsers/config.parser.js";
import type { ConfigLoaderError } from "../../src/parsers/config.parser.js";

describe("config parser", () => {
  it("resolves environment variables in nested config values", () => {
    const result = resolveEnvVariables(
      {
        baseUrl: "${API_BASE_URL}",
        defaultHeaders: {
          Authorization: "Bearer ${API_TOKEN}"
        },
        endpoints: [
          {
            url: "${API_BASE_URL}/health",
            method: "GET"
          }
        ]
      },
      {
        API_BASE_URL: "https://api.example.com",
        API_TOKEN: "secret-token"
      }
    );

    expect(result).toEqual({
      baseUrl: "https://api.example.com",
      defaultHeaders: {
        Authorization: "Bearer secret-token"
      },
      endpoints: [
        {
          url: "https://api.example.com/health",
          method: "GET"
        }
      ]
    });
  });

  it("throws when a referenced environment variable is missing", () => {
    expect(() =>
      resolveEnvVariables(
        {
          endpoints: [
            {
              url: "${API_BASE_URL}/users",
              method: "GET"
            }
          ]
        },
        {}
      )
    ).toThrow("Missing environment variable: API_BASE_URL");
  });

  it("validates the final config shape with zod", () => {
    const result = configSchema.parse({
      timeoutMs: 5000,
      endpoints: [
        {
          url: "https://api.example.com/users",
          method: "GET"
        }
      ]
    });

    expect(result.timeoutMs).toBe(5000);
    expect(result.endpoints).toHaveLength(1);
  });

  it("loads a JSON config file from disk", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "scanner-config-"));
    const configPath = join(tempDirectory, "config.json");

    await writeFile(
      configPath,
      JSON.stringify({
        baseUrl: "${API_BASE_URL}",
        defaultHeaders: {
          Authorization: "Bearer ${API_TOKEN}"
        },
        timeoutMs: 3000,
        endpoints: [
          {
            url: "${API_BASE_URL}/v1/users",
            method: "GET",
            description: "List users"
          }
        ]
      })
    );

    const config = await loadConfig(configPath, {
      API_BASE_URL: "https://api.example.com",
      API_TOKEN: "abc123"
    });

    expect(config).toEqual({
      baseUrl: "https://api.example.com",
      defaultHeaders: {
        Authorization: "Bearer abc123"
      },
      timeoutMs: 3000,
      endpoints: [
        {
          url: "https://api.example.com/v1/users",
          method: "GET",
          description: "List users"
        }
      ]
    });
  });

  it("adds file context to invalid JSON errors", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "scanner-config-"));
    const configPath = join(tempDirectory, "broken.json");

    await writeFile(configPath, "{invalid-json");

    await expect(loadConfig(configPath)).rejects.toMatchObject<ConfigLoaderError>(
      {
        name: "ConfigLoaderError",
        filePath: configPath,
        message: `Invalid JSON in config file: ${configPath}`
      }
    );
  });

  it("adds file context to validation errors", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "scanner-config-"));
    const configPath = join(tempDirectory, "invalid.json");

    await writeFile(
      configPath,
      JSON.stringify({
        endpoints: []
      })
    );

    await expect(loadConfig(configPath)).rejects.toMatchObject<ConfigLoaderError>(
      {
        name: "ConfigLoaderError",
        filePath: configPath
      }
    );
  });
});
