import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

export type StorageType = "text" | "number" | "boolean" | "datetime";

export type UiType = StorageType | "email" | "textarea" | "phone";

type ColumnWithMode = SQLiteColumn & { mode?: string };

export function inferStorageType(column: SQLiteColumn): StorageType {
  const { columnType, dataType } = column;
  const mode = (column as ColumnWithMode).mode;

  if (columnType === "SQLiteTimestamp" || dataType === "date") {
    return "datetime";
  }

  if (columnType === "SQLiteBoolean" || dataType === "boolean" || mode === "boolean") {
    return "boolean";
  }

  if (
    columnType === "SQLiteInteger" ||
    columnType === "SQLiteReal" ||
    dataType === "number"
  ) {
    return "number";
  }

  return "text";
}

export function defaultUiType(storageType: StorageType): UiType {
  return storageType;
}
