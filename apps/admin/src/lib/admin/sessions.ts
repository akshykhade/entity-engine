import "@/lib/load-root-env";
import { createDb } from "@crud-engine/db";
import { session } from "@crud-engine/db/schema/auth";
import { and, desc, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";

import type { UserSessionDto } from "@/lib/api/users";

function parseUserAgent(userAgent: string | null): { browser: string; os: string; device: string } {
  const ua = userAgent ?? "Unknown";
  const browser = /Chrome/i.test(ua)
    ? "Chrome"
    : /Firefox/i.test(ua)
      ? "Firefox"
      : /Safari/i.test(ua)
        ? "Safari"
        : "Browser";
  const os = /Mac/i.test(ua)
    ? "macOS"
    : /Windows/i.test(ua)
      ? "Windows"
      : /Linux/i.test(ua)
        ? "Linux"
        : /Android/i.test(ua)
          ? "Android"
          : /iPhone|iPad/i.test(ua)
            ? "iOS"
            : "Unknown";
  const device = /Mobile|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop";
  return { browser, os, device };
}

export async function listUserSessionsFromDb(
  userId: string,
  currentSessionToken?: string | null,
): Promise<UserSessionDto[]> {
  const db = createDb();
  const rows = await db
    .select()
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.updatedAt));

  return rows.map((row) => {
    const parsed = parseUserAgent(row.userAgent);
    return {
      id: row.id,
      userId: row.userId,
      device: parsed.device,
      browser: parsed.browser,
      os: parsed.os,
      ip: row.ipAddress ?? "—",
      location: "—",
      startedAt: row.createdAt.toISOString(),
      lastActiveAt: row.updatedAt.toISOString(),
      current: currentSessionToken ? row.token === currentSessionToken : false,
    };
  });
}

export async function getCurrentSessionToken(): Promise<string | null> {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function revokeUserSessionInDb(userId: string, sessionId: string): Promise<boolean> {
  const db = createDb();
  const result = await db
    .delete(session)
    .where(and(eq(session.userId, userId), eq(session.id, sessionId)))
    .returning({ id: session.id });
  return result.length > 0;
}

export async function revokeOtherUserSessionsInDb(
  userId: string,
  keepSessionId?: string | null,
): Promise<number> {
  const db = createDb();
  const whereClause = keepSessionId
    ? and(eq(session.userId, userId), ne(session.id, keepSessionId))
    : eq(session.userId, userId);

  const result = await db.delete(session).where(whereClause).returning({ id: session.id });
  return result.length;
}
