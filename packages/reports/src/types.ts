import type { createDb } from "@crud-engine/db";

export type ReportContext = {
  db: ReturnType<typeof createDb>;
};

export type ReportDefinition<T = unknown> = {
  name: string;
  execute: (ctx: ReportContext) => Promise<T>;
};
