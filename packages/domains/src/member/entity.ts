import { defineEntity, field } from "@crud-engine/entities";

import { members } from "./schema";

export const member = defineEntity({
  name: "Member",
  slug: "member",
  table: members,
  primaryKey: "id",
  audit: true,
  fields: {
    memberCode: field({
      label: "Member Code",
      searchable: true,
      sortable: true,
      required: true,
    }),
    name: field({
      label: "Name",
      searchable: true,
      sortable: true,
      required: true,
    }),
  },
});
