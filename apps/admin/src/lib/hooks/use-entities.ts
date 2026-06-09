"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEntityRecord,
  deleteEntityRecord,
  fetchEntityCatalog,
  fetchEntityMeta,
  fetchEntityRecord,
  fetchEntityRecords,
  fetchRecordAuditLog,
  runEntityAction,
  updateEntityRecord,
  type ListRecordsResult,
} from "@/lib/api/entities";
import type { EntityMeta, EntityRecord, ListRecordsOptions } from "@/lib/types/entity";

export function useEntityCatalog() {
  return useQuery({
    queryKey: ["entities", "catalog"],
    queryFn: fetchEntityCatalog,
  });
}

export function useEntityMeta(slug: string) {
  return useQuery({
    queryKey: ["entities", slug, "meta"],
    queryFn: () => fetchEntityMeta(slug),
    enabled: Boolean(slug),
  });
}

export function useEntityRecords(
  slug: string,
  options: ListRecordsOptions & { page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: ["entities", slug, "records", options],
    queryFn: () => fetchEntityRecords(slug, options),
    enabled: Boolean(slug),
  });
}

export function useEntityRecord(slug: string, id: string) {
  return useQuery({
    queryKey: ["entities", slug, "record", id],
    queryFn: () => fetchEntityRecord(slug, id),
    enabled: Boolean(slug && id),
  });
}

export function useRecordAuditLog(slug: string, id: string) {
  return useQuery({
    queryKey: ["entities", slug, "record", id, "audit"],
    queryFn: () => fetchRecordAuditLog(slug, id),
    enabled: Boolean(slug && id),
  });
}

export function useCreateEntityRecord(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createEntityRecord(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities", slug, "records"] });
      queryClient.invalidateQueries({ queryKey: ["entities", "catalog"] });
    },
  });
}

export function useUpdateEntityRecord(slug: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateEntityRecord(slug, id, data),
    onSuccess: (record: EntityRecord) => {
      queryClient.setQueryData(["entities", slug, "record", id], record);
      queryClient.invalidateQueries({ queryKey: ["entities", slug, "records"] });
      queryClient.invalidateQueries({ queryKey: ["entities", slug, "record", id, "audit"] });
    },
  });
}

export function useDeleteEntityRecord(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntityRecord(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities", slug, "records"] });
    },
  });
}

export function useRunEntityAction(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      runEntityAction(slug, id, action),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entities", slug, "record", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["entities", slug, "records"] });
    },
  });
}

export type { EntityMeta, ListRecordsResult };
