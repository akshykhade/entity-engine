import type { EntityDefinition } from "@crud-engine/entities";
import type { SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { badRequest } from "./errors";

type TableColumn = SQLiteColumn;

export function getTableColumn(
  entity: EntityDefinition,
  fieldName: string,
): TableColumn {
  const fromEntityColumns = entity.columns[fieldName as keyof typeof entity.columns];
  if (fromEntityColumns) {
    return fromEntityColumns;
  }

  const tableRecord = entity.table as Record<string, TableColumn | undefined>;
  const column = tableRecord[fieldName];

  if (!column) {
    throw badRequest(`Unknown field "${fieldName}" on entity "${entity.name}"`);
  }

  return column;
}

export function getPrimaryKeyColumn(entity: EntityDefinition): TableColumn {
  return getTableColumn(entity, entity.primaryKey);
}

export type { SQL };
