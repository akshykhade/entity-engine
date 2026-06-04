export const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
  },
  required: ["error", "code"],
} as const;

export const entityNameParamsSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Entity name or slug (e.g. Member or member)",
    },
  },
  required: ["name"],
} as const;

export const entityRecordParamsSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Entity registry name (e.g. Member)",
    },
    id: {
      type: "string",
      description: "Primary key of the record",
    },
  },
  required: ["name", "id"],
} as const;

export const entityActionParamsSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    id: { type: "string" },
    action: { type: "string", description: "Custom action name" },
  },
  required: ["name", "id", "action"],
} as const;

export const fieldMetaSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    searchable: { type: "boolean" },
    sortable: { type: "boolean" },
    required: { type: "boolean" },
  },
  required: ["label"],
} as const;

export const relationMetaSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["link"] },
    entity: { type: "string" },
    label: { type: "string" },
  },
  required: ["type", "entity"],
} as const;

export const entityMetaSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    primaryKey: { type: "string" },
    audit: { type: "boolean" },
    softDelete: { type: "boolean" },
    fields: {
      type: "object",
      additionalProperties: fieldMetaSchema,
    },
    relations: {
      type: "object",
      additionalProperties: relationMetaSchema,
    },
  },
  required: ["name", "slug", "primaryKey", "audit", "softDelete", "fields", "relations"],
} as const;

export const entityRecordSchema = {
  type: "object",
  additionalProperties: true,
  description: "Entity record with system and user-defined fields",
} as const;

export const listQuerySchema = {
  type: "object",
  properties: {
    search: { type: "string", description: "Search across searchable fields" },
    page: { type: "integer", minimum: 1, default: 1 },
    pageSize: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    filters: {
      type: "string",
      description: "JSON-encoded array of filter objects",
    },
    sort: {
      type: "string",
      description: 'JSON-encoded sort object, e.g. {"field":"name","direction":"asc"}',
    },
  },
} as const;

export const listResultSchema = {
  type: "object",
  properties: {
    data: {
      type: "array",
      items: entityRecordSchema,
    },
    total: { type: "integer" },
    page: { type: "integer" },
    pageSize: { type: "integer" },
  },
  required: ["data", "total", "page", "pageSize"],
} as const;

export const entityWriteBodySchema = {
  type: "object",
  additionalProperties: true,
  description: "Writable entity fields",
} as const;

export const auditLogEntrySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    entity: { type: "string" },
    recordId: { type: "string" },
    action: { type: "string" },
    before: {
      type: ["object", "null"],
      additionalProperties: true,
    },
    after: {
      type: ["object", "null"],
      additionalProperties: true,
    },
    actorId: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
  required: [
    "id",
    "entity",
    "recordId",
    "action",
    "before",
    "after",
    "actorId",
    "createdAt",
  ],
} as const;

export const auditLogListSchema = {
  type: "array",
  items: auditLogEntrySchema,
} as const;

export const deleteResultSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
  },
  required: ["success"],
} as const;

export const permissionGrantSchema = {
  type: "object",
  properties: {
    role: { type: "string" },
    entity: { type: "string" },
    action: { type: "string" },
    allowed: { type: "boolean" },
  },
  required: ["role", "entity", "action", "allowed"],
} as const;

export const permissionMatrixEntitySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    actions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["name", "actions"],
} as const;

export const permissionMatrixSchema = {
  type: "object",
  properties: {
    roles: {
      type: "array",
      items: { type: "string" },
    },
    entities: {
      type: "array",
      items: permissionMatrixEntitySchema,
    },
    grants: {
      type: "array",
      items: permissionGrantSchema,
    },
  },
  required: ["roles", "entities", "grants"],
} as const;

export const permissionMeSchema = {
  type: "object",
  properties: {
    roles: {
      type: "array",
      items: { type: "string" },
    },
    permissions: {
      type: "object",
      additionalProperties: {
        type: "object",
        additionalProperties: { type: "boolean" },
      },
    },
  },
  required: ["roles", "permissions"],
} as const;

export const roleRecordSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    label: { type: ["string", "null"] },
  },
  required: ["id", "name", "label"],
} as const;

export const roleListSchema = {
  type: "object",
  properties: {
    roles: {
      type: "array",
      items: roleRecordSchema,
    },
  },
  required: ["roles"],
} as const;

export const roleMeSchema = {
  type: "object",
  properties: {
    roles: {
      type: "array",
      items: { type: "string" },
    },
    userId: { type: ["string", "null"] },
  },
  required: ["roles", "userId"],
} as const;

export const entityTags = ["Entity Engine"] as const;
export const permissionTags = ["Permissions"] as const;
export const roleTags = ["Roles"] as const;
