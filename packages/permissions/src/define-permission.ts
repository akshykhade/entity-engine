import { permissionRegistry } from "./registry";
import type { PermissionDefinition } from "./types";

export function definePermission(
  permission: PermissionDefinition,
): PermissionDefinition {
  return permissionRegistry.register(permission);
}
