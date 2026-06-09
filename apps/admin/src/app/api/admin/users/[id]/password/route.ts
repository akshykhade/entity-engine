import { NextResponse } from "next/server";

import { setAdminUserPassword } from "@/lib/admin/users";
import { badRequest, requireAdminSession } from "@/lib/auth/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = (await request.json()) as { password?: string };
  if (!body.password || body.password.length < 8) {
    return badRequest("Password must be at least 8 characters");
  }

  await setAdminUserPassword(id, body.password);
  return NextResponse.json({ success: true });
}
