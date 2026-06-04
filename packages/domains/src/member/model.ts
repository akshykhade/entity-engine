import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { defineEntity, field } from "@crud-engine/entities";

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  memberCode: text("member_code").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const member = defineEntity({
  name: "Member",
  slug: "member",
  table: members,
  primaryKey: "id",
  audit: true,
  fields: {
    memberCode: field(members.memberCode, {
      label: "Member Code",
      searchable: true,
      sortable: true,
    }),
    name: field(members.name, {
      label: "Name",
      searchable: true,
      sortable: true,
    }),
  },
});
