import type { EntityAction, PermissionContext, PermissionDefinition } from "./types";

class PermissionRegistry {
  private permissions = new Map<string, PermissionDefinition[]>();

  register(permission: PermissionDefinition): PermissionDefinition {
    const key = permission.entity;
    const existing = this.permissions.get(key) ?? [];
    existing.push(permission);
    this.permissions.set(key, existing);
    return permission;
  }

  async checkPermission(
    ctx: PermissionContext,
    entity: string,
    action: EntityAction,
  ): Promise<boolean> {
    const rules = this.permissions.get(entity) ?? [];
    const matching = rules.filter((rule) => rule.action === action);

    if (matching.length === 0) {
      return true;
    }

    for (const rule of matching) {
      const allowed = await rule.check(ctx);
      if (!allowed) {
        return false;
      }
    }

    return true;
  }
}

export const permissionRegistry = new PermissionRegistry();
