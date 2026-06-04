import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import {
  defaultUiType,
  inferStorageType,
  type StorageType,
  type UiType,
} from "./infer-field-type";

export type { StorageType, UiType } from "./infer-field-type";

/** Presentation and search metadata; types are inferred from the Drizzle column. */
export type FieldMetaInput = {
  label: string;
  searchable?: boolean;
  sortable?: boolean;
  /** Override column nullability for validation/UI only. */
  required?: boolean;
  /** Override default UI widget; must be compatible with storage type. */
  uiType?: UiType;
};

export type FieldMeta = FieldMetaInput & {
  required: boolean;
  storageType: StorageType;
  uiType: UiType;
};

export type FieldBinding = {
  column: SQLiteColumn;
  meta: FieldMetaInput;
};

export function field<TColumn extends SQLiteColumn>(
  column: TColumn,
  meta: FieldMetaInput,
): FieldBinding {
  return { column, meta };
}

export function resolveFieldMeta(
  column: SQLiteColumn,
  input: FieldMetaInput,
): FieldMeta {
  const storageType = inferStorageType(column);
  const uiType = input.uiType ?? defaultUiType(storageType);
  const required = input.required ?? Boolean(column.notNull);

  if (input.uiType && !isUiTypeAllowed(storageType, input.uiType)) {
    throw new Error(
      `uiType "${input.uiType}" is not allowed for storageType "${storageType}"`,
    );
  }

  return {
    label: input.label,
    searchable: input.searchable,
    sortable: input.sortable,
    required,
    storageType,
    uiType,
  };
}

const UI_OVERRIDES: Record<StorageType, readonly UiType[]> = {
  text: ["text", "email", "textarea", "phone"],
  number: ["number"],
  boolean: ["boolean"],
  datetime: ["datetime"],
};

function isUiTypeAllowed(storageType: StorageType, uiType: UiType): boolean {
  return UI_OVERRIDES[storageType].includes(uiType);
}

export function isFieldBinding(value: unknown): value is FieldBinding {
  return (
    typeof value === "object" &&
    value !== null &&
    "column" in value &&
    "meta" in value
  );
}
