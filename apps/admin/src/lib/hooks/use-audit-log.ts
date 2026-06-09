"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAuditLog, type ListAuditLogOptions } from "@/lib/api/audit-log";

export function useAuditLog(options: ListAuditLogOptions = {}) {
  return useQuery({
    queryKey: ["audit-log", options],
    queryFn: () => fetchAuditLog(options),
  });
}
