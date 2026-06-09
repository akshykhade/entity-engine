import { apiFetch } from "@/lib/api/client";
import type { AuditLogEntry } from "@/lib/types/entity";

export type ListAuditLogOptions = {
  search?: string;
  entity?: string;
  action?: string;
  actorId?: string;
  page?: number;
  pageSize?: number;
};

export type ListAuditLogResult = {
  entries: AuditLogEntry[];
  total: number;
};

export async function fetchAuditLog(
  options: ListAuditLogOptions = {},
): Promise<ListAuditLogResult> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.entity) params.set("entity", options.entity);
  if (options.action) params.set("action", options.action);
  if (options.actorId) params.set("actorId", options.actorId);
  if (options.page) params.set("page", String(options.page));
  if (options.pageSize) params.set("pageSize", String(options.pageSize));

  const query = params.toString();
  const body = await apiFetch<{
    entries: Array<Omit<AuditLogEntry, "createdAt"> & { createdAt: string }>;
    total: number;
  }>(`/api/admin/audit-log${query ? `?${query}` : ""}`);

  return {
    total: body.total,
    entries: body.entries.map((entry) => ({
      ...entry,
      action: entry.action as AuditLogEntry["action"],
      createdAt: new Date(entry.createdAt),
    })),
  };
}
