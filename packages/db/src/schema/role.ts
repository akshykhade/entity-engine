import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const roles = sqliteTable(
  "roles",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    label: text("label"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [unique("roles_name_unique").on(table.name)],
);

export const userRoles = sqliteTable(
  "user_roles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    unique("user_roles_user_role_unique").on(table.userId, table.roleId),
    index("user_roles_userId_idx").on(table.userId),
    index("user_roles_roleId_idx").on(table.roleId),
  ],
);
