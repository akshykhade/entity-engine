import { createDb } from "@crud-engine/db";
import { auditLog } from "@crud-engine/db/schema/audit";
import type { EntityAction } from "@crud-engine/permissions";
import { and, desc, eq } from "drizzle-orm";

import type { EngineContext } from "./errors";

type Db = ReturnType<typeof createDb>;

export type AuditLogEntry = {
  id: string;
  entity: string;
  recordId: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  actorId: string;
  createdAt: string;
};

function parseJsonField(value: string | null): Record<string, unknown> | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function serializeAuditRow(row: typeof auditLog.$inferSelect): AuditLogEntry {
  return {
    id: row.id,
    entity: row.entity,
    recordId: row.recordId,
    action: row.action,
    before: parseJsonField(row.before),
    after: parseJsonField(row.after),
    actorId: row.actorId,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
  };
}

export async function logMutation(
  db: Db,
  ctx: EngineContext,
  input: {
    entity: string;
    recordId: string;
    action: EntityAction;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
  },
): Promise<void> {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    entity: input.entity,
    recordId: input.recordId,
    action: input.action,
    before: input.before ? JSON.stringify(input.before) : null,
    after: input.after ? JSON.stringify(input.after) : null,
    actorId: ctx.user?.id ?? "anonymous",
  });
}

export async function listAuditLogForRecord(
  db: Db,
  entity: string,
  recordId: string,
): Promise<AuditLogEntry[]> {
  const rows = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.entity, entity), eq(auditLog.recordId, recordId)))
    .orderBy(desc(auditLog.createdAt));

  return rows.map(serializeAuditRow);
}
