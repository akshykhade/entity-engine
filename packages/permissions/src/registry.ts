import type {
  PermissionAction,
  PermissionContext,
  PermissionDefinition,
} from "./types";

export class PermissionRegistry {
  private permissions = new Map<string, PermissionDefinition[]>();
  private grantChecker?: (
    roles: string[],
    entity: string,
    action: string,
  ) => boolean;

  register(permission: PermissionDefinition): PermissionDefinition {
    const key = permission.entity;
    const existing = this.permissions.get(key) ?? [];
    existing.push(permission);
    this.permissions.set(key, existing);
    return permission;
  }

  setGrantChecker(
    fn: (roles: string[], entity: string, action: string) => boolean,
  ): void {
    this.grantChecker = fn;
  }

  async checkPermission(
    ctx: PermissionContext,
    entity: string,
    action: PermissionAction,
  ): Promise<boolean> {
    const rules = (this.permissions.get(entity) ?? []).filter(
      (r) => r.action === action,
    );
    for (const rule of rules) {
      if (!(await rule.check(ctx))) return false;
    }

    if (!this.grantChecker) return false;
    return this.grantChecker(ctx.roles, entity, action);
  }
}

export const permissionRegistry = new PermissionRegistry();
