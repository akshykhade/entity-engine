import { beforeAll, describe, expect, test } from "bun:test";

import { apiFetch } from "../helpers";

describe("Grants API", () => {
  let adminCookies = "";
  let publicRoleId = "";

  beforeAll(async () => {
    // Get role IDs
    const rolesRes = await apiFetch("/api/roles");
    const rolesBody = (await rolesRes.json()) as { roles: { id: string; name: string }[] };
    const adminRole = rolesBody.roles.find((r) => r.name === "admin");
    const publicRole = rolesBody.roles.find((r) => r.name === "public");
    publicRoleId = publicRole!.id;

    // Sign up admin user
    const email = "admin-grants@test.local";
    const password = "AdminPass123!";
    await apiFetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Admin Grants", email, password }),
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

    // Sign in again to get session with admin role applied
    const signInRes2 = await apiFetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    adminCookies = signInRes2.headers.get("set-cookie") ?? "";
  });

  describe("GET /api/grants", () => {
    test("unauthenticated → 403", async () => {
      const res = await apiFetch("/api/grants");
      expect(res.status).toBe(403);
    });

    test("admin → 200 with grants array", async () => {
      const res = await apiFetch("/api/grants", {
        headers: { Cookie: adminCookies },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { grants: unknown[] };
      expect(Array.isArray(body.grants)).toBe(true);
    });
  });

  describe("PUT /api/grants/:roleId/:entity/:action", () => {
    test("unauthenticated → 403", async () => {
      const res = await apiFetch(`/api/grants/${publicRoleId}/Member/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowed: true }),
      });
      expect(res.status).toBe(403);
    });

    test("admin creates grant → 200 { success: true }", async () => {
      const res = await apiFetch(`/api/grants/${publicRoleId}/Member/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: adminCookies },
        body: JSON.stringify({ allowed: true }),
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean };
      expect(body.success).toBe(true);
    });

    test("grant is live: unauthenticated GET /api/entity/member → 200", async () => {
      const res = await apiFetch("/api/entity/Member");
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/grants/:roleId/:entity/:action", () => {
    test("admin deletes grant → 200 { success: true }", async () => {
      const res = await apiFetch(`/api/grants/${publicRoleId}/Member/read`, {
        method: "DELETE",
        headers: { Cookie: adminCookies },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean };
      expect(body.success).toBe(true);
    });

    test("grant removed: unauthenticated GET /api/entity/member → 403", async () => {
      const res = await apiFetch("/api/entity/Member");
      expect(res.status).toBe(403);
    });
  });
});
