import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import type { EntityDefinition } from "./define-entity";
import { isFieldBinding, type FieldBinding } from "./field";

export function assertEntityConsistency(
  entityName: string,
  table: SQLiteTableWithColumns<any>,
  fields: Record<string, FieldBinding | unknown>,
  resolvedFields: EntityDefinition["fields"],
): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const exposedKeys = new Set(Object.keys(fields));

  for (const [key, binding] of Object.entries(fields)) {
    if (!isFieldBinding(binding)) {
      continue;
    }

    const column = binding.column;
    const resolved = resolvedFields[key];
    if (!resolved) {
      continue;
    }

    if (binding.meta.required !== undefined && binding.meta.required !== column.notNull) {
      console.warn(
        `[crud-engine] Entity "${entityName}" field "${key}": meta.required (${binding.meta.required}) ` +
          `differs from column.notNull (${column.notNull}). Prefer relying on the column.`,
      );
    }

    if (resolved.required !== column.notNull && binding.meta.required === undefined) {
      console.warn(
        `[crud-engine] Entity "${entityName}" field "${key}": resolved required (${resolved.required}) ` +
          `does not match column.notNull (${column.notNull}).`,
      );
    }
  }

  for (const [key, column] of Object.entries(table)) {
    if (key.startsWith("_") || !(column as SQLiteColumn).notNull) {
      continue;
    }

    const col = column as SQLiteColumn;
    if (col.primary || col.hasDefault) {
      continue;
    }

    if (!exposedKeys.has(key)) {
      console.warn(
        `[crud-engine] Entity "${entityName}": column "${key}" is NOT NULL without default ` +
          `but is not exposed in fields (UI/validation may omit it).`,
      );
    }
  }
}
