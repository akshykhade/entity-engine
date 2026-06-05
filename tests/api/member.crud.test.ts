import { beforeAll, describe, expect, test } from "bun:test";

import { apiFetch } from "../helpers";

describe("Member API", () => {
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
    const email = "admin-member@test.local";
    const password = "AdminPass123!";
    await apiFetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Admin Member", email, password }),
    });

    // Get the user id by signing in
    const signInRes = await apiFetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const signInBody = (await signInRes.json()) as { user: { id: string } };
    const userId = signInBody.user.id;
    const setCookie = signInRes.headers.get("set-cookie") ?? "";
    adminCookies = setCookie;

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
    const setCookie2 = signInRes2.headers.get("set-cookie") ?? "";
    adminCookies = setCookie2;

    // Add grants for public role: Member CRUD + read
    for (const action of ["read", "create", "update", "delete"]) {
      await apiFetch(`/api/grants/${publicRoleId}/Member/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: adminCookies },
        body: JSON.stringify({ allowed: true }),
      });
    }
  });

  test("GET /api/entities includes Member", async () => {
    const res = await apiFetch("/api/entities");
    expect(res.status).toBe(200);

    const body = (await res.json()) as { entities: { name: string }[] };
    expect(body.entities.some((e) => e.name === "Member")).toBe(true);
  });

  test("GET /api/entity/Member/meta returns field metadata", async () => {
    const res = await apiFetch("/api/entity/Member/meta");
    expect(res.status).toBe(200);

    const meta = (await res.json()) as { name: string; fields: Record<string, unknown> };
    expect(meta.name).toBe("Member");
    expect(meta.fields.memberCode).toBeDefined();
    expect(meta.fields.name).toBeDefined();
  });

  test("POST /api/entity/Member creates a record", async () => {
    const res = await apiFetch("/api/entity/Member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberCode: "M001", name: "Ada" }),
    });
    expect(res.status).toBe(201);

    const record = (await res.json()) as {
      id: string;
      memberCode: string;
      name: string;
    };
    expect(record.memberCode).toBe("M001");
    expect(record.name).toBe("Ada");
    expect(record.id).toBeString();

    const getRes = await apiFetch(`/api/entity/Member/${record.id}`);
    expect(getRes.status).toBe(200);
    const fetched = (await getRes.json()) as { memberCode: string; name: string };
    expect(fetched.memberCode).toBe("M001");
    expect(fetched.name).toBe("Ada");
  });

  test("POST /api/entity/Member without memberCode returns 400", async () => {
    const res = await apiFetch("/api/entity/Member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada" }),
    });
    expect(res.status).toBe(400);

    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("BAD_REQUEST");
  });

  test("GET /api/entity/Member lists created records", async () => {
    const createRes = await apiFetch("/api/entity/Member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberCode: "M-LIST", name: "List Test" }),
    });
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { id: string };

    const listRes = await apiFetch("/api/entity/Member?page=1&pageSize=50");
    expect(listRes.status).toBe(200);

    const list = (await listRes.json()) as {
      data: { id: string }[];
      total: number;
    };
    expect(list.data.some((row) => row.id === created.id)).toBe(true);
    expect(list.total).toBeGreaterThanOrEqual(1);
  });
});
