import {
  listPermissionMatrix,
  listPermissionsForUser,
} from "@crud-engine/engine";
import type { FastifyInstance } from "fastify";

import { createEngineContext } from "../context";
import {
  permissionMatrixSchema,
  permissionMeSchema,
  permissionTags,
} from "../openapi/schemas";

export async function registerPermissionRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.get(
    "/api/permissions/matrix",
    {
      schema: {
        tags: permissionTags,
        summary: "Get permission matrix metadata",
        description:
          "Returns roles, entities with all permission actions (CRUD + custom), and configured grants for UI matrix rendering.",
        response: {
          200: permissionMatrixSchema,
        },
      },
    },
    async (_request, reply) => {
      return reply.send(await listPermissionMatrix());
    },
  );

  fastify.get(
    "/api/permissions/me",
    {
      schema: {
        tags: permissionTags,
        summary: "Get current user permissions",
        description:
          "Evaluates checkPermission for every entity action. Useful for hiding UI buttons.",
        response: {
          200: permissionMeSchema,
        },
      },
    },
    async (request, reply) => {
      const ctx = await createEngineContext(request);
      const permissions = await listPermissionsForUser(ctx);
      return reply.send({ roles: ctx.roles, permissions });
    },
  );
}
