import { createDb } from "@crud-engine/db";
import { auditLog } from "@crud-engine/db/schema/audit";
import type { EntityAction } from "@crud-engine/permissions";

import type { EngineContext } from "./errors";

type Db = ReturnType<typeof createDb>;

export async function logMutation(
  db: Db,
  ctx: EngineContext,
  input: {
    entity: string;
    recordId: string;
    action: EntityAction;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
  },
): Promise<void> {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    entity: input.entity,
    recordId: input.recordId,
    action: input.action,
    before: input.before ? JSON.stringify(input.before) : null,
    after: input.after ? JSON.stringify(input.after) : null,
    actorId: ctx.user?.id ?? "anonymous",
  });
}
