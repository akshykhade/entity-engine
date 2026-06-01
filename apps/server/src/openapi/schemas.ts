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
      description: "Entity registry name (e.g. Member)",
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

export const entityMetaSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    primaryKey: { type: "string" },
    fields: {
      type: "object",
      additionalProperties: fieldMetaSchema,
    },
  },
  required: ["name", "primaryKey", "fields"],
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

export const deleteResultSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
  },
  required: ["success"],
} as const;

export const entityTags = ["Entity Engine"] as const;
