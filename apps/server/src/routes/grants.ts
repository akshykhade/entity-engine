import { createDb } from "@crud-engine/db";
import { permissionGrants } from "@crud-engine/db/schema/grant";
import { grantStore } from "@crud-engine/engine";
import { permissionRegistry } from "@crud-engine/permissions";
import { and, eq } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { createEngineContext } from "../context";

async function requireAdminHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const ctx = await createEngineContext(request);
  if (!ctx.roles.includes("admin")) {
    reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
  }
}

export async function registerGrantRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.addHook("preHandler", requireAdminHook);

  fastify.get(
    "/api/grants",
    {
      schema: {
        tags: ["Grants"],
        summary: "List all permission grants",
        description: "Returns all role→entity→action grants. Admin only.",
        response: {
          200: {
            type: "object",
            properties: {
              grants: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    roleId: { type: "string" },
                    roleName: { type: "string" },
                    entity: { type: "string" },
                    action: { type: "string" },
                    allowed: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.send({ grants: grantStore.listGrants() });
    },
  );

  fastify.put(
    "/api/grants/:roleId/:entity/:action",
    {
      schema: {
        tags: ["Grants"],
        summary: "Upsert a permission grant",
        description:
          "Creates or updates the grant for role+entity+action. Use entity='*' and action='*' for wildcards. Admin only.",
        params: {
          type: "object",
          properties: {
            roleId: { type: "string" },
            entity: { type: "string" },
            action: { type: "string" },
          },
          required: ["roleId", "entity", "action"],
        },
        body: {
          type: "object",
          properties: { allowed: { type: "boolean" } },
          required: ["allowed"],
        },
        response: {
          200: {
            type: "object",
            properties: { success: { type: "boolean" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { roleId, entity, action } = request.params as {
        roleId: string;
        entity: string;
        action: string;
      };
      const { allowed } = request.body as { allowed: boolean };
      const db = createDb();

      await db
        .insert(permissionGrants)
        .values({ id: crypto.randomUUID(), roleId, entity, action, allowed })
        .onConflictDoUpdate({
          target: [
            permissionGrants.roleId,
            permissionGrants.entity,
            permissionGrants.action,
          ],
          set: { allowed },
        });

      await grantStore.reload(db);
      permissionRegistry.setGrantChecker((roles, ent, act) =>
        grantStore.check(roles, ent, act),
      );

      return reply.send({ success: true });
    },
  );

  fastify.delete(
    "/api/grants/:roleId/:entity/:action",
    {
      schema: {
        tags: ["Grants"],
        summary: "Delete a permission grant",
        description:
          "Removes the grant row. Falls back to deny-by-default. Admin only.",
        params: {
          type: "object",
          properties: {
            roleId: { type: "string" },
            entity: { type: "string" },
            action: { type: "string" },
          },
          required: ["roleId", "entity", "action"],
        },
        response: {
          200: {
            type: "object",
            properties: { success: { type: "boolean" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { roleId, entity, action } = request.params as {
        roleId: string;
        entity: string;
        action: string;
      };
      const db = createDb();

      await db
        .delete(permissionGrants)
        .where(
          and(
            eq(permissionGrants.roleId, roleId),
            eq(permissionGrants.entity, entity),
            eq(permissionGrants.action, action),
          ),
        );

      await grantStore.reload(db);
      permissionRegistry.setGrantChecker((roles, ent, act) =>
        grantStore.check(roles, ent, act),
      );

      return reply.send({ success: true });
    },
  );
}
