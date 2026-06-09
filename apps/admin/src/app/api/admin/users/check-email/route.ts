import { NextResponse } from "next/server";

import { isEmailTakenInDb } from "@/lib/admin/users";
import { badRequest, requireAdminSession } from "@/lib/auth/server";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email?.trim()) {
    return badRequest("Email is required");
  }

  const taken = await isEmailTakenInDb(email, searchParams.get("excludeId") ?? undefined);
  return NextResponse.json({ taken });
}
