import { entityService, type ActionDefinition } from "@crud-engine/engine";

export const memberActions: ActionDefinition[] = [
  {
    entity: "Member",
    name: "ping",
    handler: async (ctx, id, body) => {
      const record = await entityService.get(ctx, "Member", id);

      return {
        ok: true,
        message: "pong",
        id: record.id,
        memberCode: record.memberCode,
        name: record.name,
        body,
        actorId: ctx.user?.id ?? null,
      };
    },
  },
];
