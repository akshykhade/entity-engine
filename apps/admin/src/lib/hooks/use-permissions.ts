"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteGrant,
  fetchPermissionMatrix,
  upsertGrant,
} from "@/lib/api/permissions";

export function usePermissionMatrix() {
  return useQuery({
    queryKey: ["permissions", "matrix"],
    queryFn: fetchPermissionMatrix,
  });
}

export function useUpsertGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      entity,
      action,
      allowed,
    }: {
      roleId: string;
      entity: string;
      action: string;
      allowed: boolean;
    }) => upsertGrant(roleId, entity, action, allowed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "matrix"] });
    },
  });
}

export function useDeleteGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      entity,
      action,
    }: {
      roleId: string;
      entity: string;
      action: string;
    }) => deleteGrant(roleId, entity, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "matrix"] });
    },
  });
}
