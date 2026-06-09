"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  checkEmailTaken,
  createUser,
  fetchUser,
  fetchUsers,
  fetchUserSessions,
  revokeOtherUserSessions,
  revokeUserSession,
  setUserPassword,
  updateUser,
} from "@/lib/api/users";
import type { ListAdminUsersOptions, UserFormData } from "@/lib/types/entity";

export function useUsers(options: ListAdminUsersOptions = {}) {
  return useQuery({
    queryKey: ["users", options],
    queryFn: () => fetchUsers(options),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUser(id),
    enabled: Boolean(id),
  });
}

export function useUserSessions(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "sessions"],
    queryFn: () => fetchUserSessions(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserFormData & { password?: string }) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserFormData) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useSetUserPassword(id: string) {
  return useMutation({
    mutationFn: (password: string) => setUserPassword(id, password),
  });
}

export function useCheckEmailTaken(email: string, excludeId?: string, enabled = true) {
  return useQuery({
    queryKey: ["users", "check-email", email, excludeId],
    queryFn: () => checkEmailTaken(email, excludeId),
    enabled: enabled && email.includes("@"),
  });
}

export function useRevokeUserSession(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeUserSession(userId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "sessions"] });
    },
  });
}

export function useRevokeOtherUserSessions(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => revokeOtherUserSessions(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "sessions"] });
    },
  });
}
