import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { ScanReport } from "../core/types.js";

export class JsonReporter {
  generate(report: ScanReport): string {
    return JSON.stringify(report, null, 2);
  }

  async write(report: ScanReport, filePath: string): Promise<void> {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, this.generate(report), "utf8");
  }
}

export const createJsonReporter = (): JsonReporter => {
  return new JsonReporter();
};
