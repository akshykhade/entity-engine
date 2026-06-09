import { apiFetch } from "@/lib/api/client";
import type { AdminUser, ListAdminUsersOptions, UserFormData } from "@/lib/types/entity";

export type ListUsersResult = {
  users: AdminUser[];
  total: number;
};

export async function fetchUsers(
  options: ListAdminUsersOptions = {},
): Promise<ListUsersResult> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.roleId) params.set("roleId", options.roleId);
  if (options.status && options.status !== "all") params.set("status", options.status);
  if (options.sort) {
    params.set("sortField", options.sort.field);
    params.set("sortDirection", options.sort.direction);
  }
  const query = params.toString();
  const body = await apiFetch<{
    users: Array<Omit<AdminUser, "lastActive" | "createdAt"> & { lastActive: string; createdAt: string }>;
    total: number;
  }>(`/api/admin/users${query ? `?${query}` : ""}`);

  return {
    total: body.total,
    users: body.users.map(parseAdminUser),
  };
}

export async function fetchUser(id: string): Promise<AdminUser> {
  const body = await apiFetch<{
    user: Omit<AdminUser, "lastActive" | "createdAt"> & { lastActive: string; createdAt: string };
  }>(`/api/admin/users/${id}`);
  return parseAdminUser(body.user);
}

export async function createUser(data: UserFormData & { password?: string }): Promise<AdminUser> {
  const body = await apiFetch<{
    user: Omit<AdminUser, "lastActive" | "createdAt"> & { lastActive: string; createdAt: string };
    temporaryPassword?: string;
  }>("/api/admin/users", { method: "POST", json: data });
  return parseAdminUser(body.user);
}

export async function updateUser(id: string, data: UserFormData): Promise<AdminUser> {
  const body = await apiFetch<{
    user: Omit<AdminUser, "lastActive" | "createdAt"> & { lastActive: string; createdAt: string };
  }>(`/api/admin/users/${id}`, { method: "PUT", json: data });
  return parseAdminUser(body.user);
}

export async function checkEmailTaken(email: string, excludeId?: string): Promise<boolean> {
  const params = new URLSearchParams({ email });
  if (excludeId) params.set("excludeId", excludeId);
  const body = await apiFetch<{ taken: boolean }>(`/api/admin/users/check-email?${params}`);
  return body.taken;
}

export async function setUserPassword(id: string, password: string): Promise<void> {
  await apiFetch(`/api/admin/users/${id}/password`, {
    method: "POST",
    json: { password },
  });
}

export type UserSessionDto = {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  startedAt: string;
  lastActiveAt: string;
  current?: boolean;
};

export async function fetchUserSessions(userId: string): Promise<UserSessionDto[]> {
  const body = await apiFetch<{ sessions: UserSessionDto[] }>(
    `/api/admin/users/${userId}/sessions`,
  );
  return body.sessions;
}

export async function revokeUserSession(userId: string, sessionId: string): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function revokeOtherUserSessions(userId: string): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}/sessions`, { method: "DELETE" });
}

function parseAdminUser(
  row: Omit<AdminUser, "lastActive" | "createdAt"> & { lastActive: string; createdAt: string },
): AdminUser {
  return {
    ...row,
    lastActive: new Date(row.lastActive),
    createdAt: new Date(row.createdAt),
  };
}
