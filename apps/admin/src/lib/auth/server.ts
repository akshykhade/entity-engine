import "@/lib/load-root-env";
import { auth } from "@crud-engine/auth";
import { getRoleNamesForUser } from "@crud-engine/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireAdminSession() {
  const session = await getServerSession();
  if (!session?.user) {
    return { error: unauthorized("Unauthorized") };
  }

  const roles = await getRoleNamesForUser(session.user.id);
  if (!roles.includes("admin")) {
    return { error: forbidden("Admin role required") };
  }

  return { session, roles };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message, code: "UNAUTHORIZED" }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message, code: "FORBIDDEN" }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message, code: "BAD_REQUEST" }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message, code: "NOT_FOUND" }, { status: 404 });
}
