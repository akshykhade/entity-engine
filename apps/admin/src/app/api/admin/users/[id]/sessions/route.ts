import { NextResponse } from "next/server";

import {
  getCurrentSessionToken,
  listUserSessionsFromDb,
  revokeOtherUserSessionsInDb,
} from "@/lib/admin/sessions";
import { getAdminUserFromDb } from "@/lib/admin/users";
import { notFound, requireAdminSession } from "@/lib/auth/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const user = await getAdminUserFromDb(id);
  if (!user) return notFound("User not found");

  const currentToken = await getCurrentSessionToken();
  const sessions = await listUserSessionsFromDb(id, currentToken);
  return NextResponse.json({ sessions });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const user = await getAdminUserFromDb(id);
  if (!user) return notFound("User not found");

  const currentToken = await getCurrentSessionToken();
  const revoked = await revokeOtherUserSessionsInDb(id, currentToken);
  return NextResponse.json({ success: true, revoked });
}
