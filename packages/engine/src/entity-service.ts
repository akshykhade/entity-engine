import { createDb } from "@crud-engine/db";
import {
  type EntityRegistry,
  entityRegistry,
  isAuditEnabled,
  isSoftDeleteEnabled,
  toEntityMeta,
  type EntityDefinition,
  type EntityMeta,
} from "@crud-engine/entities";
import { type PermissionRegistry, permissionRegistry } from "@crud-engine/permissions";
import { type WorkflowRegistry, workflowRegistry } from "@crud-engine/workflows";
import { eq } from "drizzle-orm";

import {
  listAuditLogForRecord,
  logMutation,
  type AuditLogEntry,
} from "./audit";
import { getPrimaryKeyColumn } from "./columns";
import { type ActionRegistry, actionRegistry } from "./define-action";
import { badRequest, forbidden, notFound, type EngineContext } from "./errors";

export type EngineRegistries = {
  entityRegistry: EntityRegistry;
  permissionRegistry: PermissionRegistry;
  workflowRegistry: WorkflowRegistry;
  actionRegistry: ActionRegistry;
};
import { toHookContext } from "./hooks";
import {
  buildOrderBy,
  buildRecordWhereClause,
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
  constructor(
    private readonly db: Db,
    private readonly registries: EngineRegistries,
  ) {}

  private enrichEntityMeta(entity: EntityDefinition): EntityMeta {
    return {
      ...toEntityMeta(entity),
      actions: this.registries.actionRegistry.listForEntity(entity.name),
    };
  }

  meta(entityKey: string): EntityMeta {
    const entity = this.registries.entityRegistry.resolve(entityKey);
    return this.enrichEntityMeta(entity);
  }

  listMeta(): EntityMeta[] {
    return this.registries.entityRegistry
      .list()
      .map((entity) => this.enrichEntityMeta(entity))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async list(
    ctx: EngineContext,
    entityKey: string,
    rawQuery: unknown,
  ): Promise<ListResult<RecordData>> {
    const entity = this.registries.entityRegistry.resolve(entityKey);
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
    entityKey: string,
    id: string,
  ): Promise<RecordData> {
    const entity = this.registries.entityRegistry.resolve(entityKey);
    await this.assertPermission(ctx, entity.name, "read");
    return this.fetchRecord(entity, id);
  }

  async listAuditLog(
    ctx: EngineContext,
    entityKey: string,
    id: string,
  ): Promise<AuditLogEntry[]> {
    const entity = this.registries.entityRegistry.resolve(entityKey);
    await this.assertPermission(ctx, entity.name, "read");
    await this.fetchRecord(entity, id);

    if (!isAuditEnabled(entity)) {
      return [];
    }

    return listAuditLogForRecord(this.db, entity.name, id);
  }

  async create(
    ctx: EngineContext,
    entityKey: string,
    rawData: unknown,
  ): Promise<RecordData> {
    const entity = this.registries.entityRegistry.resolve(entityKey);
    await this.assertPermission(ctx, entity.name, "create");

    if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
      throw badRequest("Request body must be an object");
    }

    let data = pickWritableFields(entity, rawData as RecordData);
    validateRequiredFields(entity, data, false);

    if (entity.hooks?.onBeforeCreate) {
      const hookResult = await entity.hooks.onBeforeCreate(
        toHookContext(ctx, entity),
        data,
      );
      if (hookResult) {
        data = hookResult;
      }
    }

    const now = new Date();
    const record = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(entity.table).values(record);

    const serialized = serializeRecord(record as RecordData);

    if (isAuditEnabled(entity)) {
      await logMutation(this.db, ctx, {
        entity: entity.name,
        recordId: String(record.id),
        action: "create",
        after: serialized,
      });
    }

    if (entity.hooks?.onAfterCreate) {
      await entity.hooks.onAfterCreate(toHookContext(ctx, entity), serialized);
    }

    return serialized;
  }

  async update(
    ctx: EngineContext,
    entityKey: string,
    id: string,
    rawData: unknown,
  ): Promise<RecordData> {
    const entity = this.registries.entityRegistry.resolve(entityKey);
    await this.assertPermission(ctx, entity.name, "update");

    if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
      throw badRequest("Request body must be an object");
    }

    const before = await this.fetchRecord(entity, id);
    let data = pickWritableFields(entity, rawData as RecordData);
    validateRequiredFields(entity, { ...before, ...data }, true);

    if (entity.hooks?.onBeforeUpdate) {
      const hookResult = await entity.hooks.onBeforeUpdate(
        toHookContext(ctx, entity),
        id,
        data,
        before,
      );
      if (hookResult) {
        data = hookResult;
      }
    }

    const workflow = this.registries.workflowRegistry.get(entity.name);
    if (workflow && workflow.field in data) {
      const validation = this.registries.workflowRegistry.validateTransition(
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

    const after = await this.fetchRecord(entity, id);

    if (isAuditEnabled(entity)) {
      await logMutation(this.db, ctx, {
        entity: entity.name,
        recordId: id,
        action: "update",
        before,
        after,
      });
    }

    if (entity.hooks?.onAfterUpdate) {
      await entity.hooks.onAfterUpdate(
        toHookContext(ctx, entity),
        id,
        before,
        after,
      );
    }

    return after;
  }

  async delete(
    ctx: EngineContext,
    entityKey: string,
    id: string,
  ): Promise<{ success: true }> {
    const entity = this.registries.entityRegistry.resolve(entityKey);
    await this.assertPermission(ctx, entity.name, "delete");

    const before = await this.fetchRecord(entity, id);
    const pkColumn = getPrimaryKeyColumn(entity);

    if (isSoftDeleteEnabled(entity) && entity.softDeleteField) {
      const softDeletePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      softDeletePayload[entity.softDeleteField] = new Date();
      await this.db
        .update(entity.table)
        .set(softDeletePayload as Record<string, never>)
        .where(eq(pkColumn, id));
    } else {
      await this.db.delete(entity.table).where(eq(pkColumn, id));
    }

    if (isAuditEnabled(entity)) {
      await logMutation(this.db, ctx, {
        entity: entity.name,
        recordId: id,
        action: "delete",
        before,
        after: null,
      });
    }

    return { success: true };
  }

  async runAction(
    ctx: EngineContext,
    entityKey: string,
    id: string,
    actionName: string,
    rawBody: unknown,
  ): Promise<unknown> {
    const entity = this.registries.entityRegistry.resolve(entityKey);
    await this.assertPermission(ctx, entity.name, actionName);

    if (rawBody !== undefined && rawBody !== null) {
      if (typeof rawBody !== "object" || Array.isArray(rawBody)) {
        throw badRequest("Request body must be an object");
      }
    }

    const action = this.registries.actionRegistry.get(entity.name, actionName);
    const body = rawBody ?? {};
    return action.handler(ctx, id, body);
  }

  private async fetchRecord(
    entity: EntityDefinition,
    id: string,
  ): Promise<RecordData> {
    const rows = await this.db
      .select()
      .from(entity.table)
      .where(buildRecordWhereClause(entity, id))
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw notFound(`${entity.name} "${id}" not found`);
    }

    return serializeRecord(row as RecordData);
  }

  private async assertPermission(
    ctx: EngineContext,
    entity: string,
    action: string,
  ): Promise<void> {
    const allowed = await this.registries.permissionRegistry.checkPermission(ctx, entity, action);
    if (!allowed) {
      throw forbidden();
    }
  }
}

export const defaultRegistries: EngineRegistries = {
  entityRegistry,
  permissionRegistry,
  workflowRegistry,
  actionRegistry,
};

export function createEntityService(
  db: Db = createDb(),
  registries: EngineRegistries = defaultRegistries,
): EntityService {
  return new EntityService(db, registries);
}

export const entityService = createEntityService();
