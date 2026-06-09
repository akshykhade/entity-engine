import { apiFetch } from "@/lib/api/client";

export type PermissionGrant = {
  role: string;
  entity: string;
  action: string;
  allowed: boolean;
};

export type PermissionMatrix = {
  roles: string[];
  entities: { name: string; actions: string[] }[];
  grants: PermissionGrant[];
};

export async function fetchPermissionMatrix(): Promise<PermissionMatrix> {
  return apiFetch<PermissionMatrix>("/api/permissions/matrix");
}

export async function upsertGrant(
  roleId: string,
  entity: string,
  action: string,
  allowed: boolean,
): Promise<void> {
  await apiFetch(`/api/grants/${roleId}/${encodeURIComponent(entity)}/${action}`, {
    method: "PUT",
    json: { allowed },
  });
}

export async function deleteGrant(
  roleId: string,
  entity: string,
  action: string,
): Promise<void> {
  await apiFetch(`/api/grants/${roleId}/${encodeURIComponent(entity)}/${action}`, {
    method: "DELETE",
  });
}

export function grantKey(role: string, entity: string, action: string): string {
  return `${role}:${entity}:${action}`;
}

export function buildGrantMap(grants: PermissionGrant[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const grant of grants) {
    map.set(grantKey(grant.role, grant.entity, grant.action), grant.allowed);
  }
  return map;
}

export function isGranted(
  grantMap: Map<string, boolean>,
  roleName: string,
  entity: string,
  action: string,
): boolean {
  return grantMap.get(grantKey(roleName, entity, action)) ?? false;
}
