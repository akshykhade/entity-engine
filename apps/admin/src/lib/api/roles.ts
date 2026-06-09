import { apiFetch } from "@/lib/api/client";

export type RoleRecord = {
  id: string;
  name: string;
  label: string | null;
};

const ROLE_TONES: Record<string, string> = {
  admin: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  public: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

export async function fetchRoles(): Promise<RoleRecord[]> {
  const body = await apiFetch<{ roles: RoleRecord[] }>("/api/roles");
  return body.roles;
}

export async function fetchMyRoles(): Promise<{ roles: string[]; userId: string | null }> {
  return apiFetch("/api/roles/me");
}

export function getRoleTone(roleId: string, roles: RoleRecord[]): string {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return "bg-muted text-muted-foreground";
  return ROLE_TONES[role.name] ?? "bg-muted text-muted-foreground";
}

export function getRoleLabel(roleId: string, roles: RoleRecord[]): string {
  const role = roles.find((r) => r.id === roleId);
  return role?.label ?? role?.name ?? "Unknown";
}

export function roleSelectItems(roles: RoleRecord[]): { value: string; label: string }[] {
  return roles.map((role) => ({
    value: role.id,
    label: role.label ?? role.name,
  }));
}

export function isAdminRole(roleName: string): boolean {
  return roleName === "admin";
}
