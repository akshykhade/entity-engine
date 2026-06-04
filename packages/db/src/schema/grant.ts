import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { roles } from "./role";

export const permissionGrants = sqliteTable(
  "permission_grants",
  {
    id: text("id").primaryKey(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    entity: text("entity").notNull(),
    action: text("action").notNull(),
    allowed: integer("allowed", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    unique("permission_grants_role_entity_action_unique").on(
      table.roleId,
      table.entity,
      table.action,
    ),
  ],
);
