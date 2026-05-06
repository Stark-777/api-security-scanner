import type { ScanReport } from "../core/types.js";

export interface Reporter {
  render(report: ScanReport): Promise<void> | void;
}
