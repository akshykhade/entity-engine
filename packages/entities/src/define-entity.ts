import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

import type { FieldMeta } from "./field";

export type EntityMeta = {
  name: string;
  primaryKey: string;
  fields: Record<string, FieldMeta>;
};

export type EntityDefinition<
  TTable extends SQLiteTableWithColumns<any> = SQLiteTableWithColumns<any>,
  TFields extends Record<string, FieldMeta> = Record<string, FieldMeta>,
  TPrimaryKey extends keyof TTable["_"]["columns"] & string = keyof TTable["_"]["columns"] &
    string,
> = {
  name: string;
  table: TTable;
  primaryKey: TPrimaryKey;
  fields: TFields;
  columns: Record<keyof TFields & string, TTable["_"]["columns"][keyof TFields & string]>;
};

export type DefineEntityConfig<
  TTable extends SQLiteTableWithColumns<any>,
  TFields extends Record<string, FieldMeta>,
  TPrimaryKey extends keyof TTable["_"]["columns"] & string,
> = {
  name: string;
  table: TTable;
  primaryKey: TPrimaryKey;
  fields: TFields;
};

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

  return {
    ...config,
    columns,
  };
}

export function toEntityMeta(entity: EntityDefinition): EntityMeta {
  return {
    name: entity.name,
    primaryKey: entity.primaryKey,
    fields: entity.fields,
  };
}
