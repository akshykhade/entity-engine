import "@/lib/load-root-env";
import { auth } from "@crud-engine/auth";
import { createDb } from "@crud-engine/db";
import { account, session, user } from "@crud-engine/db/schema/auth";
import { roles, userRoles } from "@crud-engine/db/schema/role";
import { hashPassword } from "better-auth/crypto";
import { and, desc, eq, like, ne, or, sql } from "drizzle-orm";

import type { AdminUser, UserFormData, UserStatus } from "@/lib/types/entity";

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

function deriveStatus(emailVerified: boolean): UserStatus {
  return emailVerified ? "active" : "invited";
}

function toDate(value: Date | number | null | undefined, fallback: Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return fallback;
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  roleId: string | null;
  roleName: string | null;
  lastActive: Date | number | null;
};

export async function listAdminUsersFromDb(options: {
  search?: string;
  roleId?: string;
  status?: UserStatus | "all";
  sortField?: "name" | "email" | "lastActive" | "createdAt";
  sortDirection?: "asc" | "desc";
}): Promise<AdminUser[]> {
  const db = createDb();
  const search = options.search?.trim().toLowerCase();

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      roleId: userRoles.roleId,
      roleName: roles.name,
      lastActive: sql<Date | null>`max(${session.updatedAt})`,
    })
    .from(user)
    .leftJoin(userRoles, eq(userRoles.userId, user.id))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .leftJoin(session, eq(session.userId, user.id))
    .where(
      search
        ? or(
            like(sql`lower(${user.name})`, `%${search}%`),
            like(sql`lower(${user.email})`, `%${search}%`),
          )
        : undefined,
    )
    .groupBy(user.id, userRoles.roleId, roles.name)
    .orderBy(desc(user.createdAt));

  let mapped = rows.map((row) => toAdminUser(row));

  if (options.roleId) {
    mapped = mapped.filter((u) => u.roleId === options.roleId);
  }
  if (options.status && options.status !== "all") {
    mapped = mapped.filter((u) => u.status === options.status);
  }

  const field = options.sortField ?? "name";
  const direction = options.sortDirection ?? "asc";
  mapped.sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    const cmp =
      av instanceof Date && bv instanceof Date
        ? av.getTime() - bv.getTime()
        : String(av).localeCompare(String(bv));
    return direction === "asc" ? cmp : -cmp;
  });

  return mapped;
}

export async function getAdminUserFromDb(id: string): Promise<AdminUser | null> {
  const db = createDb();
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      roleId: userRoles.roleId,
      roleName: roles.name,
      lastActive: sql<Date | null>`max(${session.updatedAt})`,
    })
    .from(user)
    .leftJoin(userRoles, eq(userRoles.userId, user.id))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .leftJoin(session, eq(session.userId, user.id))
    .where(eq(user.id, id))
    .groupBy(user.id, userRoles.roleId, roles.name)
    .limit(1);

  const row = rows[0];
  return row ? toAdminUser(row) : null;
}

export async function isEmailTakenInDb(email: string, excludeId?: string): Promise<boolean> {
  const db = createDb();
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(
      excludeId
        ? and(eq(sql`lower(${user.email})`, email.trim().toLowerCase()), ne(user.id, excludeId))
        : eq(sql`lower(${user.email})`, email.trim().toLowerCase()),
    )
    .limit(1);
  return rows.length > 0;
}

export async function createAdminUserInDb(
  data: UserFormData,
  password: string,
): Promise<AdminUser> {
  const result = await auth.api.signUpEmail({
    body: {
      email: data.email.trim(),
      password,
      name: data.name.trim(),
    },
  });

  if (!result?.user) {
    throw new Error("Failed to create user");
  }

  const db = createDb();
  await db
    .update(user)
    .set({
      emailVerified: data.status === "active",
    })
    .where(eq(user.id, result.user.id));

  await assignUserRole(result.user.id, data.roleId);

  const created = await getAdminUserFromDb(result.user.id);
  if (!created) {
    throw new Error("Created user not found");
  }
  return created;
}

export async function updateAdminUserInDb(
  id: string,
  data: UserFormData,
): Promise<AdminUser | null> {
  const db = createDb();

  await db
    .update(user)
    .set({
      name: data.name.trim(),
      email: data.email.trim(),
      emailVerified: data.status === "active",
    })
    .where(eq(user.id, id));

  await assignUserRole(id, data.roleId);

  return getAdminUserFromDb(id);
}

export async function setAdminUserPassword(id: string, password: string): Promise<void> {
  const db = createDb();
  const hashed = await hashPassword(password);

  const rows = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, id), eq(account.providerId, "credential")))
    .limit(1);

  if (rows[0]) {
    await db.update(account).set({ password: hashed }).where(eq(account.id, rows[0].id));
  } else {
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: hashed,
    });
  }

  await db.delete(session).where(eq(session.userId, id));
}

async function assignUserRole(userId: string, roleId: string): Promise<void> {
  const db = createDb();
  await db.delete(userRoles).where(eq(userRoles.userId, userId));
  await db.insert(userRoles).values({
    id: crypto.randomUUID(),
    userId,
    roleId,
  });
}

function toAdminUser(row: UserRow): AdminUser {
  const roleId = row.roleId ?? "";
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    initials: deriveInitials(row.name),
    roleId,
    status: deriveStatus(row.emailVerified),
    twoFactor: false,
    lastActive: toDate(row.lastActive, row.createdAt),
    createdAt: row.createdAt,
  };
}
