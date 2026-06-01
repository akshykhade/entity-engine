import type { FastifyRequest } from "fastify";
import type { EngineContext } from "@crud-engine/engine";

export function createEngineContext(_request: FastifyRequest): EngineContext {
  return {
    user: undefined,
  };
}
