export type EntityHookUser = {
  id: string;
  name?: string;
  email?: string;
  roles: string[];
};

export type EntityHookContext = {
  user?: EntityHookUser;
  entityName: string;
  slug: string;
};

export type EntityHooks = {
  onBeforeCreate?: (
    ctx: EntityHookContext,
    data: Record<string, unknown>,
  ) => Promise<Record<string, unknown> | void>;
  onAfterCreate?: (
    ctx: EntityHookContext,
    record: Record<string, unknown>,
  ) => Promise<void>;
  onBeforeUpdate?: (
    ctx: EntityHookContext,
    id: string,
    data: Record<string, unknown>,
    before: Record<string, unknown>,
  ) => Promise<Record<string, unknown> | void>;
  onAfterUpdate?: (
    ctx: EntityHookContext,
    id: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
  ) => Promise<void>;
};
