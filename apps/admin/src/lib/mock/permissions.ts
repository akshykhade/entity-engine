import { getEntityCatalog } from "@/lib/mock/entities";

export type RoleId = "super-admin" | "admin" | "editor" | "viewer";

export type CellState = "yes" | "no" | "na";

export type RoleDef = {
  id: RoleId;
  name: string;
  members: number;
  description: string;
  tone: string;
  system?: boolean;
};

export type ActionColumn = {
  action: string;
  label: string;
};

export type EntityMatrixRow = {
  entitySlug: string;
  entityName: string;
  cells: Record<string, CellState>;
};

export type EntityActionPermission = {
  action: string;
  label: string;
  hint?: string;
  perms: Record<RoleId, CellState>;
};

export type EntityPermissionGroup = {
  entitySlug: string;
  entityName: string;
  permissions: EntityActionPermission[];
};

const STANDARD_ACTIONS: { action: string; label: string; hint?: string }[] = [
  { action: "list", label: "List", hint: "Browse and search the entity table." },
  { action: "read", label: "Read", hint: "Open a single record detail page." },
  { action: "create", label: "Create" },
  { action: "update", label: "Update" },
  { action: "delete", label: "Delete", hint: "Hard delete when soft-delete is off." },
];

export const ROLES: RoleDef[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    members: 1,
    description: "Full access to all entities, actions, and admin settings.",
    tone: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    system: true,
  },
  {
    id: "admin",
    name: "Admin",
    members: 3,
    description: "Manage records and members. Cannot change permission matrix.",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  },
  {
    id: "editor",
    name: "Editor",
    members: 12,
    description: "Create and edit records. No delete or admin access.",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
  {
    id: "viewer",
    name: "Viewer",
    members: 28,
    description: "Read-only access to entity tables and records.",
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  },
];

function editorPerms(
  overrides: Partial<Record<RoleId, CellState>> = {},
): Record<RoleId, CellState> {
  const base: Record<RoleId, CellState> = {
    "super-admin": "yes",
    admin: "yes",
    editor: "no",
    viewer: "no",
  };
  return {
    "super-admin": overrides["super-admin"] ?? base["super-admin"],
    admin: overrides.admin ?? base.admin,
    editor: overrides.editor ?? base.editor,
    viewer: overrides.viewer ?? base.viewer,
  };
}

function crudPerms(): Record<string, Record<RoleId, CellState>> {
  return {
    list: editorPerms({ editor: "yes", viewer: "yes" }),
    read: editorPerms({ editor: "yes", viewer: "yes" }),
    create: editorPerms({ editor: "yes" }),
    update: editorPerms({ editor: "yes" }),
    delete: editorPerms({ editor: "no", viewer: "no" }),
  };
}

function buildEntityGroups(): EntityPermissionGroup[] {
  const catalog = getEntityCatalog();

  return catalog.map((entity) => {
    const permsByAction = crudPerms();

    const permissions: EntityActionPermission[] = STANDARD_ACTIONS.map(({ action, label, hint }) => ({
      action,
      label,
      hint,
      perms: permsByAction[action]!,
    }));

    return {
      entitySlug: entity.slug,
      entityName: entity.name,
      permissions,
    };
  });
}

const PERMISSION_GROUPS: EntityPermissionGroup[] = buildEntityGroups();

export type PermissionState = {
  grants: Record<RoleId, Record<string, Record<string, CellState>>>;
};

function buildInitialGrants(): PermissionState["grants"] {
  const grants = Object.fromEntries(
    ROLES.map((role) => [role.id, {} as Record<string, Record<string, CellState>>]),
  ) as PermissionState["grants"];

  for (const group of PERMISSION_GROUPS) {
    for (const perm of group.permissions) {
      for (const role of ROLES) {
        const roleGrants = grants[role.id]!;
        const entityGrants = (roleGrants[group.entitySlug] ??= {});
        entityGrants[perm.action] = perm.perms[role.id];
      }
    }
  }

  return grants;
}

export function createInitialPermissionState(): PermissionState {
  return { grants: buildInitialGrants() };
}

export function getPermissionGroups(): EntityPermissionGroup[] {
  return PERMISSION_GROUPS;
}

export function getRoles(): RoleDef[] {
  return ROLES;
}

export function getRoleById(roleId: RoleId): RoleDef | undefined {
  return ROLES.find((role) => role.id === roleId);
}

export function getAllActionColumns(): ActionColumn[] {
  return STANDARD_ACTIONS.map(({ action, label }) => ({ action, label }));
}

export function getMatrixForRole(
  roleId: RoleId,
  state: PermissionState = createInitialPermissionState(),
): EntityMatrixRow[] {
  return PERMISSION_GROUPS.map((group) => ({
    entitySlug: group.entitySlug,
    entityName: group.entityName,
    cells: { ...state.grants[roleId][group.entitySlug] },
  }));
}

/** CRUD columns that apply to the selected role (not N/A on every entity). */
export function getActionsForRole(
  roleId: RoleId,
  state: PermissionState = createInitialPermissionState(),
): ActionColumn[] {
  const matrix = getMatrixForRole(roleId, state);
  return getAllActionColumns().filter((column) =>
    matrix.some((row) => (row.cells[column.action] ?? "na") !== "na"),
  );
}

/** Entities that apply to the selected role (at least one non-N/A action). */
export function getEntitiesForRole(
  roleId: RoleId,
  state: PermissionState = createInitialPermissionState(),
): EntityMatrixRow[] {
  const actions = getActionsForRole(roleId, state);
  return getMatrixForRole(roleId, state).filter((row) =>
    actions.some((column) => (row.cells[column.action] ?? "na") !== "na"),
  );
}

export function countAllowedForRole(
  roleId: RoleId,
  state: PermissionState = createInitialPermissionState(),
): number {
  return getMatrixForRole(roleId, state).reduce(
    (acc, row) => acc + Object.values(row.cells).filter((cellState) => cellState === "yes").length,
    0,
  );
}

export function togglePermissionGrant(
  state: PermissionState,
  roleId: RoleId,
  entitySlug: string,
  action: string,
): PermissionState {
  const current = state.grants[roleId][entitySlug]?.[action] ?? "na";
  if (current === "na") return state;

  return {
    grants: {
      ...state.grants,
      [roleId]: {
        ...state.grants[roleId],
        [entitySlug]: {
          ...state.grants[roleId][entitySlug],
          [action]: current === "yes" ? "no" : "yes",
        },
      },
    },
  };
}

export function countPermissionCells(): number {
  return PERMISSION_GROUPS.reduce((acc, group) => acc + group.permissions.length, 0);
}
