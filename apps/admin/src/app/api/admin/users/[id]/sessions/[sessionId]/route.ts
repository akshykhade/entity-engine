import { NextResponse } from "next/server";

import { revokeUserSessionInDb } from "@/lib/admin/sessions";
import { getAdminUserFromDb } from "@/lib/admin/users";
import { notFound, requireAdminSession } from "@/lib/auth/server";

type RouteContext = { params: Promise<{ id: string; sessionId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id, sessionId } = await context.params;
  const user = await getAdminUserFromDb(id);
  if (!user) return notFound("User not found");

  const revoked = await revokeUserSessionInDb(id, sessionId);
  if (!revoked) return notFound("Session not found");

  return NextResponse.json({ success: true });
}
