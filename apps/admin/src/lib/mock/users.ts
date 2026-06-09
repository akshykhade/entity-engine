import { getRoleById, type RoleId } from "@/lib/mock/permissions";
import type {
  AdminUser,
  AccessLogEntry,
  ListAdminUsersOptions,
  MockUser,
  UserFormData,
  UserSession,
} from "@/lib/types/entity";

const DAYS_AGO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const HOURS_AGO = (hours: number) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
};

const MINUTES_AGO = (minutes: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d;
};

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

const store: AdminUser[] = [
  {
    id: "user-1",
    name: "Sean Brydon",
    email: "sean@acme.dev",
    initials: "SB",
    roleId: "super-admin",
    status: "active",
    twoFactor: true,
    lastActive: MINUTES_AGO(2),
    createdAt: DAYS_AGO(420),
    phone: "+1 415 555 0101",
  },
  {
    id: "user-2",
    name: "Maya Chen",
    email: "maya@acme.dev",
    initials: "MC",
    roleId: "admin",
    status: "active",
    twoFactor: true,
    lastActive: HOURS_AGO(1),
    createdAt: DAYS_AGO(180),
    phone: "+1 628 555 0142",
  },
  {
    id: "user-3",
    name: "Riya Patel",
    email: "riya@acme.dev",
    initials: "RP",
    roleId: "editor",
    status: "active",
    twoFactor: false,
    lastActive: HOURS_AGO(5),
    createdAt: DAYS_AGO(90),
  },
  {
    id: "user-4",
    name: "James Lin",
    email: "james@acme.dev",
    initials: "JL",
    roleId: "editor",
    status: "active",
    twoFactor: true,
    lastActive: DAYS_AGO(1),
    createdAt: DAYS_AGO(60),
  },
  {
    id: "user-5",
    name: "Priya Shah",
    email: "priya@acme.dev",
    initials: "PS",
    roleId: "viewer",
    status: "active",
    twoFactor: false,
    lastActive: DAYS_AGO(3),
    createdAt: DAYS_AGO(45),
  },
  {
    id: "user-6",
    name: "Alex Rivera",
    email: "alex@acme.dev",
    initials: "AR",
    roleId: "admin",
    status: "invited",
    twoFactor: false,
    lastActive: DAYS_AGO(14),
    createdAt: DAYS_AGO(2),
  },
  {
    id: "user-7",
    name: "Taylor Kim",
    email: "taylor@acme.dev",
    initials: "TK",
    roleId: "viewer",
    status: "suspended",
    twoFactor: false,
    lastActive: DAYS_AGO(30),
    createdAt: DAYS_AGO(120),
  },
];

function generateUserId(): string {
  const max = store.reduce((acc, user) => {
    const match = /^user-(\d+)$/.exec(user.id);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `user-${max + 1}`;
}

const ACCESS_LOG: AccessLogEntry[] = [
  {
    id: "access-1",
    userId: "user-1",
    event: "login",
    ip: "192.168.1.42",
    userAgent: "Chrome 124 · macOS",
    location: "San Francisco, US",
    createdAt: MINUTES_AGO(2),
  },
  {
    id: "access-2",
    userId: "user-1",
    event: "login",
    ip: "10.0.0.8",
    userAgent: "Safari 17 · iOS",
    location: "San Francisco, US",
    createdAt: HOURS_AGO(18),
  },
  {
    id: "access-3",
    userId: "user-2",
    event: "login",
    ip: "203.0.113.14",
    userAgent: "Firefox 125 · Windows",
    location: "Austin, US",
    createdAt: HOURS_AGO(1),
  },
  {
    id: "access-4",
    userId: "user-2",
    event: "password_change",
    ip: "203.0.113.14",
    userAgent: "Firefox 125 · Windows",
    location: "Austin, US",
    createdAt: DAYS_AGO(7),
  },
  {
    id: "access-5",
    userId: "user-3",
    event: "failed_login",
    ip: "198.51.100.22",
    userAgent: "Chrome 124 · macOS",
    location: "Toronto, CA",
    createdAt: HOURS_AGO(6),
  },
  {
    id: "access-6",
    userId: "user-3",
    event: "login",
    ip: "198.51.100.22",
    userAgent: "Chrome 124 · macOS",
    location: "Toronto, CA",
    createdAt: HOURS_AGO(5),
  },
  {
    id: "access-7",
    userId: "user-4",
    event: "login",
    ip: "172.16.0.5",
    userAgent: "Chrome 124 · macOS",
    location: "Seattle, US",
    createdAt: DAYS_AGO(1),
  },
  {
    id: "access-8",
    userId: "user-5",
    event: "login",
    ip: "10.1.2.3",
    userAgent: "Edge 124 · Windows",
    location: "Chicago, US",
    createdAt: DAYS_AGO(3),
  },
  {
    id: "access-6b",
    userId: "user-1",
    event: "impersonation",
    ip: "192.168.1.42",
    userAgent: "Chrome 124 · macOS",
    location: "San Francisco, US",
    createdAt: DAYS_AGO(5),
  },
  {
    id: "access-9",
    userId: "user-7",
    event: "logout",
    ip: "10.2.3.4",
    userAgent: "Chrome 123 · macOS",
    location: "Denver, US",
    createdAt: DAYS_AGO(30),
  },
];

const sessionStore: UserSession[] = [
  {
    id: "sess-1",
    userId: "user-1",
    device: "MacBook Pro",
    browser: "Chrome 124",
    os: "macOS",
    ip: "192.168.1.42",
    location: "San Francisco, US",
    startedAt: HOURS_AGO(18),
    lastActiveAt: MINUTES_AGO(2),
    current: true,
  },
  {
    id: "sess-2",
    userId: "user-1",
    device: "iPhone 15 Pro",
    browser: "Safari 17",
    os: "iOS",
    ip: "10.0.0.8",
    location: "San Francisco, US",
    startedAt: DAYS_AGO(3),
    lastActiveAt: HOURS_AGO(18),
  },
  {
    id: "sess-3",
    userId: "user-2",
    device: "Windows PC",
    browser: "Firefox 125",
    os: "Windows 11",
    ip: "203.0.113.14",
    location: "Austin, US",
    startedAt: DAYS_AGO(2),
    lastActiveAt: HOURS_AGO(1),
    current: true,
  },
  {
    id: "sess-4",
    userId: "user-2",
    device: "iPad Air",
    browser: "Safari 17",
    os: "iPadOS",
    ip: "203.0.113.28",
    location: "Austin, US",
    startedAt: DAYS_AGO(14),
    lastActiveAt: DAYS_AGO(5),
  },
  {
    id: "sess-5",
    userId: "user-3",
    device: "MacBook Air",
    browser: "Chrome 124",
    os: "macOS",
    ip: "198.51.100.22",
    location: "Toronto, CA",
    startedAt: DAYS_AGO(7),
    lastActiveAt: HOURS_AGO(5),
    current: true,
  },
  {
    id: "sess-6",
    userId: "user-4",
    device: "ThinkPad",
    browser: "Chrome 124",
    os: "macOS",
    ip: "172.16.0.5",
    location: "Seattle, US",
    startedAt: DAYS_AGO(4),
    lastActiveAt: DAYS_AGO(1),
    current: true,
  },
  {
    id: "sess-7",
    userId: "user-5",
    device: "Surface Laptop",
    browser: "Edge 124",
    os: "Windows 11",
    ip: "10.1.2.3",
    location: "Chicago, US",
    startedAt: DAYS_AGO(10),
    lastActiveAt: DAYS_AGO(3),
    current: true,
  },
];

export function getUser(id: string): MockUser | undefined {
  return store.find((u) => u.id === id);
}

export function getAdminUser(id: string): AdminUser | undefined {
  return store.find((u) => u.id === id);
}

export function listUsers(): MockUser[] {
  return store;
}

export function isEmailTaken(email: string, excludeId?: string): boolean {
  const normalized = email.trim().toLowerCase();
  return store.some(
    (u) => u.email.toLowerCase() === normalized && u.id !== excludeId,
  );
}

export function createUser(data: UserFormData): AdminUser {
  const now = new Date();
  const user: AdminUser = {
    id: generateUserId(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    initials: deriveInitials(data.name),
    roleId: data.roleId,
    status: data.status,
    twoFactor: false,
    lastActive: now,
    createdAt: now,
    phone: data.phone.trim() || undefined,
  };
  store.push(user);
  return user;
}

export function updateUser(id: string, data: UserFormData): AdminUser | undefined {
  const index = store.findIndex((u) => u.id === id);
  if (index === -1) return undefined;

  const existing = store[index]!;
  const updated: AdminUser = {
    ...existing,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    initials: deriveInitials(data.name),
    roleId: data.roleId,
    status: data.status,
    phone: data.phone.trim() || undefined,
  };
  store[index] = updated;
  return updated;
}

export function listAdminUsers(options: ListAdminUsersOptions = {}): AdminUser[] {
  const { search, roleId, status = "all", sort } = options;
  let users = [...store];

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone?.toLowerCase().includes(q) ?? false),
    );
  }

  if (roleId && roleId !== "all") {
    users = users.filter((u) => u.roleId === roleId);
  }

  if (status !== "all") {
    users = users.filter((u) => u.status === status);
  }

  const sortField = sort?.field ?? "name";
  const sortDirection = sort?.direction ?? "asc";
  users.sort((a, b) => {
    let cmp = 0;
    if (sortField === "name" || sortField === "email") {
      cmp = a[sortField].localeCompare(b[sortField]);
    } else {
      cmp = a[sortField].getTime() - b[sortField].getTime();
    }
    return sortDirection === "asc" ? cmp : -cmp;
  });

  return users;
}

export function listAccessLogForUser(userId: string): AccessLogEntry[] {
  return ACCESS_LOG.filter((e) => e.userId === userId).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function listSessionsForUser(userId: string): UserSession[] {
  return sessionStore
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
}

export function revokeSession(sessionId: string): boolean {
  const index = sessionStore.findIndex((s) => s.id === sessionId);
  if (index === -1 || sessionStore[index]?.current) return false;
  sessionStore.splice(index, 1);
  return true;
}

export function revokeOtherSessions(userId: string): number {
  const before = sessionStore.length;
  for (let i = sessionStore.length - 1; i >= 0; i -= 1) {
    const session = sessionStore[i]!;
    if (session.userId === userId && !session.current) {
      sessionStore.splice(i, 1);
    }
  }
  return before - sessionStore.length;
}

export function getUserRoleTone(roleId: string): string {
  return getRoleById(roleId as RoleId)?.tone ?? "bg-muted text-muted-foreground";
}

export function getUserRoleName(roleId: string): string {
  return getRoleById(roleId as RoleId)?.name ?? roleId;
}
