import "@/lib/load-root-env";
import { createDb } from "@crud-engine/db";
import { auditLog } from "@crud-engine/db/schema/audit";
import { and, desc, eq, like, or, sql } from "drizzle-orm";

import type { AuditLogEntry } from "@/lib/types/entity";

export async function listAuditLogFromDb(options: {
  search?: string;
  entity?: string;
  action?: string;
  actorId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ entries: AuditLogEntry[]; total: number }> {
  const db = createDb();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;
  const search = options.search?.trim().toLowerCase();

  const conditions = [];
  if (options.entity) conditions.push(eq(auditLog.entity, options.entity));
  if (options.action) conditions.push(eq(auditLog.action, options.action));
  if (options.actorId) conditions.push(eq(auditLog.actorId, options.actorId));
  if (search) {
    conditions.push(
      or(
        like(sql`lower(${auditLog.entity})`, `%${search}%`),
        like(sql`lower(${auditLog.recordId})`, `%${search}%`),
        like(sql`lower(${auditLog.actorId})`, `%${search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(auditLog)
      .where(whereClause),
  ]);

  const entries: AuditLogEntry[] = rows.map((row) => ({
    id: row.id,
    entity: row.entity,
    recordId: row.recordId,
    action: row.action as AuditLogEntry["action"],
    before: row.before,
    after: row.after,
    actorId: row.actorId,
    createdAt: row.createdAt,
  }));

  return {
    entries,
    total: Number(countRows[0]?.count ?? 0),
  };
}
