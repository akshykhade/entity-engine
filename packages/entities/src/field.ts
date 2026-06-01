export type FieldMeta = {
  label: string;
  searchable?: boolean;
  sortable?: boolean;
  required?: boolean;
};

export type FieldDefinition = FieldMeta & {
  name: string;
};

export function field(meta: FieldMeta): FieldMeta {
  return meta;
}
