import { sql } from "drizzle-orm";

import type { ReportDefinition } from "@crud-engine/reports";

import { members } from "./schema";

export const memberReports: ReportDefinition[] = [
  {
    name: "member-count",
    execute: async (ctx) => {
      const [row] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(members);
      return { count: Number(row?.count ?? 0) };
    },
  },
];
