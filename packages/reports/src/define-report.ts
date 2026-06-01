import { reportRegistry } from "./registry";
import type { ReportDefinition } from "./types";

export function defineReport<T>(
  report: ReportDefinition<T>,
): ReportDefinition<T> {
  return reportRegistry.register(report);
}
