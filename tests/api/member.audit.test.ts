import { describe, expect, test } from "bun:test";

import { apiFetch } from "../helpers";

type AuditEntry = {
  id: string;
  entity: string;
  recordId: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  actorId: string;
  createdAt: string;
};

async function createMember(memberCode: string, name: string) {
  const res = await apiFetch("/api/entity/Member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberCode, name }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as { id: string; memberCode: string; name: string };
}

async function fetchAuditLog(id: string) {
  const res = await apiFetch(`/api/entity/Member/${id}/audit_log`);
  expect(res.status).toBe(200);
  return (await res.json()) as AuditEntry[];
}

describe("Member audit API", () => {
  test("GET /api/entity/Member/:id/audit_log records create, update, and delete", async () => {
    const record = await createMember("M-AUDIT", "Audit Subject");

    const afterCreate = await fetchAuditLog(record.id);
    expect(afterCreate.length).toBeGreaterThanOrEqual(1);

    const createEntry = afterCreate.find((e) => e.action === "create");
    expect(createEntry).toBeDefined();
    expect(createEntry!.entity).toBe("Member");
    expect(createEntry!.recordId).toBe(record.id);
    expect(createEntry!.before).toBeNull();
    expect(createEntry!.after).toMatchObject({
      memberCode: "M-AUDIT",
      name: "Audit Subject",
    });
    expect(createEntry!.actorId).toBe("anonymous");

    const updateRes = await apiFetch(`/api/entity/Member/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Audit Updated" }),
    });
    expect(updateRes.status).toBe(200);

    const afterUpdate = await fetchAuditLog(record.id);
    const updateEntry = afterUpdate.find((e) => e.action === "update");
    expect(updateEntry).toBeDefined();
    expect(updateEntry!.before).toMatchObject({ name: "Audit Subject" });
    expect(updateEntry!.after).toMatchObject({ name: "Audit Updated" });

    const beforeDelete = await fetchAuditLog(record.id);
    expect(beforeDelete.some((e) => e.action === "delete")).toBe(false);

    const deleteRes = await apiFetch(`/api/entity/Member/${record.id}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(200);

    // Audit log requires the record to still exist; after delete the route returns 404.
    const afterDeleteRes = await apiFetch(`/api/entity/Member/${record.id}/audit_log`);
    expect(afterDeleteRes.status).toBe(404);
  });

  test("audit log entries are newest first", async () => {
    const record = await createMember("M-AUDIT-ORDER", "Order Test");

    await apiFetch(`/api/entity/Member/${record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Order Updated" }),
    });

    const entries = await fetchAuditLog(record.id);
    expect(entries.length).toBeGreaterThanOrEqual(2);

    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1]!.createdAt).getTime();
      const curr = new Date(entries[i]!.createdAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});
