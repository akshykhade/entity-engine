import { NextResponse } from "next/server";

import { createAdminUserInDb, listAdminUsersFromDb } from "@/lib/admin/users";
import { badRequest, requireAdminSession } from "@/lib/auth/server";
import type { UserFormData, UserStatus } from "@/lib/types/entity";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  try {
  const { searchParams } = new URL(request.url);
  const users = await listAdminUsersFromDb({
    search: searchParams.get("search") ?? undefined,
    roleId: searchParams.get("roleId") ?? undefined,
    status: (searchParams.get("status") as UserStatus | "all" | null) ?? "all",
    sortField:
      (searchParams.get("sortField") as "name" | "email" | "lastActive" | "createdAt" | null) ??
      "name",
    sortDirection:
      (searchParams.get("sortDirection") as "asc" | "desc" | null) ?? "asc",
  });

  return NextResponse.json({
    users: users.map(serializeUser),
    total: users.length,
  });
  } catch (error) {
    console.error("GET /api/admin/users failed:", error);
    return NextResponse.json(
      { error: "Failed to load users", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = (await request.json()) as UserFormData & { password?: string };
  if (!body.name?.trim() || !body.email?.trim() || !body.roleId) {
    return badRequest("Name, email, and role are required");
  }

  const password = body.password?.trim() || generateTemporaryPassword();

  try {
    const user = await createAdminUserInDb(body, password);
    return NextResponse.json(
      {
        user: serializeUser(user),
        temporaryPassword: body.password ? undefined : password,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    return badRequest(message);
  }
}

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  initials: string;
  roleId: string;
  status: UserStatus;
  twoFactor: boolean;
  lastActive: Date;
  createdAt: Date;
  phone?: string;
}) {
  return {
    ...user,
    lastActive: user.lastActive.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
}

function generateTemporaryPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return `Tmp-${Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16)}!`;
}
