import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  entity: text("entity").notNull(),
  recordId: text("record_id").notNull(),
  action: text("action").notNull(),
  before: text("before"),
  after: text("after"),
  actorId: text("actor_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
