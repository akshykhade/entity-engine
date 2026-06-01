import { z } from "zod";

export const filterOperatorSchema = z.enum([
  "eq",
  "neq",
  "contains",
  "startsWith",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
]);

export const filterSchema = z.object({
  field: z.string(),
  operator: filterOperatorSchema,
  value: z.unknown(),
});

export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(["asc", "desc"]).default("asc"),
});

export const listQuerySchema = z.object({
  filters: z
    .union([z.array(filterSchema), z.string()])
    .optional()
    .transform((value) => {
      if (typeof value === "string") {
        return JSON.parse(value) as Filter[];
      }
      return value;
    }),
  search: z.string().optional(),
  sort: sortSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type FilterOperator = z.infer<typeof filterOperatorSchema>;
export type Filter = z.infer<typeof filterSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;

export type ListResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
