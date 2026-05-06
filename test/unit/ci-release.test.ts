import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("ci and release assets", () => {
  it("defines a GitHub Actions workflow for validation", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(workflow).toContain("name: CI");
    expect(workflow).toContain("uses: actions/checkout@v4");
    expect(workflow).toContain("uses: actions/setup-node@v4");
    expect(workflow).toContain("run: npm ci");
    expect(workflow).toContain("run: npm run ci:check");
    expect(workflow).toContain("--fail-on high");
  });

  it("defines a runnable Docker image", async () => {
    const dockerfile = await readFile("Dockerfile", "utf8");

    expect(dockerfile).toContain("FROM node:20-alpine AS build");
    expect(dockerfile).toContain("RUN npm ci");
    expect(dockerfile).toContain("RUN npm run build");
    expect(dockerfile).toContain("ENTRYPOINT [\"node\", \"dist/cli/index.js\"]");
  });

  it("keeps package scripts aligned with CI documentation", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["ci:check"]).toBe(
      "npm run lint && npm run typecheck && npm run test && npm run build"
    );
    expect(packageJson.scripts["docker:build"]).toBe(
      "docker build -t api-security-scanner ."
    );
    expect(packageJson.scripts["release:smoke"]).toBe("npm run ci:check");
  });
});
