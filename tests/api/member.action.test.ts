import { describe, expect, test } from "bun:test";

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
