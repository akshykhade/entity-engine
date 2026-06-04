import { EngineError } from "@crud-engine/engine";
import type { FastifyInstance } from "fastify";

export function registerErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof EngineError) {
      return reply.status(error.statusCode).send({
        error: error.message,
        code: error.code,
      });
    }

    // entityRegistry.resolve() throws a plain Error for unknown entities
    if (error.message.includes("not found")) {
      return reply.status(404).send({
        error: error.message,
        code: "NOT_FOUND",
      });
    }

    fastify.log.error({ err: error }, "Unhandled error");
    return reply.status(500).send({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  });
}
