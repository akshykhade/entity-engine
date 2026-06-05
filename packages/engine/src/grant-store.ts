import { createDb } from "@crud-engine/db";
import { permissionGrants } from "@crud-engine/db/schema/grant";
import { roles } from "@crud-engine/db/schema/role";
import { eq } from "drizzle-orm";

type Db = ReturnType<typeof createDb>;

export type LoadedGrant = {
  id: string;
  roleId: string;
  roleName: string;
  entity: string;
  action: string;
  allowed: boolean;
};

export class GrantStore {
  private grants: LoadedGrant[] = [];

  async load(db: Db = createDb()): Promise<void> {
    const rows = await db
      .select({
        id: permissionGrants.id,
        roleId: permissionGrants.roleId,
        roleName: roles.name,
        entity: permissionGrants.entity,
        action: permissionGrants.action,
        allowed: permissionGrants.allowed,
      })
      .from(permissionGrants)
      .innerJoin(roles, eq(permissionGrants.roleId, roles.id));

    this.grants = rows.map((row: typeof rows[number]) => ({
      id: row.id,
      roleId: row.roleId,
      roleName: row.roleName,
      entity: row.entity,
      action: row.action,
      allowed: row.allowed,
    }));
  }

  async reload(db?: Db): Promise<void> {
    return this.load(db);
  }

  check(roleNames: string[], entity: string, action: string): boolean {
    const matching = this.grants.filter(
      (g) =>
        (g.entity === entity || g.entity === "*") &&
        (g.action === action || g.action === "*") &&
        roleNames.includes(g.roleName),
    );
    if (matching.length === 0) return false;
    if (matching.some((g) => !g.allowed)) return false;
    return true;
  }

  listGrants(): LoadedGrant[] {
    return [...this.grants];
  }

  listRoleNames(): string[] {
    return [...new Set(this.grants.map((g) => g.roleName))].sort();
  }
}

export const grantStore = new GrantStore();
