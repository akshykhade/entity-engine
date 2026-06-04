export const CRUD_ACTIONS = ["read", "create", "update", "delete"] as const;

export type CrudAction = (typeof CRUD_ACTIONS)[number];

/** Any permission key: CRUD or custom action name (e.g. "Discontinue"). */
export type PermissionAction = string;

/** @deprecated Use CrudAction for audit/CRUD-only paths. */
export type EntityAction = CrudAction;

export type PermissionContext = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    roles?: string[];
  };
  /** Effective roles for this request (e.g. public for anonymous). */
  roles: string[];
};

export type PermissionDefinition = {
  entity: string;
  action: PermissionAction;
  check: (ctx: PermissionContext) => boolean | Promise<boolean>;
};

export type PermissionGrant = {
  role: string;
  entity: string;
  action: PermissionAction;
  allowed: boolean;
};

export type PermissionMatrixEntity = {
  name: string;
  actions: PermissionAction[];
};

export type PermissionMatrix = {
  roles: string[];
  entities: PermissionMatrixEntity[];
  grants: PermissionGrant[];
};
