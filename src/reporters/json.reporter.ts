import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { ScanReport } from "../core/types.js";
import { sanitizeScanReport } from "./helpers.js";
import type { Reporter } from "./reporter.js";

export class JsonReporter implements Reporter {
  generate(report: ScanReport): string {
    return JSON.stringify(sanitizeScanReport(report), null, 2);
  }

  render(report: ScanReport): void {
    process.stdout.write(`${this.generate(report)}\n`);
  }

  async write(report: ScanReport, filePath: string): Promise<void> {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, this.generate(report), "utf8");
  }
}

export const createJsonReporter = (): JsonReporter => {
  return new JsonReporter();
};
