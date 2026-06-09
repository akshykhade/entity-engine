import { NextResponse } from "next/server";

import { listAuditLogFromDb } from "@/lib/admin/audit-log";
import { requireAdminSession } from "@/lib/auth/server";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const result = await listAuditLogFromDb({
    search: searchParams.get("search") ?? undefined,
    entity: searchParams.get("entity") ?? undefined,
    action: searchParams.get("action") ?? undefined,
    actorId: searchParams.get("actorId") ?? undefined,
    page: Number(searchParams.get("page") ?? "1"),
    pageSize: Number(searchParams.get("pageSize") ?? "20"),
  });

  return NextResponse.json({
    total: result.total,
    entries: result.entries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    })),
  });
}
