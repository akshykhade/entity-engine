import { describe, expect, test } from "bun:test";

import { apiFetch } from "../helpers";

describe("Member API", () => {
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
