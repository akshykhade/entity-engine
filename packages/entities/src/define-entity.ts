import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

import { defaultSlug } from "./slug";
import type { EntityHooks } from "./hooks";
import type { FieldMeta } from "./field";
import type { RelationDefinition } from "./relations";

export type SoftDeleteConfig =
  | boolean
  | {
      /** Column on the Drizzle table; default `deletedAt`. */
      field?: string;
    };

export type EntityMeta = {
  name: string;
  slug: string;
  primaryKey: string;
  audit: boolean;
  softDelete: boolean;
  fields: Record<string, FieldMeta>;
  relations: Record<string, RelationDefinition>;
};

export type EntityDefinition<
  TTable extends SQLiteTableWithColumns<any> = SQLiteTableWithColumns<any>,
  TFields extends Record<string, FieldMeta> = Record<string, FieldMeta>,
  TPrimaryKey extends keyof TTable["_"]["columns"] & string = keyof TTable["_"]["columns"] &
    string,
> = {
  name: string;
  slug: string;
  table: TTable;
  primaryKey: TPrimaryKey;
  fields: TFields;
  columns: Record<keyof TFields & string, TTable["_"]["columns"][keyof TFields & string]>;
  relations: Record<string, RelationDefinition>;
  /** When false, create/update/delete skip audit_log. Default true. */
  audit: boolean;
  softDelete: SoftDeleteConfig | false;
  softDeleteField: string | null;
  hooks?: EntityHooks;
};

export type DefineEntityConfig<
  TTable extends SQLiteTableWithColumns<any>,
  TFields extends Record<string, FieldMeta>,
  TPrimaryKey extends keyof TTable["_"]["columns"] & string,
> = {
  name: string;
  /** API slug for routes; defaults from `name` (Member → member). */
  slug?: string;
  table: TTable;
  primaryKey: TPrimaryKey;
  fields: TFields;
  relations?: Record<string, RelationDefinition>;
  audit?: boolean;
  softDelete?: SoftDeleteConfig;
  hooks?: EntityHooks;
};

function resolveSoftDelete(
  config: SoftDeleteConfig | undefined,
  table: SQLiteTableWithColumns<any>,
): { enabled: SoftDeleteConfig | false; field: string | null } {
  if (!config) {
    return { enabled: false, field: null };
  }

  const fieldName =
    typeof config === "object" && config.field ? config.field : "deletedAt";

  if (!(fieldName in table)) {
    throw new Error(
      `softDelete field "${fieldName}" is not a column on table for entity`,
    );
  }

  return { enabled: config, field: fieldName };
}

export function defineEntity<
  TTable extends SQLiteTableWithColumns<any>,
  TFields extends Record<string, FieldMeta>,
  TPrimaryKey extends keyof TTable["_"]["columns"] & string,
>(
  config: DefineEntityConfig<TTable, TFields, TPrimaryKey>,
): EntityDefinition<TTable, TFields, TPrimaryKey> {
  const columns = {} as EntityDefinition<TTable, TFields, TPrimaryKey>["columns"];

  for (const fieldName of Object.keys(config.fields) as Array<keyof TFields & string>) {
    const column = config.table[fieldName as keyof TTable];
    if (!column) {
      throw new Error(
        `Entity "${config.name}" field "${fieldName}" does not map to a Drizzle column`,
      );
    }
    columns[fieldName] = column as TTable["_"]["columns"][keyof TFields & string];
  }

  const { enabled: softDelete, field: softDeleteField } = resolveSoftDelete(
    config.softDelete,
    config.table,
  );

  const slug = config.slug ?? defaultSlug(config.name);

  return {
    name: config.name,
    slug,
    table: config.table,
    primaryKey: config.primaryKey,
    fields: config.fields,
    columns,
    relations: config.relations ?? {},
    audit: config.audit ?? true,
    softDelete,
    softDeleteField,
    hooks: config.hooks,
  };
}

export function toEntityMeta(entity: EntityDefinition): EntityMeta {
  return {
    name: entity.name,
    slug: entity.slug,
    primaryKey: entity.primaryKey,
    audit: entity.audit,
    softDelete: Boolean(entity.softDelete),
    fields: entity.fields,
    relations: entity.relations,
  };
}

export function isAuditEnabled(entity: EntityDefinition): boolean {
  return entity.audit !== false;
}

export function isSoftDeleteEnabled(entity: EntityDefinition): boolean {
  return Boolean(entity.softDelete);
}
