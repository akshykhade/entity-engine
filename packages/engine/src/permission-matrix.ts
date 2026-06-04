import { entityRegistry } from "@crud-engine/entities";
import {
  CRUD_ACTIONS,
  permissionRegistry,
  type PermissionAction,
  type PermissionContext,
  type PermissionMatrix,
} from "@crud-engine/permissions";
import { listRoles } from "@crud-engine/auth";

import { actionRegistry } from "./define-action";

export function listActionsForEntity(entity: string): PermissionAction[] {
  return [...CRUD_ACTIONS, ...actionRegistry.listForEntity(entity)];
}

export async function listPermissionMatrix(): Promise<PermissionMatrix> {
  const entities = entityRegistry.list().map((entity) => ({
    name: entity.name,
    actions: listActionsForEntity(entity.name),
  }));

  const dbRoleNames = (await listRoles()).map((role) => role.name);
  const grantRoleNames = permissionRegistry.listRoles();
  const roles = [...new Set([...dbRoleNames, ...grantRoleNames])].sort();

  return {
    roles,
    entities,
    grants: permissionRegistry.listGrants(),
  };
}

export async function listPermissionsForUser(
  ctx: PermissionContext,
): Promise<Record<string, Record<string, boolean>>> {
  const matrix = await listPermissionMatrix();
  const permissions: Record<string, Record<string, boolean>> = {};

  for (const entity of matrix.entities) {
    const entityPermissions: Record<string, boolean> = {};
    permissions[entity.name] = entityPermissions;

    for (const action of entity.actions) {
      entityPermissions[action] = await permissionRegistry.checkPermission(
        ctx,
        entity.name,
        action,
      );
    }
  }

  return permissions;
}
