import { describe, expect, it, vi } from "vitest";

import { createCli } from "../../src/cli/index.js";

describe("cli bootstrap", () => {
  it("prints the bootstrap message", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const program = createCli();

    program.exitOverride();
    await program.parseAsync([], { from: "user" });

    expect(logSpy).toHaveBeenCalledWith("scanner started");
    logSpy.mockRestore();
  });
});
