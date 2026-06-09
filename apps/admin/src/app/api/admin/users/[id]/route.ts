import { NextResponse } from "next/server";

import { getAdminUserFromDb, updateAdminUserInDb } from "@/lib/admin/users";
import { badRequest, notFound, requireAdminSession } from "@/lib/auth/server";
import type { UserFormData } from "@/lib/types/entity";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const user = await getAdminUserFromDb(id);
  if (!user) return notFound("User not found");

  return NextResponse.json({
    user: {
      ...user,
      lastActive: user.lastActive.toISOString(),
      createdAt: user.createdAt.toISOString(),
    },
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = (await request.json()) as UserFormData;
  if (!body.name?.trim() || !body.email?.trim() || !body.roleId) {
    return badRequest("Name, email, and role are required");
  }

  const updated = await updateAdminUserInDb(id, body);
  if (!updated) return notFound("User not found");

  return NextResponse.json({
    user: {
      ...updated,
      lastActive: updated.lastActive.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    },
  });
}
