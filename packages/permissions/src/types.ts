export type EntityAction = "read" | "create" | "update" | "delete";

export type PermissionContext = {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
};

export type PermissionDefinition = {
  entity: string;
  action: EntityAction;
  check: (ctx: PermissionContext) => boolean | Promise<boolean>;
};
