import { apiFetch } from "@/lib/api/client";
import type { EntityMeta, EntityRecord, ListRecordsOptions } from "@/lib/types/entity";

export type ListRecordsResult = {
  data: EntityRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type AuditLogApiEntry = {
  id: string;
  entity: string;
  recordId: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  actorId: string;
  createdAt: string;
};

function parseRecord(row: Record<string, unknown>): EntityRecord {
  return {
    ...row,
    createdAt: row.createdAt ? new Date(String(row.createdAt)) : new Date(),
    updatedAt: row.updatedAt ? new Date(String(row.updatedAt)) : new Date(),
  } as EntityRecord;
}

export async function fetchEntityCatalog(): Promise<EntityMeta[]> {
  const body = await apiFetch<{ entities: EntityMeta[] }>("/api/entities");
  return body.entities;
}

export async function fetchEntityMeta(slug: string): Promise<EntityMeta> {
  return apiFetch<EntityMeta>(`/api/entity/${slug}/meta`);
}

export async function fetchEntityRecords(
  slug: string,
  options: ListRecordsOptions & { page?: number; pageSize?: number } = {},
): Promise<ListRecordsResult> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("pageSize", String(options.pageSize));
  if (options.filters && Object.keys(options.filters).length > 0) {
    const filters = Object.entries(options.filters).map(([field, value]) => ({
      field,
      operator: "eq" as const,
      value,
    }));
    params.set("filters", JSON.stringify(filters));
  }
  if (options.sort) {
    // Server expects nested query params, not a JSON string (see listQuerySchema.sort).
    params.set("sort[field]", options.sort.field);
    params.set("sort[direction]", options.sort.direction);
  }

  const query = params.toString();
  const body = await apiFetch<ListRecordsResult>(
    `/api/entity/${slug}${query ? `?${query}` : ""}`,
  );
  return {
    ...body,
    data: body.data.map((row) => parseRecord(row as Record<string, unknown>)),
  };
}

export async function fetchEntityRecord(slug: string, id: string): Promise<EntityRecord> {
  const row = await apiFetch<Record<string, unknown>>(`/api/entity/${slug}/${id}`);
  return parseRecord(row);
}

export async function createEntityRecord(
  slug: string,
  data: Record<string, unknown>,
): Promise<EntityRecord> {
  const row = await apiFetch<Record<string, unknown>>(`/api/entity/${slug}`, {
    method: "POST",
    json: data,
  });
  return parseRecord(row);
}

export async function updateEntityRecord(
  slug: string,
  id: string,
  data: Record<string, unknown>,
): Promise<EntityRecord> {
  const row = await apiFetch<Record<string, unknown>>(`/api/entity/${slug}/${id}`, {
    method: "PUT",
    json: data,
  });
  return parseRecord(row);
}

export async function deleteEntityRecord(slug: string, id: string): Promise<void> {
  await apiFetch(`/api/entity/${slug}/${id}`, { method: "DELETE" });
}

export async function runEntityAction(
  slug: string,
  id: string,
  action: string,
): Promise<unknown> {
  return apiFetch(`/api/entity/${slug}/${id}/action/${action}`, { method: "POST" });
}

export async function fetchRecordAuditLog(
  slug: string,
  id: string,
): Promise<AuditLogApiEntry[]> {
  return apiFetch<AuditLogApiEntry[]>(`/api/entity/${slug}/${id}/audit_log`);
}
