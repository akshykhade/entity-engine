import { listRoles } from "@crud-engine/roles";
import type { FastifyInstance } from "fastify";

import { createEngineContext } from "../context";
import { roleListSchema, roleMeSchema, roleTags } from "../openapi/schemas";

export async function registerRoleRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/api/roles",
    {
      schema: {
        tags: roleTags,
        summary: "List roles",
        description: "All roles in the system (e.g. public for anonymous grants).",
        response: {
          200: roleListSchema,
        },
      },
    },
    async (_request, reply) => {
      const roles = await listRoles();
      return reply.send({ roles });
    },
  );

  fastify.get(
    "/api/roles/me",
    {
      schema: {
        tags: roleTags,
        summary: "Current request roles",
        description:
          "Effective roles for this request: public when unauthenticated, assigned roles when logged in.",
        response: {
          200: roleMeSchema,
        },
      },
    },
    async (request, reply) => {
      const ctx = await createEngineContext(request);
      return reply.send({
        roles: ctx.roles,
        userId: ctx.user?.id ?? null,
      });
    },
  );
}
