export type StorageType = "text" | "number" | "boolean" | "datetime";

export type UiType =
  | "text"
  | "email"
  | "textarea"
  | "phone"
  | "number"
  | "boolean"
  | "datetime"
  | "select";

export type FieldMeta = {
  label: string;
  searchable?: boolean;
  sortable?: boolean;
  required: boolean;
  storageType: StorageType;
  uiType: UiType;
  /** Options for select fields */
  options?: { label: string; value: string }[];
};

export type EntityMeta = {
  name: string;
  slug: string;
  primaryKey: string;
  audit: boolean;
  softDelete: boolean;
  fields: Record<string, FieldMeta>;
  relations: Record<string, unknown>;
  actions?: string[];
};

export type AuditAction = "create" | "update" | "delete";

export type AuditLogEntry = {
  id: string;
  entity: string;
  recordId: string;
  action: AuditAction;
  before: string | null;
  after: string | null;
  actorId: string;
  createdAt: Date;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

export type UserStatus = "active" | "invited" | "suspended";

export type AdminUser = MockUser & {
  roleId: string;
  status: UserStatus;
  twoFactor: boolean;
  lastActive: Date;
  createdAt: Date;
  phone?: string;
};

export type AccessLogEvent =
  | "login"
  | "logout"
  | "failed_login"
  | "password_change"
  | "impersonation";

export type AccessLogEntry = {
  id: string;
  userId: string;
  event: AccessLogEvent;
  ip: string;
  userAgent: string;
  location?: string;
  createdAt: Date;
};

export type UserSession = {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  startedAt: Date;
  lastActiveAt: Date;
  current?: boolean;
};

export type ListAdminUsersOptions = {
  search?: string;
  roleId?: string;
  status?: UserStatus | "all";
  sort?: { field: "name" | "email" | "lastActive" | "createdAt"; direction: "asc" | "desc" };
};

export type UserFormData = {
  name: string;
  email: string;
  phone: string;
  roleId: string;
  status: UserStatus;
};

export type EntityRecord = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
};

export type ListRecordsOptions = {
  search?: string;
  filters?: Record<string, string>;
  sort?: { field: string; direction: "asc" | "desc" };
};

export type ListAuditLogOptions = {
  entity?: string;
  actorId?: string;
  action?: AuditAction;
  dateRange?: "24h" | "7d" | "30d" | "all";
};

export const DEFAULT_ACTOR_ID = "user-1";
