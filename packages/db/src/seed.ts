import { eq } from "drizzle-orm";

import { createDb } from "./index";
import { permissionGrants } from "./schema/grant";
import { roles } from "./schema/role";

const ROLES = [
  { name: "public", label: "Public (anonymous)" },
  { name: "admin", label: "Administrator" },
];

async function seed(): Promise<void> {
  const db = createDb();
  const roleMap: Record<string, string> = {};

  for (const role of ROLES) {
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, role.name))
      .limit(1);

    if (existing[0]) {
      roleMap[role.name] = existing[0].id;
    } else {
      const id = crypto.randomUUID();
      await db.insert(roles).values({ id, name: role.name, label: role.label });
      roleMap[role.name] = id;
    }
  }

  const adminRoleId = roleMap["admin"]!;
  await db
    .insert(permissionGrants)
    .values({
      id: crypto.randomUUID(),
      roleId: adminRoleId,
      entity: "*",
      action: "*",
      allowed: true,
    })
    .onConflictDoNothing();

  console.log("Seed complete: roles [public, admin] + admin wildcard grant");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
