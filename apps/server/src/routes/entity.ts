import {
  entityService,
} from "@crud-engine/engine";
import type { FastifyInstance } from "fastify";

import { createEngineContext } from "../context";
import {
  auditLogListSchema,
  deleteResultSchema,
  entityActionParamsSchema,
  entityCatalogSchema,
  entityMetaSchema,
  entityNameParamsSchema,
  entityRecordParamsSchema,
  entityRecordSchema,
  entityTags,
  entityWriteBodySchema,
  errorResponseSchema,
  listQuerySchema,
  listResultSchema,
} from "../openapi/schemas";

export async function registerEntityRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/api/entities",
    {
      schema: {
        tags: entityTags,
        summary: "List registered entities",
        description:
          "Returns metadata for every entity in the registry, sorted by name. Use for navigation, module pickers, and generic UI bootstrapping.",
        response: {
          200: entityCatalogSchema,
        },
      },
    },
    async (_request, reply) => {
      return reply.send({ entities: entityService.listMeta() });
    },
  );

  fastify.get(
    "/api/entity/:name/meta",
    {
      schema: {
        tags: entityTags,
        summary: "Get entity metadata",
        description: "Returns form/list metadata for a registered entity.",
        params: entityNameParamsSchema,
        response: {
          200: entityMetaSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name } = request.params as { name: string };
      const meta = entityService.meta(name);
      return reply.send(meta);
    },
  );

  fastify.get(
    "/api/entity/:name",
    {
      schema: {
        tags: entityTags,
        summary: "List entity records",
        description:
          "List records with optional search, filters, sort, and pagination.",
        params: entityNameParamsSchema,
        querystring: listQuerySchema,
        response: {
          200: listResultSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name } = request.params as { name: string };
      const ctx = await createEngineContext(request);
      const result = await entityService.list(ctx, name, request.query);
      return reply.send(result);
    },
  );

  fastify.get(
    "/api/entity/:name/:id/audit_log",
    {
      schema: {
        tags: entityTags,
        summary: "List audit log for entity record",
        description:
          "Returns audit trail entries for a record, newest first. Read-only.",
        params: entityRecordParamsSchema,
        response: {
          200: auditLogListSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, id } = request.params as { name: string; id: string };
      const ctx = await createEngineContext(request);
      const entries = await entityService.listAuditLog(ctx, name, id);
      return reply.send(entries);
    },
  );

  fastify.get(
    "/api/entity/:name/:id",
    {
      schema: {
        tags: entityTags,
        summary: "Get entity record",
        params: entityRecordParamsSchema,
        response: {
          200: entityRecordSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, id } = request.params as { name: string; id: string };
      const ctx = await createEngineContext(request);
      const record = await entityService.get(ctx, name, id);
      return reply.send(record);
    },
  );

  fastify.post(
    "/api/entity/:name",
    {
      schema: {
        tags: entityTags,
        summary: "Create entity record",
        params: entityNameParamsSchema,
        body: entityWriteBodySchema,
        response: {
          201: entityRecordSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name } = request.params as { name: string };
      const ctx = await createEngineContext(request);
      const record = await entityService.create(ctx, name, request.body);
      return reply.status(201).send(record);
    },
  );

  fastify.put(
    "/api/entity/:name/:id",
    {
      schema: {
        tags: entityTags,
        summary: "Update entity record",
        params: entityRecordParamsSchema,
        body: entityWriteBodySchema,
        response: {
          200: entityRecordSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, id } = request.params as { name: string; id: string };
      const ctx = await createEngineContext(request);
      const record = await entityService.update(ctx, name, id, request.body);
      return reply.send(record);
    },
  );

  fastify.delete(
    "/api/entity/:name/:id",
    {
      schema: {
        tags: entityTags,
        summary: "Delete entity record",
        params: entityRecordParamsSchema,
        response: {
          200: deleteResultSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, id } = request.params as { name: string; id: string };
      const ctx = await createEngineContext(request);
      const result = await entityService.delete(ctx, name, id);
      return reply.send(result);
    },
  );

  fastify.post(
    "/api/entity/:name/:id/action/:action",
    {
      schema: {
        tags: entityTags,
        summary: "Run custom entity action",
        params: entityActionParamsSchema,
        body: entityWriteBodySchema,
        response: {
          200: { type: "object", additionalProperties: true },
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, id, action } = request.params as {
        name: string;
        id: string;
        action: string;
      };
      const ctx = await createEngineContext(request);
      const result = await entityService.runAction(
        ctx,
        name,
        id,
        action,
        request.body,
      );
      return reply.send(result);
    },
  );
}
