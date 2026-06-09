import type {
  AuditAction,
  AuditLogEntry,
  ListAuditLogOptions,
} from "@/lib/types/entity";

function daysAgo(days: number, hours = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d;
}

function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedAuditLog(): AuditLogEntry[] {
  return [
    {
      id: "audit-seed-001",
      entity: "member",
      recordId: "mem-001",
      action: "create",
      before: null,
      after: JSON.stringify({ id: "mem-001", memberCode: "M-1001", name: "Ada Lovelace" }),
      actorId: "user-2",
      createdAt: daysAgo(30),
    },
    {
      id: "audit-seed-002",
      entity: "invoice",
      recordId: "inv-001",
      action: "update",
      before: JSON.stringify({ status: "sent", amount: 12500 }),
      after: JSON.stringify({ status: "paid", amount: 12500 }),
      actorId: "user-3",
      createdAt: daysAgo(40, 2),
    },
    {
      id: "audit-seed-003",
      entity: "customer",
      recordId: "cus-001",
      action: "update",
      before: JSON.stringify({ phone: "" }),
      after: JSON.stringify({ phone: "+1 555-0101" }),
      actorId: "user-1",
      createdAt: daysAgo(30, 4),
    },
    {
      id: "audit-seed-004",
      entity: "member",
      recordId: "mem-003",
      action: "update",
      before: JSON.stringify({ name: "Grace H." }),
      after: JSON.stringify({ name: "Grace Hopper" }),
      actorId: "user-4",
      createdAt: daysAgo(1, 6),
    },
    {
      id: "audit-seed-005",
      entity: "invoice",
      recordId: "inv-005",
      action: "update",
      before: JSON.stringify({ status: "sent" }),
      after: JSON.stringify({ status: "void" }),
      actorId: "user-5",
      createdAt: daysAgo(8, 1),
    },
    {
      id: "audit-seed-006",
      entity: "customer",
      recordId: "cus-008",
      action: "create",
      before: null,
      after: JSON.stringify({ id: "cus-008", customerCode: "C-5008", name: "Stark Industries" }),
      actorId: "user-2",
      createdAt: daysAgo(15),
    },
    {
      id: "audit-seed-007",
      entity: "member",
      recordId: "mem-007",
      action: "delete",
      before: JSON.stringify({ id: "mem-007", memberCode: "M-1007", name: "Dani Kim (old)" }),
      after: null,
      actorId: "user-4",
      createdAt: daysAgo(20),
    },
    {
      id: "audit-seed-008",
      entity: "invoice",
      recordId: "inv-008",
      action: "create",
      before: null,
      after: JSON.stringify({ id: "inv-008", invoiceNumber: "INV-2025-003", amount: 42000 }),
      actorId: "user-1",
      createdAt: daysAgo(3, 3),
    },
    {
      id: "audit-seed-009",
      entity: "customer",
      recordId: "cus-012",
      action: "create",
      before: null,
      after: JSON.stringify({ id: "cus-012", customerCode: "C-5012", name: "Hooli" }),
      actorId: "user-3",
      createdAt: daysAgo(1, 2),
    },
    {
      id: "audit-seed-010",
      entity: "member",
      recordId: "mem-009",
      action: "update",
      before: JSON.stringify({ memberCode: "M-1009" }),
      after: JSON.stringify({ memberCode: "M-1009", name: "Tomás García" }),
      actorId: "user-1",
      createdAt: daysAgo(0, 3),
    },
    {
      id: "audit-seed-011",
      entity: "invoice",
      recordId: "inv-010",
      action: "create",
      before: null,
      after: JSON.stringify({ id: "inv-010", invoiceNumber: "INV-2025-005", status: "draft" }),
      actorId: "user-2",
      createdAt: daysAgo(1),
    },
    {
      id: "audit-seed-012",
      entity: "customer",
      recordId: "cus-005",
      action: "update",
      before: JSON.stringify({ email: "contact@globex.com" }),
      after: JSON.stringify({ email: "info@globex.com" }),
      actorId: "user-5",
      createdAt: daysAgo(10, 5),
    },{
      id: "audit-seed-013",
      entity: "member",
      recordId: "mem-009",
      action: "update",
      before: JSON.stringify({ memberCode: "M-1009" }),
      after: JSON.stringify({ memberCode: "M-1009", name: "Tomás García" }),
      actorId: "user-1",
      createdAt: daysAgo(0, 3),
    },
    {
      id: "audit-seed-014",
      entity: "invoice",
      recordId: "inv-010",
      action: "create",
      before: null,
      after: JSON.stringify({ id: "inv-010", invoiceNumber: "INV-2025-005", status: "draft" }),
      actorId: "user-2",
      createdAt: daysAgo(1),
    },
    {
      id: "audit-seed-015",
      entity: "customer",
      recordId: "cus-005",
      action: "update",
      before: JSON.stringify({ email: "contact@globex.com" }),
      after: JSON.stringify({ email: "info@globex.com" }),
      actorId: "user-5",
      createdAt: daysAgo(10, 5),
    }
  ];
}

const auditStore: AuditLogEntry[] = seedAuditLog();

type AppendAuditInput = {
  entity: string;
  recordId: string;
  action: AuditAction;
  before: string | null;
  after: string | null;
  actorId: string;
};

export function appendAuditEntry(input: AppendAuditInput): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateId(),
    ...input,
    createdAt: new Date(),
  };
  auditStore.unshift(entry);
  return entry;
}

function withinDateRange(date: Date, range: ListAuditLogOptions["dateRange"]): boolean {
  if (!range || range === "all") return true;
  const now = Date.now();
  const ms = date.getTime();
  const limits: Record<string, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };
  const limit = limits[range];
  if (limit === undefined) return true;
  return now - ms <= limit;
}

export function listAuditLog(options: ListAuditLogOptions = {}): AuditLogEntry[] {
  return auditStore
    .filter((e) => {
      if (options.entity && options.entity !== "all" && e.entity !== options.entity) {
        return false;
      }
      if (options.actorId && options.actorId !== "all" && e.actorId !== options.actorId) {
        return false;
      }
      if (options.action && options.action !== ("all" as AuditAction) && e.action !== options.action) {
        return false;
      }
      if (!withinDateRange(e.createdAt, options.dateRange)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function listRecordAuditLog(entity: string, recordId: string): AuditLogEntry[] {
  return auditStore
    .filter((e) => e.entity === entity && e.recordId === recordId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getRecentAuditEntries(limit = 5): AuditLogEntry[] {
  return listAuditLog({ dateRange: "all" }).slice(0, limit);
}

export function countActionsToday(): number {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return auditStore.filter((e) => e.createdAt >= startOfDay).length;
}
