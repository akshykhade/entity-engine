import type { ReportDefinition } from "./types";

export class ReportRegistry {
  private reports = new Map<string, ReportDefinition>();

  register<T>(report: ReportDefinition<T>): ReportDefinition<T> {
    this.reports.set(report.name, report);
    return report;
  }

  get(name: string): ReportDefinition {
    const report = this.reports.get(name);
    if (!report) {
      throw new Error(`Report "${name}" not found`);
    }
    return report;
  }

  list(): ReportDefinition[] {
    return Array.from(this.reports.values());
  }
}

export const reportRegistry = new ReportRegistry();
