import { beforeAll, describe, expect, test } from "bun:test";

import { apiFetch } from "../helpers";

async function createMember(memberCode: string, name: string) {
  const res = await apiFetch("/api/entity/Member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberCode, name }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as { id: string; memberCode: string; name: string };
}

describe("Member action API", () => {
  beforeAll(async () => {
    // Get role IDs
    const rolesRes = await apiFetch("/api/roles");
    const rolesBody = (await rolesRes.json()) as { roles: { id: string; name: string }[] };
    const adminRole = rolesBody.roles.find((r) => r.name === "admin");
    const publicRole = rolesBody.roles.find((r) => r.name === "public");
    const publicRoleId = publicRole!.id;

    // Sign up admin user
    const email = "admin-action@test.local";
    const password = "AdminPass123!";
    await apiFetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Admin Action", email, password }),
    });

    // Sign in to get user id
    const signInRes = await apiFetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const signInBody = (await signInRes.json()) as { user: { id: string } };
    const userId = signInBody.user.id;

    // Assign admin role
    await apiFetch("/api/test/assign-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleId: adminRole!.id }),
    });

    // Sign in again to get session with admin role
    const signInRes2 = await apiFetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const adminCookies = signInRes2.headers.get("set-cookie") ?? "";

    // Add wildcard grant for public role on Member entity (covers all actions including custom ones)
    await apiFetch(`/api/grants/${publicRoleId}/Member/*`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookies },
      body: JSON.stringify({ allowed: true }),
    });
  });

  test("GET /api/entity/Member/meta lists ping action", async () => {
    const res = await apiFetch("/api/entity/Member/meta");
    expect(res.status).toBe(200);

    const meta = (await res.json()) as { actions?: string[] };
    expect(meta.actions).toContain("ping");
  });

  test("POST /api/entity/Member/:id/action/ping returns pong payload", async () => {
    const record = await createMember("M-PING", "Ping Test");

    const res = await apiFetch(`/api/entity/Member/${record.id}/action/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "hello" }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      ok: boolean;
      message: string;
      id: string;
      memberCode: string;
      name: string;
      body: { note: string };
      actorId: string | null;
    };

    expect(body.ok).toBe(true);
    expect(body.message).toBe("pong");
    expect(body.id).toBe(record.id);
    expect(body.memberCode).toBe("M-PING");
    expect(body.name).toBe("Ping Test");
    expect(body.body).toEqual({ note: "hello" });
    expect(body.actorId).toBeNull();
  });

  test("POST unknown action returns 404", async () => {
    const record = await createMember("M-NO-ACTION", "No Action");

    const res = await apiFetch(
      `/api/entity/Member/${record.id}/action/not-a-real-action`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );
    expect(res.status).toBe(404);

    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("NOT_FOUND");
  });
});
