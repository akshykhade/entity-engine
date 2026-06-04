import { permissionRegistry } from "./registry";
import type { PermissionGrant } from "./types";

export function definePermissionGrant(
  grant: PermissionGrant,
): PermissionGrant {
  return permissionRegistry.registerGrant(grant);
}
