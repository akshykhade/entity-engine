import type {
  PermissionAction,
  PermissionContext,
  PermissionDefinition,
  PermissionGrant,
  PermissionMatrix,
} from "./types";

export class PermissionRegistry {
  private permissions = new Map<string, PermissionDefinition[]>();
  private grants: PermissionGrant[] = [];

  register(permission: PermissionDefinition): PermissionDefinition {
    const key = permission.entity;
    const existing = this.permissions.get(key) ?? [];
    existing.push(permission);
    this.permissions.set(key, existing);
    return permission;
  }

  registerGrant(grant: PermissionGrant): PermissionGrant {
    this.grants.push(grant);
    return grant;
  }

  listGrants(): PermissionGrant[] {
    return [...this.grants];
  }

  listRoles(): string[] {
    return [...new Set(this.grants.map((grant) => grant.role))].sort();
  }

  listMatrix(entities: PermissionMatrix["entities"]): PermissionMatrix {
    return {
      roles: this.listRoles(),
      entities,
      grants: this.listGrants(),
    };
  }

  async checkPermission(
    ctx: PermissionContext,
    entity: string,
    action: PermissionAction,
  ): Promise<boolean> {
    const rules = this.permissions.get(entity) ?? [];
    const matchingRules = rules.filter((rule) => rule.action === action);

    for (const rule of matchingRules) {
      const allowed = await rule.check(ctx);
      if (!allowed) {
        return false;
      }
    }

    const matchingGrants = this.grants.filter(
      (grant) => grant.entity === entity && grant.action === action,
    );

    if (matchingGrants.length === 0) {
      return true;
    }

    const effectiveRoles = ctx.roles.length > 0 ? ctx.roles : (ctx.user?.roles ?? []);
    return matchingGrants.some(
      (grant) => grant.allowed && effectiveRoles.includes(grant.role),
    );
  }
}

export const permissionRegistry = new PermissionRegistry();
