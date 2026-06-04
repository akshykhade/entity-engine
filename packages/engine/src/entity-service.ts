import { createDb } from "@crud-engine/db";
import {
  entityRegistry,
  toEntityMeta,
  type EntityDefinition,
  type EntityMeta,
} from "@crud-engine/entities";
import { permissionRegistry } from "@crud-engine/permissions";
import { workflowRegistry } from "@crud-engine/workflows";
import { eq } from "drizzle-orm";

import {
  listAuditLogForRecord,
  logMutation,
  type AuditLogEntry,
} from "./audit";
import { getPrimaryKeyColumn } from "./columns";
import { actionRegistry } from "./define-action";
import { badRequest, forbidden, notFound, type EngineContext } from "./errors";
import {
  buildOrderBy,
  buildWhereClause,
  count,
  getPagination,
} from "./query-builder";
import { listQuerySchema, type ListResult } from "./types";

type Db = ReturnType<typeof createDb>;
type RecordData = Record<string, unknown>;

function serializeRecord(record: RecordData): RecordData {
  const output: RecordData = {};

  for (const [key, value] of Object.entries(record)) {
    if (value instanceof Date) {
      output[key] = value.toISOString();
      continue;
    }
    output[key] = value;
  }

  return output;
}

function pickWritableFields(
  entity: EntityDefinition,
  data: RecordData,
): RecordData {
  const output: RecordData = {};

  for (const fieldName of Object.keys(entity.fields)) {
    if (fieldName in data) {
      output[fieldName] = data[fieldName];
    }
  }

  return output;
}

function validateRequiredFields(
  entity: EntityDefinition,
  data: RecordData,
  partial: boolean,
): void {
  for (const [fieldName, meta] of Object.entries(entity.fields)) {
    if (!meta.required || partial) {
      continue;
    }

    const value = data[fieldName];
    if (value === undefined || value === null || value === "") {
      throw badRequest(`Field "${fieldName}" is required`);
    }
  }
}

export class EntityService {
  constructor(private readonly db: Db) {}

  meta(entityName: string): EntityMeta {
    const entity = entityRegistry.get(entityName);
    return toEntityMeta(entity);
  }

  async list(
    ctx: EngineContext,
    entityName: string,
    rawQuery: unknown,
  ): Promise<ListResult<RecordData>> {
    const entity = entityRegistry.get(entityName);
    await this.assertPermission(ctx, entity.name, "read");

    const query = listQuerySchema.parse(rawQuery ?? {});
    const where = buildWhereClause(entity, query);
    const orderBy = buildOrderBy(entity, query.sort);
    const { page, pageSize, limit, offset } = getPagination(query);

    let listQuery = this.db.select().from(entity.table).$dynamic();
    let countQuery = this.db.select({ value: count() }).from(entity.table).$dynamic();

    if (where) {
      listQuery = listQuery.where(where);
      countQuery = countQuery.where(where);
    }

    if (orderBy) {
      listQuery = listQuery.orderBy(...orderBy);
    }

    const [rows, totalRows] = await Promise.all([
      listQuery.limit(limit).offset(offset),
      countQuery,
    ]);

    return {
      data: rows.map((row) => serializeRecord(row as RecordData)),
      total: totalRows[0]?.value ?? 0,
      page,
      pageSize,
    };
  }

  async get(
    ctx: EngineContext,
    entityName: string,
    id: string,
  ): Promise<RecordData> {
    const entity = entityRegistry.get(entityName);
    await this.assertPermission(ctx, entity.name, "read");

    const pkColumn = getPrimaryKeyColumn(entity);
    const rows = await this.db
      .select()
      .from(entity.table)
      .where(eq(pkColumn, id))
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw notFound(`${entity.name} "${id}" not found`);
    }

    return serializeRecord(row as RecordData);
  }

  async listAuditLog(
    ctx: EngineContext,
    entityName: string,
    id: string,
  ): Promise<AuditLogEntry[]> {
    const entity = entityRegistry.get(entityName);
    await this.assertPermission(ctx, entity.name, "read");
    await this.get(ctx, entityName, id);

    return listAuditLogForRecord(this.db, entity.name, id);
  }

  async create(
    ctx: EngineContext,
    entityName: string,
    rawData: unknown,
  ): Promise<RecordData> {
    const entity = entityRegistry.get(entityName);
    await this.assertPermission(ctx, entity.name, "create");

    if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
      throw badRequest("Request body must be an object");
    }

    const data = pickWritableFields(entity, rawData as RecordData);
    validateRequiredFields(entity, data, false);

    const now = new Date();
    const record = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(entity.table).values(record);

    await logMutation(this.db, ctx, {
      entity: entity.name,
      recordId: String(record.id),
      action: "create",
      after: serializeRecord(record as RecordData),
    });

    return serializeRecord(record as RecordData);
  }

  async update(
    ctx: EngineContext,
    entityName: string,
    id: string,
    rawData: unknown,
  ): Promise<RecordData> {
    const entity = entityRegistry.get(entityName);
    await this.assertPermission(ctx, entity.name, "update");

    if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
      throw badRequest("Request body must be an object");
    }

    const before = await this.get(ctx, entityName, id);
    const data = pickWritableFields(entity, rawData as RecordData);
    validateRequiredFields(entity, { ...before, ...data }, true);

    const workflow = workflowRegistry.get(entity.name);
    if (workflow && workflow.field in data) {
      const validation = workflowRegistry.validateTransition(
        entity.name,
        String(before[workflow.field]),
        String(data[workflow.field]),
      );

      if (!validation.ok) {
        throw badRequest(validation.message);
      }
    }

    const pkColumn = getPrimaryKeyColumn(entity);
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await this.db
      .update(entity.table)
      .set(updateData)
      .where(eq(pkColumn, id));

    const after = await this.get(ctx, entityName, id);

    await logMutation(this.db, ctx, {
      entity: entity.name,
      recordId: id,
      action: "update",
      before,
      after,
    });

    return after;
  }

  async delete(
    ctx: EngineContext,
    entityName: string,
    id: string,
  ): Promise<{ success: true }> {
    const entity = entityRegistry.get(entityName);
    await this.assertPermission(ctx, entity.name, "delete");

    const before = await this.get(ctx, entityName, id);
    const pkColumn = getPrimaryKeyColumn(entity);

    await this.db.delete(entity.table).where(eq(pkColumn, id));

    await logMutation(this.db, ctx, {
      entity: entity.name,
      recordId: id,
      action: "delete",
      before,
      after: null,
    });

    return { success: true };
  }

  async runAction(
    ctx: EngineContext,
    entityName: string,
    id: string,
    actionName: string,
  ): Promise<unknown> {
    entityRegistry.get(entityName);
    const action = actionRegistry.get(entityName, actionName);
    return action.handler(ctx, id);
  }

  private async assertPermission(
    ctx: EngineContext,
    entity: string,
    action: "read" | "create" | "update" | "delete",
  ): Promise<void> {
    const allowed = await permissionRegistry.checkPermission(ctx, entity, action);
    if (!allowed) {
      throw forbidden();
    }
  }
}

export function createEntityService(db: Db = createDb()): EntityService {
  return new EntityService(db);
}

export const entityService = createEntityService();
