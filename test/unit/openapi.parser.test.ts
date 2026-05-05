import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadOpenApiInput } from "../../src/parsers/openapi.parser.js";
import type { OpenApiLoaderError } from "../../src/parsers/openapi.parser.js";

describe("openapi parser", () => {
  it("loads OpenAPI JSON and extracts endpoints", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "openapi-json-"));
    const filePath = join(tempDirectory, "openapi.json");

    await writeFile(
      filePath,
      JSON.stringify({
        openapi: "3.0.3",
        servers: [{ url: "https://api.example.com" }],
        paths: {
          "/users": {
            get: {
              summary: "List users"
            },
            post: {
              description: "Create user"
            }
          },
          "/ignored": {
            trace: {
              summary: "Ignore unsupported methods"
            }
          }
        }
      })
    );

    const result = await loadOpenApiInput(filePath);

    expect(result.baseUrl).toBe("https://api.example.com");
    expect(result.endpoints).toEqual([
      {
        url: "https://api.example.com/users",
        method: "GET",
        description: "List users"
      },
      {
        url: "https://api.example.com/users",
        method: "POST",
        description: "Create user"
      }
    ]);
  });

  it("loads OpenAPI YAML and extracts endpoints", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "openapi-yaml-"));
    const filePath = join(tempDirectory, "openapi.yaml");

    await writeFile(
      filePath,
      `
openapi: 3.0.3
servers:
  - url: https://api.example.com/base/
paths:
  /health:
    get:
      summary: Health check
`
    );

    const result = await loadOpenApiInput(filePath);

    expect(result.endpoints).toEqual([
      {
        url: "https://api.example.com/health",
        method: "GET",
        description: "Health check"
      }
    ]);
  });

  it("fails clearly for malformed spec files", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "openapi-invalid-"));
    const filePath = join(tempDirectory, "broken.json");

    await writeFile(filePath, "{broken");

    await expect(loadOpenApiInput(filePath)).rejects.toMatchObject<OpenApiLoaderError>({
      name: "OpenApiLoaderError",
      filePath
    });
  });

  it("fails when no valid server URL is available", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "openapi-server-"));
    const filePath = join(tempDirectory, "openapi.json");

    await writeFile(
      filePath,
      JSON.stringify({
        openapi: "3.0.3",
        paths: {
          "/users": {
            get: {
              summary: "List users"
            }
          }
        }
      })
    );

    await expect(loadOpenApiInput(filePath)).rejects.toMatchObject<OpenApiLoaderError>({
      name: "OpenApiLoaderError",
      filePath,
      message: `OpenAPI file must include at least one valid absolute server URL: ${filePath}`
    });
  });

  it("fails when the file does not produce supported endpoints", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "openapi-empty-"));
    const filePath = join(tempDirectory, "openapi.json");

    await writeFile(
      filePath,
      JSON.stringify({
        openapi: "3.0.3",
        servers: [{ url: "https://api.example.com" }],
        paths: {
          "/users": {
            trace: {
              summary: "Unsupported"
            }
          }
        }
      })
    );

    await expect(loadOpenApiInput(filePath)).rejects.toMatchObject<OpenApiLoaderError>({
      name: "OpenApiLoaderError",
      filePath,
      message: `OpenAPI file did not produce any supported endpoints: ${filePath}`
    });
  });
});
