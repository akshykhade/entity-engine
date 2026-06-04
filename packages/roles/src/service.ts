import { createDb } from "@crud-engine/db";
import { roles, userRoles } from "@crud-engine/db/schema/role";
import { eq } from "drizzle-orm";

import { PUBLIC_ROLE } from "./constants";

type Db = ReturnType<typeof createDb>;

export type RoleRecord = {
  id: string;
  name: string;
  label: string | null;
};

export async function ensurePublicRole(db: Db = createDb()): Promise<RoleRecord> {
  const existing = await db
    .select()
    .from(roles)
    .where(eq(roles.name, PUBLIC_ROLE))
    .limit(1);

  if (existing[0]) {
    return {
      id: existing[0].id,
      name: existing[0].name,
      label: existing[0].label,
    };
  }

  const id = crypto.randomUUID();
  await db.insert(roles).values({
    id,
    name: PUBLIC_ROLE,
    label: "Public (anonymous)",
  });

  return { id, name: PUBLIC_ROLE, label: "Public (anonymous)" };
}

export async function listRoles(db: Db = createDb()): Promise<RoleRecord[]> {
  const rows = await db.select().from(roles).orderBy(roles.name);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    label: row.label,
  }));
}

export async function getRoleNamesForUser(
  userId: string,
  db: Db = createDb(),
): Promise<string[]> {
  const rows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return rows.map((row) => row.name);
}

export function anonymousRoleNames(): string[] {
  return [PUBLIC_ROLE];
}
